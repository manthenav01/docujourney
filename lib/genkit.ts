// Direct Google AI integration for visa status analysis

export interface DocumentSummary {
  documentType: string;
  validFrom?: string;
  validTo?: string;
  issueDate?: string;
  expirationDate?: string;
  classOfAdmission?: string;
  countryOfCitizen?: string;
}

export interface VisaStatusRequest {
  documents: DocumentSummary[];
  currentDate: string;
  profileContext?: {
    firstEntryDate?: string;
    firstEntryVisaType?: string;
    currentlyEmployed?: boolean;
  };
}

export interface VisaStatusResponse {
  currentStatus: string; // "In Status" or "Out of Status"
  visaType: string; // e.g., "F-1 Student", "H-1B ", "Green Card Holder"
  statusDetails: string;
  expirationWarnings: string[];
  nextActions: string[];
  confidence: number;
}

/**
 * Analyze visa status based on document types and dates
 */
export async function analyzeVisaStatus(input: VisaStatusRequest): Promise<VisaStatusResponse> {
  const { documents, currentDate, profileContext } = input;

  const profileContextSection = profileContext && (profileContext.firstEntryDate || profileContext.firstEntryVisaType || profileContext.currentlyEmployed !== undefined) ? `

Profile Context:
- First Entry Date: ${profileContext.firstEntryDate || 'Not specified'}
- First Entry Visa Type: ${profileContext.firstEntryVisaType || 'Not specified'}
- Currently Employed: ${profileContext.currentlyEmployed !== undefined ? (profileContext.currentlyEmployed ? 'Yes' : 'No') : 'Not specified'}
` : '';

  const prompt = `
You are a U.S. immigration expert. Based on the provided document types and their validity dates, determine the current visa/immigration status.

Current Date: ${currentDate}
${profileContextSection}
Documents:
${documents.map((doc, index) => `
- Document Type: ${doc.documentType}
- Valid From: ${doc.validFrom || 'Not specified'}
- Valid To: ${doc.validTo || 'Not specified'}
- Issue Date: ${doc.issueDate || 'Not specified'}
- Expiration Date: ${doc.expirationDate || 'Not specified'}
- Class of Admission: ${doc.classOfAdmission || 'Not specified'}
- Country of Citizenship: ${doc.countryOfCitizen || 'Not specified'}
`).join('\n')}

Note: All dates are provided in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ). Compare them against the current date to determine status and expiration warnings.

Please analyze these documents and provide:

1. **Current Status**: Either "In Status" or "Out of Status" based on document validity

2. **Visa Type**: The current visa category (e.g., "F-1 Student", "H-1B Worker", "Green Card Holder", "Pending Adjustment of Status", "B-2 Visitor", "L-1 Intracompany Transfer", etc.)

3. **Status Details**: A brief explanation of the status determination based on the documents

4. **Expiration Warnings**: Array of warnings about documents expiring within 90 days or already expired

5. **Next Actions**: Array of recommended actions based on the status and document dates

6. **Confidence**: A number between 0-1 indicating confidence in the status determination


Important guidelines:
- Determine if person is "In Status" or "Out of Status" based on document validity dates
- Consider document hierarchy (Green Card > EAD > I-94 > Visa stamps, etc.)
- Use the Class of Admission field to determine the specific visa category (e.g., F-1, H-1B, B-2, etc.)
- Consider Country of Citizenship for visa-free travel programs (VWP) or specific country agreements
- If Profile Context is provided, use the first entry information to better understand the immigration history and journey
- A person is "In Status" if they have valid, unexpired immigration documents
- A person is "Out of Status" if their documents are expired or there are gaps in authorization
- Check for gaps between document validity periods
- Flag expired documents
- Recommend renewals for documents expiring within 90 days
- If multiple valid statuses exist, choose the most permissive one
- Consider common immigration scenarios and transitions
- Be conservative in status determination if documents conflict
- For permanent residents with Green Cards, always use "In Status" and "Green Card Holder" as visa type
- Match the visa type to the class of admission when available (e.g., F-1 class = "F-1 Student", H-1B class = "H-1B")

CRITICAL: Return ONLY a valid JSON object with no additional text, markdown, or formatting. Do not wrap the JSON in code blocks or add any explanatory text before or after the JSON.

Return your response as a JSON object with this exact structure:
{
  "currentStatus": "string",
  "visaType": "string",
  "statusDetails": "string", 
  "expirationWarnings": ["string"],
  "nextActions": ["string"],
  "confidence": 0.8
}
`;

  try {
    // Use Google AI API directly
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    console.log(prompt);
    if (!apiKey) {
      throw new Error('Google AI API key not configured');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Google AI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No response generated from Google AI');
    }

    // Clean the response text to extract JSON
    let cleanedText = generatedText.trim();
    
    // Remove markdown code blocks if present
    cleanedText = cleanedText.replace(/```json\s*\n?/g, '').replace(/```\s*$/g, '');
    
    // Remove any leading/trailing text that's not JSON
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Failed to parse text:', cleanedText);
      
      // Return a fallback response if JSON parsing fails
      return {
        currentStatus: 'Analysis Incomplete',
        visaType: 'Unknown',
        statusDetails: 'Unable to parse AI response, but analysis was attempted',
        expirationWarnings: [],
        nextActions: ['Please try again or review documents manually'],
        confidence: 0.1
      };
    }
    return {
      currentStatus: parsedResponse.currentStatus || 'Unknown',
      visaType: parsedResponse.visaType || 'Unknown',
      statusDetails: parsedResponse.statusDetails || 'Unable to determine status',
      expirationWarnings: parsedResponse.expirationWarnings || [],
      nextActions: parsedResponse.nextActions || [],
      confidence: parsedResponse.confidence || 0.5
    };
  } catch (error) {
    console.error('Error analyzing visa status:', error);
    return {
      currentStatus: 'Analysis Error',
      visaType: 'Unknown',
      statusDetails: 'Failed to analyze visa status',
      expirationWarnings: [],
      nextActions: ['Please review documents manually'],
      confidence: 0
    };
  }
}

/**
 * Helper function to prepare document data for Genkit analysis
 */
export function prepareDocumentsForAnalysis(documents: any[]): DocumentSummary[] {
  const convertFirebaseTimestamp = (value: any): string | undefined => {
    if (!value) return undefined;
    
    // Check if it's a Firebase Timestamp
    if (value && typeof value === 'object' && typeof value.toDate === 'function') {
      return value.toDate().toISOString();
    }
    
    // Check if it's already a Date object
    if (value instanceof Date) {
      return value.toISOString();
    }
    
    // Check if it's a string that can be parsed as a date
    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? undefined : date.toISOString();
    }
    
    // Check if it's a number (timestamp)
    if (typeof value === 'number') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? undefined : date.toISOString();
    }
    
    return undefined;
  };

  return documents
    .filter(doc => doc.extracted?.document_type) // Only include documents with extracted data
    .map(doc => ({
      documentType: doc.extracted.document_type,
      validFrom: convertFirebaseTimestamp(doc.extracted.valid_from),
      validTo: convertFirebaseTimestamp(doc.extracted.valid_to),
      issueDate: convertFirebaseTimestamp(doc.extracted.notice_date),
      expirationDate: convertFirebaseTimestamp(doc.extracted.valid_to), // Using valid_to as expiration date
      classOfAdmission: doc.extracted.class_of_admission || undefined,
      countryOfCitizen: doc.extracted.country_of_citizen || undefined
    }));
}
