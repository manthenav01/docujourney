export interface ComparisonConfig {
  projectId: string;
  keyFilename: string;
  entities?: ComparisonEntity[];
  metrics?: string[];
  timeframe?: string;
  includeCorrelations?: boolean;
  includeTrends?: boolean;
  includeMarketAnalysis?: boolean;
}

export interface ComparisonEntity {
  id: string;
  name: string;
  type: 'employer' | 'job' | 'location';
  data: Record<string, any>;
}

export interface ComparisonFilters {
  entityType?: 'employer' | 'job' | 'location';
  year?: number;
  location?: string;
  salaryRange?: {
    min: number;
    max: number;
  };
}