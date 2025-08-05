import { createClient, RedisClientType } from 'redis';

let redis: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
  if (!redis) {
    redis = createClient({
      url: process.env.REDIS_CONNECTION_STRING || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
      },
    });

    redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    redis.on('connect', () => {
      console.log('✅ Connected to Azure Redis Cache');
    });

    await redis.connect();
  }
  
  return redis;
}

// Session Management
export async function storeSession(sessionId: string, sessionData: any, ttl: number = 86400) {
  const client = await getRedisClient();
  await client.setEx(`session:${sessionId}`, ttl, JSON.stringify(sessionData));
}

export async function getSession(sessionId: string) {
  const client = await getRedisClient();
  const data = await client.get(`session:${sessionId}`);
  return data ? JSON.parse(data) : null;
}

export async function deleteSession(sessionId: string) {
  const client = await getRedisClient();
  await client.del(`session:${sessionId}`);
}

// Microsoft Graph API Caching
export async function cacheGraphData(key: string, data: any, ttl: number = 300) {
  const client = await getRedisClient();
  await client.setEx(`graph:${key}`, ttl, JSON.stringify(data));
}

export async function getCachedGraphData(key: string) {
  const client = await getRedisClient();
  const data = await client.get(`graph:${key}`);
  return data ? JSON.parse(data) : null;
}

// Rate Limiting
export async function checkRateLimit(userId: string, endpoint: string, limit: number = 100, window: number = 3600) {
  const client = await getRedisClient();
  const key = `rate:${userId}:${endpoint}`;
  
  const count = await client.incr(key);
  if (count === 1) {
    await client.expire(key, window);
  }
  
  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    resetTime: Date.now() + (window * 1000)
  };
}

// Database Query Caching
export async function cacheQueryResult(queryKey: string, data: any, ttl: number = 1800) {
  const client = await getRedisClient();
  await client.setEx(`query:${queryKey}`, ttl, JSON.stringify(data));
}

export async function getCachedQueryResult(queryKey: string) {
  const client = await getRedisClient();
  const data = await client.get(`query:${queryKey}`);
  return data ? JSON.parse(data) : null;
}

// Cache Invalidation
export async function invalidateCache(pattern: string) {
  const client = await getRedisClient();
  const keys = await client.keys(pattern);
  if (keys.length > 0) {
    await client.del(keys);
  }
}

// Health Check
export async function checkRedisHealth() {
  try {
    const client = await getRedisClient();
    await client.ping();
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString() 
    };
  }
}