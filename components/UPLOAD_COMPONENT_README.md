# UploadDocumentDialog - Refactored Component Structure

## Overview
The `UploadDocumentDialog` component has been refactored into a clean, modular architecture that separates concerns and improves maintainability. The component now follows React best practices with proper separation of logic, UI components, and state management.

## Component Structure

### Main Component
- **UploadDocumentDialog.tsx** - The main dialog component that orchestrates the upload flow

### Sub-components
- **FileSelector.tsx** - Handles file selection with drag-and-drop support
- **UploadProgress.tsx** - Shows upload progress with visual feedback
- **DocumentVerificationForm.tsx** - Form for verifying extracted document data

### Custom Hook
- **useDocumentUpload.ts** - Manages all upload-related state and logic

## Features

### File Selection
- **Drag and Drop**: Users can drag files directly onto the upload area
- **File Validation**: Checks file type and size (10MB limit)
- **Supported Formats**: PDF, DOC, DOCX, JPG, PNG, TXT
- **Visual Feedback**: Interactive UI with hover and drag states

### Upload Progress
- **Real-time Progress**: Shows upload percentage and status
- **Visual Indicators**: Progress bar with color changes
- **Status Messages**: Clear feedback for different upload states
- **Error Handling**: Graceful error handling with user-friendly messages

### Document Verification
- **Dynamic Forms**: Auto-generated forms based on document schemas
- **Date Handling**: Special date picker for date fields
- **Field Validation**: Built-in form validation
- **Loading States**: Disabled states during submission

## Key Improvements

### 1. Separation of Concerns
- **Logic**: Moved to `useDocumentUpload` hook
- **UI Components**: Split into focused, reusable components
- **State Management**: Centralized in the custom hook

### 2. Error Handling
- **File Validation**: Client-side validation before upload
- **Upload Errors**: Proper error states and user feedback
- **Form Submission**: Error handling for verification form

### 3. User Experience
- **Drag and Drop**: Modern file selection experience
- **Loading States**: Clear feedback during async operations
- **Progress Tracking**: Visual progress indicators
- **Error Messages**: User-friendly error messages

### 4. Code Quality
- **TypeScript**: Full type safety throughout
- **Modularity**: Small, focused components
- **Reusability**: Components can be reused in other contexts
- **Maintainability**: Clear structure and separation

## Usage

```tsx
<UploadDocumentDialog
  userId={userId}
  profileId={profileId}
  documentSchemas={documentSchemas}
/>
```

## File Organization

```
components/
├── UploadDocumentDialog.tsx          # Main component
├── components/
│   ├── index.ts                      # Component exports
│   ├── FileSelector.tsx              # File selection UI
│   ├── UploadProgress.tsx            # Upload progress UI
│   └── DocumentVerificationForm.tsx  # Verification form UI
└── hooks/
    ├── index.ts                      # Hook exports
    └── useDocumentUpload.ts          # Upload logic hook
```

## Benefits of This Architecture

1. **Maintainability**: Each component has a single responsibility
2. **Testability**: Components can be tested in isolation
3. **Reusability**: Sub-components can be used elsewhere
4. **Readability**: Clear, focused code with minimal complexity
5. **Scalability**: Easy to extend with new features
6. **Type Safety**: Full TypeScript coverage prevents runtime errors

## State Flow

1. **File Selection**: User selects or drops a file
2. **Validation**: File is validated for type and size
3. **Upload**: File is uploaded to Firebase Storage
4. **Processing**: Document is processed for data extraction
5. **Verification**: User reviews and edits extracted data
6. **Completion**: Document is saved with verified data

This refactored structure makes the component much more maintainable, testable, and user-friendly while preserving all original functionality.
