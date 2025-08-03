import { FileText, DollarSign, Building2, TrendingUp, Users, Award, CheckCircle, Clock } from 'lucide-react';

export interface MetricConfig {
  icon: any;
  colorClass: string;
  bgClass: string;
}

export const METRIC_CONFIGS: Record<string, MetricConfig> = {
  // Primary metrics used across all dashboards
  totalApplications: {
    icon: FileText,
    colorClass: 'text-primary',
    bgClass: 'bg-primary/10',
  },
  averageSalary: {
    icon: DollarSign,
    colorClass: 'text-primary',
    bgClass: 'bg-primary/10',
  },
  uniqueEmployers: {
    icon: Building2,
    colorClass: 'text-primary',
    bgClass: 'bg-primary/10',
  },
  approvalRate: {
    icon: TrendingUp,
    colorClass: 'text-primary',
    bgClass: 'bg-primary/10',
  },
  
  // Alternative names for same metrics
  certificationRate: {
    icon: TrendingUp,
    colorClass: 'text-primary',
    bgClass: 'bg-primary/10',
  },
  successRate: {
    icon: TrendingUp,
    colorClass: 'text-primary',
    bgClass: 'bg-primary/10',
  },
  
  // Additional metrics
  salaryRange: {
    icon: DollarSign,
    colorClass: 'text-primary',
    bgClass: 'bg-primary/10',
  },
  fullTimePositions: {
    icon: Clock,
    colorClass: 'text-primary',
    bgClass: 'bg-primary/10',
  },
  certifiedCases: {
    icon: CheckCircle,
    colorClass: 'text-primary',
    bgClass: 'bg-primary/10',
  },
  totalCases: {
    icon: FileText,
    colorClass: 'text-primary',
    bgClass: 'bg-primary/10',
  },
};

// Helper function to get metric config
export const getMetricConfig = (metricType: string): MetricConfig => {
  return METRIC_CONFIGS[metricType] || METRIC_CONFIGS.totalApplications;
};