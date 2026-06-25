import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { AdminNavLink } from "@/app/admin/components/AdminNavLink";
import { getFhirEnvironmentInfo } from "@/lib/fhir/config";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const fhirEnvironment = getFhirEnvironmentInfo();
  const toneStyles: Record<string, string> = {
    info: "border-sky-200 bg-sky-50 text-sky-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    neutral: "border-slate-200 bg-slate-100 text-slate-700",
    danger: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <Container className="max-w-4xl">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link
              href="/admin/"
              className="group flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
            >
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full bg-sky-500 shadow-sm shadow-sky-500/30"
              />

              <div className="min-w-0 leading-none">
                <span className="block truncate text-sm font-semibold tracking-[0.01em] text-slate-900 transition-colors group-hover:text-sky-700 sm:text-base">
                  Administración de pacientes
                </span>
                <span className="hidden text-xs font-medium text-slate-500 sm:block">
                  Superficie privada
                </span>
              </div>
            </Link>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <span
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${toneStyles[fhirEnvironment.tone]}`}
              >
                Entorno FHIR: {fhirEnvironment.label}
              </span>
              <span className="text-[11px] text-slate-500">
                {fhirEnvironment.endpointLabel}
              </span>
            </div>

            <nav aria-label="Navegación principal de admin">
              <ul className="flex items-center gap-1 sm:gap-3">
                <li>
                  <AdminNavLink href="/admin/patients/" match="branch">
                    Pacientes
                  </AdminNavLink>
                </li>
                <li>
                  <AdminNavLink href="/admin/patients/new">
                    Nuevo paciente
                  </AdminNavLink>
                </li>
                <li>
                  <AdminNavLink href="/admin/configuracion/profesional">
                    Configuración
                  </AdminNavLink>
                </li>
              </ul>
            </nav>
          </div>
        </Container>
      </header>

      <main id="contenido" className="flex-1 py-8 sm:py-10">
        <Container className="max-w-4xl">{children}</Container>
      </main>
    </div>
  );
}
