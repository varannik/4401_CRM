import { NextRequest, NextResponse } from 'next/server';
import { emailProcessor } from '@/lib/email-processor';
import { PrismaClient } from '@prisma/client';
import { DomainUtils } from '@/lib/domain-utils';
import {
  cacheWebhookProcessingState,
  getWebhookProcessingState,
  checkWebhookRateLimit,
  cacheCompanyByDomain,
  getCachedCompanyByDomain,
  cacheContactByEmail,
  getCachedContactByEmail,
  trackEmailProcessingMetrics,
  addToWebhookQueue,
  invalidateWebhookCache
} from './microsoft-graph-cached';

const prisma = new PrismaClient();

// Enhanced webhook processor with Redis caching
export class EmailWebhookProcessor {
  
  // Process incoming email webhook with caching
  async processEmailWebhook(request: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();
    
    try {
      // Verify webhook authentication
      const authHeader = request.headers.get('authorization');
      const webhookSecret = process.env.EMAIL_WEBHOOK_SECRET;
      
      if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized webhook request' },
          { status: 401 }
        );
      }

      const emailData = await request.json();
      
      // Validate email data structure
      if (!emailData.messageId || !emailData.from || !emailData.subject) {
        return NextResponse.json(
          { error: 'Invalid email data structure' },
          { status: 400 }
        );
      }

      // Track webhook reception
      const senderDomain = emailData.from.email?.split('@')[1]?.toLowerCase();
      await trackEmailProcessingMetrics('received', senderDomain);

      // Check rate limiting
      const rateCheck = await checkWebhookRateLimit(emailData.from.email);
      if (!rateCheck.emailAllowed || !rateCheck.domainAllowed) {
        console.warn(`Rate limit exceeded for: ${emailData.from.email}`);
        return NextResponse.json({
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((rateCheck.resetTime - Date.now()) / 1000)
        }, { status: 429 });
      }

      // Check if email was already processed (Redis cache check)
      const existingState = await getWebhookProcessingState(emailData.messageId);
      if (existingState) {
        console.log(`Email already processed: ${emailData.messageId} (state: ${existingState.state})`);
        return NextResponse.json({
          message: 'Email already processed',
          state: existingState.state,
          processedAt: existingState.timestamp
        }, { status: 200 });
      }

      // Check database as fallback
      const existingCommunication = await prisma.communication.findUnique({
        where: { messageId: emailData.messageId }
      });

      if (existingCommunication) {
        // Cache the state for future checks
        await cacheWebhookProcessingState(emailData.messageId, 'completed', {
          communicationId: existingCommunication.id
        });
        
        return NextResponse.json({
          message: 'Email already processed',
          communicationId: existingCommunication.id
        }, { status: 200 });
      }

      // Mark as processing in cache
      await cacheWebhookProcessingState(emailData.messageId, 'processing');

      // For high-volume scenarios, add to queue for background processing
      const emailVolume = await this.getRecentEmailVolume();
      if (emailVolume > 50) { // If more than 50 emails in last hour
        await addToWebhookQueue(emailData.messageId, emailData, 'normal');
        return NextResponse.json({
          message: 'Email queued for processing',
          messageId: emailData.messageId,
          queuePosition: 'normal'
        }, { status: 202 });
      }

      // Process immediately
      const result = await this.processEmailWithCaching(emailData);

      // Track successful processing
      await trackEmailProcessingMetrics('processed', senderDomain);
      await cacheWebhookProcessingState(emailData.messageId, 'completed', result);

      const processingTime = Date.now() - startTime;
      console.log(`✅ Email processed successfully in ${processingTime}ms: ${emailData.messageId}`);

