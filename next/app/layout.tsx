import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/components/providers/session-provider";
import ZustandProvider from "@/components/providers/zustand-provider";
import Notifications from "@/components/ui/notifications";
import { BubbleBackground } from "@/components/animate-ui/backgrounds/bubble";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "44.01 CRM - Customer Relationship Management",
  description: "Enterprise CRM platform for 44.01 - Advanced customer relationship management and monitoring system for sustainable carbon removal technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
            <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
      >
        <BubbleBackground className="fixed inset-0 z-0" />
        <div className="relative z-10 min-h-screen">
          <AuthSessionProvider>
            <ZustandProvider>
              {children}
              <Notifications />
            </ZustandProvider>
          </AuthSessionProvider>
        </div>
      </body>
    </html>
  );
}
