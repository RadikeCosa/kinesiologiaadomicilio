"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { trackScroll50, trackScroll90 } from "@/lib/analytics";

function getScrollProgressPercentage(): number {
  const documentElement = document.documentElement;
  const scrollableHeight =
    documentElement.scrollHeight - documentElement.clientHeight;

  if (scrollableHeight <= 0) {
    return 0;
  }

  return (window.scrollY / scrollableHeight) * 100;
}

export function ScrollDepthTracker(): null {
  const pathname = usePathname();
  const hasTracked50Ref = useRef(false);
  const hasTracked90Ref = useRef(false);

  useEffect(() => {
    hasTracked50Ref.current = false;
    hasTracked90Ref.current = false;

    const onScroll = (): void => {
      const scrollProgressPercentage = getScrollProgressPercentage();

      if (!hasTracked50Ref.current && scrollProgressPercentage >= 50) {
        hasTracked50Ref.current = true;
        trackScroll50({
          pagePath: pathname,
          pageTitle: document.title,
        });
      }

      if (!hasTracked90Ref.current && scrollProgressPercentage >= 90) {
        hasTracked90Ref.current = true;
        trackScroll90({
          pagePath: pathname,
          pageTitle: document.title,
        });
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  return null;
}
