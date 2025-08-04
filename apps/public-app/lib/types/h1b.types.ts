/**
 * H1B Data Type Definitions
 * Centralized interfaces for H1B BigQuery service and dashboard components
 */

export interface H1BQueryFilters {
  fiscalYears?: string[];
  states?: string[];
  salaryRange?: [number, number];
  jobCategories?: string[];
  skillLevels?: string[];
  companySizes?: string[];
  searchQuery?: string;
}

export interface H1BEmployer {
  employer: string;
  applications: number;
  avgSalary: number;
  minSalary: number;
  maxSalary: number;
  topState: string;
  yoyGrowthRate: number;
}

export interface H1BAttorney {
  attorneyName: string;
  lawFirm: string;
  totalApplications: number;
  certifiedApplications: number;
  certificationRate: number;
  avgSalary: number;
  topStates: string[];
  topJobCategories: string[];
  city: string;
  state: string;
}

export interface H1BLawFirm {
  lawFirm: string;
  totalApplications: number;
  certifiedApplications: number;
  certificationRate: number;
  avgSalary: number;
  attorneyCount: number;
  topStates: string[];
  topJobCategories: string[];
  city: string;
  state: string;
}

export interface H1BSalaryDistribution {
  range: string;
  count: number;
  minSalary: number;
  maxSalary: number;
}

export interface H1BYearlyTrend {
  fiscalYear: string;
  applications: number;
  avgSalary: number;
  medianSalary: number;
}

export interface H1BStateDistribution {
  state: string;
  applications: number;
  avgSalary: number;
  highestSalary: number;
}

export interface H1BJobTitleDistribution {
  jobTitle: string;
  applications: number;
  avgSalary: number;
  percentage: number;
  yoyGrowth?: number | null;
  yoyGrowthPercentage?: number | null;
}

export interface H1BIndustryDistribution {
  industry: string;
  applications: number;
  avgSalary: number;
  percentage: number;
}

export interface H1BMostAppliedJob {
  title: string;
  applications: number;
}

export interface H1BAggregatedData {
  totalApplications: number;
  certifiedApplications: number;
  deniedApplications: number;
  withdrawnApplications: number;
  certificationRate: number;
  avgSalary: number;
  medianSalary: number;
  uniqueEmployers: number;
  uniqueStates: number;
  uniqueAttorneys: number;
  uniqueLawFirms: number;
  uniqueJobTitles: number;
  mostAppliedJob: H1BMostAppliedJob;
  topEmployers: H1BEmployer[];
  topAttorneys: H1BAttorney[];
  salaryDistribution: H1BSalaryDistribution[];
  yearlyTrends: H1BYearlyTrend[];
  stateDistribution: H1BStateDistribution[];
  jobTitleDistribution: H1BJobTitleDistribution[];
  industryDistribution: H1BIndustryDistribution[];
}

// Company-specific analysis types
export interface H1BCompanyTopState {
  state: string;
  applications: number;
  percentage: number;
}

export interface H1BCompanyTopJobTitle {
  jobTitle: string;
  applications: number;
  avgSalary: number;
  medianSalary: number;
  yoyGrowth?: number | null;
  yoyGrowthPercentage?: number | null;
}

export interface H1BCompanyYearlyTrend {
  fiscalYear: string;
  applications: number;
  avgSalary: number;
  certificationRate: number;
}

export interface H1BCompanySalaryDistribution {
  range: string;
  count: number;
}

export interface H1BCompanyRecentActivity {
  month: string;
  applications: number;
}

export interface H1BCompanyAnalysis {
  name: string;
  totalApplications: number;
  certifiedApplications: number;
  avgSalary: number;
  medianSalary: number;
  minSalary: number;
  maxSalary: number;
  topStates: H1BCompanyTopState[];
  topJobTitles: H1BCompanyTopJobTitle[];
  yearlyTrends: H1BCompanyYearlyTrend[];
  salaryDistribution: H1BCompanySalaryDistribution[];
  recentActivity: H1BCompanyRecentActivity[];
}

// Job-specific analysis types
export interface H1BJobTopEmployer {
  employer: string;
  applications: number;
  avgSalary: number;
  medianSalary: number;
  yoyGrowth?: number | null;
  yoyGrowthPercentage?: number | null;
}

export interface H1BJobTopState {
  state: string;
  applications: number;
  percentage: number;
  avgSalary: number;
}

export interface H1BJobYearlyTrend {
  fiscalYear: string;
  applications: number;
  avgSalary: number;
  certificationRate: number;
}

export interface H1BJobSalaryDistribution {
  range: string;
  count: number;
}

export interface H1BJobWageLevel {
  level: string;
  applications: number;
  avgActualWage: number;
  avgPrevailingWage: number;
  abovePrevailingCount: number;
  avgWagePremium: number;
}

export interface H1BJobAnalysis {
  title: string;
  totalApplications: number;
  certifiedApplications: number;
  avgSalary: number;
  medianSalary: number;
  minSalary: number;
  maxSalary: number;
  fullTimePositions: number;
  partTimePositions: number;
  uniqueEmployers: number;
  topEmployers: H1BJobTopEmployer[];
  topStates: H1BJobTopState[];
  yearlyTrends: H1BJobYearlyTrend[];
  salaryDistribution: H1BJobSalaryDistribution[];
  wageLevelAnalysis: H1BJobWageLevel[];
}

