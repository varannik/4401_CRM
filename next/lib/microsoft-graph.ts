import { Client } from '@microsoft/microsoft-graph-client';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { ExchangeOptimizer } from './exchange-optimization';

// Microsoft Graph API client using session token with timeout
export async function createGraphClient(requireEmailPermissions: boolean = false) {
  try {
    // Add timeout to session retrieval
    const sessionPromise = getServerSession(authOptions);
    const timeoutPromise = new Promise<null>((_, reject) => 
      setTimeout(() => reject(new Error('Session retrieval timeout')), 10000)
    );
    
    const session = await Promise.race([sessionPromise, timeoutPromise]) as any;
    
    if (!session?.accessToken) {
      throw new Error('No access token available. Please sign in.');
    }
    
    // Only check email permissions if explicitly required
    if (requireEmailPermissions) {
      const scopes = session.scope?.split(' ') || [];
      const hasEmailAccess = scopes.some((scope: string) => 
        scope.includes('Mail.Read') || scope.includes('Mail.ReadBasic')
      );
      
      if (!hasEmailAccess) {
        throw new Error('Email permissions not granted. Please re-authenticate with email permissions.');
      }
    }
    
    return Client.init({
      authProvider: async () => session.accessToken as string
    });
  } catch (error) {
    console.error('❌ Failed to create Graph client:', error);
    throw new Error(`Graph client creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Check if user has email permissions
export async function hasEmailPermissions(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  
  if (!session?.scope) {
    return false;
  }
  
  const scopes = session.scope.split(' ');
  return scopes.some(scope => 
    scope.includes('Mail.Read') || scope.includes('Mail.ReadBasic')
  );
}

// Email metadata interface (privacy-compliant)
export interface EmailMetadata {
  id: string;
  subject: string;
  sender: {
    name: string;
    email: string;
  };
  recipients: Array<{
    name: string;
    email: string;
  }>;
  sentDateTime: string;
  receivedDateTime?: string;
  hasAttachments: boolean;
  importance: string;
  conversationId: string;
  isRead: boolean;
  // NO BODY CONTENT - Privacy compliance
}

// Meeting metadata interface
export interface MeetingMetadata {
  id: string;
  subject: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  organizer: {
    name: string;
    email: string;
  };
  attendees: Array<{
    name: string;
    email: string;
    response: string;
  }>;
  location?: {
    displayName: string;
  };
  onlineMeeting?: {
    joinUrl: string;
  };
  isAllDay: boolean;
}

// Fetch emails with Exchange-optimized filtering
export async function fetchEmailMetadata(options?: {
  top?: number;
  filter?: string;
  orderBy?: string;
  daysBack?: number;
}): Promise<EmailMetadata[]> {
  const graphClient = await createGraphClient(true); // Require email permissions
  const config = ExchangeOptimizer.getBatchProcessingConfig();
  
  const {
    top = config.emailBatchSize,
    orderBy = "sentDateTime desc",
    daysBack = 30
  } = options || {};
  
  // Use Exchange-optimized filter if none provided
  const filter = options?.filter || ExchangeOptimizer.getOptimizedEmailFilter(daysBack);
  
  try {
    console.log('🔍 Fetching emails from Exchange with optimized filter...');
    
    const messagesPromise = graphClient
      .api('/me/messages')
      .select('id,subject,sender,toRecipients,ccRecipients,sentDateTime,receivedDateTime,hasAttachments,importance,conversationId,isRead')
      .filter(filter)
      .orderby(orderBy)
      .top(top)
      .get();

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Email fetch timeout (30s) - Exchange may be experiencing delays')), 30000)
    );

    const messages = await Promise.race([messagesPromise, timeoutPromise]);

    console.log(`📧 Retrieved ${messages.value?.length || 0} emails from Exchange`);

    return (messages.value || []).map((message: any) => ({
      id: message.id,
      subject: message.subject || '(No Subject)',
      sender: {
        name: message.sender?.emailAddress?.name || 'Unknown',
        email: message.sender?.emailAddress?.address || ''
      },
      recipients: [
        ...(message.toRecipients || []),
        ...(message.ccRecipients || [])
      ].map((recipient: any) => ({
        name: recipient.emailAddress?.name || 'Unknown',
        email: recipient.emailAddress?.address || ''
      })),
      sentDateTime: message.sentDateTime,
      receivedDateTime: message.receivedDateTime,
      hasAttachments: message.hasAttachments || false,
      importance: message.importance || 'normal',
      conversationId: message.conversationId || '',
      isRead: message.isRead || false
    }));
  } catch (error: any) {
    console.error('❌ Failed to fetch email metadata from Exchange:', error);
    
    // Exchange-specific error handling
    if (error.code === 'Throttled' || error.code === 'TooManyRequests') {
      throw new Error('Exchange is currently throttling requests. Please try again in a few minutes.');
    }
    
    if (error.code === 'Forbidden') {
      throw new Error('Insufficient permissions to access Exchange emails. Please re-authenticate.');
    }
    
    throw new Error(`Failed to fetch emails from Exchange: ${error.message || 'Unknown error'}`);
  }
}

// Fetch calendar meetings with Exchange optimization
export async function fetchMeetingMetadata(options?: {
  top?: number;
  filter?: string;
  daysBack?: number;
}): Promise<MeetingMetadata[]> {
  const graphClient = await createGraphClient(true); // Require calendar permissions
  const config = ExchangeOptimizer.getBatchProcessingConfig();
  
  const {
    top = config.meetingBatchSize,
    daysBack = 30
  } = options || {};
  
  // Use Exchange-optimized filter
  const filter = options?.filter || ExchangeOptimizer.getOptimizedMeetingFilter(daysBack);
  
  try {
    console.log('📅 Fetching meetings from Exchange calendar...');
    
    const eventsPromise = graphClient
      .api('/me/events')
      .select('id,subject,start,end,organizer,attendees,location,onlineMeeting,isAllDay')
      .filter(filter)
      .orderby('start/dateTime desc')
      .top(top)
      .get();

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Meeting fetch timeout (30s) - Exchange may be experiencing delays')), 30000)
    );

    const events = await Promise.race([eventsPromise, timeoutPromise]);

    console.log(`🤝 Retrieved ${events.value?.length || 0} meetings from Exchange`);

    return (events.value || []).map((event: any) => ({
      id: event.id,
      subject: event.subject || '(No Subject)',
      start: event.start,
      end: event.end,
      organizer: {
        name: event.organizer?.emailAddress?.name || 'Unknown',
        email: event.organizer?.emailAddress?.address || ''
      },
      attendees: (event.attendees || []).map((attendee: any) => ({
        name: attendee.emailAddress?.name || 'Unknown',
        email: attendee.emailAddress?.address || '',
        response: attendee.status?.response || 'none'
      })),
      location: event.location,
      onlineMeeting: event.onlineMeeting,
      isAllDay: event.isAllDay || false
    }));
  } catch (error: any) {
    console.error('❌ Failed to fetch meeting metadata from Exchange:', error);
    
    // Exchange-specific error handling
    if (error.code === 'Throttled' || error.code === 'TooManyRequests') {
      throw new Error('Exchange calendar is currently throttling requests. Please try again in a few minutes.');
    }
    
    throw new Error(`Failed to fetch meetings from Exchange calendar: ${error.message || 'Unknown error'}`);
  }
}

// Get user profile information from Exchange/Azure AD with timeout and retry
export async function getUserProfile(retryCount: number = 0) {
  const maxRetries = 3;
  const timeoutDuration = retryCount === 0 ? 30000 : 45000; // First try: 30s, retries: 45s
  let graphClient;
  
  try {
    console.log(`👤 Fetching user profile from Exchange/Azure AD (attempt ${retryCount + 1}/${maxRetries + 1})...`);
    
    // Create client with timeout
    const clientStartTime = Date.now();
    graphClient = await createGraphClient();
    console.log(`✅ Graph client created in ${Date.now() - clientStartTime}ms`);
    
    // Create the API call with timeout
    const apiStartTime = Date.now();
    const profilePromise = graphClient
      .api('/me')
      .select('id,displayName,mail,userPrincipalName,jobTitle,department,companyName')
      .get();
    
    // Add dynamic timeout based on retry attempt
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => {
        console.log(`❌ Profile fetch timeout after ${timeoutDuration/1000}s (attempt ${retryCount + 1})`);
        reject(new Error(`User profile fetch timeout (${timeoutDuration/1000}s) - attempt ${retryCount + 1}`));
      }, timeoutDuration)
    );
    
    const profile = await Promise.race([profilePromise, timeoutPromise]);
    const apiDuration = Date.now() - apiStartTime;
    
    console.log(`✅ Retrieved profile for: ${profile.displayName} (${profile.mail}) in ${apiDuration}ms`);
    return profile;
    
  } catch (error: any) {
    const errorMsg = error.message || 'Unknown error';
    console.error(`❌ Failed to fetch user profile (attempt ${retryCount + 1}):`, errorMsg);
    
    // Retry logic for timeout and network errors
    if (retryCount < maxRetries && (
      errorMsg.includes('timeout') || 
      errorMsg.includes('Network') || 
      errorMsg.includes('ECONNRESET') ||
      errorMsg.includes('ETIMEDOUT') ||
      error.code === 'Throttled' ||
      error.code === 'TooManyRequests'
    )) {
      console.log(`🔄 Retrying profile fetch in ${(retryCount + 1) * 2}s...`);
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
      return getUserProfile(retryCount + 1);
    }
    
    // Enhanced error handling
    if (errorMsg.includes('timeout')) {
      throw new Error(`Microsoft Graph API is responding slowly. This may be due to:\n• High server load on Microsoft's side\n• Network connectivity issues\n• Azure AD throttling\n\nPlease try again in a few minutes.`);
    }
    
    if (error.code === 'Forbidden' || error.code === 'Unauthorized') {
      throw new Error('Access denied. Please sign out and sign in again to refresh your permissions.');
    }
    
    if (error.code === 'Throttled' || error.code === 'TooManyRequests') {
      throw new Error('Microsoft Graph is temporarily throttling requests. Please wait 2-3 minutes and try again.');
    }
    
    if (errorMsg.includes('Network') || errorMsg.includes('ECONNRESET')) {
      throw new Error('Network error while connecting to Microsoft Graph. Please check your internet connection and try again.');
    }
    
    throw new Error(`Failed to fetch user profile: ${errorMsg}`);
  }
}

