# Environment Badges

This document explains the environment badge system that displays the Google Cloud project name and branch for non-production environments.

## Overview

Environment badges are visual indicators that show:
- **Google Cloud Project ID** (e.g., `immigrant-central-test`)
- **Git Branch Name** (e.g., `preview`, `develop`)

These badges only appear in non-production environments to help developers and testers identify which environment they're working with.

## Implementation

### Component Location
- **File**: `components/ui/environment-badge.tsx`
- **Usage**: Imported and used in application headers/sidebars

### Environment Detection
The component uses the following environment variables:

1. **NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_ID** - Google Cloud project identifier
2. **VERCEL_GIT_COMMIT_REF** - Git branch from Vercel deployment
3. **NEXT_PUBLIC_BRANCH_NAME** - Branch name passed from CI/CD

### Badge Display Rules

- **Production Environment**: No badges shown
- **Preview Environment**: Blue badge with project ID + branch name
- **Development Environment**: Orange badge with project ID + branch name

### Environment Variables

#### CI/CD Setup (GitHub Actions)
```yaml
env:
  NEXT_PUBLIC_BRANCH_NAME: ${{ github.ref_name }}
  NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_ID: immigrant-central-test
```

#### Vercel Environment Variables
Set these in Vercel Dashboard → Project Settings → Environment Variables:

```bash
# For Preview/Test environments
NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_ID=immigrant-central-test

# For Development environments  
NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_ID=docujourney-dev
```

## Integration Points

### Public App (H1B Dashboard)
- **Location**: Header component
- **File**: `apps/public-app/components/h1b-dashboard/DashboardHeader.tsx`
- **Display**: Next to the logo in the header

### Auth App (Document Management)
- **Location**: Sidebar header
- **File**: `apps/auth-app/components/AppSidebar.tsx`
- **Display**: Below the DocuJourney logo

## Project Mapping

| Environment | Branch | Google Cloud Project | Badge Color |
|-------------|--------|---------------------|-------------|
| Production | `main` | `doctracker-b4528` | No badge |
| Preview | `preview` | `immigrant-central-test` | Blue |
| Test | `develop` | `immigrant-central-test` | Blue |
| Local Dev | `local` | Various | Orange |

## Security Considerations

- Only project IDs are displayed (no sensitive information)
- Badges are hidden in production to maintain clean UX
- Environment variables use `NEXT_PUBLIC_` prefix for client-side access
- No credentials or API keys are exposed in badges

## Troubleshooting

### Badge Not Showing
1. Check environment variables are set correctly
2. Verify the project ID is not `doctracker-b4528` (production)
3. Confirm the component is imported and used correctly

### Wrong Project Name Displayed  
1. Update `NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_ID` in Vercel
2. Redeploy the application
3. Check CI/CD workflow environment variables

### Branch Name Not Showing
1. Ensure `NEXT_PUBLIC_BRANCH_NAME` is passed from CI/CD
2. Check Vercel's automatic `VERCEL_GIT_COMMIT_REF` variable
3. Verify the workflow is running on the correct branch

## Example Usage

```tsx
import { EnvironmentBadge } from '@/components/ui/environment-badge';

export function MyHeader() {
  return (
    <header>
      <div className="logo">My App</div>
      <EnvironmentBadge />
    </header>
  );
}
```

## Future Enhancements

- Add environment-specific styling themes
- Include deployment timestamp in badges
- Add click-to-copy functionality for environment info
- Integrate with monitoring/logging systems