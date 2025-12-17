import * as Sentry from "@sentry/react-native";

export const navigationIntegration = Sentry.reactNavigationIntegration();

// import * as Sentry from "@sentry/react-native";


// export const navigationIntegration = Sentry.reactNavigationIntegration();


Sentry.init({
  dsn: "https://b1b537a2e262325c93b6d34d8540d51d@o4510499774332928.ingest.de.sentry.io/4510499780231248",  // Thay bằng DSN của bạn
  tracePropagationTargets: ["https://myproject.org", /^\/api\//],
  debug: true,// Bật để xem logs khi test


  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% transactions khi test
  enableAutoSessionTracking: true,
  sessionTrackingIntervalMillis: 5000,


  // User Interaction Tracking
  enableUserInteractionTracing: true,

 
  // Integrations
  integrations: [
    // Mobile replay integration with minimal configuration
    // See: https://docs.sentry.io/platforms/react-native/session-replay/configuration/
    navigationIntegration,
  ],
 
  // Privacy
  sendDefaultPii: false, // Không gửi thông tin cá nhân mặc định
  maxBreadcrumbs: 150,
 
  // Enable native crash handling
  enableNative: true,
  enableNativeCrashHandling: true,
  enableAutoPerformanceTracing: true,
 
});


// Sentry.init({
//   dsn: "https://b1b537a2e262325c93b6d34d8540d51d@o4510499774332928.ingest.de.sentry.io/4510499780231248",
//   // tracePropagationTargets: ["https://myproject.org", /^\/api\//],
//   debug: true, // Bật để xem logs khi test

//   // Performance Monitoring
//   tracesSampleRate: 1.0, // Capture 100% transactions khi test
//   profilesSampleRate: 1.0,

//   enableAutoSessionTracking: true,
//   sessionTrackingIntervalMillis: 5000,

//   // User Interaction Tracking
//   enableUserInteractionTracing: true,

//   // Integrations - Simplified to avoid compatibility issues
//   integrations: [navigationIntegration],

//   // Privacy
//   sendDefaultPii: true, // Không gửi thông tin cá nhân mặc định
//   maxBreadcrumbs: 150,

//   // Enable native crash handling
//   enableNative: true,
//   enableNativeCrashHandling: true,
//   enableAutoPerformanceTracing: true,
// });
