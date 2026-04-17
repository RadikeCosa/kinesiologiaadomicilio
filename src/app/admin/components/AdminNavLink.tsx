"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminNavLinkProps {
  href: string;
  children: React.ReactNode;
  match?: "exact" | "branch";
}

function isActivePath(pathname: string, href: string, match: "exact" | "branch") {
  if (match === "exact") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNavLink({ href, children, match = "exact" }: AdminNavLinkProps) {
  const pathname = usePathname();
  const isActive = isActivePath(pathname, href, match);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 ${
        isActive
          ? "bg-slate-900 text-white hover:bg-slate-700"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {children}
    </Link>
  );
}
