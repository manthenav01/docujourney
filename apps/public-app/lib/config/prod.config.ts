/**
 * Production environment specific configuration
 * Used for custom domain deployment
 */

export const prodConfig = {
  googleCloud: {
    projectId: 'immigrant-central-prod',
    region: 'us-central1',
  },
  bigQuery: {
    datasetId: 'h1b_data',
    tableId: 'lca_applications',
    // Production query limits
    maxResults: 10000,
    timeoutMs: 30000,
  },
  firebase: {
    projectId: 'immigrant-central-prod',
    authDomain: 'immigrant-central-prod.firebaseapp.com',
    storageBucket: 'immigrant-central-prod.appspot.com',
  },
  app: {
    name: 'Immigrant Central',
    url: 'https://yourdomain.com', // Will be updated with actual domain
    environment: 'production' as const,
  },
  features: {
    // Disable debugging in production
    enableQueryLogging: false,
    enablePerformanceMonitoring: true,
    limitDataQueries: false,
  },
};

export type ProdConfig = typeof prodConfig;