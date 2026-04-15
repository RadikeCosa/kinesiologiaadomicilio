"use client";

import { sendGAEvent } from "@next/third-parties/google";

export type CtaLocation =
  | "hero"
  | "services"
  | "footer"
  | "header"
  | "contact"
  | "how_it_works"
  | "other";

interface TrackBaseEventParams {
  ctaLocation: CtaLocation;
  ctaLabel?: string;
  destination: string;
  pagePath?: string;
}

interface TrackScrollEventParams {
  pagePath?: string;
  pageTitle?: string;
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

function resolvePageTitle(pageTitle?: string): string {
  if (pageTitle) {
    return pageTitle;
  }

  if (typeof document !== "undefined") {
    return document.title;
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


export function trackScroll50({
  pagePath,
  pageTitle,
}: TrackScrollEventParams): void {
  sendGAEvent("event", "scroll_50", {
    scroll_threshold: 50,
    page_path: resolvePagePath(pagePath),
    page_title: resolvePageTitle(pageTitle),
  });
}

export function trackScroll90({
  pagePath,
  pageTitle,
}: TrackScrollEventParams): void {
  sendGAEvent("event", "scroll_90", {
    scroll_threshold: 90,
    page_path: resolvePagePath(pagePath),
    page_title: resolvePageTitle(pageTitle),
  });
}
