import { NextAuthOptions } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    userId?: string
    accessToken?: string
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          scope: "openid profile email User.Read"
        }
      }
    }),
  ],
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: "jwt", // Simplified - no Redis/database needed
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // Store Azure tokens and user info in JWT on first sign in
      if (account && user) {
        console.log('JWT callback - storing tokens for user:', user.id)
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.idToken = account.id_token
        token.expiresAt = account.expires_at
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      // Add user ID and access token to session for API calls
      session.userId = token.userId as string
      session.accessToken = token.accessToken as string
      
      // Ensure user.id is set
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      
      console.log('Session callback - user ID:', session.userId)
      return session
    },
    async signIn({ user, account }) {
      console.log('SignIn callback - user:', !!user, 'account:', !!account)
      // No need to store anything - JWT handles it
      return true
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
} 