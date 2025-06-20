export interface TimelineEvent {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'upcoming';
  date: string; // ISO timestamp
  description: string;
  documents: string[]; // Array of document IDs for completed/current events
  documentsRequired: string[]; // Array of document types needed for upcoming events
  checklist: string[]; // Array of action items
  aiInsights: {
    recommendation: string;
    links: string[];
  };
  duration?: string; // Optional duration field
  visaType?: string; // e.g., "H-1B", "F-1", "Green Card"
  priority?: 'low' | 'medium' | 'high';
  eventType?: 'major' | 'deadline' | 'milestone' | 'requirement' | 'suggestion';
  employer?: string; // For work-related events
  additionalInfo?: Record<string, any>; // Flexible field for extra data
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}
