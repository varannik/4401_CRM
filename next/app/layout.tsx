import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Notifications from "@/components/ui/notifications";
import localFont from "next/font/local";


const interDisplay = localFont({
  src: [
      {
          path: "../public/fonts/InterDisplay-Light.woff2",
          weight: "300",
      },
      {
          path: "../public/fonts/InterDisplay-Regular.woff2",
          weight: "400",
      },
      {
          path: "../public/fonts/InterDisplay-Medium.woff2",
          weight: "500",
      },
      {
          path: "../public/fonts/InterDisplay-SemiBold.woff2",
          weight: "600",
      },
      {
          path: "../public/fonts/InterDisplay-Bold.woff2",
          weight: "700",
      },
  ],
  variable: "--font-inter-display",
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
    <html lang="en" suppressHydrationWarning>
            <body
        className={`${interDisplay.variable} bg-b-surface1 font-inter text-body-1 text-t-primary antialiased`}
      >
        <div className="min-h-screen">
          <Providers>
            {children}
            <Notifications />
          </Providers>
        </div>
      </body>
    </html>
  );
}


export async function generateViewport(): Promise<Viewport> {
  const userAgent = (await headers()).get("user-agent");
  const isiPhone = /iphone/i.test(userAgent ?? "");
  return isiPhone
      ? {
            width: "device-width",
            initialScale: 1,
            maximumScale: 1, // disables auto-zoom on ios safari
        }
      : {};
}

