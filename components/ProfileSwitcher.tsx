"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProfileSelector from './ProfileSelector';
import { DocumentMetaDataAPIModel } from '@/lib/types/document.model';

interface DocumentGroup {
  documentType: string;
  docs: DocumentMetaDataAPIModel[];
}

interface ProfileSwitcherProps {
  userId: string;
  initialProfileId: string;
  profiles: any[];
}

export default function ProfileSwitcher({
  userId,
  initialProfileId,
  profiles,
}: ProfileSwitcherProps) {
  const [selectedProfileId, setSelectedProfileId] = useState(initialProfileId);
  const router = useRouter();

  // Handle profile change
  const handleProfileChange = (profileId: string) => {
    setSelectedProfileId(profileId);
    // Use this to navigate to the same page but with a different profile
    // This will cause a full server render with the new profile's data
    router.push(`/dashboard?profileId=${profileId}`);
  };

  return (
    <ProfileSelector
      profiles={profiles}
      selectedProfileId={selectedProfileId}
      onProfileChange={handleProfileChange}
    />
  );
}
