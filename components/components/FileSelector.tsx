import React, { useCallback, useState } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FileSelectorProps {
  onFileSelect: (file: File) => void;
  accept: string;
  maxSizeInMB: number;
  selectedFile: File | null;
  onClearFile: () => void;
  error?: string;
  disabled?: boolean;
}

export const FileSelector: React.FC<FileSelectorProps> = ({
  onFileSelect,
  accept,
  maxSizeInMB,
  selectedFile,
  onClearFile,
  error,
  disabled = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type;
    
    const isValidType = acceptedTypes.some(acceptedType => {
      if (acceptedType.startsWith('.')) {
        return fileExtension === acceptedType.toLowerCase();
      }
      return mimeType.match(acceptedType.replace('*', '.*'));
    });

    if (!isValidType) {
      return `File type not supported. Please select: ${accept}`;
    }

    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return `File size exceeds ${maxSizeInMB}MB limit`;
    }

    return null;
  };

  const handleFileChange = useCallback((file: File) => {
    setValidationError(null);
    
    const validation = validateFile(file);
    if (validation) {
      setValidationError(validation);
      return;
    }

    onFileSelect(file);
  }, [onFileSelect, accept, maxSizeInMB]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) {return;}

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  }, [handleFileChange, disabled]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) {return '0 Bytes';}
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const displayError = error || validationError;

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${displayError ? 'border-red-300 bg-red-50' : ''}
          `}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => {
            if (!disabled) {
              document.getElementById('file-input')?.click();
            }
          }}
        >
          <div className="flex flex-col items-center space-y-4">
            <Upload 
              className={`h-12 w-12 ${
                displayError ? 'text-red-400' : 'text-gray-400'
              }`} 
            />
            <div>
              <p className={`text-lg font-medium ${
                displayError ? 'text-red-700' : 'text-gray-700'
              }`}>
                {dragActive ? 'Drop your file here' : 'Choose a file or drag it here'}
              </p>
              <p className={`text-sm ${
                displayError ? 'text-red-500' : 'text-gray-500'
              }`}>
                Supports: {accept} (Max {maxSizeInMB}MB)
              </p>
            </div>
            {!disabled && (
              <Button variant="outline" type="button">
                Browse Files
              </Button>
            )}
          </div>
          
          <input
            id="file-input"
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled}
          />
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClearFile}
              disabled={disabled}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {displayError && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
};
