"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import UploadDocumentDialog from './UploadDocumentDialog';
import DashboardDisplay from './DashboardDisplay';
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
}

export default function DashboardWithUpload({
  userId,
  activeProfileId,
  activeProfile,
  profiles,
  documentGroups,
  documentSchemas,
}: DashboardWithUploadProps) {
  const router = useRouter();

  const handleUploadSuccess = () => {
    // Refresh the page to get updated data
    router.refresh();
  };

  const handleProfileCreated = (newProfileId: string) => {
    // Navigate to the new profile or refresh data
    router.refresh();
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
          />
          {/* Upload button triggers the upload dialog */}
          <UploadDocumentDialog
            userId={userId}
            profileId={activeProfileId}
            currentProfile={activeProfile}
            allProfiles={profiles}
            documentSchemas={documentSchemas}
            onSuccess={handleUploadSuccess}
            onProfileCreated={handleProfileCreated}
          />
        </div>
      </div>
      <DashboardDisplay
        userId={userId}
        initialProfileId={activeProfileId}
        documentGroups={documentGroups}
        documentSchemas={documentSchemas}
      />
    </>
  );
}
