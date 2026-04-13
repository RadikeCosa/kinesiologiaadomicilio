import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollDepthTracker } from "@/components/ScrollDepthTracker";
import { BUSINESS_CONFIG } from "@/lib/config";
import { servicesData } from "@/app/services/data/servicesData";

import "./globals.css";

const gaId = process.env.NEXT_PUBLIC_GA_ID;
const businessUrl = BUSINESS_CONFIG.url;

const structuredData = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "@id": `${businessUrl}/#organization`,
  name: BUSINESS_CONFIG.name,
  image: `${businessUrl}/og-placeholder.png`,
  url: `${businessUrl}/`,
  logo: `${businessUrl}/favicon.ico`,
  description:
    "Kinesiología y rehabilitación funcional a domicilio en Neuquén: postoperatorios, adultos mayores y cuidados paliativos.",
  address: {
    "@type": "PostalAddress",
    addressLocality: BUSINESS_CONFIG.location.city,
    addressRegion: BUSINESS_CONFIG.location.region,
    addressCountry: BUSINESS_CONFIG.location.countryCode,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: BUSINESS_CONFIG.location.coordinates.latitude,
    longitude: BUSINESS_CONFIG.location.coordinates.longitude,
  },
  areaServed: {
    "@type": "City",
    name: BUSINESS_CONFIG.location.city,
    "@id": "https://www.wikidata.org/wiki/Q44753",
  },
  priceRange: "$$",
  serviceType: servicesData.map((service) => service.title),
  medicalSpecialty: "PhysicalTherapy",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Servicios de Kinesiología",
    itemListElement: servicesData.map((service) => ({
      "@type": "Offer",
      name: service.title,
      description: service.description,
    })),
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    telephone: BUSINESS_CONFIG.phone,
    availableLanguage: ["es"],
    areaServed: BUSINESS_CONFIG.location.countryCode,
  },
  sameAs: [`https://wa.me/${BUSINESS_CONFIG.phoneClean}`],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Kinesiología y rehabilitación a domicilio en Neuquén",
  description:
    "Atención profesional y personalizada en la comodidad del hogar. Sesiones de kinesiología y rehabilitación funcional, cuidados paliativos y recuperación postoperatoria en Neuquén.",
  metadataBase: new URL(businessUrl),
  openGraph: {
    title: "Kinesiología y rehabilitación a domicilio en Neuquén",
    description:
      "Atención profesional y personalizada en la comodidad del hogar. Sesiones de kinesiología y rehabilitación funcional, cuidados paliativos y recuperación postoperatoria en Neuquén.",
    url: businessUrl,
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
    "kinesiología domiciliaria",
    "fisioterapia a domicilio Neuquén",
    "rehabilitación postoperatoria",
    "terapia física domicilio",
    "kinesiólogo a domicilio Neuquén",
  ],
  authors: [{ name: "Rehabilitación a domicilio Neuquén" }],
  alternates: {
    canonical: businessUrl,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
  verification: {
    google: "yIAuiC-866ahSn2Fh0PGCbmx_d6B5NNBwhXYf3778IE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR">
      <body className="font-sans antialiased flex min-h-dvh flex-col bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-slate-100">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 rounded bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Saltar al contenido principal
        </a>

        <ScrollDepthTracker />

        <Header />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />

        <main id="contenido" className="flex flex-1 flex-col">
          {children}
        </main>

        <Footer />
      </body>

      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </html>
  );
}
