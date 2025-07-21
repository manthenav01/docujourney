export interface ComparisonConfig {
  timeframe?: 'all' | 'last_year' | 'last_2_years' | 'last_5_years';
  includeTimeframeFilter?: boolean;
}

export interface ComparisonRequest {
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

// Additional types needed by the service
export interface ComparisonResult {
  entities: ComparisonEntityWithMetrics[];
  rankings: RankingData[];
  correlations?: CorrelationData[];
  trends?: TrendData[];
  marketAnalysis?: MarketAnalysis;
  summary: {
    totalEntities: number;
    comparisonDate: string;
    methodology: string;
  };
}

export interface ComparisonMetrics {
  [key: string]: number | string;
}

export interface ComparisonEntityWithMetrics extends ComparisonEntity {
  metrics: ComparisonMetrics;
  rank?: number;
}

export interface TrendData {
  entityId: string;
  metric: string;
  data: Array<{
    period: string;
    value: number;
  }>;
}

export interface CorrelationData {
  metric1: string;
  metric2: string;
  correlation: number;
  significance: number;
}

export interface RankingData {
  entityId: string;
  metric: string;
  rank: number;
  value: number;
}

export interface MarketAnalysis {
  insights: string[];
  recommendations: string[];
  marketTrends: string[];
}