import { EmailMetadata, MeetingMetadata } from './types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Email processing service
export class EmailProcessor {
  private internal44Domain = '44.01'; // Your internal domain
  
  // Process email metadata and create CRM records
  async processEmailMetadata(emails: EmailMetadata[], userId: string) {
    const processedEmails = [];
    
    for (const email of emails) {
      try {
        const result = await this.processIndividualEmail(email, userId);
        if (result) {
          processedEmails.push(result);
        }
      } catch (error) {
        console.error(`Failed to process email ${email.id}:`, error);
      }
    }
    
    return processedEmails;
  }
  
  private async processIndividualEmail(email: EmailMetadata, userId: string) {
    // Extract external email addresses (non-44.01 emails)
    const externalEmails = this.extractExternalEmails(email);
    
    if (externalEmails.length === 0) {
      // Internal email only, skip
      return null;
    }
    
    const results = [];
    
    for (const externalEmail of externalEmails) {
      try {
        // Find or create company and contact
        const { company, contact } = await this.findOrCreateCompanyAndContact(externalEmail);
        
        // Determine communication direction
        const direction = this.isInternalSender(email.sender.email) ? 'SENT' : 'RECEIVED';
        
        // Create communication record
        const communication = await this.createCommunicationRecord({
          email,
          company,
          contact,
          userId,
          direction
        });
        
        results.push({ company, contact, communication });
      } catch (error) {
        console.error(`Failed to process external email ${externalEmail.email}:`, error);
      }
    }
    
    return results;
  }
  
  // Extract external (non-44.01) email addresses
  private extractExternalEmails(email: EmailMetadata) {
    const allEmails = [
      email.sender,
      ...email.recipients
    ].filter(contact => 
      contact.email && 
      !contact.email.toLowerCase().includes(this.internal44Domain.toLowerCase()) &&
      this.isValidEmail(contact.email)
    );
    
    // Remove duplicates
    const unique = allEmails.filter((email, index, self) => 
      index === self.findIndex(e => e.email.toLowerCase() === email.email.toLowerCase())
    );
    
    return unique;
  }
  
