import { adminDb } from './firebaseAdmin';
import { TimelineEvent } from './types/timeline.model';
import { DocumentMetaDataTransformedModel } from './types/document.model';
import { Profile } from './types/profile.model';
import { analyzeVisaStatus, VisaStatusRequest, DocumentSummary } from './genkit';

export interface TimelineGenerationRequest {
  userId: string;
  profileId?: string;
  profile: Profile;
  documents: DocumentMetaDataTransformedModel[];
  forceRegenerate?: boolean;
}

export interface TimelineGenerationResponse {
  events: TimelineEvent[];
  generatedAt: string;
  confidence: number;
  documentCount: number;
}

/**
 * Generate timeline events using LLM based on user's documents and profile
 */
export async function generateTimelineWithLLM(
  request: TimelineGenerationRequest
): Promise<TimelineGenerationResponse> {
  const { userId, profileId, profile, documents, forceRegenerate = false } = request;
  
  if (!profileId) {
    throw new Error('profileId is required for timeline generation');
  }
  
  console.log(`=== TIMELINE GENERATION START ===`);
  console.log(`User: ${userId}, Profile: ${profile.firstName} ${profile.lastName} (${profileId})`);
  console.log(`Documents: ${documents.length}, Force Regenerate: ${forceRegenerate}`);

  // Filter documents to only include those belonging to this profile
  const profileDocuments = documents.filter(doc => doc.id !== undefined);
  console.log(`Filtered to ${profileDocuments.length} documents for profile ${profileId}`);

  // Check if we should regenerate or use existing timeline
  if (!forceRegenerate) {
    const existingEvents = await fetchTimelineEvents(userId, profileId);
    if (existingEvents.length > 0) {
      console.log(`Using existing ${existingEvents.length} timeline events`);
      return {
        events: existingEvents,
        generatedAt: existingEvents[0]?.createdAt || new Date().toISOString(),
        confidence: 0.9,
        documentCount: profileDocuments.length
      };
    }
  }

  // Prepare document summaries for LLM (only for this profile)
  const documentSummaries: DocumentSummary[] = profileDocuments
    .filter(doc => doc.extracted?.document_type)
    .map(doc => ({
      documentType: doc.extracted!.document_type,
      validFrom: doc.extracted?.valid_from,
      validTo: doc.extracted?.valid_to,
      issueDate: doc.extracted?.notice_date || doc.createdAt,
      classOfAdmission: doc.extracted?.class_of_admission,
      countryOfCitizen: doc.extracted?.country_of_citizen || doc.extracted?.country_of_origin,
    countryOfBirth: doc.extracted?.country_of_birth,
    }));

  // Prepare profile context
  const profileContext = {
    firstEntryDate: profile.firstEntryDate,
    firstEntryVisaType: profile.firstEntryVisaType,
    currentlyEmployed: profile.currentlyEmployed
  };

  // Generate timeline using LLM
  const llmPrompt = await buildTimelineGenerationPrompt(
    documentSummaries,
    profileContext,
    profile
  );

  try {
    // Use the existing genkit service to call LLM
    const timelineResponse = await callLLMForTimeline(llmPrompt);
    
    // Parse and validate the LLM response
    const generatedEvents = parseTimelineEvents(timelineResponse, userId);
    
    // Save events to Firebase
    await saveTimelineEvents(userId, profileId, generatedEvents);
    
    console.log(`Generated and saved ${generatedEvents.length} timeline events`);
    
    return {
      events: generatedEvents,
      generatedAt: new Date().toISOString(),
      confidence: 0.85,

      documentCount: profileDocuments.length
    };
  } catch (error) {
    console.error('Error generating timeline with LLM:', error);
    
    // Fallback to rule-based generation
    console.log('Falling back to rule-based timeline generation');
    const fallbackEvents = generateFallbackTimeline(profileDocuments, profile, userId);
    await saveTimelineEvents(userId, profileId, fallbackEvents);
    
    return {
      events: fallbackEvents,
      generatedAt: new Date().toISOString(),
      confidence: 0.6,
      
      documentCount: profileDocuments.length
    };
  }
}

