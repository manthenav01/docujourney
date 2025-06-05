# Firebase Functions

This directory contains the Firebase Cloud Functions for the DocuJourney application.

## Setup

1. Navigate to the functions directory:
   ```bash
   cd functions
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the functions:
   ```bash
   npm run build
   ```

## Development

### Running Functions Locally

To run functions locally with the Firebase emulator:

```bash
npm run serve
```

### Deploying Functions

To deploy functions to Firebase:

```bash
npm run deploy
```

### Viewing Logs

To view function logs:

```bash
npm run logs
```

## Available Functions

- `helloWorld` - Example HTTP function
- `processDocument` - Firestore trigger for new documents
- `analyzeVisaStatus` - Callable function for visa status analysis

## Structure

```
functions/
├── src/
│   ├── index.ts          # Main functions entry point
│   └── ...               # Additional function modules
├── lib/                  # Compiled JavaScript (generated)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## Integration with Next.js App

The functions can be called from your Next.js application using the Firebase client SDK. For callable functions, use:

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const analyzeVisaStatus = httpsCallable(functions, 'analyzeVisaStatus');

// Call the function
const result = await analyzeVisaStatus({ userId, profileId });
```
