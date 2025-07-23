import React from 'react';
import { FileIcon, UploadIcon } from 'lucide-react';
import { Button } from '@docujourney/ui';

interface UploadProgressProps {
  file: File;
  uploadProgress: number;
  onStartUpload: () => void;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({ file, uploadProgress, onStartUpload }) => {
  const isUploading = uploadProgress > 0;
  const isCompleted = uploadProgress === 100;

  const getStatusMessage = () => {
    if (uploadProgress === 0) {return 'Ready to upload';}
    if (uploadProgress < 100) {return 'Uploading...';}
    return 'Processing document...';
  };

  const getStatusColor = () => {
    if (uploadProgress === 0) {return 'text-gray-500';}
    if (uploadProgress < 100) {return 'text-blue-600';}
    return 'text-green-600';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 border rounded-lg bg-gray-50">
        <FileIcon className="h-8 w-8 text-blue-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{file.name}</p>
          <p className="text-xs text-gray-500">
            {(file.size / (1024 * 1024)).toFixed(2)} MB
          </p>
        </div>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className={getStatusColor()}>
              {getStatusMessage()}
            </span>
            <span className="font-medium">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isCompleted ? 'bg-green-600' : 'bg-blue-600'
              }`}
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          {isCompleted && (
            <p className="text-xs text-gray-600 text-center">
              Document uploaded successfully. Extracting data...
            </p>
          )}
        </div>
      )}

      {!isUploading && (
        <Button 
          onClick={onStartUpload} 
          className="w-full"
          disabled={isUploading}
        >
          <UploadIcon className="h-4 w-4 mr-2" />
          Start Upload
        </Button>
      )}
    </div>
  );
};
