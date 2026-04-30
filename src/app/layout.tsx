import type { Metadata, Viewport } from "next";
import { BUSINESS_CONFIG } from "@/lib/config";

import "./globals.css";

const businessUrl = BUSINESS_CONFIG.url;

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(businessUrl),
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR">
      <body className="font-sans antialiased bg-slate-50 text-slate-900 dark:bg-neutral-900 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
