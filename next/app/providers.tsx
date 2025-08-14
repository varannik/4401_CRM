"use client";

import { ThemeProvider } from "next-themes";
import { AuthSessionProvider, ZustandProvider } from "@/components/Providers";

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