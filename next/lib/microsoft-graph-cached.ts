import { Client } from '@microsoft/microsoft-graph-client';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { 
  cacheGraphData, 
  getCachedGraphData, 
  checkRateLimit,
  getRedisClient,
  cacheQueryResult,
  getCachedQueryResult
} from './redis';

// Enhanced Microsoft Graph client with Redis caching
export async function createGraphClientCached(requireEmailPermissions: boolean = false) {
  try {
    const sessionPromise = getServerSession(authOptions);
    const timeoutPromise = new Promise<null>((_, reject) => 
      setTimeout(() => reject(new Error('Session retrieval timeout')), 10000)
    );
    
    const session = await Promise.race([sessionPromise, timeoutPromise]) as any;
    
    if (!session?.accessToken) {
      throw new Error('No access token available. Please sign in.');
    }
    
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

// Cache webhook email processing state
export async function cacheWebhookProcessingState(messageId: string, state: 'processing' | 'completed' | 'failed', data?: any) {
  const redis = await getRedisClient();
  const cacheKey = `webhook:email:${messageId}`;
  
  const stateData = {
    state,
    timestamp: new Date().toISOString(),
    data: data || null
  };
  
  // Cache for 24 hours to prevent duplicate processing
  await redis.setEx(cacheKey, 86400, JSON.stringify(stateData));
  
  console.log(`📧 Cached webhook processing state: ${messageId} -> ${state}`);
}

// Check if email webhook was already processed
export async function getWebhookProcessingState(messageId: string) {
  const redis = await getRedisClient();
  const cacheKey = `webhook:email:${messageId}`;
  
  const cached = await redis.get(cacheKey);
  if (cached) {
    const state = JSON.parse(cached);
    console.log(`📧 Found webhook processing state: ${messageId} -> ${state.state}`);
    return state;
  }
  
  return null;
}

// Cache company lookup by email domain
export async function cacheCompanyByDomain(domain: string, company: any) {
  const cacheKey = `domain:company:${domain.toLowerCase()}`;
  await cacheQueryResult(cacheKey, company, 3600); // Cache for 1 hour
  console.log(`🏢 Cached company for domain: ${domain}`);
}

// Get cached company by email domain
export async function getCachedCompanyByDomain(domain: string) {
  const cacheKey = `domain:company:${domain.toLowerCase()}`;
  const cached = await getCachedQueryResult(cacheKey);
  
  if (cached) {
    console.log(`🏢 Retrieved cached company for domain: ${domain}`);
  }
  
  return cached;
}

// Cache contact lookup by email
export async function cacheContactByEmail(email: string, contact: any) {
  const cacheKey = `email:contact:${email.toLowerCase()}`;
  await cacheQueryResult(cacheKey, contact, 1800); // Cache for 30 minutes
  console.log(`👤 Cached contact for email: ${email}`);
}

// Get cached contact by email
export async function getCachedContactByEmail(email: string) {
  const cacheKey = `email:contact:${email.toLowerCase()}`;
  const cached = await getCachedQueryResult(cacheKey);
  
  if (cached) {
    console.log(`👤 Retrieved cached contact for email: ${email}`);
  }
  
  return cached;
}

// Cache recent communications for dashboard
export async function cacheRecentCommunications(companyId: string, communications: any[]) {
  const cacheKey = `communications:recent:${companyId}`;
  await cacheQueryResult(cacheKey, communications, 600); // Cache for 10 minutes
  console.log(`💬 Cached recent communications for company: ${companyId}`);
}

// Get cached recent communications
export async function getCachedRecentCommunications(companyId: string) {
  const cacheKey = `communications:recent:${companyId}`;
  const cached = await getCachedQueryResult(cacheKey);
  
  if (cached) {
    console.log(`💬 Retrieved cached communications for company: ${companyId}`);
  }
  
  return cached;
}

// Rate limiting for webhook processing
export async function checkWebhookRateLimit(senderEmail: string) {
  const domain = senderEmail.split('@')[1]?.toLowerCase();
  
  // Check per-email rate limiting (100 emails per hour per sender)
  const emailRateCheck = await checkRateLimit(senderEmail, 'webhook-email', 100, 3600);
  
  // Check per-domain rate limiting (500 emails per hour per domain)
  const domainRateCheck = await checkRateLimit(domain, 'webhook-domain', 500, 3600);
  
  return {
    emailAllowed: emailRateCheck.allowed,
    domainAllowed: domainRateCheck.allowed,
    emailRemaining: emailRateCheck.remaining,
    domainRemaining: domainRateCheck.remaining,
    resetTime: Math.max(emailRateCheck.resetTime, domainRateCheck.resetTime)
  };
}

// Cache webhook processing queue for high-volume periods
export async function addToWebhookQueue(messageId: string, webhookData: any, priority: 'high' | 'normal' | 'low' = 'normal') {
  const redis = await getRedisClient();
  const queueKey = `webhook:queue:${priority}`;
  
  const queueItem = {
    messageId,
    webhookData,
    timestamp: new Date().toISOString(),
    retryCount: 0
  };
  
  // Add to Redis list (FIFO queue)
  await redis.lPush(queueKey, JSON.stringify(queueItem));
  
  console.log(`📋 Added webhook to ${priority} priority queue: ${messageId}`);
}

// Process webhook queue (for background processing)
export async function processWebhookQueue(priority: 'high' | 'normal' | 'low' = 'normal', batchSize: number = 10) {
  const redis = await getRedisClient();
  const queueKey = `webhook:queue:${priority}`;
  
  const processedItems: any[] = [];
  
  for (let i = 0; i < batchSize; i++) {
    const item = await redis.rPop(queueKey);
    if (!item) break;
    
    try {
      const queueItem = JSON.parse(item);
      console.log(`⚡ Processing queued webhook: ${queueItem.messageId}`);
      
      // Mark as processing
      await cacheWebhookProcessingState(queueItem.messageId, 'processing');
      
      processedItems.push(queueItem);
    } catch (error) {
      console.error('Failed to parse queue item:', error);
    }
  }
  
  return processedItems;
}

// Cache email processing analytics
export async function trackEmailProcessingMetrics(type: 'received' | 'processed' | 'failed', senderDomain?: string) {
  const redis = await getRedisClient();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // Daily metrics
  const dailyKey = `metrics:daily:${today}:${type}`;
  await redis.incr(dailyKey);
  await redis.expire(dailyKey, 86400 * 30); // Keep for 30 days
  
  // Domain-specific metrics if provided
  if (senderDomain) {
    const domainKey = `metrics:domain:${today}:${senderDomain}:${type}`;
    await redis.incr(domainKey);
    await redis.expire(domainKey, 86400 * 7); // Keep for 7 days
  }
  
  // Hourly metrics for real-time monitoring
  const hour = new Date().toISOString().split('T')[1].split(':')[0]; // HH format
  const hourlyKey = `metrics:hourly:${today}:${hour}:${type}`;
  await redis.incr(hourlyKey);
  await redis.expire(hourlyKey, 86400); // Keep for 24 hours
  
  console.log(`📊 Tracked email metric: ${type} for ${senderDomain || 'all domains'}`);
}

// Get email processing analytics
export async function getEmailProcessingMetrics(days: number = 7) {
  const redis = await getRedisClient();
  const metrics: any = {
    daily: {},
    topDomains: {},
    hourlyToday: {}
  };
  
  // Get daily metrics for the past N days
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const received = await redis.get(`metrics:daily:${dateStr}:received`) || '0';
    const processed = await redis.get(`metrics:daily:${dateStr}:processed`) || '0';
    const failed = await redis.get(`metrics:daily:${dateStr}:failed`) || '0';
    
    metrics.daily[dateStr] = {
      received: parseInt(received),
      processed: parseInt(processed),
      failed: parseInt(failed)
    };
  }
  
  // Get hourly metrics for today
  const today = new Date().toISOString().split('T')[0];
  for (let hour = 0; hour < 24; hour++) {
    const hourStr = hour.toString().padStart(2, '0');
    const received = await redis.get(`metrics:hourly:${today}:${hourStr}:received`) || '0';
    const processed = await redis.get(`metrics:hourly:${today}:${hourStr}:processed`) || '0';
    
    metrics.hourlyToday[hourStr] = {
      received: parseInt(received),
      processed: parseInt(processed)
    };
  }
  
  return metrics;
}

// Cache frequently accessed communication threads
export async function cacheEmailThread(threadId: string, communications: any[]) {
  const cacheKey = `thread:${threadId}`;
  await cacheQueryResult(cacheKey, communications, 1800); // Cache for 30 minutes
  console.log(`🧵 Cached email thread: ${threadId} (${communications.length} messages)`);
}

// Get cached email thread
export async function getCachedEmailThread(threadId: string) {
  const cacheKey = `thread:${threadId}`;
  const cached = await getCachedQueryResult(cacheKey);
  
  if (cached) {
    console.log(`🧵 Retrieved cached email thread: ${threadId}`);
  }
  
  return cached;
}

// Cache dashboard data for faster loading
export async function cacheDashboardData(userId: string, dashboardData: any) {
  const cacheKey = `dashboard:${userId}`;
  await cacheQueryResult(cacheKey, dashboardData, 300); // Cache for 5 minutes
  console.log(`📊 Cached dashboard data for user: ${userId}`);
}

// Get cached dashboard data
export async function getCachedDashboardData(userId: string) {
  const cacheKey = `dashboard:${userId}`;
  const cached = await getCachedQueryResult(cacheKey);
  
  if (cached) {
    console.log(`📊 Retrieved cached dashboard data for user: ${userId}`);
  }
  
  return cached;
}

// Cache invalidation helper for webhook-related data
export async function invalidateWebhookCache(messageId?: string, companyId?: string, contactEmail?: string) {
  const redis = await getRedisClient();
  const patterns: string[] = [];
  
  if (messageId) {
    patterns.push(`webhook:email:${messageId}`);
  }
  
  if (companyId) {
    patterns.push(`communications:recent:${companyId}`, `thread:*`);
  }
  
  if (contactEmail) {
    const domain = contactEmail.split('@')[1]?.toLowerCase();
    patterns.push(`email:contact:${contactEmail.toLowerCase()}`);
    if (domain) {
      patterns.push(`domain:company:${domain}`);
    }
  }
  
  for (const pattern of patterns) {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }
  
  console.log(`🗑️ Invalidated webhook-related cache`);
}

// Cached user profile fetching (still needed for Microsoft Graph integration)
export async function getUserProfileCached(userId: string) {
  // Check rate limiting
  const rateCheck = await checkRateLimit(userId, 'profile', 50, 3600); // 50 calls per hour
  if (!rateCheck.allowed) {
    throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((rateCheck.resetTime - Date.now()) / 60000)} minutes.`);
  }

  // Try cache first (1 hour cache)
  const cacheKey = `profile:${userId}`;
  const cachedData = await getCachedGraphData(cacheKey);
  
  if (cachedData) {
    console.log('👤 Retrieved user profile from Redis cache');
    return cachedData;
  }

  try {
    console.log('👤 Fetching user profile from Microsoft Graph API...');
    
    const graphClient = await createGraphClientCached();
    
    const profilePromise = graphClient
      .api('/me')
      .select('id,displayName,mail,userPrincipalName,jobTitle,department,companyName')
      .get();
    
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Profile fetch timeout (15s)')), 15000)
    );
    
    const profile = await Promise.race([profilePromise, timeoutPromise]);
    
    // Cache for 1 hour
    await cacheGraphData(cacheKey, profile, 3600);
    
    console.log(`✅ Retrieved and cached profile for: ${profile.displayName}`);
    return profile;
    
  } catch (error: any) {
    console.error('❌ Profile fetch failed:', error);
    throw new Error(`Failed to fetch user profile: ${error.message || 'Unknown error'}`);
  }
}