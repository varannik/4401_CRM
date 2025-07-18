import { createClient, RedisClientType } from 'redis'

let redis: RedisClientType | null = null
let isConnecting = false

export async function getRedisClient(): Promise<RedisClientType> {
  if (redis && redis.isReady) {
    return redis
  }

  if (isConnecting) {
    // Wait for the existing connection attempt
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    if (redis && redis.isReady) {
      return redis
    }
  }

  isConnecting = true

  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
    const redisPassword = process.env.REDIS_PASSWORD

    // Validate URL format
    let url: URL
    try {
      url = new URL(redisUrl)
    } catch (error) {
      console.error('Invalid Redis URL format:', redisUrl)
      throw new Error(`Invalid Redis URL: ${redisUrl}`)
    }

    // Ensure the protocol is redis:// or rediss://
    if (!['redis:', 'rediss:'].includes(url.protocol)) {
      console.error('Invalid Redis protocol. Must be redis:// or rediss://')
      throw new Error(`Invalid Redis protocol: ${url.protocol}. Must be redis:// or rediss://`)
    }

    const config: any = {
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries: number) => {
          console.log(`Redis reconnection attempt ${retries}`)
          return Math.min(retries * 50, 500)
        },
        connectTimeout: 10000,
        lazyConnect: false,
      }
    }

    // Add password if provided
    if (redisPassword) {
      config.password = redisPassword
    }

    console.log('Creating Redis client with URL:', redisUrl.replace(/:[^:@]*@/, ':***@'))
    
    redis = createClient(config)

    redis.on('error', (err: Error) => {
      console.error('Redis connection error:', err)
      isConnecting = false
    })

    redis.on('connect', () => {
      console.log('Connected to Redis')
    })

    redis.on('ready', () => {
      console.log('Redis client ready')
      isConnecting = false
    })

    redis.on('end', () => {
      console.log('Redis connection ended')
      isConnecting = false
    })

    redis.on('reconnecting', () => {
      console.log('Redis reconnecting...')
    })

    // Connect to Redis
    await redis.connect()
    
    return redis

  } catch (error) {
    isConnecting = false
    console.error('Failed to create Redis client:', error)
    throw error
  }
}

// Graceful shutdown
export async function closeRedisConnection(): Promise<void> {
  if (redis) {
    try {
      await redis.quit()
      redis = null
    } catch (error) {
      console.error('Error closing Redis connection:', error)
      redis = null
    }
  }
}

// Helper functions for token management
export const TokenCache = {
  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    const client = await getRedisClient()
    await client.setEx(key, ttlSeconds, JSON.stringify(value))
  },

  async get(key: string): Promise<any | null> {
    try {
      const client = await getRedisClient()
      const value = await client.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Error getting value from Redis:', error)
      return null
    }
  },

  async delete(key: string): Promise<void> {
    try {
      const client = await getRedisClient()
      await client.del(key)
    } catch (error) {
      console.error('Error deleting key from Redis:', error)
    }
  },

  async exists(key: string): Promise<boolean> {
    try {
      const client = await getRedisClient()
      return (await client.exists(key)) === 1
    } catch (error) {
      console.error('Error checking key existence in Redis:', error)
      return false
    }
  },

  // Store AAD tokens with user ID as key
  async setUserTokens(userId: string, tokens: {
    accessToken: string
    idToken?: string
    refreshToken?: string
    expiresAt?: number
  }): Promise<void> {
    const key = `user:${userId}:tokens`
    const ttl = tokens.expiresAt ? Math.floor((tokens.expiresAt - Date.now()) / 1000) : 3600
    await this.set(key, tokens, Math.max(ttl, 300)) // Minimum 5 minutes
  },

  async getUserTokens(userId: string): Promise<{
    accessToken: string
    idToken?: string
    refreshToken?: string
    expiresAt?: number
  } | null> {
    const key = `user:${userId}:tokens`
    return await this.get(key)
  },

  async deleteUserTokens(userId: string): Promise<void> {
    const key = `user:${userId}:tokens`
    await this.delete(key)
  }
}

export default redis 