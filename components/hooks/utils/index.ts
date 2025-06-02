// Utility functions for the document upload hook
export { transformDatesToFirestore, transformTimestampsToFormValues } from './dateTransformers';
export { doNamesMatch, findMatchingProfile } from './profileMatching';
export { validateFile } from './fileValidation';
export { createNewProfile, fetchProfileById } from './profileApi';
export { uploadFileToStorage } from './uploadHelpers';
export { handleDocumentCompletion, setupFormFields } from './documentProcessing';
