'use client';

import React, { useState } from 'react';
import { Profile } from '@/lib/types/profile.model';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Crown, Users, User, Plus } from 'lucide-react';
import { toast } from 'sonner';
import ProfileEditDialog from './ProfileEditDialog';
import { 
    getVisaStatusColorClasses, 
    getVisaStatusIcon, 
    getVisaStatusDisplayText, 
} from '@/lib/visaStatusUtils';
import { formatValue } from '@/utils/documentUtils';
import { sortProfilesByRelationship } from '@/utils/profileUtils';

interface ProfilesDisplayProps {
    profiles: Profile[];
    userId: string;
    onAddProfile?: () => void;
}


const ProfilesDisplay: React.FC<ProfilesDisplayProps> = ({ profiles, userId, onAddProfile }) => {
    const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
    const [showNewProfileDialog, setShowNewProfileDialog] = useState(false);


    const handleEditProfile = (profile: Profile) => {
        setEditingProfile(profile);
    };

    const handleCloseEdit = () => {
        setEditingProfile(null);
    };

    const handleAddProfile = () => {
        if (onAddProfile) {
            onAddProfile();
        } else {
            setShowNewProfileDialog(true);
        }
    };

    const renderProfileCard = (profile: Profile) => {
        const statusIcon = profile.lastVisaStatusAnalysis 
            ? getVisaStatusIcon(profile.lastVisaStatusAnalysis.currentStatus)
            : null;
        
        return (
            <div key={profile.id} className="space-y-4">
                <Card className="border hover:shadow-md transition-shadow bg-white">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <User className="w-5 h-5 text-gray-600" />
                                <div>
                                    <CardTitle className="text-base font-semibold text-gray-900">
                                        {profile.firstName} {profile.lastName}
                                    </CardTitle>
                                    <p className="text-xs text-gray-500 font-medium">
                                        {profile.relationship || 'Other'}
                                    </p>
                                </div>
                            </div>
                            {profile.isAdmin && (
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                                    <Crown className="w-3 h-3 mr-1" />
                                    Admin
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0 pb-3">
                        <div className="space-y-3">
                            {/* Profile Information */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">Email:</span>
                                    <span className="text-xs font-medium text-gray-900 truncate ml-2" title={profile.email}>
                                        {profile.email}
                                    </span>
                                </div>
                                {profile.phone && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">Phone:</span>
                                        <span className="text-xs font-medium text-gray-900">{profile.phone}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">DOB:</span>
                                    <span className="text-xs font-medium text-gray-900">
                                        {profile.dateOfBirth ? formatValue(profile.dateOfBirth, 'date') : 'Not set'}
                                    </span>
                                </div>
                                {profile.firstEntryDate && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">First Entry Date:</span>
                                        <span className="text-xs font-medium text-gray-900">
                                            {formatValue(profile.firstEntryDate, 'date')}
                                        </span>
                                    </div>
                                )}
                                {profile.firstEntryVisaType && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">First Entry Visa:</span>
                                        <span className="text-xs font-medium text-gray-900">
                                            {profile.firstEntryVisaType}
                                        </span>
                                    </div>
                                )}
                                {profile.countryOfCitizen && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">Citizenship:</span>
                                        <span className="text-xs font-medium text-gray-900">{profile.countryOfCitizen}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">Employment:</span>
                                    <Badge 
                                        variant="outline" 
                                        className={`text-xs ${
                                            profile.currentlyEmployed 
                                                ? 'bg-green-50 text-green-700 border-green-200' 
                                                : 'bg-gray-50 text-gray-600 border-gray-200'
                                        }`}
                                    >
                                        {profile.currentlyEmployed ? 'Employed' : 'Unemployed'}
                                    </Badge>
                                </div>
                            </div>

                            {/* Simple Visa Status Section */}
                            {profile.lastVisaStatusAnalysis && (
                                <div className="border-t pt-3 space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">Visa Status:</span>
                                        <div className="flex items-center gap-1">
                                            {statusIcon && React.createElement(statusIcon, { className: 'w-3 h-3' })}
                                            <Badge 
                                                className={`${getVisaStatusColorClasses(profile.lastVisaStatusAnalysis.currentStatus)} text-xs border-0`}
                                            >
                                                {getVisaStatusDisplayText(profile.lastVisaStatusAnalysis.currentStatus)}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">Visa Type:</span>
                                        <Badge variant="outline" className="text-xs">
                                            {profile.lastVisaStatusAnalysis.visaType}
                                        </Badge>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProfile(profile)}
                            className="w-full text-xs h-8"
                        >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    };

    // Sort profiles by relationship priority
    const sortedProfiles = sortProfilesByRelationship(profiles);

    return (
        <div className="space-y-6">
            {profiles.length > 0 ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sortedProfiles.map((profile) => renderProfileCard(profile))}
                    </div>
                </div>
            ) : (
                /* Empty State - No profiles at all */
                <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No profiles found</h3>
                    <p className="text-gray-600 mb-4">Get started by adding your first profile.</p>
                    <Button
                        onClick={handleAddProfile}
                        variant="outline"
                        className="border-teal-600 text-teal-600 hover:bg-teal-50"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Profile
                    </Button>
                </div>
            )}

            {/* Edit Profile Dialog */}
            {editingProfile && (
                <ProfileEditDialog
                    profile={editingProfile}
                    userId={userId}
                    onClose={handleCloseEdit}
                    onSave={() => {
                        handleCloseEdit();
                        toast.success('Profile updated successfully');
                        window.location.reload();
                    }}
                />
            )}

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
    );
};

export default ProfilesDisplay;