// Fallback function to get user profile from session when Microsoft Graph is slow
export async function getUserProfileFromSession() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      throw new Error('No session available');
    }
    
    // Return basic profile from session data
    return {
      id: session.user.id || session.user.email || 'unknown',
      displayName: session.user.name || 'Unknown User',
      mail: session.user.email || '',
      userPrincipalName: session.user.email || '',
      jobTitle: null,
      department: null,
      companyName: null,
      source: 'session' // Indicate this is from session, not Graph API
    };
  } catch (error) {
    console.error('❌ Failed to get user profile from session:', error);
    throw new Error('Unable to get user information from session');
  }
}

// Enhanced user profile function with fallback
export async function getUserProfileSafe(useFallback: boolean = true) {
  try {
    // Try to get full profile from Microsoft Graph
    return await getUserProfile();
  } catch (error: any) {
    console.error('❌ Microsoft Graph profile fetch failed:', error);
    
    if (useFallback && (error.message?.includes('timeout') || error.message?.includes('Network'))) {
      console.log('🔄 Falling back to session-based profile...');
      
      try {
        const sessionProfile = await getUserProfileFromSession();
        console.log('✅ Using session-based profile as fallback');
        return sessionProfile;
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
      }
    }
    
    // If no fallback or fallback failed, throw original error
    throw error;
  }
}

