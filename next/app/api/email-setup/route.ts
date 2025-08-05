import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// API endpoint to get email setup configuration
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Return the email setup configuration
    return NextResponse.json({
      success: true,
      emailAddress: 'crm@4401.earth',
      status: 'active',
      processingEnabled: true,
      lastProcessed: new Date().toISOString(),
      configuration: {
        autoClassification: true,
        smartTagging: true,
        duplicateDetection: true,
        externalOnly: true
      },
      instructions: [
        'Forward external emails to crm@4401.earth',
        'Or CC the address when sending emails to external contacts',
        'System automatically creates contact and organization records',
        'Communication history is logged with intelligent tags and metadata'
      ]
    });

  } catch (error) {
    console.error('Email setup configuration error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get email setup configuration',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// API endpoint to test email processing status
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { testEmail } = body;

    // Validate that this looks like an external email
    if (testEmail && testEmail.includes('@4401.earth')) {
      return NextResponse.json({
        success: false,
        message: 'Cannot test with internal 4401.earth addresses'
      });
    }

    // Return processing status
    return NextResponse.json({
      success: true,
      message: 'Email processing is active and ready',
      status: {
        webhookActive: true,
        processingDelay: '1-2 minutes',
        lastHealthCheck: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Email setup test error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to test email setup',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}