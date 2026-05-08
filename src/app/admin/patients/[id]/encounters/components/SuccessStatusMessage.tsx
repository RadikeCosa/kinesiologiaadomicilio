"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface SuccessStatusMessageProps {
  message: string;
  autoHideMs?: number;
  clearQueryParam?: boolean;
}

export function SuccessStatusMessage({
  message,
  autoHideMs = 5000,
  clearQueryParam = true,
}: SuccessStatusMessageProps) {
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsSnapshot = useMemo(() => searchParams.toString(), [searchParams]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsVisible(false);

      if (!clearQueryParam) {
        return;
      }

      const nextParams = new URLSearchParams(searchParamsSnapshot);
      nextParams.delete("status");
      const query = nextParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }, autoHideMs);

    return () => window.clearTimeout(timeout);
  }, [autoHideMs, clearQueryParam, pathname, router, searchParamsSnapshot]);

  if (!isVisible) {
    return null;
  }

  return (
    <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-2 text-sm text-emerald-900">
      {message}
    </p>
  );
}
