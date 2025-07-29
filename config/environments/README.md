# Environment Configuration

This directory contains environment-specific configuration files for the DocuJourney H1B dashboard.

## Environment Structure

### Development (`development.env`)
- **Project**: `doctracker-b4528` (main project)
- **Dataset**: `h1b_data`
- **Authentication**: Service account key file (`serviceAccountKey.json`)
- **Usage**: Local development

### Test (`test.env`) 
- **Project**: `immigrant-central-test` (test project)
- **Dataset**: `h1b_data`
- **Authentication**: Environment variables (Vercel secrets)
- **Usage**: Vercel preview deployments

### Production (`production.env`)
- **Project**: `doctracker-prod` (to be created)
- **Dataset**: `h1b_data`
- **Authentication**: Environment variables (Vercel secrets)
- **Usage**: Production deployments

## Key Design Principles

1. **Project Separation**: Each environment uses a different Google Cloud project for complete isolation
2. **Consistent Schema**: Same dataset (`h1b_data`) and table (`lca_applications`) names across all environments
3. **Flexible Authentication**: Service account keys for development, environment variables for deployed environments

## Setting Up New Environment

When creating a new Google Cloud project:

1. Enable BigQuery API
2. Create service account with BigQuery Data Editor and BigQuery Job User roles
3. Create and download service account key
4. Update the appropriate `.env` file with project ID and credentials
5. Import H1B data using the data pipeline scripts