// Test Exchange connectivity and permissions
export async function testExchangeConnection(): Promise<{
  success: boolean;
  permissions: string[];
  exchangeVersion?: string;
  mailboxType?: string;
  errors: string[];
}> {
  try {
    const results = {
      success: false,
      permissions: [] as string[],
      errors: [] as string[]
    };
    
    // Test basic profile access (no email permissions required)
    try {
      const profile = await getUserProfile();
      results.permissions.push('User.Read ✅');
      console.log(`✅ Exchange connection test: Profile access successful for ${profile.mail}`);
    } catch (error) {
      results.errors.push('Profile access failed');
    }
    
    // Test email access (requires email permissions)
    try {
      const graphClient = await createGraphClient(true); // Require email permissions for this test
      const emailTestPromise = graphClient
        .api('/me/messages')
        .select('id')
        .top(1)
        .get();
      
      const emailTimeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Email access test timeout')), 20000)
      );
      
      await Promise.race([emailTestPromise, emailTimeoutPromise]);
      results.permissions.push('Mail.Read ✅');
      console.log('✅ Exchange connection test: Email access successful');
    } catch (error) {
      results.errors.push('Email access failed - check Mail.Read permission');
    }
    
    // Test calendar access (requires calendar permissions)
    try {
      const graphClient = await createGraphClient(true); // Require calendar permissions for this test
      const calendarTestPromise = graphClient
        .api('/me/events')
        .select('id')
        .top(1)
        .get();
      
      const calendarTimeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Calendar access test timeout')), 20000)
      );
      
      await Promise.race([calendarTestPromise, calendarTimeoutPromise]);
      results.permissions.push('Calendars.Read ✅');
      console.log('✅ Exchange connection test: Calendar access successful');
    } catch (error) {
      results.errors.push('Calendar access failed - check Calendars.Read permission');
    }
    
    results.success = results.errors.length === 0;
    return results;
    
  } catch (error: any) {
    console.error('❌ Exchange connection test failed:', error);
    return {
      success: false,
      permissions: [],
      errors: [`Connection test failed: ${error.message}`]
    };
  }
} 

