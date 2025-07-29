/**
 * Development environment specific configuration
 * Used for local development
 */

export const devConfig = {
  googleCloud: {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'doctracker-b4528', // Fallback to current project
    region: 'us-central1',
  },
  bigQuery: {
    datasetId: 'h1b_data',
    tableId: 'lca_applications',
    // Development query limits
    maxResults: 500,
    timeoutMs: 15000,
  },
  firebase: {
    projectId: 'doctracker-b4528', // Current development project
    authDomain: 'doctracker-b4528.firebaseapp.com',
    storageBucket: 'doctracker-b4528.appspot.com',
  },
  app: {
    name: 'Immigrant Central (Dev)',
    url: 'http://localhost:3000',
    environment: 'development' as const,
  },
  features: {
    // Enable all debugging features in development
    enableQueryLogging: true,
    enablePerformanceMonitoring: true,
    limitDataQueries: true, // Use smaller datasets for faster development
  },
};

export type DevConfig = typeof devConfig;