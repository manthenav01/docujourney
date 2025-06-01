"use client";

import React, { useState, useEffect } from 'react';
import { Profile } from '@/lib/types/profile.model';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Save, X } from 'lucide-react';

interface ProfileEditDialogProps {
    profile: Profile | null; // null for new profile
    userId: string;
    onClose: () => void;
    onSave: () => void;
}

const relationshipOptions = [
    { value: 'self', label: 'Self' },
    { value: 'spouse', label: 'Spouse/Partner' },
    { value: 'child', label: 'Child' },
    { value: 'parent', label: 'Parent' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'grandparent', label: 'Grandparent' },
];

const ProfileEditDialog: React.FC<ProfileEditDialogProps> = ({
    profile,
    userId,
    onClose,
    onSave,
}) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        relationship: '',
        isAdmin: false,
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const isEditing = !!profile;

    useEffect(() => {
        if (profile) {
            setFormData({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                email: profile.email || '',
                phone: profile.phone || '',
                dateOfBirth: profile.dateOfBirth 
                    ? new Date(profile.dateOfBirth).toISOString().split('T')[0]
                    : '',
                relationship: profile.relationship || 'other',
                isAdmin: profile.isAdmin || false,
            });
        }
    }, [profile]);

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const validateForm = () => {
        if (!formData.firstName.trim()) {
            toast.error('First name is required');
            return false;
        }
        if (!formData.lastName.trim()) {
            toast.error('Last name is required');
            return false;
        }
        if (!formData.relationship.trim()) {
            toast.error('Relationship is required');
            return false;
        }
        // Email validation only if provided
        if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
            toast.error('Please enter a valid email address');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        
        try {
            const profileData = {
                ...formData,
                dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
                userId,
            };

            const response = await fetch('/api/createProfile', {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...profileData,
                    ...(isEditing && { id: profile.id }),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save profile');
            }

            toast.success(isEditing ? 'Profile updated successfully' : 'Profile created successfully');
            onSave();
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to save profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <span>{isEditing ? 'Edit Profile' : 'Create New Profile'}</span>
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing 
                            ? 'Update the profile information below.'
                            : 'Fill in the details to create a new profile.'
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                                id="firstName"
                                placeholder="Enter first name"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                                id="lastName"
                                placeholder="Enter last name"
                                value={formData.lastName}
                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="relationship">Relationship *</Label>
                            <Select
                                value={formData.relationship}
                                onValueChange={(value) => handleInputChange('relationship', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select relationship" />
                                </SelectTrigger>
                                <SelectContent>
                                    {relationshipOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                            <Input
                                id="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter email address"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="Enter phone number"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                    </div>

                    



                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={isLoading}
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isLoading 
                            ? (isEditing ? 'Updating...' : 'Creating...') 
                            : (isEditing ? 'Update Profile' : 'Create Profile')
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ProfileEditDialog;
