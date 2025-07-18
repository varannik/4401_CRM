import type { Adapter, AdapterUser, AdapterAccount, AdapterSession, VerificationToken } from "next-auth/adapters"
import type { RedisClientType } from "redis"

export interface RedisAdapterOptions {
  baseKeyPrefix?: string
  accountKeyPrefix?: string
  accountByUserIdPrefix?: string
  emailKeyPrefix?: string
  sessionKeyPrefix?: string
  sessionByUserIdKeyPrefix?: string
  userKeyPrefix?: string
  verificationTokenKeyPrefix?: string
}

const defaultOptions: RedisAdapterOptions = {
  baseKeyPrefix: "",
  accountKeyPrefix: "user:account:",
  accountByUserIdPrefix: "user:account:by-user-id:",
  emailKeyPrefix: "user:email:",
  sessionKeyPrefix: "user:session:",
  sessionByUserIdKeyPrefix: "user:session:by-user-id:",
  userKeyPrefix: "user:",
  verificationTokenKeyPrefix: "user:token:",
}

export function RedisAdapter(
  getClient: () => Promise<RedisClientType>,
  options: RedisAdapterOptions = {}
): Adapter {
  const opts = { ...defaultOptions, ...options }
  const { baseKeyPrefix } = opts

  const setObjectAsJson = async (key: string, obj: Record<string, any>) => {
    const client = await getClient()
    await client.set(`${baseKeyPrefix}${key}`, JSON.stringify(obj))
  }

  const getObjectFromJson = async (key: string) => {
    const client = await getClient()
    const value = await client.get(`${baseKeyPrefix}${key}`)
    if (!value) return null
    return JSON.parse(value)
  }

  return {
    async createUser(user: Omit<AdapterUser, "id">) {
      const id = crypto.randomUUID()
      const newUser: AdapterUser = { ...user, id }
      await setObjectAsJson(`${opts.userKeyPrefix}${id}`, newUser)
      
      const client = await getClient()
      await client.set(`${baseKeyPrefix}${opts.emailKeyPrefix}${user.email}`, id)
      return newUser
    },

    async getUser(id: string) {
      const user = await getObjectFromJson(`${opts.userKeyPrefix}${id}`)
      if (!user) return null
      return user as AdapterUser
    },

    async getUserByEmail(email: string) {
      const client = await getClient()
      const userId = await client.get(`${baseKeyPrefix}${opts.emailKeyPrefix}${email}`)
      if (!userId) return null
      
      const user = await getObjectFromJson(`${opts.userKeyPrefix}${userId}`)
      return user ? (user as AdapterUser) : null
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const accountId = `${provider}:${providerAccountId}`
      const account = await getObjectFromJson(`${opts.accountKeyPrefix}${accountId}`)
      if (!account) return null
      
      const user = await getObjectFromJson(`${opts.userKeyPrefix}${account.userId}`)
      return user ? (user as AdapterUser) : null
    },

    async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, "id">) {
      const existingUser = await getObjectFromJson(`${opts.userKeyPrefix}${user.id}`)
      if (!existingUser) throw new Error("User not found")
      
      const updatedUser = { ...existingUser, ...user }
      await setObjectAsJson(`${opts.userKeyPrefix}${user.id}`, updatedUser)
      return updatedUser as AdapterUser
    },

    async deleteUser(userId: string) {
      const user = await getObjectFromJson(`${opts.userKeyPrefix}${userId}`)
      if (!user) return
      
      const client = await getClient()
      
      // Delete user
      await client.del(`${baseKeyPrefix}${opts.userKeyPrefix}${userId}`)
      // Delete email mapping
      await client.del(`${baseKeyPrefix}${opts.emailKeyPrefix}${user.email}`)
      
      // Delete all accounts for this user
      const accountKeys = await client.keys(`${baseKeyPrefix}${opts.accountKeyPrefix}*`)
      for (const key of accountKeys) {
        const account = await getObjectFromJson(key.replace(`${baseKeyPrefix}`, ''))
        if (account?.userId === userId) {
          await client.del(key)
        }
      }
      
      // Delete all sessions for this user
      const sessionKeys = await client.keys(`${baseKeyPrefix}${opts.sessionKeyPrefix}*`)
      for (const key of sessionKeys) {
        const session = await getObjectFromJson(key.replace(`${baseKeyPrefix}`, ''))
        if (session?.userId === userId) {
          await client.del(key)
        }
      }
    },

    async linkAccount(account: AdapterAccount) {
      const accountId = `${account.provider}:${account.providerAccountId}`
      await setObjectAsJson(`${opts.accountKeyPrefix}${accountId}`, account)
      
      const client = await getClient()
      await client.set(`${baseKeyPrefix}${opts.accountByUserIdPrefix}${account.userId}`, accountId)
    },

    async unlinkAccount({ providerAccountId, provider }) {
      const accountId = `${provider}:${providerAccountId}`
      const account = await getObjectFromJson(`${opts.accountKeyPrefix}${accountId}`)
      if (!account) return
      
      const client = await getClient()
      await client.del(`${baseKeyPrefix}${opts.accountKeyPrefix}${accountId}`)
      await client.del(`${baseKeyPrefix}${opts.accountByUserIdPrefix}${account.userId}`)
    },

    async createSession({ sessionToken, userId, expires }) {
      const session: AdapterSession = { sessionToken, userId, expires }
      await setObjectAsJson(`${opts.sessionKeyPrefix}${sessionToken}`, session)
      
      const client = await getClient()
      await client.set(`${baseKeyPrefix}${opts.sessionByUserIdKeyPrefix}${userId}`, sessionToken)
      return session
    },

    async getSessionAndUser(sessionToken: string) {
      const session = await getObjectFromJson(`${opts.sessionKeyPrefix}${sessionToken}`)
      if (!session) return null
      
      const user = await getObjectFromJson(`${opts.userKeyPrefix}${session.userId}`)
      if (!user) return null
      
      return {
        session: {
          ...session,
          expires: new Date(session.expires)
        } as AdapterSession,
        user: user as AdapterUser
      }
    },

    async updateSession({ sessionToken, expires, userId }) {
      const existingSession = await getObjectFromJson(`${opts.sessionKeyPrefix}${sessionToken}`)
      if (!existingSession) return null
      
      const updatedSession = {
        ...existingSession,
        ...(expires && { expires }),
        ...(userId && { userId })
      }
      
      await setObjectAsJson(`${opts.sessionKeyPrefix}${sessionToken}`, updatedSession)
      return {
        ...updatedSession,
        expires: new Date(updatedSession.expires)
      } as AdapterSession
    },

    async deleteSession(sessionToken: string) {
      const session = await getObjectFromJson(`${opts.sessionKeyPrefix}${sessionToken}`)
      if (!session) return
      
      const client = await getClient()
      await client.del(`${baseKeyPrefix}${opts.sessionKeyPrefix}${sessionToken}`)
      await client.del(`${baseKeyPrefix}${opts.sessionByUserIdKeyPrefix}${session.userId}`)
    },

    async createVerificationToken({ identifier, expires, token }) {
      const verificationToken = { identifier, expires, token }
      await setObjectAsJson(`${opts.verificationTokenKeyPrefix}${identifier}:${token}`, verificationToken)
      return verificationToken
    },

    async useVerificationToken({ identifier, token }) {
      const key = `${opts.verificationTokenKeyPrefix}${identifier}:${token}`
      const verificationToken = await getObjectFromJson(key)
      if (!verificationToken) return null
      
      const client = await getClient()
      await client.del(`${baseKeyPrefix}${key}`)
      return {
        ...verificationToken,
        expires: new Date(verificationToken.expires)
      } as VerificationToken
    },
  }
} 