// City-specific analysis types
export interface H1BCityTopEmployer {
  employer: string;
  applications: number;
  percentage: number;
  avgSalary: number;
  medianSalary: number;
}

export interface H1BCityTopJobTitle {
  jobTitle: string;
  applications: number;
  avgSalary: number;
  medianSalary: number;
  yoyGrowth?: number | null;
  yoyGrowthPercentage?: number | null;
}

export interface H1BCityYearlyTrend {
  fiscalYear: string;
  applications: number;
  avgSalary: number;
  certificationRate: number;
}

export interface H1BCitySalaryDistribution {
  range: string;
  count: number;
}

export interface H1BCityRecentActivity {
  month: string;
  applications: number;
}

export interface H1BCityAnalysis {
  city: string;
  state: string;
  totalApplications: number;
  certifiedApplications: number;
  avgSalary: number;
  medianSalary: number;
  minSalary: number;
  maxSalary: number;
  topEmployers: H1BCityTopEmployer[];
  topJobTitles: H1BCityTopJobTitle[];
  yearlyTrends: H1BCityYearlyTrend[];
  salaryDistribution: H1BCitySalaryDistribution[];
  recentActivity: H1BCityRecentActivity[];
}

// Attorney-specific analysis types
export interface H1BAttorneyTopEmployer {
  employer: string;
  applications: number;
  percentage: number;
  avgSalary: number;
  certificationRate: number;
}

export interface H1BAttorneyTopState {
  state: string;
  applications: number;
  percentage: number;
  avgSalary: number;
}

export interface H1BAttorneyTopJobCategory {
  jobCategory: string;
  applications: number;
  percentage: number;
  avgSalary: number;
  certificationRate: number;
  yoyGrowth?: number | null;
  yoyGrowthPercentage?: number | null;
}

export interface H1BAttorneyYearlyTrend {
  fiscalYear: string;
  applications: number;
  certifiedApplications: number;
  certificationRate: number;
  avgSalary: number;
}

export interface H1BAttorneySalaryDistribution {
  range: string;
  count: number;
}

export interface H1BAttorneyRecentActivity {
  month: string;
  applications: number;
  certificationRate: number;
}

export interface H1BAttorneyAnalysis {
  attorneyName: string;
  lawFirm: string;
  city: string;
  state: string;
  totalApplications: number;
  certifiedApplications: number;
  deniedApplications: number;
  withdrawnApplications: number;
  certificationRate: number;
  avgSalary: number;
  medianSalary: number;
  minSalary: number;
  maxSalary: number;
  topEmployers: H1BAttorneyTopEmployer[];
  topStates: H1BAttorneyTopState[];
  topJobCategories: H1BAttorneyTopJobCategory[];
  yearlyTrends: H1BAttorneyYearlyTrend[];
  salaryDistribution: H1BAttorneySalaryDistribution[];
  recentActivity: H1BAttorneyRecentActivity[];
}

// Filter options types
export interface H1BFilterOptions {
  fiscalYears: string[];
  states: string[];
  jobTitles: string[];
  employers: string[];
  salaryRanges: {
    min: number;
    max: number;
  };
}

// Search suggestion types
export interface H1BSearchSuggestion {
  suggestion: string;
  type: 'employer' | 'job' | 'state' | 'city';
  count: number;
}

// Error handling types
export interface H1BServiceError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface H1BApiResponse<T> {
  data?: T;
  error?: H1BServiceError;
  metadata?: {
    queryTime: number;
    cacheHit?: boolean;
    source: string;
  };
}

// Input validation types
export interface ValidatedAttorneyInput {
  attorneyName: string;
  lawFirm?: string;
}

export interface ValidatedCompanyInput {
  companyName: string;
}

export interface ValidatedJobInput {
  jobTitle: string;
}

export interface ValidatedCityInput {
  cityName: string;
  stateName: string;
}

// BigQuery row types for better type safety
export interface BigQueryAttorneyRow {
  attorney_name: string;
  law_firm: string | null;
  city: string | null;
  state: string | null;
  total_applications: number;
  certified_applications: number;
  denied_applications: number;
  withdrawn_applications: number;
  certification_rate: number;
  avg_salary: number;
  median_salary: number;
  min_salary: number;
  max_salary: number;
}

export interface BigQueryEmployerRow {
  employer: string;
  applications: number;
  percentage: number;
  avg_salary: number;
  certification_rate: number;
}

export interface BigQueryStateRow {
  state: string;
  applications: number;
  percentage: number;
  avg_salary: number;
}

export interface BigQueryJobCategoryRow {
  job_category: string;
  applications: number;
  percentage: number;
  avg_salary: number;
  certification_rate: number;
}

export interface BigQueryYearlyTrendRow {
  fiscal_year: string;
  applications: number;
  certified_applications: number;
  certification_rate: number;
  avg_salary: number;
}

export interface BigQuerySalaryDistributionRow {
  salary_range: string;
  count: number;
}