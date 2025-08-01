import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchEmailMetadata, fetchMeetingMetadata, hasEmailPermissions } from '@/lib/microsoft-graph';
import { emailProcessor } from '@/lib/email-processor';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }
    
    // Check if user has email permissions
    const hasPermissions = await hasEmailPermissions();
    if (!hasPermissions) {
      return NextResponse.json(
        { 
          error: 'Email permissions not granted',
          message: 'Please re-authenticate with email permissions to sync emails'
        },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { 
      syncEmails = true, 
      syncMeetings = true, 
      limit = 50,
      daysBack = 30 
    } = body;
    
         const results = {
       emails: { processed: 0, records: 0 },
       meetings: { processed: 0, records: 0 },
       errors: [] as string[]
     };
    
    // Calculate date filter for recent emails/meetings
    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - daysBack);
    const dateFilterISO = dateFilter.toISOString();
    
    // Sync emails
    if (syncEmails) {
      try {
        console.log('Fetching email metadata...');
        const emails = await fetchEmailMetadata({
          top: limit,
          filter: `sentDateTime ge ${dateFilterISO}`,
          orderBy: 'sentDateTime desc'
        });
        
        console.log(`Fetched ${emails.length} emails, processing...`);
        const processedEmails = await emailProcessor.processEmailMetadata(emails, session.user.id);
        
        results.emails.processed = emails.length;
        results.emails.records = processedEmails.filter(Boolean).length;
             } catch (error) {
         console.error('Email sync failed:', error);
         const errorMessage = error instanceof Error ? error.message : 'Unknown error';
         results.errors.push(`Email sync failed: ${errorMessage}`);
       }
    }
    
    // Sync meetings
    if (syncMeetings) {
      try {
        console.log('Fetching meeting metadata...');
        const meetings = await fetchMeetingMetadata({
          top: limit,
          filter: `start/dateTime ge '${dateFilterISO}'`
        });
        
        console.log(`Fetched ${meetings.length} meetings, processing...`);
        const processedMeetings = await emailProcessor.processMeetingMetadata(meetings, session.user.id);
        
        results.meetings.processed = meetings.length;
        results.meetings.records = processedMeetings.filter(Boolean).length;
             } catch (error) {
         console.error('Meeting sync failed:', error);
         const errorMessage = error instanceof Error ? error.message : 'Unknown error';
         results.errors.push(`Meeting sync failed: ${errorMessage}`);
       }
    }
    
    console.log('Sync completed:', results);
    
    return NextResponse.json({
      success: true,
      results,
      message: `Sync completed. Processed ${results.emails.processed} emails and ${results.meetings.processed} meetings.`
    });
    
  } catch (error) {
    console.error('Email sync API error:', error);
         return NextResponse.json(
       { 
         error: 'Internal server error',
         message: error instanceof Error ? error.message : 'Unknown error'
       },
       { status: 500 }
     );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check sync status and permissions
    const hasPermissions = await hasEmailPermissions();
    
    return NextResponse.json({
      hasEmailPermissions: hasPermissions,
      userId: session.user.id,
      scopes: session.scope?.split(' ') || []
    });
    
  } catch (error) {
    console.error('Email sync status check failed:', error);
    return NextResponse.json(
      { error: 'Failed to check sync status' },
      { status: 500 }
    );
  }
} 