      return NextResponse.json({
        success: true,
        message: 'Email processed successfully',
        processed: result,
        processingTimeMs: processingTime
      });

    } catch (error) {
      console.error('Email webhook processing failed:', error);
      
      // Track failed processing
      const emailData = await request.json().catch(() => ({}));
      const senderDomain = emailData.from?.email?.split('@')[1]?.toLowerCase();
      await trackEmailProcessingMetrics('failed', senderDomain);
      
      // Cache failure state
      if (emailData.messageId) {
        await cacheWebhookProcessingState(emailData.messageId, 'failed', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      
      return NextResponse.json({
        error: 'Failed to process email webhook',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  }

  // Process email with enhanced caching
  private async processEmailWithCaching(webhookData: any) {
    const emailMetadata = this.transformWebhookToEmailMetadata(webhookData);
    
    // Find system user for processing
    const systemUser = await prisma.user.findFirst({
      where: { role: 'sys_admin' }
    });

    if (!systemUser) {
      throw new Error('No system user found for processing emails');
    }

    // Enhanced processing with caching
    const { company, contact } = await this.findOrCreateCompanyAndContactCached(
      emailMetadata.sender.email,
      emailMetadata.sender.name
    );

    // Create communication record
    const communication = await this.createCommunicationRecord({
      email: emailMetadata,
      company,
      contact,
      userId: systemUser.id,
      direction: 'RECEIVED'
    });

    // Invalidate relevant caches
    await invalidateWebhookCache(
      emailMetadata.id,
      company.id,
      emailMetadata.sender.email
    );

    return {
      communicationId: communication.id,
      companyId: company.id,
      contactId: contact.id,
      messageId: emailMetadata.id
    };
  }

  // Cached company and contact lookup
  private async findOrCreateCompanyAndContactCached(email: string, name: string) {
    const domainInfo = DomainUtils.extractCompanyDomainInfo(email);
    const domainClassification = DomainUtils.classifyDomain(email);
    
    // Skip internal emails (from your own organization)
    if (domainClassification === 'internal') {
      throw new Error('Skipping internal email - no external company to track');
    }
    
    // Try to get cached contact first
    let contact = await getCachedContactByEmail(email);
    let company = null;

    if (contact) {
      // Get company from cached contact
      company = await prisma.company.findUnique({
        where: { id: contact.companyId }
      });
    } else {
      // Try to get cached company by domain
      company = await getCachedCompanyByDomain(domainInfo.domain);
      
      if (!company) {
        // Lookup or create company
        company = await prisma.company.findFirst({
          where: { domain: domainInfo.domain }
        });

        if (!company) {
          // Determine company type based on domain classification
          const companyType = domainClassification === 'personal' ? 'OTHER' : 'COMPANY';
          const organizationTags = ['auto-created'];
          
          if (domainClassification === 'personal') {
            organizationTags.push('personal-email');
          }
          
          company = await prisma.company.create({
            data: {
              name: domainInfo.companyHint,
              domain: domainInfo.domain,
              companyType: companyType,
              organizationTags: organizationTags,
              firstContactDate: new Date(),
              lastContactDate: new Date(),
              contactCount: 1,
              notes: domainClassification === 'personal' 
                ? 'Contact using personal email address' 
                : `Auto-created from email domain: ${domainInfo.domain}`
            }
          });
        }

        // Cache the company
        await cacheCompanyByDomain(domainInfo.domain, company);
      }

      // Create or find contact
      contact = await prisma.contact.findFirst({
        where: { 
          email: email,
          companyId: company.id 
        }
      });

      if (!contact) {
        const [firstName, ...lastNameParts] = name.split(' ');
        const lastName = lastNameParts.join(' ') || '';

        contact = await prisma.contact.create({
          data: {
            firstName: firstName || 'Unknown',
            lastName: lastName,
            email: email,
            companyId: company.id,
            lastContactDate: new Date(),
            contactCount: 1,
            notes: domainClassification === 'personal' 
              ? 'Uses personal email for business communication' 
              : undefined
          }
        });
      }

      // Cache the contact
      await cacheContactByEmail(email, { ...contact, companyId: company.id });
    }

    return { company, contact };
  }

  // Create communication record (similar to original but with caching)
  private async createCommunicationRecord({ email, company, contact, userId, direction }: any) {
    // Check if this email was already processed
    const existing = await prisma.communication.findUnique({
      where: { messageId: email.id }
    });
    
    if (existing) {
      return existing;
    }
    
    return await prisma.communication.create({
      data: {
        type: 'EMAIL',
        subject: email.subject,
        notes: `${direction === 'SENT' ? 'Sent to' : 'Received from'} ${contact.firstName} ${contact.lastName}`,
        direction: direction,
        messageId: email.id,
        threadId: email.conversationId,
        importance: this.mapImportance(email.importance),
        hasAttachments: email.hasAttachments,
        tags: ['webhook-processed'],
        communicationDate: new Date(email.sentDateTime),
        companyId: company.id,
        contactId: contact.id,
        userId: userId,
        metadata: {
          messageId: email.id,
          conversationId: email.conversationId,
          originalImportance: email.importance,
          isRead: email.isRead,
          recipients: email.recipients || [],
          sender: { name: email.sender.name, email: email.sender.email },
          processingTimestamp: new Date().toISOString(),
          autoGenerated: true,
          processedViaWebhook: true
        }
      }
    });
  }

  // Transform webhook data to EmailMetadata format
  private transformWebhookToEmailMetadata(webhookData: any) {
    return {
      id: webhookData.messageId,
      subject: webhookData.subject || '(No Subject)',
      sender: {
        name: webhookData.from.name || webhookData.from.email || 'Unknown',
        email: webhookData.from.email || ''
      },
      recipients: [
        ...(webhookData.to || []).map((recipient: any) => ({
          name: recipient.name || recipient.email || 'Unknown',
          email: recipient.email || ''
        })),
        ...(webhookData.cc || []).map((recipient: any) => ({
          name: recipient.name || recipient.email || 'Unknown',
          email: recipient.email || ''
        }))
      ],
      sentDateTime: webhookData.date || new Date().toISOString(),
      receivedDateTime: new Date().toISOString(),
      hasAttachments: webhookData.attachments ? webhookData.attachments.length > 0 : false,
      importance: webhookData.importance || 'normal',
      conversationId: webhookData.threadId || webhookData.messageId || '',
      isRead: false
    };
  }

  // Helper methods
  private mapImportance(importance: string) {
    switch (importance?.toLowerCase()) {
      case 'high': return 'HIGH';
      case 'low': return 'LOW';
      default: return 'NORMAL';
    }
  }

  private async getRecentEmailVolume(): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 3600000);
    const count = await prisma.communication.count({
      where: {
        type: 'EMAIL',
        createdAt: {
          gte: oneHourAgo
        }
      }
    });
    return count;
  }
}

// Export singleton instance
export const emailWebhookProcessor = new EmailWebhookProcessor();