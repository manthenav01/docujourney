/**
 * Environment-specific configuration loader
 * Automatically selects the correct config based on environment
 */

import { devConfig, type DevConfig } from './dev.config';
import { testConfig, type TestConfig } from './test.config';
import { prodConfig, type ProdConfig } from './prod.config';

export type EnvironmentConfig = DevConfig | TestConfig | ProdConfig;

// Determine current environment
function getCurrentEnvironment(): 'development' | 'test' | 'production' {
  // Check Vercel environment first (most reliable in deployed environments)
  if (process.env.VERCEL_ENV === 'production') {
    return 'production';
  }
  if (process.env.VERCEL_ENV === 'preview') {
    return 'test';
  }
  
  // Fallback to NODE_ENV
  if (process.env.NODE_ENV === 'production') {
    return 'production';
  }
  if (process.env.NODE_ENV === 'test') {
    return 'test';
  }
  
  return 'development';
}

// Get environment-specific configuration
export function getEnvironmentConfig(): EnvironmentConfig {
  const env = getCurrentEnvironment();
  
  switch (env) {
    case 'production':
      return prodConfig;
    case 'test':
      return testConfig;
    case 'development':
    default:
      return devConfig;
  }
}

// Export singleton config instance
export const environmentConfig = getEnvironmentConfig();

// Export current environment
export const currentEnvironment = getCurrentEnvironment();

// Export individual configs for direct access if needed
export { devConfig, testConfig, prodConfig };

// Type exports
export type { DevConfig, TestConfig, ProdConfig };

// Helper functions
export const isProduction = () => currentEnvironment === 'production';
export const isTest = () => currentEnvironment === 'test';
export const isDevelopment = () => currentEnvironment === 'development';

// Log current environment (helpful for debugging)
if (typeof window === 'undefined') { // Only log on server side
  console.log(`🚀 Running in ${currentEnvironment} environment`);
  if (currentEnvironment === 'test') {
    console.log(`📊 Using BigQuery dataset: ${environmentConfig.bigQuery.datasetId}`);
  }
}