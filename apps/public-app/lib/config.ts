/**
 * Environment configuration for BigQuery and other services
 * Security: Uses environment variables instead of file paths for credentials
 */

export interface BigQueryConfig {
  projectId: string;
  credentials: any;
  datasetId: string;
  tableId: string;
}

export interface AppConfig {
  bigQuery: BigQueryConfig;
  environment: 'development' | 'test' | 'production';
  isProd: boolean;
  isDev: boolean;
  isTest: boolean;
}

// Validate required environment variables
function validateEnvVar(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}

// Parse BigQuery credentials from environment
function getBigQueryCredentials() {
  const serviceAccountKeyEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  
  if (serviceAccountKeyEnv) {
    try {
      return JSON.parse(serviceAccountKeyEnv);
    } catch (error) {
      throw new Error('Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON format');
    }
  }
  
  // Fallback to individual credential fields
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY;
  const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL;
  
  if (projectId && privateKey && clientEmail) {
    return {
      project_id: projectId.trim(),
      private_key: privateKey.replace(/\\n/g, '\n').trim(),
      client_email: clientEmail.trim(),
      type: 'service_account',
    };
  }
  
  // In development, allow using ADC (Application Default Credentials)
  if (process.env.NODE_ENV === 'development') {
    console.warn('Using Application Default Credentials for BigQuery in development');
    return undefined; // Will use ADC
  }
  
  // During build time, return null to avoid build errors
  if (process.env.NODE_ENV === undefined || process.env.VERCEL_ENV === undefined) {
    console.warn('BigQuery credentials not available during build time');
    return null; // Will be initialized at runtime
  }
  
  throw new Error('BigQuery credentials not configured properly');
}

// Determine environment
function getEnvironment(): 'development' | 'test' | 'production' {
  // Check Vercel environment first
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

// Create configuration object
export function createConfig(): AppConfig {
  const environment = getEnvironment();
  const isProd = environment === 'production';
  const isDev = environment === 'development';
  const isTest = environment === 'test';
  
  // Environment-specific defaults
  const defaultDatasetId = 'h1b_data'; // Same dataset name across all environments
  const defaultProjectId = isDev ? 'doctracker-b4528' :
                           isTest ? 'immigrant-central-test' : 
                           'doctracker-prod'; // Placeholder for production project
  
  const credentials = getBigQueryCredentials();
  
  return {
    environment,
    bigQuery: {
      projectId: (process.env.GOOGLE_CLOUD_PROJECT_ID || defaultProjectId).trim(),
      credentials,
      datasetId: (process.env.BIGQUERY_DATASET_ID || defaultDatasetId).trim(),
      tableId: (process.env.BIGQUERY_TABLE_ID || 'lca_applications').trim(),
    },
    isProd,
    isDev,
    isTest,
  };
}

// Export singleton config instance
export const config = createConfig();

// Export individual configs for convenience
export const bigQueryConfig = config.bigQuery;
export const isProduction = config.isProd;
export const isDevelopment = config.isDev;
export const isTest = config.isTest;
export const environment = config.environment;