/**
 * Build the LLM prompt for timeline generation
 */
async function buildTimelineGenerationPrompt(
  documents: DocumentSummary[],
  profileContext: any,
  profile: Profile
): Promise<string> {
  const currentDate = new Date().toISOString();
  
  const profileSection = profileContext && 
    (profileContext.firstEntryDate || profileContext.firstEntryVisaType || profileContext.currentlyEmployed !== undefined) ? `
Profile Information:
- Name: ${profile.firstName} ${profile.lastName}
- First Entry Date: ${profileContext.firstEntryDate || 'Not specified'}
- First Entry Visa Type: ${profileContext.firstEntryVisaType || 'Not specified'}
- Currently Employed: ${profileContext.currentlyEmployed !== undefined ? (profileContext.currentlyEmployed ? 'Yes' : 'No') : 'Not specified'}
` : '';

  return `
You are a U.S. immigration expert tasked with creating a comprehensive immigration timeline for a person based on their documents and profile information.

Current Date: ${currentDate}
${profileSection}

Documents Available:
${documents.map((doc, index) => `
${index + 1}. Document Type: ${doc.documentType}
   - Valid From: ${doc.validFrom || 'Not specified'}
   - Valid To: ${doc.validTo || 'Not specified'}
   - Issue Date: ${doc.issueDate || 'Not specified'}
   - Expiration Date: ${doc.expirationDate || 'Not specified'}
   - Class of Admission: ${doc.classOfAdmission || 'Not specified'}
   - Country of Citizenship: ${doc.countryOfCitizen || 'Not specified'}
    - Country of Birth: ${doc.countryOfBirth || 'Not specified'}
`).join('')}

Please create a comprehensive immigration timeline with the following requirements:

1. **Event Types**: Generate events for major milestones, deadlines, requirements, and suggestions

2. **Document Validity Periods**: 
   - For expired documents (passports, visas, permits), create SINGLE events showing the validity period
   - Use title format: "{Document Type} Validity Period"
   - Set status to "expired" for documents no longer valid
   - Set eventType to "validity_period" for these events
   - Include documentType field with the document type
   - Do NOT create separate "valid from" and "valid to" events

3. **Status Assignment**: Assign each event one of these statuses based on the date:
   - "completed": Events that happened more than 7 days ago
   - "current": Events happening within the next 30 days or within 7 days of today
   - "upcoming": Events more than 30 days in the future
   - "expired": Documents or statuses that are no longer valid

4. **Event Categories**:
   - **Major Milestones**: First entry, petition filings, approvals, status changes
   - **Deadlines**: Document expirations, renewal deadlines, grace periods
   - **Requirements**: Document submissions, medical exams, interviews
   - **Suggestions**: Recommended next steps, optimization opportunities
   - **Validity Periods**: Document validity periods (for expired/historical documents)

5. **AI Insights**: For each event, provide:
   - Specific recommendations for action
   - Helpful links or resources
   - Checklist items for preparation

6. **Required vs. Available Documents**: 
   - For completed/current events: List actual documents that support this event
   - For upcoming events: List document types that will be required

7. **Smart Predictions**: Based on the immigration pattern, predict likely next steps and timeline

Return your response as a JSON array of timeline events with this exact structure:
[
  {
    "id": "unique-event-id",
    "title": "Event Title",
    "status": "completed|current|upcoming|expired",
    "date": "ISO timestamp",
    "description": "Detailed description of the event",
    "documents": ["doc-id-1", "doc-id-2"], // For completed/current events
    "documentsRequired": ["document-type-1", "document-type-2"], // For upcoming events
    "checklist": ["action-item-1", "action-item-2"],
    "aiInsights": {
      "recommendation": "Specific recommendation",
      "links": ["https://helpful-link-1.com", "https://helpful-link-2.com"]
    },
    "duration": "Optional duration string",
    "visaType": "H-1B|F-1|Green Card|etc",
    "priority": "low|medium|high",
    "eventType": "major|deadline|milestone|requirement|suggestion|validity_period",
    "employer": "Employer name if applicable",
    "documentType": "passport|visa|i94|etc (for document-related events)"
  }
]

CRITICAL INSTRUCTIONS:
- Return ONLY a valid JSON array with no additional text, markdown, or formatting
- Do NOT wrap the JSON in code blocks (\`\`\`json or \`\`\`)  
- Do NOT add any explanatory text before or after the JSON
- Do NOT use markdown formatting of any kind
- Start your response directly with [ and end with ]
- Your entire response should be parseable as JSON

Example of correct format:
[{"id":"event-1","title":"Entry to US",...}]

WRONG - Do not do this:
\`\`\`json
[{"id":"event-1",...}]
\`\`\`

WRONG - Do not do this:
Here is the timeline:
[{"id":"event-1",...}]
`;
}

