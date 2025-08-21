import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kinesiología y rehabilitación a domicilio en Neuquén",
  description:
    "Atención profesional y personalizada en la comodidad del hogar. Sesiones de kinesiología y rehabilitación funcional, cuidados paliativos y recuperación postoperatoria en Neuquén.",
  metadataBase: new URL("https://kinesiologiaadomicilio.vercel.app"),
  openGraph: {
    title: "Kinesiología y rehabilitación a domicilio en Neuquén",
    description:
      "Atención profesional y personalizada en la comodidad del hogar. Sesiones de kinesiología y rehabilitación funcional, cuidados paliativos y recuperación postoperatoria en Neuquén.",
    url: "https://kinesiologiaadomicilio.vercel.app",
    siteName: "Rehabilitación a domicilio Neuquén",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "/og-placeholder.png",
        width: 1200,
        height: 630,
        alt: "Kinesiología y rehabilitación a domicilio en Neuquén",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kinesiología y rehabilitación a domicilio en Neuquén",
    description:
      "Atención profesional y personalizada en la comodidad del hogar. Sesiones de kinesiología y rehabilitación funcional, cuidados paliativos y recuperación postoperatoria en Neuquén.",
    images: ["/og-placeholder.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
  keywords: [
    "kinesiología a domicilio",
    "rehabilitación Neuquén",
    "kinesiólogo Neuquén",
    "rehabilitación adultos mayores",
    "cuidados paliativos domicilio",
  ],
  authors: [{ name: "Rehabilitación a domicilio Neuquén" }],
  alternates: {
    canonical: "https://kinesiologiaadomicilio.vercel.app",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-dvh flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
