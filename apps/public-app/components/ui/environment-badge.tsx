'use client';

import { Badge } from '@docujourney/ui';
import { GitBranch, Cloud } from 'lucide-react';

interface EnvironmentBadgeProps {
  projectId?: string
  branch?: string
  environment?: 'development' | 'preview' | 'production'
  className?: string
}

export function EnvironmentBadge({ 
  projectId, 
  branch, 
  environment,
  className = '',
}: EnvironmentBadgeProps) {
  // Don't show badge in production
  if (environment === 'production' || process.env.NODE_ENV === 'production' && !projectId) {
    return null;
  }

  // Get environment info from environment variables or props
  const currentProjectId = projectId || process.env.NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_ID || 'unknown';
  const currentBranch = branch || process.env.VERCEL_GIT_COMMIT_REF || process.env.NEXT_PUBLIC_BRANCH_NAME || 'local';
  const currentEnv = environment || (process.env.VERCEL_ENV === 'preview' ? 'preview' : 'development');

  // Don't show for production project
  if (currentProjectId === 'doctracker-b4528') {
    return null;
  }

  const badgeVariant = currentEnv === 'preview' ? 'secondary' : 'outline';
  const badgeColor = currentEnv === 'preview' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant={badgeVariant} className={`${badgeColor} flex items-center gap-1 font-mono text-xs`}>
        <Cloud className="h-3 w-3" />
        {currentProjectId}
      </Badge>
      <Badge variant="outline" className="flex items-center gap-1 font-mono text-xs">
        <GitBranch className="h-3 w-3" />
        {currentBranch}
      </Badge>
    </div>
  );
}