/**
 * Call LLM service for timeline generation
 */
async function callLLMForTimeline(prompt: string): Promise<string> {
  const { ai } = await import('./genkitConfig');
  
  console.log('Calling LLM for timeline generation...', prompt);
  
  const response = await ai.generate({
    model: 'googleai/gemini-1.5-flash',
    prompt: prompt,
    config: {
      temperature: 0.1,
      maxOutputTokens: 2000
    }
  });

  console.log('LLM response received, length:', response.text.length);
  console.log('LLM response preview:', response.text.substring(0, 200) + '...');

  return response.text;
}

/**
 * Parse and validate LLM response into TimelineEvent objects
 */
function parseTimelineEvents(llmResponse: string, userId: string): TimelineEvent[] {
  try {
    console.log('Raw LLM response for parsing (first 500 chars):', llmResponse.substring(0, 500));
    
    // Clean the response by removing markdown code blocks if present
    let cleanedResponse = llmResponse.trim();
    
    // Remove multiple types of markdown code block markers
    if (cleanedResponse.includes('```json')) {
      // Remove ```json at start and ``` at end
      cleanedResponse = cleanedResponse.replace(/^[\s\S]*?```json\s*/, '').replace(/\s*```[\s\S]*?$/, '');
    } else if (cleanedResponse.includes('```')) {
      // Remove generic ``` blocks
      cleanedResponse = cleanedResponse.replace(/^[\s\S]*?```\s*/, '').replace(/\s*```[\s\S]*?$/, '');
    }
    
    // Remove any explanatory text before the JSON array
    const jsonStart = cleanedResponse.indexOf('[');
    const jsonEnd = cleanedResponse.lastIndexOf(']');
    
    if (jsonStart === -1) {
      throw new Error('No JSON array found in LLM response - missing opening bracket [');
    }
    
    if (jsonEnd === -1) {
      throw new Error('No JSON array found in LLM response - missing closing bracket ]');
    }
    
    if (jsonEnd <= jsonStart) {
      throw new Error('Invalid JSON array structure in LLM response');
    }
    
    // Extract just the JSON array
    cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
    
    // Remove any leading/trailing whitespace
    cleanedResponse = cleanedResponse.trim();
    
    console.log('Cleaned LLM response for parsing (first 500 chars):', cleanedResponse.substring(0, 500));
    
    const parsedEvents = JSON.parse(cleanedResponse);
    
    if (!Array.isArray(parsedEvents)) {
      throw new Error(`LLM response is not an array, got: ${typeof parsedEvents}`);
    }

    if (parsedEvents.length === 0) {
      console.warn('LLM returned empty timeline array');
      return [];
    }

    const now = new Date().toISOString();
    
    // Helper function to safely parse and validate dates
    const safeParseDate = (dateValue: any, fallback: string = now): string => {
      if (!dateValue) {
        return fallback;
      }
      
      // If already a valid ISO string, return it
      if (typeof dateValue === 'string') {
        const parsedDate = new Date(dateValue);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toISOString();
        }
      }
      
      // Try to parse various date formats
      try {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      } catch (error) {
        console.warn(`Failed to parse date: ${dateValue}, using fallback: ${fallback}`);
      }
      
      return fallback;
    };
    
    const validatedEvents = parsedEvents.map((event: any, index: number) => {
      // Validate required fields
      if (!event.title) {
        console.warn(`Event ${index} missing title, using default`);
      }
      if (!event.date) {
        console.warn(`Event ${index} missing date, using current time`);
      }
      
      // Base event object with required fields
      const baseEvent: any = {
        id: event.id || `generated-event-${Date.now()}-${index}`,
        title: event.title || `Immigration Event ${index + 1}`,
        status: ['completed', 'current', 'upcoming', 'expired'].includes(event.status) ? event.status : 'upcoming',
        date: safeParseDate(event.date, now),
        description: event.description || '',
        documents: Array.isArray(event.documents) ? event.documents : [],
        documentsRequired: Array.isArray(event.documentsRequired) ? event.documentsRequired : [],
        checklist: Array.isArray(event.checklist) ? event.checklist : [],
        aiInsights: {
          recommendation: event.aiInsights?.recommendation || '',
          links: Array.isArray(event.aiInsights?.links) ? event.aiInsights.links : []
        },
        priority: ['low', 'medium', 'high'].includes(event.priority) ? event.priority : 'medium',
        eventType: ['major', 'deadline', 'milestone', 'requirement', 'suggestion', 'validity_period'].includes(event.eventType) ? event.eventType : 'milestone',
        additionalInfo: typeof event.additionalInfo === 'object' ? event.additionalInfo : {},
        createdAt: now,
        updatedAt: now
      };
      
      // Only add optional fields if they have actual values (not undefined/null/empty)
      if (event.duration && event.duration.trim()) {
        baseEvent.duration = event.duration;
      }
      
      if (event.visaType && event.visaType.trim()) {
        baseEvent.visaType = event.visaType;
      }
      
      if (event.employer && event.employer.trim()) {
        baseEvent.employer = event.employer;
      }
      
      if (event.documentType && event.documentType.trim()) {
        baseEvent.documentType = event.documentType;
      }
      
      // Handle date ranges for validity periods
      if (event.dateRange && event.dateRange.from && event.dateRange.to) {
        baseEvent.dateRange = {
          from: safeParseDate(event.dateRange.from, now),
          to: safeParseDate(event.dateRange.to, now)
        };
      }
      
      return baseEvent;
    });

    // Post-process to combine expired document validity events
    const combinedEvents = combineExpiredDocumentEvents(validatedEvents);
    
    // Analyze document status to determine which expired documents should be highlighted
    const processedEvents = analyzeDocumentStatus(combinedEvents);

    console.log(`Successfully parsed ${processedEvents.length} timeline events`);
    return processedEvents;
    
  } catch (error) {
    console.error('Failed to parse LLM timeline response:', error);
    console.error('Raw LLM response:', llmResponse);
    throw new Error(`Invalid LLM response format: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate fallback timeline using rule-based approach
 */
function generateFallbackTimeline(
  documents: DocumentMetaDataTransformedModel[],
  profile: Profile,
  userId: string
): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const now = new Date().toISOString();
  
  // Basic timeline based on documents
  documents.forEach((doc, index) => {
    if (doc.extracted?.document_type) {
      events.push({
        id: `fallback-${doc.id}`,
        title: `${doc.extracted.document_type} Document`,
        status: 'completed',
        date: doc.extracted.notice_date || doc.createdAt,
        description: `${doc.extracted.document_type} document was processed`,
        documents: [doc.id],
        documentsRequired: [],
        checklist: [],
        aiInsights: {
          recommendation: 'Review document details for accuracy',
          links: []
        },
        visaType: extractVisaTypeFromDocument(doc.extracted.document_type),
        priority: 'medium',
        eventType: 'milestone',
        createdAt: now,
        updatedAt: now
      });
    }
  });

  return events;
}

/**
 * Extract visa type from document type
 */
function extractVisaTypeFromDocument(documentType: string): string {
  const type = documentType.toLowerCase();
  if (type.includes('h-1b') || type.includes('h1b')) return 'H-1B';
  if (type.includes('f-1') || type.includes('f1')) return 'F-1';
  if (type.includes('green card') || type.includes('i-551')) return 'Green Card';
  if (type.includes('ead') || type.includes('i-765')) return 'EAD';
  if (type.includes('l-1') || type.includes('l1')) return 'L-1';
  if (type.includes('o-1') || type.includes('o1')) return 'O-1';
  return 'Other';
}

/**
 * Remove undefined values from an object (Firestore doesn't allow undefined)
 */
function removeUndefinedValues(obj: any): any {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        cleaned[key] = removeUndefinedValues(value);
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

/**
 * Import existing timeline API functions
 */
async function saveTimelineEvents(userId: string, profileId: string, events: TimelineEvent[]): Promise<void> {
  const batch = adminDb.batch();
  
  console.log(`Preparing to save ${events.length} timeline events for user ${userId}, profile ${profileId}`);
  
  for (const event of events) {
    const eventRef = adminDb.collection(`users/${userId}/profiles/${profileId}/timeline`).doc(event.id);
    
    // Safe date conversion function
    const safeDate = (dateValue: string | Date): Date => {
      if (dateValue instanceof Date) {
        return dateValue;
      }
      
      if (typeof dateValue === 'string') {
        const parsedDate = new Date(dateValue);
        if (isNaN(parsedDate.getTime())) {
          console.warn(`Invalid date string: ${dateValue}, using current time`);
          return new Date();
        }
        return parsedDate;
      }
      
      console.warn(`Invalid date value: ${dateValue}, using current time`);
      return new Date();
    };
    
    // Clean the event object to remove any undefined values and safely convert dates
    const cleanedEvent = removeUndefinedValues({
      ...event,
      createdAt: safeDate(event.createdAt),
      updatedAt: safeDate(event.updatedAt),
      date: safeDate(event.date)
    });
    
    console.log(`Saving event ${event.id}: ${event.title} with date ${event.date}`);
    batch.set(eventRef, cleanedEvent);
  }
  
  await batch.commit();
  console.log(`Saved ${events.length} timeline events for user ${userId}, profile ${profileId}`);
}

async function fetchTimelineEvents(userId: string, profileId: string): Promise<TimelineEvent[]> {
  const snapshot = await adminDb
    .collection(`users/${userId}/profiles/${profileId}/timeline`)
    .orderBy('date', 'asc')
    .get();
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      date: data.date?.toDate?.()?.toISOString() || data.date,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
    } as TimelineEvent;
  });
}

/**
 * Helper function to extract document type from event title
 */
function extractDocumentTypeFromTitle(title: string): string {
  // Extract document type from titles like "Passport valid from", "Visa valid to", etc.
  const patterns = [
    /^([^:]+?)(?:\s+(?:valid|validity|expires?|issued))/i,
    /^([^:]+?)(?:\s+(?:from|to|until|on))/i,
    /^([A-Za-z\s]+?)(?:\s+[-–—])/i
  ];
  
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  // Fallback: take first few words
  const words = title.split(' ');
  return words.slice(0, Math.min(2, words.length)).join(' ');
}

/**
 * Helper function to format date as MM/YYYY
 */
function formatDateForRange(dateString: string): string {
  try {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${year}`;
  } catch (error) {
    return dateString;
  }
}

