import React, { useState } from 'react';
import { DocumentTypeSchemaModel } from '@/lib/documentActions';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@docujourney/ui';

interface DocumentTypeSelectorProps {
  documentSchemas: Record<string, DocumentTypeSchemaModel>;
  onSelectDocumentType: (documentType: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const DocumentTypeSelectorrr: React.FC<DocumentTypeSelectorProps> = ({
  documentSchemas,
  onSelectDocumentType,
  onCancel,
  isLoading = false,
}) => {
  const [selectedType, setSelectedType] = useState<string>('');

  const handleContinue = () => {
    if (selectedType) {
      onSelectDocumentType(selectedType);
    }
  };

  const documentTypes = Object.entries(documentSchemas).map(([key, schema]) => ({
    value: key,
    label: schema.displayName || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
  }));

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex-shrink-0 text-center space-y-3">
        <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Select Document Type
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            We couldn't automatically detect the document type. Please select the type that best matches your document.
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Document Type <span className="text-red-500">*</span>
          </label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full h-12 bg-white border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
              <SelectValue placeholder="Choose a document type..." />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {documentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value} className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{type.label}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedType && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  {documentTypes.find(t => t.value === selectedType)?.label}
                </h4>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 bg-white pt-4 border-t border-gray-100">
        <div className="flex gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            disabled={isLoading}
            className="flex-1 h-11 border-gray-200"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleContinue}
            disabled={!selectedType || isLoading}
            className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Loading...
              </>
            ) : (
              <>
                Continue
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
