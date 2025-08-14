import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    userId?: string;
    accessToken?: string;
    refreshToken?: string;
    scope?: string;
    error?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string | null;
      departmentId?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    scope?: string;
    expiresAt?: number;
    userId?: string;
    role?: string;
    departmentId?: string;
  }
}


