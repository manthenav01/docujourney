"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { DocumentTypeSchemaModel } from '@/lib/documentActions';
import { Profile } from '@/lib/types/profile.model';
import { useDocumentUpload } from './hooks';
import { FileSelector, UploadProgress, DocumentVerificationForm, DocumentTypeSelection, NewProfileDialog } from './components';
import { toast } from 'sonner';

interface UploadDocumentDialogProps {
  userId: string;
  profileId: string;
  currentProfile: Profile;
  allProfiles: Profile[];
  documentSchemas: Record<string, DocumentTypeSchemaModel>;
  onSuccess?: () => void;
  onProfileCreated?: (newProfileId: string) => void;
}

export default function UploadDocumentDialog({ 
  userId, 
  profileId, 
  currentProfile, 
  allProfiles, 
  documentSchemas, 
  onSuccess: onSuccessCallback,
  onProfileCreated 
}: UploadDocumentDialogProps) {
  const [open, setOpen] = useState(false);
  const [cameFromManualSelection, setCameFromManualSelection] = useState(false);
  
  const {
    file,
    uploadProgress,
    formFields,
    documentType,
    documentId,
    showDocumentTypeSelection,
    showNewProfileDialog,
    extractedPersonInfo,
    selectedProfileId,
    error,
    isLoading,
    handleFileSelect,
    startUpload,
    handleVerificationSubmit,
    handleDocumentTypeSelection,
    handleNewProfileConfirm,
    handleNewProfileCancel,
    goBackToDocumentTypeSelection,
    resetUpload
  } = useDocumentUpload({ 
    userId, 
    profileId,
    currentProfile,
    allProfiles,
    documentSchemas,
    onSuccess: () => {
      setOpen(false);
      // Call the parent's onSuccess callback to refresh data
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onProfileCreated
  });

  // Show toast notification when error occurs
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleDialogClose = () => {
    setOpen(false);
    setCameFromManualSelection(false);
    resetUpload();
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setCameFromManualSelection(false);
      resetUpload();
    }
  };

  const handleManualDocumentTypeSelection = (documentType: string) => {
    setCameFromManualSelection(true);
    handleDocumentTypeSelection(documentType);
  };

  const handleBackToDocumentTypeSelection = () => {
    setCameFromManualSelection(false);
    goBackToDocumentTypeSelection();
  };

  const handleFileSelectWrapper = (selectedFile: File) => {
    // Create a mock ChangeEvent to match the hook's expected interface
    const mockEvent = {
      target: {
        files: [selectedFile]
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleFileSelect(mockEvent);
  };

  const getDialogContent = () => {
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

    if (!file) {
      return (
        <FileSelector 
          onFileSelect={handleFileSelectWrapper}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
          maxSizeInMB={10}
          selectedFile={file}
          onClearFile={resetUpload}
        />
      );
    }
    
    if (file && !formFields && !showDocumentTypeSelection) {
      return <UploadProgress file={file} uploadProgress={uploadProgress} onStartUpload={startUpload} />;
    }
    
    if (showDocumentTypeSelection) {
      return (
        <DocumentTypeSelection
          documentSchemas={documentSchemas}
          onSelect={handleManualDocumentTypeSelection}
          onCancel={handleDialogClose}
          isLoading={isLoading}
        />
      );
    }
    
    if (formFields && documentType && documentId) {
      return (
        <DocumentVerificationForm
          formFields={formFields}
          documentType={documentType}
          documentSchemas={documentSchemas}
          documentId={documentId}
          userId={userId}
          profileId={selectedProfileId}
          onSubmit={handleVerificationSubmit}
          onCancel={handleDialogClose}
          onDelete={handleDialogClose}
          onBack={handleBackToDocumentTypeSelection}
          showBackButton={cameFromManualSelection}
          isLoading={isLoading}
        />
      );
    }
    
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Upload Document</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {showNewProfileDialog ? "Create New Profile" :
             showDocumentTypeSelection ? "Select Document Type" :
             formFields && documentType ? "Verify Extracted Data" : "Upload Document"}
          </DialogTitle>
          {!formFields && !showDocumentTypeSelection && !showNewProfileDialog && (
            <DialogDescription>Select a file to upload and verify extracted data.</DialogDescription>
          )}
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {getDialogContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
