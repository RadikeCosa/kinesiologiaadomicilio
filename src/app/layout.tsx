import type { Metadata, Viewport } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

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
    "kinesiología domiciliaria",
    "fisioterapia a domicilio Neuquén",
    "rehabilitación postoperatoria",
    "terapia física domicilio",
    "kinesiólogo a domicilio Neuquén",
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
        className="font-sans antialiased flex min-h-dvh flex-col bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-slate-100"
      >
        {/* Skip link para accesibilidad / SEO (mejora de experiencia) */}
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 rounded bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Saltar al contenido principal
        </a>
        <Header />
        {/* Script JSON-LD para negocio local */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MedicalBusiness",
              "@id": "https://kinesiologiaadomicilio.vercel.app/#organization",
              name: "Kinesiología a Domicilio Neuquén",
              image:
                "https://kinesiologiaadomicilio.vercel.app/og-placeholder.png",
              url: "https://kinesiologiaadomicilio.vercel.app/",
              logo: "https://kinesiologiaadomicilio.vercel.app/favicon.ico",
              description:
                "Kinesiología y rehabilitación funcional a domicilio en Neuquén: postoperatorios, adultos mayores y cuidados paliativos.",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Neuquén",
                addressRegion: "Neuquén",
                addressCountry: "AR",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: -38.9516,
                longitude: -68.0591,
              },
              areaServed: {
                "@type": "City",
                name: "Neuquén Capital",
                "@id": "https://www.wikidata.org/wiki/Q44753",
              },
              priceRange: "$$",
              serviceType: [
                "Rehabilitación post-operatoria",
                "Terapia física domiciliaria",
                "Cuidados paliativos",
                "Kinesiología para adultos mayores",
              ],
              medicalSpecialty: "PhysicalTherapy",
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Servicios de Kinesiología",
                itemListElement: [
                  {
                    "@type": "Offer",
                    name: "Rehabilitación Post-operatoria",
                    description:
                      "Recuperación especializada después de cirugías ortopédicas, traumatológicas y cardíacas.",
                  },
                  {
                    "@type": "Offer",
                    name: "Kinesiología para Adultos Mayores",
                    description:
                      "Terapia física adaptada para mantener movilidad, fuerza y autonomía en la tercera edad.",
                  },
                  {
                    "@type": "Offer",
                    name: "Cuidados Paliativos",
                    description:
                      "Acompañamiento kinesiológico para mejorar calidad de vida y confort.",
                  },
                  {
                    "@type": "Offer",
                    name: "Terapia Física General",
                    description:
                      "Sesiones para lesiones deportivas, dolor crónico y prevención.",
                  },
                ],
              },
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                telephone: "+54 9 299 521 7189",
                availableLanguage: ["es"],
                areaServed: "AR",
              },
              sameAs: ["https://wa.me/5492995217189"],
            }),
          }}
        />
        <main id="contenido" className="flex flex-1 flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