// Debug utility to test Exchange connectivity with detailed logging
export async function debugExchangeConnection(): Promise<{
  success: boolean;
  steps: Array<{ step: string; success: boolean; duration: number; error?: string }>;
  totalDuration: number;
}> {
  const startTime = Date.now();
  const steps: Array<{ step: string; success: boolean; duration: number; error?: string }> = [];
  
  // Step 1: Session retrieval
  let stepStart = Date.now();
  try {
    console.log('🔍 Step 1: Testing session retrieval...');
    const session = await getServerSession(authOptions);
    steps.push({
      step: 'Session Retrieval',
      success: !!session,
      duration: Date.now() - stepStart,
      error: !session ? 'No session found' : undefined
    });
    
    if (!session) {
      return { success: false, steps, totalDuration: Date.now() - startTime };
    }
    
    // Step 2: Token validation
    stepStart = Date.now();
    console.log('🔍 Step 2: Testing token validation...');
    const hasToken = !!session.accessToken;
    steps.push({
      step: 'Token Validation',
      success: hasToken,
      duration: Date.now() - stepStart,
      error: !hasToken ? 'No access token found' : undefined
    });
    
    if (!hasToken) {
      return { success: false, steps, totalDuration: Date.now() - startTime };
    }
    
    // Step 3: Graph client creation
    stepStart = Date.now();
    console.log('🔍 Step 3: Testing Graph client creation...');
    try {
      const graphClient = await createGraphClient(); // Basic client without email requirements
      steps.push({
        step: 'Graph Client Creation',
        success: true,
        duration: Date.now() - stepStart
      });
      
      // Step 4: User profile fetch
      stepStart = Date.now();
      console.log('🔍 Step 4: Testing user profile fetch...');
      await getUserProfile();
      steps.push({
        step: 'User Profile Fetch',
        success: true,
        duration: Date.now() - stepStart
      });
      
      return { success: true, steps, totalDuration: Date.now() - startTime };
      
    } catch (error) {
      steps.push({
        step: 'Graph Client Creation',
        success: false,
        duration: Date.now() - stepStart,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return { success: false, steps, totalDuration: Date.now() - startTime };
    }
    
  } catch (error) {
    steps.push({
      step: 'Session Retrieval',
      success: false,
      duration: Date.now() - stepStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return { success: false, steps, totalDuration: Date.now() - startTime };
  }
} 