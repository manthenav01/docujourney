# Genkit Integration for Visa Status Analysis

This project integrates Google's Genkit AI framework to automatically analyze immigration documents and determine visa status for each profile.

## Features

- **Automatic Visa Status Analysis**: After document verification, the system automatically analyzes all documents for a profile to determine current visa status
- **Privacy-First Approach**: Only document types and dates are sent to the AI model - no personal information like names
- **Smart Status Detection**: Considers document hierarchy (Green Card > EAD > I-94, etc.) and validity periods
- **Expiration Warnings**: Flags documents expiring within 90 days
- **Actionable Recommendations**: Provides next steps based on document status

## Setup

### 1. Install Dependencies
The required Genkit dependencies are already included in `package.json`:
```json
{
  "@genkit-ai/googleai": "^1.11.1",
  "@genkit-ai/next": "^1.11.1",
  "genkit": "^1.11.1"
}
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and add your Google AI API key:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
GOOGLE_GENAI_API_KEY=your_google_ai_api_key_here
```

### 3. Get Google AI API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env.local` file

## How It Works

### Document Processing Flow
1. User uploads and verifies a document
2. After verification, `triggerVisaStatusAnalysis()` is called automatically
3. The system fetches all verified documents for the profile
4. Document data is anonymized (only types and dates are used)
5. Genkit analyzes the documents using Gemini 1.5 Flash
6. Results are displayed in the `VisaStatusCard` component

### Data Privacy
The integration is designed with privacy in mind:
- ✅ Document types (e.g., "I-20", "EAD", "Green Card")
- ✅ Validity dates (valid_from, valid_to)
- ✅ Issue dates
- ❌ Names, addresses, or other personal information

### File Structure
```
lib/
├── genkit.ts                 # Genkit configuration and analysis logic
├── genkitConfig.ts          # Genkit initialization
hooks/
├── useVisaStatus.ts         # React hook for visa status analysis
components/
├── VisaStatusCard.tsx       # UI component to display analysis results
app/api/
├── analyzeVisaStatus/       # API endpoint for analysis
components/hooks/utils/
├── documentProcessing.ts    # Updated to trigger analysis after verification
```

## Usage

### Automatic Analysis
Visa status analysis is automatically triggered when:
- A document is successfully verified
- User manually clicks "Analyze" button in VisaStatusCard

### Manual Analysis
Users can manually trigger analysis from:
- Dashboard (auto-analyzes for active profile)
- Profiles page (analyze button for each profile)

### API Endpoint
```typescript
POST /api/analyzeVisaStatus
{
  "userId": "string",
  "profileId": "string"
}
```

Response:
```typescript
{
  "currentStatus": "H-1B Worker",
  "statusDetails": "Based on valid EAD and I-94 documents...",
  "expirationWarnings": ["EAD expires in 45 days"],
  "nextActions": ["File EAD renewal", "Check I-94 status"],
  "confidence": 0.85
}
```

## Components

### VisaStatusCard
Displays visa status analysis with:
- Current immigration status
- Detailed explanation
- Expiration warnings
- Recommended actions
- Confidence score
- Last analysis timestamp

### useVisaStatus Hook
React hook that manages:
- Analysis state (loading, error, results)
- Manual analysis trigger
- Automatic analysis on mount

## Configuration

### Model Settings
The integration uses Gemini 1.5 Flash with:
- Temperature: 0.3 (for consistent analysis)
- Max tokens: 1000
- JSON output format

### Document Hierarchy
The AI model considers this hierarchy when determining status:
1. Green Card (highest priority)
2. EAD (Employment Authorization Document)
3. I-94 (Arrival/Departure Record)
4. Visa stamps
5. Other immigration documents

## Troubleshooting

### Common Issues
1. **API Key Missing**: Ensure `GOOGLE_GENAI_API_KEY` is set in `.env.local`
2. **Analysis Fails**: Check browser console for Genkit errors
3. **No Documents**: Analysis requires at least one verified document

### Error Handling
The system gracefully handles errors:
- Missing API key: Shows configuration error
- API failures: Shows analysis error with retry option
- No documents: Shows "No documents" status

### Development
For development, you can enable Genkit debugging:
```typescript
// In lib/genkit.ts
configureGenkit({
  plugins: [googleAI()],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
```

## Security Notes

- API keys should never be committed to version control
- The system only sends document metadata, not file contents
- All analysis results are stored in Firestore for caching
- Consider rate limiting for production use

## Future Enhancements

- Support for more document types
- Multi-language document analysis
- Integration with USCIS case status APIs
- Automated renewal reminders
- Historical status tracking
