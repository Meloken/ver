const isSentryEnabled = !!(process.env.NEXT_PUBLIC_SENTRY_DSN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT);

export async function register() {
  if (!isSentryEnabled) return;

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = isSentryEnabled
  ? async (...args: Parameters<typeof import('@sentry/nextjs').captureRequestError>) => {
      const Sentry = await import('@sentry/nextjs');
      return Sentry.captureRequestError(...args);
    }
  : undefined;

