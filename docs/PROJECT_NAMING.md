# Project Naming Configuration

## Overview

This document clarifies the naming structure used across different components of the Immigrant Central H1B dashboard.

## Naming Structure

### Repository & Code
- **GitHub Repository**: `docujourney` (historical name)
- **Application Name**: **Immigrant Central** (user-facing brand)
- **Package Names**: `@docujourney/*` (maintained for consistency)

### Deployment & Infrastructure

#### Vercel Projects
- **Project Name**: `immigrant-central` ✅
- **Production URL**: `https://immigrant-central.vercel.app`
- **Preview URLs**: `https://immigrant-central-[hash].vercel.app`

#### Google Cloud Projects
- **Development**: `doctracker-b4528` (original project)
- **Test**: `immigrant-central-test` 
- **Production**: `doctracker-prod` (placeholder, to be created)

#### BigQuery Configuration
- **Dataset**: `h1b_data` (consistent across all environments)
- **Table**: `lca_applications` (consistent across all environments)

## Recent Changes

### ✅ Completed Updates
1. **Vercel Project Renamed**: `docujourney` → `immigrant-central`
2. **Environment Variables**: All configured for new project
3. **Documentation**: Updated with correct project names
4. **Test Deployment**: Successfully deployed to new project

### Why the Change?
- **Brand Alignment**: Vercel project name now matches the application name "Immigrant Central"
- **User Clarity**: URLs and deployment names reflect the actual product
- **Professional Presentation**: Consistent naming for external-facing infrastructure

## Environment URLs

| Environment | URL | Status |
|-------------|-----|--------|
| **Development** | `http://localhost:3000` | Local |
| **Test/Preview** | `https://immigrant-central-[hash].vercel.app` | Active |
| **Production** | `https://immigrant-central.vercel.app` | To be configured |

## Authentication Note

The current deployment may have Vercel authentication enabled. To disable:

1. Go to Vercel Dashboard > Project Settings
2. Navigate to "Functions" or "Security" 
3. Disable password protection for API routes
4. Redeploy if necessary

## Next Steps

When creating the production Google Cloud project:
1. Create `doctracker-prod` project
2. Update production environment variables in Vercel
3. Deploy to production domain
4. Configure custom domain if needed

---

**Key Takeaway**: The application is now properly branded as "Immigrant Central" across all deployment infrastructure while maintaining the existing codebase structure.