  private isInternalSender(email: string): boolean {
    return email.toLowerCase().includes(this.internal44Domain.toLowerCase());
  }
  
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // Find or create company and contact
  private async findOrCreateCompanyAndContact(emailContact: { name: string; email: string }) {
    const domain = emailContact.email.split('@')[1];
    
    // Try to find existing company by domain or email
    let company = await prisma.company.findFirst({
      where: {
        OR: [
          { domain: domain },
          { website: { contains: domain } },
          { contacts: { some: { email: emailContact.email } } }
        ]
      },
      include: { contacts: true }
    });
    
    // If no company found, create new company record
    if (!company) {
      const companyInfo = await this.detectCompanyInfo(domain);
      const companyType = this.detectCompanyType(domain);
      
      company = await prisma.company.create({
        data: {
          name: companyInfo.name || this.generateCompanyNameFromDomain(domain),
          industry: companyInfo.industry,
          location: companyInfo.location,
          country: companyInfo.country,
          website: `https://${domain}`,
          domain: domain,
          companyType: companyType,
          organizationTags: this.generateAutoTags(domain, companyInfo),
          description: `Auto-detected from email communication with ${emailContact.email}`,
          notes: 'Auto-created from email integration. Please review and update details.',
          firstContactDate: new Date(),
          lastContactDate: new Date(),
          contactCount: 1
        },
        include: { contacts: true }
      });
    } else {
      // Update last contact date and tags if needed
      const updatedTags = await this.updateOrganizationTags(company.id, emailContact);
      await prisma.company.update({
        where: { id: company.id },
        data: {
          lastContactDate: new Date(),
          contactCount: { increment: 1 },
          organizationTags: updatedTags
        }
      });
    }
    
    if (!company) {
      throw new Error('Failed to create or find company');
    }
    
    // Find or create contact
    let contact = await prisma.contact.findFirst({
      where: {
        email: emailContact.email,
        companyId: company.id
      }
    });
    
    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          firstName: this.extractFirstName(emailContact.name),
          lastName: this.extractLastName(emailContact.name),
          email: emailContact.email,
          companyId: company.id,
          notes: 'Auto-created from email integration',
          lastContactDate: new Date(),
          contactCount: 1
        }
      });
    } else {
      // Update contact
      await prisma.contact.update({
        where: { id: contact.id },
        data: {
          lastContactDate: new Date(),
          contactCount: { increment: 1 }
        }
      });
    }
    
    return { company, contact };
  }
  
  // Create communication record with enhanced metadata
  private async createCommunicationRecord({
    email,
    company,
    contact,
    userId,
    direction
  }: {
    email: EmailMetadata;
    company: any;
    contact: any;
    userId: string;
    direction: string;
  }) {
    // Check if this email was already processed
    const existing = await prisma.communication.findUnique({
      where: { messageId: email.id }
    });
    
    if (existing) {
      return existing;
    }
    
    // Generate communication tags based on content and metadata
    const autoTags = this.generateCommunicationTags(email, company);
    
    return await prisma.communication.create({
      data: {
        type: 'EMAIL',
        subject: email.subject,
        notes: `${direction === 'SENT' ? 'Sent to' : 'Received from'} ${contact.firstName} ${contact.lastName}`,
        direction: direction as any,
        messageId: email.id,
        threadId: email.conversationId,
        importance: this.mapImportance(email.importance),
        hasAttachments: email.hasAttachments,
        tags: autoTags,
        communicationDate: new Date(email.sentDateTime),
        companyId: company.id,
        contactId: contact.id,
        userId: userId,
        metadata: {
          messageId: email.id,
          conversationId: email.conversationId,
          originalImportance: email.importance,
          isRead: email.isRead,
          recipients: email.recipients.map(r => ({ name: r.name, email: r.email })),
          sender: { name: email.sender.name, email: email.sender.email },
          processingTimestamp: new Date().toISOString(),
          autoGenerated: true
        }
      }
    });
  }
  
  // Process meeting metadata
  async processMeetingMetadata(meetings: MeetingMetadata[], userId: string) {
    const processedMeetings = [];
    
    for (const meeting of meetings) {
      try {
        const result = await this.processMeeting(meeting, userId);
        if (result) {
          processedMeetings.push(result);
        }
      } catch (error) {
        console.error(`Failed to process meeting ${meeting.id}:`, error);
      }
    }
    
    return processedMeetings;
  }
  
  private async processMeeting(meeting: MeetingMetadata, userId: string) {
    // Extract external attendees
    const externalAttendees = meeting.attendees.filter(attendee =>
      attendee.email && 
      !attendee.email.toLowerCase().includes(this.internal44Domain.toLowerCase())
    );
    
    if (externalAttendees.length === 0) {
      return null; // Internal meeting only
    }
    
    const results = [];
    
    for (const attendee of externalAttendees) {
      try {
        const { company, contact } = await this.findOrCreateCompanyAndContact(attendee);
        
        // Create meeting communication record
        const communication = await prisma.communication.create({
          data: {
            type: 'MEETING',
            subject: meeting.subject,
            notes: `Meeting with ${attendee.name} (${attendee.response})`,
            communicationDate: new Date(meeting.start.dateTime),
            companyId: company.id,
            contactId: contact.id,
            userId: userId,
            metadata: {
              meetingId: meeting.id,
              startTime: meeting.start.dateTime,
              endTime: meeting.end.dateTime,
              location: meeting.location?.displayName,
              joinUrl: meeting.onlineMeeting?.joinUrl,
              isAllDay: meeting.isAllDay,
              attendeeResponse: attendee.response
            }
          }
        });
        
        results.push({ company, contact, communication });
      } catch (error) {
        console.error(`Failed to process meeting attendee ${attendee.email}:`, error);
      }
    }
    
    return results;
  }
  
  // Helper methods
  private generateCompanyNameFromDomain(domain: string): string {
    // Remove common TLDs and clean up domain name
    return domain
      .replace(/\.(com|org|net|edu|gov|co\.uk|co\.in|etc)$/i, '')
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
  
  private extractFirstName(fullName: string): string {
    if (!fullName) return 'Unknown';
    const parts = fullName.trim().split(' ');
    return parts[0] || 'Unknown';
  }
  
  private extractLastName(fullName: string): string {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    return parts.length > 1 ? parts.slice(1).join(' ') : '';
  }
  
  // Enhanced company detection with type detection
  private async detectCompanyInfo(domain: string) {
    try {
      // Enhanced pattern recognition with type detection
      const companyPatterns = {
        'microsoft.com': { name: 'Microsoft Corporation', industry: 'Technology', location: 'Redmond, WA', country: 'United States' },
        'google.com': { name: 'Google LLC', industry: 'Technology', location: 'Mountain View, CA', country: 'United States' },
        'amazon.com': { name: 'Amazon.com Inc.', industry: 'E-commerce', location: 'Seattle, WA', country: 'United States' },
        'mit.edu': { name: 'Massachusetts Institute of Technology', industry: 'Education', location: 'Cambridge, MA', country: 'United States' },
        'stanford.edu': { name: 'Stanford University', industry: 'Education', location: 'Stanford, CA', country: 'United States' },
        'harvard.edu': { name: 'Harvard University', industry: 'Education', location: 'Cambridge, MA', country: 'United States' },
        // Add more patterns as needed
      };
      
      const patterns: Record<string, { name: string; industry: string; location: string; country: string }> = companyPatterns;
      return patterns[domain.toLowerCase()] || {
        name: null,
        industry: null,
        location: null,
        country: null
      };
    } catch (error) {
      console.error('Company detection failed:', error);
      return { name: null, industry: null, location: null, country: null };
    }
  }

  // Detect company type based on domain patterns
  private detectCompanyType(domain: string): string {
    // Educational institutions
    if (domain.endsWith('.edu') || domain.includes('university') || domain.includes('college') || domain.includes('school')) {
      return 'UNIVERSITY';
    }
    
    // Government domains
    if (domain.endsWith('.gov') || domain.endsWith('.gov.uk') || domain.includes('government')) {
      return 'GOVERNMENT';
    }
    
    // Non-profit patterns
    if (domain.endsWith('.org') || domain.includes('foundation') || domain.includes('nonprofit')) {
      return 'NON_PROFIT';
    }
    
    // Research institutions
    if (domain.includes('research') || domain.includes('institute') || domain.includes('lab')) {
      return 'RESEARCH_INSTITUTE';
    }
    
    // Default to company
    return 'COMPANY';
  }

  // Generate automatic tags for organizations
  private generateAutoTags(domain: string, companyInfo: any): string[] {
    const tags: string[] = [];
    
    // Add industry-based tags
    if (companyInfo.industry) {
      tags.push(companyInfo.industry.toLowerCase());
    }
    
    // Add location-based tags
    if (companyInfo.country) {
      tags.push(companyInfo.country.toLowerCase().replace(/\s+/g, '-'));
    }
    
    // Add domain-based tags
    if (domain.endsWith('.edu')) {
      tags.push('education', 'academic');
    } else if (domain.endsWith('.gov')) {
      tags.push('government', 'public-sector');
    } else if (domain.endsWith('.org')) {
      tags.push('non-profit', 'organization');
    }
    
    // Add size indicators (basic patterns)
    const largeTechCompanies = ['microsoft.com', 'google.com', 'amazon.com', 'apple.com', 'meta.com'];
    if (largeTechCompanies.includes(domain.toLowerCase())) {
      tags.push('enterprise', 'large-corporation');
    }
    
    return [...new Set(tags)]; // Remove duplicates
  }

  // Update organization tags based on new communication
  private async updateOrganizationTags(companyId: string, emailContact: any): Promise<string[]> {
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });
    
    if (!company) return [];
    
    const currentTags = company.organizationTags || [];
    const newTags = [...currentTags];
    
    // Add contact-based tags if not already present
    const contactDomain = emailContact.email.split('@')[1];
    const additionalTags = this.generateAutoTags(contactDomain, {});
    
    additionalTags.forEach(tag => {
      if (!newTags.includes(tag)) {
        newTags.push(tag);
      }
    });
    
    return newTags;
  }

  // Generate communication tags
  private generateCommunicationTags(email: EmailMetadata, company: any): string[] {
    const tags: string[] = [];
    
    // Add subject-based tags
    const subject = email.subject.toLowerCase();
    if (subject.includes('meeting') || subject.includes('call')) {
      tags.push('meeting-request');
    }
    if (subject.includes('proposal') || subject.includes('quote')) {
      tags.push('business-proposal');
    }
    if (subject.includes('urgent') || subject.includes('important')) {
      tags.push('urgent');
    }
    if (subject.includes('follow-up') || subject.includes('followup')) {
      tags.push('follow-up');
    }
    
    // Add company type tags
    if (company.companyType) {
      tags.push(company.companyType.toLowerCase());
    }
    
    // Add importance-based tags
    if (email.importance === 'high') {
      tags.push('high-priority');
    }
    
    // Add attachment tags
    if (email.hasAttachments) {
      tags.push('has-attachments');
    }
    
    return [...new Set(tags)]; // Remove duplicates
  }

  // Map email importance to enum
  private mapImportance(importance: string): string {
    switch (importance.toLowerCase()) {
      case 'high':
        return 'HIGH';
      case 'low':
        return 'LOW';
      default:
        return 'NORMAL';
    }
  }
}

// Export singleton instance
export const emailProcessor = new EmailProcessor(); 