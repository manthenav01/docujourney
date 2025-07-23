'use client';

import React, { useState } from 'react';
import { Profile } from '@/lib/types/profile.model';
import ProfilesDisplay from '@/components/ProfilesDisplay';
import ProfileEditDialog from '@/components/ProfileEditDialog';
import { Button } from '@docujourney/ui';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ProfilesPageClientProps {
    profiles: Profile[];
    userId: string;
}

const ProfilesPageClient: React.FC<ProfilesPageClientProps> = ({ profiles, userId }) => {
    const [showNewProfileDialog, setShowNewProfileDialog] = useState(false);

    const handleAddProfile = () => {
        setShowNewProfileDialog(true);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Profiles</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage your family profiles and relationships
                        </p>
                    </div>
                    <Button
                        onClick={handleAddProfile}
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Profile
                    </Button>
                </div>
                
                <ProfilesDisplay 
                    profiles={profiles}
                    userId={userId}
                    onAddProfile={handleAddProfile}
                />

                {/* New Profile Dialog */}
                {showNewProfileDialog && (
                    <ProfileEditDialog
                        profile={null}
                        userId={userId}
                        onClose={() => setShowNewProfileDialog(false)}
                        onSave={() => {
                            setShowNewProfileDialog(false);
                            toast.success('Profile created successfully');
                            window.location.reload();
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default ProfilesPageClient;
