"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DocumentTypeSchemaModel } from '@/lib/documentActions';
import { Profile } from '@/lib/types/profile.model';
import { useDocumentUpload } from '@/components/hooks';
import { FileSelector, UploadProgress, DocumentVerificationForm, DocumentTypeSelection, FirstEntryDateSelection, NewProfileDialog } from '@/components/components';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { sortProfilesByRelationship } from '@/utils/profileUtils';

interface UploadPageClientProps {
  userId: string;
  profiles: Profile[];
  documentSchemas: Record<string, DocumentTypeSchemaModel>;
}

export default function UploadPageClient({ 
  userId, 
  profiles, 
  documentSchemas
}: UploadPageClientProps) {
  const router = useRouter();
  const [localProfiles, setLocalProfiles] = useState<Profile[]>(profiles);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    profiles.find(p => p.admin)?.id || profiles[0].id
  );
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('auto-detect');
  
  const currentProfile = localProfiles.find(p => p.id === selectedProfileId) || localProfiles[0];

  // Handle initial loading state
  useEffect(() => {
    if (profiles.length > 0 && Object.keys(documentSchemas).length > 0) {
      setIsInitialLoading(false);
    }
  }, [profiles, documentSchemas]);

  // Sync local profiles with prop changes
  useEffect(() => {
    setLocalProfiles(profiles);
  }, [profiles]);

  const {
    file,
    uploadProgress,
    formFields,
    documentType,
    documentId,
    showDocumentTypeSelection,
    showNewProfileDialog,
    showFirstEntryDateSelection,
    extractedPersonInfo,
    selectedProfileId: hookSelectedProfileId,
    error,
    isLoading,
    phase,
    isFormDisabled,
    handleFileSelect,
    startUpload,
    handleVerificationSubmit,
    handleDocumentTypeSelection,
    handleNewProfileConfirm,
    handleNewProfileCancel,
    handleFirstEntryDateSubmit,
    handleFirstEntryDateCancel,
    goBackToDocumentTypeSelection,
    resetUpload,
    deleteCurrentDocument
  } = useDocumentUpload({ 
    userId, 
    profileId: selectedProfileId,
    currentProfile,
    allProfiles: localProfiles,
    documentSchemas,
    onSuccess: async (finalProfileId: string) => {
      await resetUpload();
      toast.success('Document uploaded successfully!');
      // Redirect to documents page with the final profile (which might be different from initially selected profile)
      router.push(`/documents?profileId=${finalProfileId}`);
    },
    onProfileCreated: (newProfileId: string, newProfile?: Profile) => {
      // Update the selected profile to the newly created one
      setSelectedProfileId(newProfileId);
      
      // Add the new profile to our local profiles list if we have the complete profile data
      if (newProfile) {
        setLocalProfiles(prev => {
          // Check if profile already exists to avoid duplicates
          const profileExists = prev.some(p => p.id === newProfileId);
          if (profileExists) {
            return prev;
          }
          return [...prev, newProfile];
        });
      }
    }
  });

  // Show toast notification when error occurs
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleFileSelectWrapper = (selectedFile: File) => {
    // Create a mock ChangeEvent to match the hook's expected interface
    const mockEvent = {
      target: {
        files: [selectedFile]
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleFileSelect(mockEvent);
  };

  const handleManualDocumentTypeSelection = (documentType: string) => {
    handleDocumentTypeSelection(documentType);
  };

  const handleDocumentTypeChange = (newDocumentType: string) => {
    setSelectedDocumentType(newDocumentType);
    // If user selects a specific document type and has already uploaded a file,
    // trigger the manual document type selection
    if (newDocumentType !== 'auto-detect' && file && !formFields) {
      handleDocumentTypeSelection(newDocumentType);
    }
  };

  const handleProfileChange = async (newProfileId: string) => {
    if (file || formFields) {
      // If there's an upload in progress, ask for confirmation
      if (confirm('Changing profile will reset the current upload and delete any uploaded document. Do you want to continue?')) {
        await resetUpload(true); // Pass true to delete the document
        setSelectedProfileId(newProfileId);
      }
    } else {
      setSelectedProfileId(newProfileId);
    }
  };

  const handleClearFile = () => {
    resetUpload(true).catch(console.error);
  };

  const handleVerificationCancel = () => {
    resetUpload().catch(console.error);
  };

  const handleVerificationDelete = () => {
    resetUpload(true).catch(console.error);
  };

  const getMainContent = () => {
    // Show skeleton if data is still being processed or initially loading
    if (isInitialLoading || (isLoading && !file && !formFields && !showDocumentTypeSelection && !showNewProfileDialog)) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4 py-16">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
      );
    }

    // New Profile Dialog
    if (showNewProfileDialog && extractedPersonInfo) {
      return (
        <NewProfileDialog
          extractedPersonInfo={extractedPersonInfo}
          onConfirm={handleNewProfileConfirm}
          onCancel={handleNewProfileCancel}
          isLoading={isLoading}
        />
      );
    }

    // First Entry Date Selection
    if (showFirstEntryDateSelection) {
      return (
        <FirstEntryDateSelection
          profileName={`${currentProfile.firstName} ${currentProfile.lastName}`}
          onSubmit={handleFirstEntryDateSubmit}
          onCancel={handleFirstEntryDateCancel}
          isLoading={isLoading}
          existingDate={currentProfile.firstEntryDate}
          existingVisaType={currentProfile.firstEntryVisaType}
          existingEmploymentStatus={currentProfile.currentlyEmployed}
        />
      );
    }

    // Document Type Selection
    if (showDocumentTypeSelection) {
      return (
        <DocumentTypeSelection
          documentSchemas={documentSchemas}
          onSelect={handleManualDocumentTypeSelection}
          onCancel={() => goBackToDocumentTypeSelection()}
          isLoading={isLoading}
          showFirstEntryStep={phase === 'completed' || phase === 'profile-info'}
        />
      );
    }

    // Verification Form
    if (formFields && documentType && documentId) {
      return (
        <DocumentVerificationForm
          formFields={formFields}
          documentType={documentType}
          documentSchemas={documentSchemas}
          documentId={documentId}
          userId={userId}
          profileId={hookSelectedProfileId}
          onSubmit={handleVerificationSubmit}
          onCancel={handleVerificationCancel}
          onDelete={handleVerificationDelete}
          isLoading={isLoading}
        />
      );
    }

    // Upload Progress
    if (file && !formFields && !showDocumentTypeSelection) {
      return (
        <UploadProgress 
          file={file} 
          uploadProgress={uploadProgress} 
          onStartUpload={startUpload} 
        />
      );
    }

    // File Selection (default state)
    return (
      <FileSelector 
        onFileSelect={handleFileSelectWrapper}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
        maxSizeInMB={10}
        selectedFile={file}
        onClearFile={handleClearFile}
      />
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Upload Document</h1>
        <p className="text-gray-600">Upload and verify your documents with ease</p>
      </div>

      {/* Profile and Document Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Profile Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {isInitialLoading || localProfiles.length === 0 ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select 
                value={selectedProfileId} 
                onValueChange={handleProfileChange}
                disabled={isLoading || !!file}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a profile" />
                </SelectTrigger>
                <SelectContent>
                  {sortProfilesByRelationship(localProfiles).map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      <div className="flex items-center gap-2">
                        <span>{profile.firstName} {profile.lastName}</span>
                        {profile.admin && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Admin
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {/* Document Type Selection (Optional - for manual selection) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Document Type</CardTitle>
          </CardHeader>
          <CardContent>
            {isInitialLoading || Object.keys(documentSchemas).length === 0 ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select 
                value={selectedDocumentType} 
                onValueChange={handleDocumentTypeChange}
                disabled={isLoading || !!file}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Auto-detect or choose manually" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto-detect">Auto-detect document type</SelectItem>
                  {Object.entries(documentSchemas).map(([key, schema]) => (
                    <SelectItem key={key} value={key}>
                      {schema.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>
            {showNewProfileDialog ? "Create New Profile" :
             showFirstEntryDateSelection ? "First Entry Date Required" :
             showDocumentTypeSelection ? "Select Document Type" :
             formFields && documentType ? "Verify Extracted Data" : "Upload Document"}
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-[400px]">
          {getMainContent()}
        </CardContent>
      </Card>
    </div>
  );
}
