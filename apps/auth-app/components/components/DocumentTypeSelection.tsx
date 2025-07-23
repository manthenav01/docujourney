import React from 'react';
import { DocumentTypeSchemaModel } from '@/lib/documentActions';
import { FileIcon, ChevronRightIcon } from 'lucide-react';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Stepper } from '@docujourney/ui';

interface DocumentTypeSelectionProps {
  documentSchemas: Record<string, DocumentTypeSchemaModel>;
  onSelect: (documentType: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  showFirstEntryStep?: boolean; // New prop to indicate if first entry step was shown
}

export const DocumentTypeSelection: React.FC<DocumentTypeSelectionProps> = ({
  documentSchemas,
  onSelect,
  onCancel,
  isLoading = false,
  showFirstEntryStep = false,
}) => {
  const [selectedType, setSelectedType] = React.useState<string>('');

  const documentTypes = Object.entries(documentSchemas).map(([key, schema]) => ({
    value: key,
    label: schema.displayName || key,
    description: `${schema.fields?.filter(f => f.editable)?.length || 0} fields to fill`,
    fieldCount: schema.fields?.filter(f => f.editable)?.length || 0,
  }));

  const handleContinue = () => {
    if (selectedType) {
      onSelect(selectedType);
    }
  };


  return (
    <div className="flex flex-col h-full max-h-[calc(90vh-120px)] space-y-6">
      {/* Header */}
      <div className="flex-shrink-0">
        <Stepper 
          steps={showFirstEntryStep ? [
            { title: 'First Entry Date', description: 'Date entered' },
            { title: 'Document Type', description: 'Select type' },
            { title: 'Verify Data', description: 'Review fields' },
          ] : [
            { title: 'Document Type', description: 'Select type' },
            { title: 'Verify Data', description: 'Review fields' },
          ]}
          currentStep={showFirstEntryStep ? 1 : 0}
          className="mb-6"
        />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Select Document Type</h3>
          <p className="text-sm text-gray-600">
            We couldn't automatically detect the document type. Please select the correct type below.
          </p>
        </div>
      </div>

      {/* Document Type Selection */}
      <div className="flex-1 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Document Type <span className="text-red-500">*</span>
          </label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full h-12 bg-white border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
              <div className="flex items-center gap-3">
                <FileIcon className="h-4 w-4 text-gray-500" />
                <SelectValue placeholder="Choose a document type..." />
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {documentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value} className="py-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{type.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex-shrink-0 flex gap-3 pt-4 border-t border-gray-100">
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
          className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Loading...
            </>
          ) : (
            <>
              Continue
              <ChevronRightIcon className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
