import { EmailMetadata, MeetingMetadata } from './microsoft-graph';

// Exchange-specific configurations and optimizations
export class ExchangeOptimizer {
  
  // Exchange-specific email filtering for better performance
  static getOptimizedEmailFilter(daysBack: number = 30): string {
    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - daysBack);
    
    // Exchange-optimized OData filter
    return [
      `sentDateTime ge ${dateFilter.toISOString()}`,
      // Exclude internal distribution lists and automated emails
      `not startsWith(sender/emailAddress/address, 'noreply')`,
      `not startsWith(sender/emailAddress/address, 'donotreply')`,
      `not contains(sender/emailAddress/address, 'notifications')`,
      // Focus on external communications (non-44.01 domain)
      `not endsWith(sender/emailAddress/address, '@44.01.com')`,
      `not endsWith(sender/emailAddress/address, '@44point01.com')`,
      // Exclude system emails
      `not startsWith(subject, 'Automatic reply:')`,
      `not startsWith(subject, 'Out of office:')`,
      `not startsWith(subject, 'Delivery Status Notification')`
    ].join(' and ');
  }
  
  // Exchange-specific meeting filter
  static getOptimizedMeetingFilter(daysBack: number = 30): string {
    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - daysBack);
    
    return [
      `start/dateTime ge '${dateFilter.toISOString()}'`,
      // Exclude all-internal meetings
      `attendees/any(a: not endsWith(a/emailAddress/address, '@44.01.com'))`,
      // Exclude cancelled meetings
      `isCancelled eq false`,
      // Exclude private meetings (respect privacy)
      `sensitivity ne 'private'`
    ].join(' and ');
  }
  
  // Exchange-specific batch processing for large mailboxes
  static getBatchProcessingConfig() {
    return {
      // Optimal batch sizes for Exchange
      emailBatchSize: 50,   // Exchange handles 50 emails well per request
      meetingBatchSize: 25, // Meetings have more complex data
      maxConcurrentRequests: 3, // Avoid throttling
      delayBetweenBatches: 100, // ms delay to respect rate limits
      
      // Exchange pagination
      maxTotalEmails: 1000,   // Reasonable limit for initial sync
      maxTotalMeetings: 500,  // Meetings are less frequent
    };
  }
  
  // Exchange-specific company domain extraction
  static extractCompanyDomainInfo(email: string): {
    domain: string;
    isExchangeOnline: boolean;
    isOutlook: boolean;
    companyHint: string;
  } {
    const domain = email.split('@')[1]?.toLowerCase() || '';
    
    return {
      domain,
      isExchangeOnline: domain.includes('outlook.com') || domain.includes('hotmail.com'),
      isOutlook: domain === 'outlook.com' || domain === 'hotmail.com',
      companyHint: this.generateCompanyNameFromDomain(domain)
    };
  }
  
  private static generateCompanyNameFromDomain(domain: string): string {
    // Enhanced company name generation for common patterns
    const cleanDomain = domain
      .replace(/\.(com|org|net|edu|gov|co\.uk|co\.in|de|fr|jp|au)$/i, '')
      .replace(/^www\./, '');
    
    // Handle common corporate email patterns
    if (cleanDomain.includes('.')) {
      const parts = cleanDomain.split('.');
      // Take the main part (usually the company name)
      return parts[parts.length - 1]
        .split(/[-_]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    }
    
    return cleanDomain
      .split(/[-_]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
  
  // Exchange-specific error handling and retry logic
  static getRetryConfig() {
    return {
      maxRetries: 3,
      baseDelay: 1000, // Start with 1 second
      exponentialBackoff: true,
      
      // Exchange-specific error codes to retry on
      retryableErrors: [
        'throttled',
        'service_unavailable', 
        'timeout',
        'internal_server_error',
        'too_many_requests'
      ],
      
      // Don't retry on these errors
      skipRetryErrors: [
        'unauthorized',
        'forbidden',
        'not_found',
        'bad_request'
      ]
    };
  }
}

// Exchange environment detection
export function detectExchangeEnvironment(): {
  isExchangeOnline: boolean;
  isHybrid: boolean;
  isOnPremises: boolean;
  recommendations: string[];
} {
  // This would typically be configured based on your organization's setup
  // For now, we'll assume Exchange Online (most common)
  
  return {
    isExchangeOnline: true,  // Most likely scenario
    isHybrid: false,         // Would need to be configured
    isOnPremises: false,     // Would need to be configured
    
    recommendations: [
      'Ensure your Exchange Online admin has enabled Microsoft Graph API access',
      'Verify that the Azure AD app has the necessary permissions',
      'Check if your organization has any conditional access policies that might affect API access',
      'Consider setting up application-level permissions for batch processing'
    ]
  };
}

// Exchange-specific optimization suggestions
export function getExchangeOptimizationTips(): string[] {
  return [
    '🔧 Use delta queries for incremental sync after initial setup',
    '⚡ Implement webhook subscriptions for real-time updates',
    '📊 Enable application insights to monitor API usage and performance',
    '🛡️ Set up retry logic with exponential backoff for resilience',
    '📈 Use batch requests for processing multiple emails efficiently',
    '🔍 Implement smart filtering to exclude internal/automated emails',
    '💾 Cache frequently accessed data to reduce API calls',
    '🕐 Schedule sync during off-peak hours for better performance'
  ];
} 