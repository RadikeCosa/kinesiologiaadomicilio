interface AnalyticsEnvironment {
  gaId?: string;
  nodeEnv?: string;
  vercelEnv?: string;
}

/** Never load the production property in development, tests or Vercel previews. */
export function getPublicAnalyticsId({ gaId, nodeEnv, vercelEnv }: AnalyticsEnvironment): string | undefined {
  if (nodeEnv !== "production" || (vercelEnv && vercelEnv !== "production")) {
    return undefined;
  }
  return gaId || undefined;
}
