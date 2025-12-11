import * as Sentry from "@sentry/react-native";

export const navigationIntegration = Sentry.reactNavigationIntegration();

Sentry.init({
  dsn: "https://b1b537a2e262325c93b6d34d8540d51d@o4510499774332928.ingest.de.sentry.io/4510499780231248",
  tracePropagationTargets: ["https://myproject.org", /^\/api\//],
  debug: true, // Bật để xem logs khi test

  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% transactions khi test
  profilesSampleRate: 1.0,

  enableAutoSessionTracking: true,
  sessionTrackingIntervalMillis: 5000,

  // User Interaction Tracking
  enableUserInteractionTracing: true,

  // Integrations - Simplified to avoid compatibility issues
  integrations: [navigationIntegration, Sentry.hermesProfilingIntegration({
    platformProfilers: false
  })],

  // Privacy
  sendDefaultPii: false, // Không gửi thông tin cá nhân mặc định
  maxBreadcrumbs: 150,

  // Enable native crash handling
  enableNative: true,
  enableNativeCrashHandling: true,
  enableAutoPerformanceTracing: true,
});
