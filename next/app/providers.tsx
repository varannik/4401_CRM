"use client";

import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthStore, useUIStore } from '@/stores';

// Inline AuthSessionProvider
function AuthSessionProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

// Inline ZustandProvider
function ZustandProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const { setUser, setTokens, setLoading, logout } = useAuthStore();
  const { setGlobalLoading } = useUIStore();

  // Sync NextAuth session with Zustand auth store
  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
      setGlobalLoading(true);
      return;
    }

    setLoading(false);
    setGlobalLoading(false);

    if (session?.user) {
      // Map NextAuth user to our store format
      const user = {
        id: session.user.email || session.user.name || 'unknown',
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role,
        departmentId: session.user.departmentId,
      };
      
      setUser(user);
      setTokens(session.accessToken, session.accessToken);
    } else {
      logout();
    }
  }, [session, status, setUser, setTokens, setLoading, logout, setGlobalLoading]);

  // Initialize stores on mount
  useEffect(() => {
    // Any additional initialization logic can go here
    console.log('Zustand stores initialized');
  }, []);

  return <>{children}</>;
}

const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <ThemeProvider disableTransitionOnChange>
            <AuthSessionProvider>
                <ZustandProvider>
                    {children}
                </ZustandProvider>
            </AuthSessionProvider>
        </ThemeProvider>
    );
};

export default Providers; 