/**
 * Combine separate "valid from" and "valid to" events into single validity period events
 */
function combineExpiredDocumentEvents(events: TimelineEvent[]): TimelineEvent[] {
  const processedEvents: TimelineEvent[] = [];
  const expiredDocGroups: Map<string, { 
    validFrom: TimelineEvent | null, 
    validTo: TimelineEvent | null,
    others: TimelineEvent[]
  }> = new Map();
  
  for (const event of events) {
    // Check if this is an expired document validity event
    const isExpiredValidityEvent = (
      (event.status === 'expired' || event.status === 'completed') &&
      (event.title.toLowerCase().includes('valid from') || 
       event.title.toLowerCase().includes('valid to') ||
       event.title.toLowerCase().includes('validity period') ||
       event.title.toLowerCase().includes('expires') ||
       event.title.toLowerCase().includes('issued'))
    );
    
    if (isExpiredValidityEvent) {
      // Extract document type from title
      const docType = extractDocumentTypeFromTitle(event.title);
      const groupKey = `${docType.toLowerCase().replace(/\s+/g, '_')}_validity`;
      
      if (!expiredDocGroups.has(groupKey)) {
        expiredDocGroups.set(groupKey, { validFrom: null, validTo: null, others: [] });
      }
      
      const group = expiredDocGroups.get(groupKey)!;
      
      // Determine if this is a "from" or "to" event based on title or date comparison
      if (event.title.toLowerCase().includes('valid from') || 
          event.title.toLowerCase().includes('issued') ||
          (!group.validFrom || event.date < group.validFrom.date)) {
        group.validFrom = event;
      } else if (event.title.toLowerCase().includes('valid to') || 
                 event.title.toLowerCase().includes('expires') ||
                 (!group.validTo || event.date > group.validTo.date)) {
        group.validTo = event;
      } else {
        group.others.push(event);
      }
    } else {
      processedEvents.push(event);
    }
  }
  
  // Combine expired document validity events
  Array.from(expiredDocGroups.entries()).forEach(([groupKey, group]) => {
    const { validFrom, validTo, others } = group;
    const docType = groupKey.replace('_validity', '').replace(/_/g, ' ');
    
    if (validFrom && validTo) {
      // Create combined event with date range
      const fromFormatted = formatDateForRange(validFrom.date);
      const toFormatted = formatDateForRange(validTo.date);
      
      const combinedEvent: TimelineEvent = {
        id: `${validFrom.id}_combined`,
        title: `${docType.charAt(0).toUpperCase() + docType.slice(1)} Validity Period`,
        description: `${docType.charAt(0).toUpperCase() + docType.slice(1)} was valid from ${fromFormatted} to ${toFormatted}`,
        date: validFrom.date, // Use the earlier date for sorting
        dateRange: {
          from: validFrom.date,
          to: validTo.date
        },
        status: 'expired' as const,
        documents: [...(validFrom.documents || []), ...(validTo.documents || [])],
        documentsRequired: [],
        checklist: [],
        aiInsights: {
          recommendation: validFrom.aiInsights?.recommendation || validTo.aiInsights?.recommendation || '',
          links: [
            ...(validFrom.aiInsights?.links || []), 
            ...(validTo.aiInsights?.links || [])
          ].filter((link, index, arr) => arr.indexOf(link) === index)
        },
        eventType: 'validity_period' as const,
        documentType: validFrom.documentType || docType.toLowerCase(),
        priority: validFrom.priority || validTo.priority || 'medium',
        additionalInfo: {
          ...(validFrom.additionalInfo || {}),
          ...(validTo.additionalInfo || {}),
          // Preserve historical expired flag if either event has it
          isHistoricalExpired: validFrom.additionalInfo?.isHistoricalExpired || validTo.additionalInfo?.isHistoricalExpired
        },
        createdAt: validFrom.createdAt,
        updatedAt: new Date().toISOString()
      };
      
      // Merge additional fields
      if (validFrom.visaType || validTo.visaType) {
        combinedEvent.visaType = validFrom.visaType || validTo.visaType;
      }
      if (validFrom.employer || validTo.employer) {
        combinedEvent.employer = validFrom.employer || validTo.employer;
      }
      
      processedEvents.push(combinedEvent);
    } else if (validFrom || validTo) {
      // Single validity event - enhance its title and description
      const singleEvent = validFrom || validTo!;
      const enhancedEvent: TimelineEvent = {
        ...singleEvent,
        title: `${docType.charAt(0).toUpperCase() + docType.slice(1)} Validity Period`,
        description: singleEvent.description || `${docType.charAt(0).toUpperCase() + docType.slice(1)} validity information`,
        eventType: 'validity_period' as const,
        documentType: singleEvent.documentType || docType.toLowerCase()
      };
      processedEvents.push(enhancedEvent);
    }
    
    // Add any other events in this group
    others.forEach((event: TimelineEvent) => processedEvents.push(event));
  });
  
  return processedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Analyze document timeline to determine if expired documents should be highlighted as problematic
 */
function analyzeDocumentStatus(events: TimelineEvent[]): TimelineEvent[] {
  // Group events by document type
  const documentGroups = new Map<string, TimelineEvent[]>();
  
  events.forEach(event => {
    if (event.documentType || event.eventType === 'validity_period') {
      const docType = event.documentType || extractDocumentTypeFromTitle(event.title);
      const normalizedType = normalizeDocumentType(docType);
      
      if (!documentGroups.has(normalizedType)) {
        documentGroups.set(normalizedType, []);
      }
      documentGroups.get(normalizedType)!.push(event);
    }
  });
  
  // Analyze each document group to determine status
  const updatedEvents = events.map(event => {
    if (event.status !== 'expired' || (!event.documentType && event.eventType !== 'validity_period')) {
      return event;
    }
    
    const docType = event.documentType || extractDocumentTypeFromTitle(event.title);
    const normalizedType = normalizeDocumentType(docType);
    const documentEvents = documentGroups.get(normalizedType) || [];
    
    // Sort events by date to find the most recent ones
    const sortedEvents = documentEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // For validity period events, use the end date (to date) for comparison
    const eventDate = event.dateRange ? new Date(event.dateRange.to) : new Date(event.date);
    
    // Check if there are any valid/current documents after this expired one
    const hasNewerValidDocuments = sortedEvents.some(e => {
      const eDate = e.dateRange ? new Date(e.dateRange.from) : new Date(e.date);
      return eDate > eventDate && (
        e.status === 'completed' || 
        e.status === 'current' || 
        e.status === 'upcoming' ||
        (e.status === 'expired' && e.dateRange && new Date(e.dateRange.to) > new Date())
      );
    });
    
    // If there are newer valid documents, mark this as historical (not problematic)
    if (hasNewerValidDocuments) {
      return {
        ...event,
        additionalInfo: {
          ...event.additionalInfo,
          isHistoricalExpired: true
        }
      };
    }
    
    return event;
  });
  
  return updatedEvents;
}

/**
 * Normalize document type for consistent grouping
 */
function normalizeDocumentType(docType: string): string {
  const normalized = docType.toLowerCase().trim();
  
  // Group similar document types together
  if (normalized.includes('passport')) return 'passport';
  if (normalized.includes('visa')) return 'visa';
  if (normalized.includes('i-94') || normalized.includes('i94')) return 'i94';
  if (normalized.includes('green card') || normalized.includes('permanent resident')) return 'green_card';
  if (normalized.includes('ead') || normalized.includes('employment authorization')) return 'ead';
  if (normalized.includes('h1b') || normalized.includes('h-1b')) return 'h1b';
  if (normalized.includes('f1') || normalized.includes('f-1')) return 'f1';
  if (normalized.includes('opt')) return 'opt';
  if (normalized.includes('cpt')) return 'cpt';
  
  // Default: use the normalized string with spaces replaced by underscores
  return normalized.replace(/\s+/g, '_');
}
