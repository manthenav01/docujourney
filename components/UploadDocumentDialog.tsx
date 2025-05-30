"use client";

import React, { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { DocumentTypeSchemaModel } from '@/lib/documentActions';
import { useDocumentUpload } from './hooks';
import { FileSelector, UploadProgress, DocumentVerificationForm, DocumentTypeSelection } from './components';

interface UploadDocumentDialogProps {
  userId: string;
  profileId: string;
  documentSchemas: Record<string, DocumentTypeSchemaModel>;
  onSuccess?: () => void;
}

export default function UploadDocumentDialog({ userId, profileId, documentSchemas, onSuccess: onSuccessCallback }: UploadDocumentDialogProps) {
  const [open, setOpen] = useState(false);
  const [cameFromManualSelection, setCameFromManualSelection] = useState(false);
  
  const {
    file,
    uploadProgress,
    formFields,
    documentType,
    documentId,
    showDocumentTypeSelection,
    error,
    isLoading,
    handleFileSelect,
    startUpload,
    handleVerificationSubmit,
    handleDocumentTypeSelection,
    goBackToDocumentTypeSelection,
    resetUpload
  } = useDocumentUpload({ 
    userId, 
    profileId, 
    documentSchemas,
    onSuccess: () => {
      setOpen(false);
      // Call the parent's onSuccess callback to refresh data
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    }
  });

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
          profileId={profileId}
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
            {showDocumentTypeSelection ? "Select Document Type" :
             formFields && documentType ? "Verify Extracted Data" : "Upload Document"}
          </DialogTitle>
          {!formFields && !showDocumentTypeSelection && (
            <DialogDescription>Select a file to upload and verify extracted data.</DialogDescription>
          )}
        </DialogHeader>
        
        {error && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 flex-shrink-0">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        <div className="flex-1 overflow-hidden">
          {getDialogContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
