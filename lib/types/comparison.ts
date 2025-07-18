// Comparison types for multi-entity analysis

export interface ComparisonEntity {
  id: string;
  type: 'employer' | 'job_title' | 'location' | 'industry';
  displayName: string;
  metadata?: Record<string, any>;
}

export interface ComparisonMetrics {
  totalApplications: number;
  certifiedApplications: number;
  deniedApplications: number;
  approvalRate: number;
  avgSalary: number;
  medianSalary: number;
  salaryRange: {
    min: number;
    max: number;
    percentile25: number;
    percentile75: number;
  };
  uniqueEmployers: number;
  uniqueJobTitles: number;
  topJobTitle: string;
  topState: string;
}

export interface ComparisonEntityWithMetrics extends ComparisonEntity {
  metrics: ComparisonMetrics;
  rankings?: {
    totalApplications: number;
    approvalRate: number;
    avgSalary: number;
  };
}

export interface TrendData {
  entityId: string;
  metric: string;
  periods: Array<{
    period: string;
    value: number;
    date: Date;
  }>;
  trend: 'increasing' | 'decreasing' | 'stable';
  changeRate: number;
}

export interface CorrelationData {
  entityPair: [string, string];
  metrics: {
    salary: number;
    applications: number;
    approvalRate: number;
  };
  strength: 'strong' | 'moderate' | 'weak';
  significance: number;
}

export interface RankingData {
  entityId: string;
  metric: string;
  rank: number;
  percentile: number;
  value: number;
}

export interface MarketInsight {
  type: 'strength' | 'weakness' | 'opportunity' | 'threat';
  entityId: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
}

export interface MarketAnalysis {
  summary: {
    topPerformer: string;
    worstPerformer: string;
    marketLeader: string;
    fastestGrowing: string;
  };
  insights: MarketInsight[];
  benchmarks: {
    industryAverage: Record<string, any>;
    topQuartile: Record<string, any>;
    median: Record<string, any>;
  };
}

export interface ComparisonResult {
  entities: ComparisonEntityWithMetrics[];
  trends: TrendData[];
  correlations: CorrelationData[];
  rankings: RankingData[];
  marketAnalysis: MarketAnalysis;
  metadata: {
    comparisonId: string;
    timestamp: Date;
    filters: ComparisonFilters;
    config: ComparisonConfig;
  };
}

export interface ComparisonFilters {
  timeframe?: string;
  minSalary?: number;
  maxSalary?: number;
  states?: string[];
  jobTitles?: string[];
  caseStatus?: string[];
}

export interface ComparisonConfig {
  entities: ComparisonEntity[];
  metrics: string[];
  timeframe: string;
  includeCorrelations: boolean;
  includeTrends: boolean;
  includeRankings: boolean;
  includeMarketAnalysis?: boolean;
  filters?: ComparisonFilters;
}