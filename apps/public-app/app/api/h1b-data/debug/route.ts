import { NextResponse } from 'next/server';

export async function GET() {
  // Check which environment variables are available
  const envCheck = {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    
    // Public vars (safe to expose)
    NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_ID,
    NEXT_PUBLIC_BRANCH_NAME: process.env.NEXT_PUBLIC_BRANCH_NAME,
    
    // Check if private vars exist (don't expose values)
    GOOGLE_CLOUD_PROJECT_ID_EXISTS: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
    GOOGLE_CLOUD_PRIVATE_KEY_EXISTS: !!process.env.GOOGLE_CLOUD_PRIVATE_KEY,
    GOOGLE_CLOUD_CLIENT_EMAIL_EXISTS: !!process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    GOOGLE_APPLICATION_CREDENTIALS_JSON_EXISTS: !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
    
    // Project ID value (safe to show)
    GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID || 'NOT_SET',
    
    // BigQuery specific
    BIGQUERY_DATASET_ID: process.env.BIGQUERY_DATASET_ID || 'h1b_data',
    BIGQUERY_TABLE_ID: process.env.BIGQUERY_TABLE_ID || 'lca_applications',
  };

  return NextResponse.json({
    message: 'Environment debug info',
    environment: envCheck,
    timestamp: new Date().toISOString(),
  });
}