"use client";

import { ThemeProvider } from "next-themes";
import AuthSessionProvider from "@/components/SessionProvider";
import ZustandProvider from "@/components/ZustandProvider";

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