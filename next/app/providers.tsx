"use client";

import { ThemeProvider } from "next-themes";
import AuthSessionProvider from "@/components/Providers/session-provider";
import ZustandProvider from "@/components/Providers/zustand-provider";

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