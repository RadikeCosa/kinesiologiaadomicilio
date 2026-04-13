"use client";

import { sendGAEvent } from "@next/third-parties/google";

export type CtaLocation =
  | "hero"
  | "services"
  | "footer"
  | "header"
  | "contact"
  | "other";

interface TrackBaseEventParams {
  ctaLocation: CtaLocation;
  ctaLabel?: string;
  destination: string;
  pagePath?: string;
}

function resolvePagePath(pagePath?: string): string {
  if (pagePath) {
    return pagePath;
  }

  if (typeof window !== "undefined") {
    return window.location.pathname;
  }

  return "";
}

export function trackGenerateLead({
  ctaLocation,
  ctaLabel,
  destination,
  pagePath,
}: TrackBaseEventParams): void {
  sendGAEvent("event", "generate_lead", {
    channel: "whatsapp",
    cta_location: ctaLocation,
    cta_label: ctaLabel,
    destination,
    page_path: resolvePagePath(pagePath),
  });
}

export function trackPhoneClick({
  ctaLocation,
  ctaLabel,
  destination,
  pagePath,
}: TrackBaseEventParams): void {
  sendGAEvent("event", "phone_click", {
    channel: "phone",
    cta_location: ctaLocation,
    cta_label: ctaLabel,
    destination,
    page_path: resolvePagePath(pagePath),
  });
}
