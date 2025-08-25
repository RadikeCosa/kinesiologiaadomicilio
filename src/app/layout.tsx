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
    <html lang="es-AR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-dvh flex-col bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-slate-100`}
      >
        {/* Skip link para accesibilidad / SEO (mejora de experiencia) */}
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 rounded bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Saltar al contenido principal
        </a>
        {/* Script JSON-LD para negocio local */}
        <script
          type="application/ld+json"
          // Mantener inline para que aparezca temprano; ajustar datos reales cuando estén disponibles
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MedicalBusiness",
              name: "Kinesiología a Domicilio Neuquén",
              image:
                "https://kinesiologiaadomicilio.vercel.app/og-placeholder.png",
              url: "https://kinesiologiaadomicilio.vercel.app/",
              logo: "https://kinesiologiaadomicilio.vercel.app/favicon.ico",
              description:
                "Kinesiología y rehabilitación funcional a domicilio en Neuquén: postoperatorios, adultos mayores y cuidados paliativos.",
              areaServed: {
                "@type": "AdministrativeArea",
                name: "Neuquén Capital",
              },
              priceRange: "$$",
              serviceType: [
                "Rehabilitación post-operatoria",
                "Terapia física domiciliaria",
                "Cuidados paliativos",
                "Adultos mayores",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                telephone: "+54 9 299 521 7189",
                availableLanguage: ["es"],
              },
            }),
          }}
        />
        <main id="contenido" className="flex flex-1 flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
