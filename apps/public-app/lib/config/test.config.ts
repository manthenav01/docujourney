/**
 * Test environment specific configuration
 * Used for immigrant-central-test.vercel.app deployment
 */

export const testConfig = {
  googleCloud: {
    projectId: 'immigrant-central-test',
    region: 'us-central1',
  },
  bigQuery: {
    datasetId: 'h1b_data_test',
    tableId: 'lca_applications',
    // Use smaller query limits for testing
    maxResults: 1000,
    timeoutMs: 10000,
  },
  firebase: {
    projectId: 'immigrant-central-test',
    authDomain: 'immigrant-central-test.firebaseapp.com',
    storageBucket: 'immigrant-central-test.appspot.com',
  },
  app: {
    name: 'Immigrant Central (Test)',
    url: 'https://immigrant-central-test.vercel.app',
    environment: 'test' as const,
  },
  features: {
    // Enable debugging features in test
    enableQueryLogging: true,
    enablePerformanceMonitoring: true,
    // Use subset of data for faster testing
    limitDataQueries: true,
  },
};

export type TestConfig = typeof testConfig;