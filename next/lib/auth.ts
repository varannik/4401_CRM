import { NextAuthOptions } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"
import { prisma } from "@/lib/prisma"

// Module augmentations moved to types/next-auth.d.ts

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          scope: "openid profile email User.Read Mail.Read Mail.ReadBasic Calendars.Read offline_access"
          // Added Mail.Read, Mail.ReadBasic, Calendars.Read, offline_access for email integration
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
        token.scope = account.scope
        token.userId = user.id

        // Fetch user role and department from database
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email || '' },
            include: { department: true }
          })
          
          if (dbUser) {
            token.role = dbUser.role
            token.departmentId = dbUser.departmentId || undefined
          } else {
            // Create new user with default consultant role
            const newUser = await prisma.user.create({
              data: {
                email: user.email || '',
                name: user.name,
                image: user.image,
                role: 'consultant' as const
              }
            })
            token.role = newUser.role
            token.departmentId = newUser.departmentId || undefined
          }
        } catch (error) {
          console.error('Failed to fetch/create user from database:', error)
          token.role = 'consultant' // Default role
        }
      }

      // Check if token needs refresh (15 minutes before expiry)
      if (token.expiresAt && Date.now() < (token.expiresAt * 1000 - 15 * 60 * 1000)) {
        return token
      }

      // Token is expired or about to expire, try to refresh it
      if (token.refreshToken) {
        try {
          const refreshedTokens = await refreshAccessToken(token.refreshToken as string)
          return {
            ...token,
            accessToken: refreshedTokens.access_token,
            expiresAt: Math.floor(Date.now() / 1000 + refreshedTokens.expires_in),
            refreshToken: refreshedTokens.refresh_token || token.refreshToken,
          }
        } catch (error) {
          console.error('Token refresh failed:', error)
          return { ...token, error: "RefreshAccessTokenError" }
        }
      }

      return token
    },
    async session({ session, token }) {
      // Add user ID, access token, and scope to session for API calls
      session.userId = token.userId as string
      session.accessToken = token.accessToken as string
      session.refreshToken = token.refreshToken as string
      session.scope = token.scope as string
      
      // Ensure user.id is set and add role information
      if (session.user && token.sub) {
        session.user.id = token.sub
        session.user.role = token.role as string
        session.user.departmentId = token.departmentId as string
      }
      
      // Handle token refresh errors
      if (token.error) {
        session.error = token.error as string
      }
      
      console.log('Session callback - user ID:', session.userId, 'role:', token.role)
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

// Token refresh function with timeout
async function refreshAccessToken(refreshToken: string) {
  try {
    console.log('🔄 Refreshing Azure AD access token...');
    
    const fetchPromise = fetch(`https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.AZURE_AD_CLIENT_ID!,
        client_secret: process.env.AZURE_AD_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        scope: 'openid profile email User.Read Mail.Read Mail.ReadBasic Calendars.Read offline_access'
      })
    });

    // Add 15 second timeout for token refresh
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Token refresh timeout (15s)')), 15000)
    );

    const response = await Promise.race([fetchPromise, timeoutPromise]);
    const tokens = await response.json();

    if (!response.ok) {
      throw new Error(tokens.error_description || `Token refresh failed: ${response.status}`);
    }

    console.log('✅ Token refresh successful');
    return tokens;
  } catch (error) {
    console.error('❌ Error refreshing access token:', error);
    
    // Enhanced error handling for token refresh
    if (error instanceof Error && error.message.includes('timeout')) {
      throw new Error('Token refresh timed out. Please sign in again.');
    }
    
    throw error;
  }
} 