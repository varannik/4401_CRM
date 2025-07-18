import { NextAuthOptions } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"
import { RedisAdapter } from "./redis-adapter"
import { getRedisClient, TokenCache } from "./redis"

export const authOptions: NextAuthOptions = {
  adapter: RedisAdapter(getRedisClient),
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          scope: "openid profile email User.Read https://database.windows.net/user_impersonation"
        }
      }
    }),
  ],
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async jwt({ token, account, profile, user }) {
      // For database sessions, this is mainly called during sign-in
      if (account && user?.id) {
        console.log('JWT callback - storing tokens in Redis for user:', user.id)
        
        // Calculate expiration time
        const expiresAt = account.expires_at ? account.expires_at * 1000 : Date.now() + 3600000 // 1 hour default

        await TokenCache.setUserTokens(user.id, {
          accessToken: account.access_token!,
          idToken: account.id_token,
          refreshToken: account.refresh_token,
          expiresAt
        })

        token.userId = user.id
      }
      return token
    },
    async session({ session, token, user }) {
      // Add user ID to session for API calls
      if (user?.id) {
        session.userId = user.id
        console.log('Session callback - using database user ID:', user.id)
      } else if (token?.userId) {
        session.userId = token.userId as string
        console.log('Session callback - using token user ID:', token.userId)
      }
      
      return session
    },
    async signIn({ user, account, profile }) {
      console.log('SignIn callback - user:', !!user, 'account:', !!account)
      
      // Store tokens during sign-in for database sessions
      if (account && user?.id) {
        console.log('SignIn callback - storing tokens for user:', user.id)
        
        const expiresAt = account.expires_at ? account.expires_at * 1000 : Date.now() + 3600000

        await TokenCache.setUserTokens(user.id, {
          accessToken: account.access_token!,
          idToken: account.id_token,
          refreshToken: account.refresh_token,
          expiresAt
        })
        
        console.log('SignIn callback - tokens stored successfully')
      }
      
      return true
    },
  },
  events: {
    async signOut({ token, session }) {
      // Clean up tokens from Redis on sign out
      const userId = (session as any)?.userId || (token as any)?.userId
      if (userId) {
        console.log('Cleaning up tokens for user:', userId)
        await TokenCache.deleteUserTokens(userId)
      }
    },
    async linkAccount({ user, account, profile }) {
      // Also store tokens when linking accounts
      if (account && user?.id) {
        console.log('LinkAccount event - storing tokens for user:', user.id)
        
        const expiresAt = account.expires_at ? account.expires_at * 1000 : Date.now() + 3600000

        await TokenCache.setUserTokens(user.id, {
          accessToken: account.access_token!,
          idToken: account.id_token,
          refreshToken: account.refresh_token,
          expiresAt
        })
        
        console.log('LinkAccount event - tokens stored successfully')
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "database",
  },
} 