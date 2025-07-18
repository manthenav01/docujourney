'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Profile } from '@/lib/types/profile.model';
import { sortProfilesByRelationship } from '@/utils/profileUtils';

interface ProfileSelectorProps {
  profiles: Profile[];
  selectedProfileId: string;
  onProfileChange: (profileId: string) => void;
}

export default function ProfileSelector({ 
  profiles, 
  selectedProfileId, 
  onProfileChange, 
}: ProfileSelectorProps) {
  // Sort profiles by relationship priority
  const sortedProfiles = sortProfilesByRelationship(profiles);

  return (
    <div >
      <Select value={selectedProfileId} onValueChange={onProfileChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a profile" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {sortedProfiles.map((profile) => (
              <SelectItem key={profile.id} value={profile.id}>
                {profile.firstName} {profile.lastName}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
