// Google Analytics configuration
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Check if analytics should be enabled
export const isAnalyticsEnabled = (): boolean => {
  return typeof window !== 'undefined' && 
         !!GA_MEASUREMENT_ID && 
         process.env.NODE_ENV === 'production';
};

// Page view tracking
export const pageview = (url: string) => {
  if (!isAnalyticsEnabled()) {
    return;
  }
  
  window.gtag('config', GA_MEASUREMENT_ID!, {
    page_path: url,
  });
};

// Custom event tracking
export const event = (action: string, parameters: Record<string, any>) => {
  if (!isAnalyticsEnabled()) {
    return;
  }
  
  window.gtag('event', action, parameters);
};

// H1B-specific event tracking functions
export const trackCompanyView = (company: {
  name: string;
  totalApplications?: number;
  approvalRate?: number;
  avgSalary?: number;
}) => {
  event('view_company_profile', {
    company_name: company.name,
    total_applications: company.totalApplications,
    approval_rate: company.approvalRate,
    average_salary: company.avgSalary,
    event_category: 'H1B_Company',
  });
};

export const trackJobSearch = (searchParams: {
  jobTitle?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  resultsCount?: number;
}) => {
  event('search_h1b_jobs', {
    job_title: searchParams.jobTitle,
    location: searchParams.location,
    salary_range: searchParams.salaryMin && searchParams.salaryMax 
      ? `${searchParams.salaryMin}-${searchParams.salaryMax}` 
      : undefined,
    results_count: searchParams.resultsCount,
    event_category: 'H1B_Search',
  });
};

export const trackSalaryDataView = (data: {
  type: 'company' | 'job' | 'location';
  name: string;
  salaryRange?: string;
  dataPoints?: number;
}) => {
  event('view_salary_data', {
    data_type: data.type,
    entity_name: data.name,
    salary_range: data.salaryRange,
    data_points: data.dataPoints,
    event_category: 'H1B_Salary',
  });
};

export const trackDataExport = (exportData: {
  dataType: string;
  format: 'csv' | 'json' | 'pdf';
  rowCount: number;
}) => {
  event('export_h1b_data', {
    data_type: exportData.dataType,
    export_format: exportData.format,
    row_count: exportData.rowCount,
    event_category: 'H1B_Export',
  });
};

export const trackFilterUsage = (filterData: {
  filterType: string;
  filterValue: any;
  resultsCount?: number;
}) => {
  event('apply_filter', {
    filter_type: filterData.filterType,
    filter_value: filterData.filterValue,
    results_count: filterData.resultsCount,
    event_category: 'H1B_Filter',
  });
};

// Track dashboard interactions
export const trackDashboardInteraction = (interaction: {
  component: string;
  action: string;
  value?: any;
}) => {
  event('dashboard_interaction', {
    component_name: interaction.component,
    interaction_type: interaction.action,
    interaction_value: interaction.value,
    event_category: 'H1B_Dashboard',
  });
};

// Declare gtag function type
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}