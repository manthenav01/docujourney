"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import DocumentsDisplay from './DocumentsDisplay';
import ProfileSwitcher from './ProfileSwitcher';
import { DocumentTypeSchemaModel } from '@/lib/documentActions';
import { DocumentMetaDataTransformedModel } from '@/lib/types/document.model';
import { Profile } from '@/lib/types/profile.model';

interface DashboardWithUploadProps {
  userId: string;
  activeProfileId: string;
  activeProfile: Profile;
  profiles: Profile[];
  documentGroups: { documentType: string; docs: DocumentMetaDataTransformedModel[] }[];
  documentSchemas: Record<string, DocumentTypeSchemaModel>;
  currentRoute?: string; // Optional current route for profile switching
}

export default function DashboardWithUpload({
  userId,
  activeProfileId,
  activeProfile,
  profiles,
  documentGroups,
  documentSchemas,
  currentRoute = '/dashboard', // Default to dashboard for backward compatibility
}: DashboardWithUploadProps) {
  const router = useRouter();

  const handleUploadClick = () => {
    router.push('/upload');
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium"> 🚀 Welcome back, {activeProfile?.firstName}!</h2>
        <div className="flex items-center gap-2">
          <ProfileSwitcher
            profiles={profiles}
            initialProfileId={activeProfileId}
            userId={userId}
            currentRoute={currentRoute}
          />
          {/* Upload button navigates to upload page */}
          <Button onClick={handleUploadClick}>Upload Document</Button>
        </div>
      </div>
      <DocumentsDisplay
        userId={userId}
        initialProfileId={activeProfileId}
        documentGroups={documentGroups}
        documentSchemas={documentSchemas}
      />
    </>
  );
}
