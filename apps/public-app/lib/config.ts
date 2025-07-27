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
  isProd: boolean;
  isDev: boolean;
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
      project_id: projectId,
      private_key: privateKey.replace(/\\n/g, '\n'),
      client_email: clientEmail,
      type: 'service_account',
    };
  }
  
  // In development, allow using ADC (Application Default Credentials)
  if (process.env.NODE_ENV === 'development') {
    console.warn('Using Application Default Credentials for BigQuery in development');
    return undefined; // Will use ADC
  }
  
  throw new Error('BigQuery credentials not configured properly');
}

// Create configuration object
export function createConfig(): AppConfig {
  const isProd = process.env.NODE_ENV === 'production';
  const isDev = process.env.NODE_ENV === 'development';
  
  return {
    bigQuery: {
      projectId: validateEnvVar('GOOGLE_CLOUD_PROJECT_ID', process.env.GOOGLE_CLOUD_PROJECT_ID),
      credentials: getBigQueryCredentials(),
      datasetId: process.env.BIGQUERY_DATASET_ID || 'h1b_data',
      tableId: process.env.BIGQUERY_TABLE_ID || 'lca_applications',
    },
    isProd,
    isDev,
  };
}

// Export singleton config instance
export const config = createConfig();

// Export individual configs for convenience
export const bigQueryConfig = config.bigQuery;
export const isProduction = config.isProd;
export const isDevelopment = config.isDev;