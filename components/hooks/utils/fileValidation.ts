/**
 * Validate file before upload
 */
export const validateFile = (file: File): string | null => {
  // Validate file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    return 'File size must be less than 10MB';
  }
  
  // Validate file type
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'text/plain',
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return 'Please select a valid file type (PDF, DOC, DOCX, JPG, PNG, TXT)';
  }
  
  return null; // No error
};
