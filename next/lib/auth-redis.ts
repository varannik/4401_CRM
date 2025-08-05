import { NextAuthOptions } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"
import { PrismaClient } from "@prisma/client"
import { storeSession, getSession, deleteSession } from './redis';

const prisma = new PrismaClient()

// Enhanced auth configuration with Redis session storage
export const authOptionsWithRedis: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          scope: "openid profile email User.Read Mail.Read Mail.ReadBasic Calendars.Read offline_access"
        }
      }
    }),
  ],
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: "database", // Use Redis instead of JWT
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // Update every hour
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('SignIn callback - Redis session storage');
      return true;
    },
    
    async session({ session, token, user }) {
      // Enhanced session with cached user data
      if (session.user?.email) {
        try {
          // Try to get user data from cache/database
          const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { department: true }
          });
          
          if (dbUser) {
            session.user.id = dbUser.id;
            session.user.role = dbUser.role;
            session.user.departmentId = dbUser.departmentId;
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      }
      
      return session;
    },
    
    async jwt({ token, account, user, profile }) {
      // Store Azure tokens in Redis when user signs in
      if (account && user) {
        const sessionData = {
          userId: user.id,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          idToken: account.id_token,
          expiresAt: account.expires_at,
          scope: account.scope,
          tokenType: account.token_type,
          email: user.email,
          name: user.name,
          image: user.image,
        };
        
        // Store in Redis with 24 hour expiry
        await storeSession(`azure_tokens:${user.id}`, sessionData, 86400);
        
        // Store user info in token for session callback
        token.userId = user.id;
        token.email = user.email;
      }
      
      return token;
    }
  },
  
  // Custom session store using Redis
  adapter: {
    createUser: async (user) => {
      const newUser = await prisma.user.create({
        data: {
          email: user.email!,
          name: user.name,
          image: user.image,
          role: 'consultant'
        }
      });
      return newUser;
    },
    
    getUser: async (id) => {
      const user = await prisma.user.findUnique({
        where: { id }
      });
      return user;
    },
    
    getUserByEmail: async (email) => {
      const user = await prisma.user.findUnique({
        where: { email }
      });
      return user;
    },
    
    getUserByAccount: async (provider_providerAccountId) => {
      const account = await prisma.account.findUnique({
        where: { provider_providerAccountId },
        include: { user: true }
      });
      return account?.user ?? null;
    },
    
    updateUser: async (user) => {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: user
      });
      return updatedUser;
    },
    
    deleteUser: async (userId) => {
      await prisma.user.delete({
        where: { id: userId }
      });
    },
    
    linkAccount: async (account) => {
      await prisma.account.create({
        data: account
      });
    },
    
    unlinkAccount: async (provider_providerAccountId) => {
      await prisma.account.delete({
        where: { provider_providerAccountId }
      });
    },
    
    // Redis-based session management
    createSession: async (session) => {
      const sessionData = {
        ...session,
        createdAt: new Date().toISOString()
      };
      
      await storeSession(session.sessionToken, sessionData, 86400);
      return session;
    },
    
    getSession: async (sessionToken) => {
      const sessionData = await getSession(sessionToken);
      
      if (!sessionData) return null;
      
      // Check if session is expired
      if (new Date(sessionData.expires) < new Date()) {
        await deleteSession(sessionToken);
        return null;
      }
      
      return sessionData;
    },
    
    updateSession: async (session) => {
      const existingSession = await getSession(session.sessionToken!);
      if (!existingSession) return null;
      
      const updatedSession = { ...existingSession, ...session };
      await storeSession(session.sessionToken!, updatedSession, 86400);
      
      return updatedSession;
    },
    
    deleteSession: async (sessionToken) => {
      await deleteSession(sessionToken);
    },
    
    createVerificationToken: async (verificationToken) => {
      await prisma.verificationToken.create({
        data: verificationToken
      });
      return verificationToken;
    },
    
    useVerificationToken: async (params) => {
      const verificationToken = await prisma.verificationToken.findUnique({
        where: { identifier_token: params }
      });
      
      if (verificationToken) {
        await prisma.verificationToken.delete({
          where: { identifier_token: params }
        });
      }
      
      return verificationToken;
    }
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
}

// Helper function to get Azure tokens from Redis
export async function getAzureTokens(userId: string) {
  const sessionData = await getSession(`azure_tokens:${userId}`);
  
  if (!sessionData) {
    throw new Error('No Azure tokens found. Please sign in again.');
  }
  
  // Check if token is expired (with 15 minute buffer)
  const expiresAt = sessionData.expiresAt * 1000;
  const now = Date.now();
  const bufferTime = 15 * 60 * 1000; // 15 minutes
  
  if (now >= (expiresAt - bufferTime)) {
    // Token is expired or about to expire, try to refresh
    if (sessionData.refreshToken) {
      try {
        const refreshedTokens = await refreshAzureTokens(sessionData.refreshToken);
        
        // Update cached tokens
        const updatedSessionData = {
          ...sessionData,
          accessToken: refreshedTokens.access_token,
          expiresAt: Math.floor(Date.now() / 1000 + refreshedTokens.expires_in),
          refreshToken: refreshedTokens.refresh_token || sessionData.refreshToken,
        };
        
        await storeSession(`azure_tokens:${userId}`, updatedSessionData, 86400);
        return updatedSessionData;
      } catch (error) {
        console.error('Token refresh failed:', error);
        throw new Error('Token refresh failed. Please sign in again.');
      }
    } else {
      throw new Error('Token expired and no refresh token available. Please sign in again.');
    }
  }
  
  return sessionData;
}

// Azure token refresh function
async function refreshAzureTokens(refreshToken: string) {
  try {
    console.log('🔄 Refreshing Azure AD access token from Redis session...');
    
    const response = await fetch(`https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`, {
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

    const tokens = await response.json();

    if (!response.ok) {
      throw new Error(tokens.error_description || `Token refresh failed: ${response.status}`);
    }

    console.log('✅ Azure token refresh successful (Redis session)');
    return tokens;
  } catch (error) {
    console.error('❌ Error refreshing Azure access token:', error);
    throw error;
  }
}