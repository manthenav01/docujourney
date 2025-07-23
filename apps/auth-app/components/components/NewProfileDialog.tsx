import React, { useState } from 'react';
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@docujourney/ui';

interface ExtractedPersonInfo {
  firstName: string;
  lastName: string;
}

interface NewProfileDialogProps {
  extractedPersonInfo: ExtractedPersonInfo;
  onConfirm: (relationship: string, email?: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const relationshipOptions = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'relative', label: 'Other Relative' },
];

export const NewProfileDialog: React.FC<NewProfileDialogProps> = ({
  extractedPersonInfo,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const [relationship, setRelationship] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  const handleConfirm = () => {
    if (relationship) {
      onConfirm(relationship, email || undefined);
    }
  };

  const handleCancel = () => {
    setRelationship('');
    setEmail('');
    onCancel();
  };

  const { firstName, lastName } = extractedPersonInfo;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-gray-900">New Person Detected</h3>
        <p className="text-sm text-gray-600">
          The document contains information for <strong>{firstName} {lastName}</strong>, 
          who doesn't match the current profile. We'll create a new profile for them.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            What is your relationship to {firstName}? <span className="text-red-500">*</span>
          </label>
          <Select value={relationship} onValueChange={setRelationship}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select relationship..." />
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
          <label className="text-sm font-medium text-gray-700">
            Email (optional)
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className="w-full"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button 
          type="button" 
          onClick={handleConfirm}
          disabled={!relationship || isLoading}
          className="flex-1"
        >
          {isLoading ? 'Creating Profile...' : 'Create Profile'}
        </Button>
      </div>
    </div>
  );
};
