// BigQuery service for H1B data
import { BigQuery } from '@google-cloud/bigquery';

interface BigQueryConfig {
  projectId: string;
  keyFilename: string;
}

export interface H1BQueryFilters {
  fiscalYears?: string[];
  states?: string[];
  salaryRange?: [number, number];
  jobCategories?: string[];
  skillLevels?: string[];
  companySizes?: string[];
  searchQuery?: string;
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
  mostAppliedJob: {
    title: string;
    applications: number;
  };
  topEmployers: Array<{
    employer: string;
    applications: number;
    avgSalary: number;
    topState: string;
  }>;
  salaryDistribution: Array<{
    range: string;
    count: number;
    minSalary: number;
    maxSalary: number;
  }>;
  yearlyTrends: Array<{
    fiscalYear: string;
    applications: number;
    avgSalary: number;
    medianSalary: number;
  }>;
  stateDistribution: Array<{
    state: string;
    applications: number;
    avgSalary: number;
  }>;
  jobTitleDistribution: Array<{
    jobTitle: string;
    applications: number;
    avgSalary: number;
    percentage: number;
  }>;
  industryDistribution: Array<{
    industry: string;
    applications: number;
    avgSalary: number;
    percentage: number;
  }>;
}

export class H1BBigQueryService {
  private bigquery: BigQuery;
  private projectId: string;
  private datasetId: string = 'h1b_data';

  constructor(config: BigQueryConfig) {
    this.projectId = config.projectId;
    this.bigquery = new BigQuery({
      projectId: config.projectId,
      keyFilename: config.keyFilename,
    });
  }

  /**
   * Build WHERE clause for filters - simplified to use only LCA table
   */
  private buildWhereClause(filters: H1BQueryFilters = {}): { whereClause: string; params: any } {
    const conditions: string[] = [];
    const params: any = {};

    // Don't automatically filter by case_status - let the query decide what to include

    // Derive fiscal year from received_date (fiscal year starts in October)
    // Default to 2024 fiscal year if no years specified
    if (!filters.fiscalYears || filters.fiscalYears.length === 0) {
      conditions.push(`
        CASE 
          WHEN EXTRACT(MONTH FROM received_date) >= 10 
          THEN EXTRACT(YEAR FROM received_date) + 1
          ELSE EXTRACT(YEAR FROM received_date)
        END = @currentFiscalYear
      `);
      params.currentFiscalYear = 2025; // Default to current fiscal year
    } else if (filters.fiscalYears.length > 0) {
      const yearPlaceholders = filters.fiscalYears.map((_, index) => `@fiscalYear${index}`);
      conditions.push(`
        CASE 
          WHEN EXTRACT(MONTH FROM received_date) >= 10 
          THEN EXTRACT(YEAR FROM received_date) + 1
          ELSE EXTRACT(YEAR FROM received_date)
        END IN (${yearPlaceholders.join(', ')})
      `);
      filters.fiscalYears.forEach((year, index) => {
        params[`fiscalYear${index}`] = parseInt(year);
      });
    }

    // State filter
    if (filters.states && filters.states.length > 0) {
      const statePlaceholders = filters.states.map((_, index) => `@state${index}`);
      conditions.push(`worksite_state IN (${statePlaceholders.join(', ')})`);
      filters.states.forEach((state, index) => {
        params[`state${index}`] = state;
      });
    }

    // Salary range filter
    if (filters.salaryRange && filters.salaryRange[0] > 0) {
      conditions.push("wage_rate_of_pay_from >= @minSalary");
      params.minSalary = filters.salaryRange[0];
    }
    if (filters.salaryRange && filters.salaryRange[1] < 500000) {
      conditions.push("wage_rate_of_pay_from <= @maxSalary");
      params.maxSalary = filters.salaryRange[1];
    }

    // Search query (employer or job title)
    if (filters.searchQuery && filters.searchQuery.trim()) {
      conditions.push(`(
        LOWER(employer_name) LIKE @searchQuery OR 
        LOWER(job_title) LIKE @searchQuery
      )`);
      params.searchQuery = `%${filters.searchQuery.toLowerCase()}%`;
    }

    return {
      whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
      params
    };
  }

  /**
   * Get aggregated H1B data for dashboard - simplified to use only LCA table
   */
  async getH1BDashboardData(filters: H1BQueryFilters = {}): Promise<H1BAggregatedData> {
    const { whereClause, params } = this.buildWhereClause(filters);

    // Main aggregation query - showing both total and certified applications
    const mainQuery = `
      SELECT 
        COUNT(*) as total_applications,
        COUNT(CASE WHEN case_status = 'Certified' THEN 1 END) as certified_applications,
        COUNT(CASE WHEN case_status = 'Denied' THEN 1 END) as denied_applications,
        COUNT(CASE WHEN case_status = 'Withdrawn' THEN 1 END) as withdrawn_applications,
        ROUND(COUNT(CASE WHEN case_status = 'Certified' THEN 1 END) * 100.0 / COUNT(*), 2) as certification_rate,
        AVG(CASE WHEN case_status = 'Certified' THEN wage_rate_of_pay_from END) as avg_salary,
        APPROX_QUANTILES(CASE WHEN case_status = 'Certified' THEN wage_rate_of_pay_from END, 100)[OFFSET(50)] as median_salary,
        COUNT(DISTINCT employer_name) as unique_employers,
        COUNT(DISTINCT worksite_state) as unique_states
      FROM \`${this.projectId}.${this.datasetId}.lca_applications\`
      ${whereClause}
      AND wage_rate_of_pay_from IS NOT NULL
      AND wage_rate_of_pay_from > 0
    `;

    // Top employers query - only certified applications for meaningful salary data
    const employersQuery = `
      WITH employer_stats AS (
        SELECT 
          employer_name,
          COUNT(*) as applications,
          AVG(wage_rate_of_pay_from) as avg_salary,
          ANY_VALUE(worksite_state) as top_state
        FROM \`${this.projectId}.${this.datasetId}.lca_applications\`
        ${whereClause}
        AND case_status = 'Certified'
        AND wage_rate_of_pay_from IS NOT NULL
        AND wage_rate_of_pay_from > 0
        GROUP BY employer_name
      )
      SELECT 
        employer_name as employer,
        applications,
        avg_salary,
        top_state
      FROM employer_stats
      ORDER BY applications DESC
      LIMIT 10
    `;

    // Salary distribution query - only certified applications
    const salaryDistQuery = `
      WITH salary_buckets AS (
        SELECT 
          CASE 
            WHEN wage_rate_of_pay_from < 50000 THEN '< $50K'
            WHEN wage_rate_of_pay_from < 75000 THEN '$50K - $75K'
            WHEN wage_rate_of_pay_from < 100000 THEN '$75K - $100K'
            WHEN wage_rate_of_pay_from < 125000 THEN '$100K - $125K'
            WHEN wage_rate_of_pay_from < 150000 THEN '$125K - $150K'
            WHEN wage_rate_of_pay_from < 200000 THEN '$150K - $200K'
            ELSE '$200K+'
          END as salary_range,
          CASE 
            WHEN wage_rate_of_pay_from < 50000 THEN 0
            WHEN wage_rate_of_pay_from < 75000 THEN 50000
            WHEN wage_rate_of_pay_from < 100000 THEN 75000
            WHEN wage_rate_of_pay_from < 125000 THEN 100000
            WHEN wage_rate_of_pay_from < 150000 THEN 125000
            WHEN wage_rate_of_pay_from < 200000 THEN 150000
            ELSE 200000
          END as min_salary,
          CASE 
            WHEN wage_rate_of_pay_from < 50000 THEN 50000
            WHEN wage_rate_of_pay_from < 75000 THEN 75000
            WHEN wage_rate_of_pay_from < 100000 THEN 100000
            WHEN wage_rate_of_pay_from < 125000 THEN 125000
            WHEN wage_rate_of_pay_from < 150000 THEN 150000
            WHEN wage_rate_of_pay_from < 200000 THEN 200000
            ELSE 500000
          END as max_salary
        FROM \`${this.projectId}.${this.datasetId}.lca_applications\`
        ${whereClause}
        AND case_status = 'Certified'
        AND wage_rate_of_pay_from IS NOT NULL
        AND wage_rate_of_pay_from > 0
      )
      SELECT 
        salary_range,
        COUNT(*) as count,
        min_salary,
        max_salary
      FROM salary_buckets
      GROUP BY salary_range, min_salary, max_salary
      ORDER BY min_salary
    `;

    // Yearly trends query - derive fiscal year from received_date
    const yearlyTrendsQuery = `
      WITH yearly_data AS (
        SELECT 
          wage_rate_of_pay_from as salary,
          CASE 
            WHEN EXTRACT(MONTH FROM received_date) >= 10 
            THEN EXTRACT(YEAR FROM received_date) + 1
            ELSE EXTRACT(YEAR FROM received_date)
          END as fiscal_year
        FROM \`${this.projectId}.${this.datasetId}.lca_applications\`
        WHERE case_status = 'Certified'
        AND wage_rate_of_pay_from IS NOT NULL
        AND wage_rate_of_pay_from > 0
        AND received_date IS NOT NULL
      )
      SELECT 
        CAST(fiscal_year AS STRING) as fiscal_year,
        COUNT(*) as applications,
        AVG(salary) as avg_salary,
        APPROX_QUANTILES(salary, 100)[OFFSET(50)] as median_salary
      FROM yearly_data
      GROUP BY fiscal_year
      ORDER BY fiscal_year DESC
      LIMIT 5
    `;

    // State distribution query - only certified applications for meaningful salary data
    const stateDistQuery = `
      SELECT 
        worksite_state as state,
        COUNT(*) as applications,
        AVG(wage_rate_of_pay_from) as avg_salary
      FROM \`${this.projectId}.${this.datasetId}.lca_applications\`
      ${whereClause}
      AND case_status = 'Certified'
      AND wage_rate_of_pay_from IS NOT NULL
      AND wage_rate_of_pay_from > 0
      GROUP BY worksite_state
      ORDER BY applications DESC
      LIMIT 15
    `;

    // Most applied job query
    const mostAppliedJobQuery = `
      SELECT 
        job_title,
        COUNT(*) as applications
      FROM \`${this.projectId}.${this.datasetId}.lca_applications\`
      ${whereClause}
      AND case_status = 'Certified'
      AND job_title IS NOT NULL
      GROUP BY job_title
      ORDER BY applications DESC
      LIMIT 1
    `;

    // Job title distribution query
    const jobTitleDistQuery = `
      WITH job_totals AS (
        SELECT COUNT(*) as total_count
        FROM \`${this.projectId}.${this.datasetId}.lca_applications\`
        ${whereClause}
        AND case_status = 'Certified'
        AND job_title IS NOT NULL
      )
      SELECT 
        job_title,
        COUNT(*) as applications,
        AVG(wage_rate_of_pay_from) as avg_salary,
        ROUND(COUNT(*) * 100.0 / (SELECT total_count FROM job_totals), 2) as percentage
      FROM \`${this.projectId}.${this.datasetId}.lca_applications\`
      ${whereClause}
      AND case_status = 'Certified'
      AND job_title IS NOT NULL
      AND wage_rate_of_pay_from IS NOT NULL
      AND wage_rate_of_pay_from > 0
      GROUP BY job_title
      ORDER BY applications DESC
      LIMIT 15
    `;

    // Industry distribution query - using NAICS codes for actual employer industries
    const industryDistQuery = `
      WITH industry_totals AS (
        SELECT COUNT(*) as total_count
        FROM \`${this.projectId}.${this.datasetId}.lca_applications\`
        ${whereClause}
        AND case_status = 'Certified'
        AND naics_code IS NOT NULL
        AND naics_code != ''
      ),
      naics_mapping AS (
        SELECT 
          naics_code,
          CASE 
            WHEN naics_code LIKE '11%' THEN 'Agriculture, Forestry, Fishing'
            WHEN naics_code LIKE '21%' THEN 'Mining, Quarrying, Oil & Gas'
            WHEN naics_code LIKE '22%' THEN 'Utilities'
            WHEN naics_code LIKE '23%' THEN 'Construction'
            WHEN naics_code LIKE '31%' OR naics_code LIKE '32%' OR naics_code LIKE '33%' THEN 'Manufacturing'
            WHEN naics_code LIKE '42%' THEN 'Wholesale Trade'
            WHEN naics_code LIKE '44%' OR naics_code LIKE '45%' THEN 'Retail Trade'
            WHEN naics_code LIKE '48%' OR naics_code LIKE '49%' THEN 'Transportation & Warehousing'
            WHEN naics_code LIKE '51%' THEN 'Information & Technology'
            WHEN naics_code LIKE '52%' THEN 'Finance & Insurance'
            WHEN naics_code LIKE '53%' THEN 'Real Estate & Rental'
            WHEN naics_code LIKE '54%' THEN 'Professional & Technical Services'
            WHEN naics_code LIKE '55%' THEN 'Management of Companies'
            WHEN naics_code LIKE '56%' THEN 'Administrative & Support Services'
            WHEN naics_code LIKE '61%' THEN 'Educational Services'
            WHEN naics_code LIKE '62%' THEN 'Healthcare & Social Assistance'
            WHEN naics_code LIKE '71%' THEN 'Arts, Entertainment & Recreation'
            WHEN naics_code LIKE '72%' THEN 'Accommodation & Food Services'
            WHEN naics_code LIKE '81%' THEN 'Other Services'
            WHEN naics_code LIKE '92%' THEN 'Public Administration'
            ELSE 'Other Industries'
          END as industry_name,
          COUNT(*) as applications,
          AVG(wage_rate_of_pay_from) as avg_salary,
          ROUND(COUNT(*) * 100.0 / (SELECT total_count FROM industry_totals), 2) as percentage
        FROM \`${this.projectId}.${this.datasetId}.lca_applications\`
        ${whereClause}
        AND case_status = 'Certified'
        AND naics_code IS NOT NULL
        AND naics_code != ''
        AND wage_rate_of_pay_from IS NOT NULL
        AND wage_rate_of_pay_from > 0
        GROUP BY naics_code
      )
      SELECT 
        industry_name as industry,
        SUM(applications) as applications,
        AVG(avg_salary) as avg_salary,
        SUM(percentage) as percentage
      FROM naics_mapping
      GROUP BY industry_name
      ORDER BY applications DESC
      LIMIT 12
    `;

    try {
      // Execute all queries in parallel
      const [
        [mainResults],
        [employerResults],
        [salaryDistResults],
        [yearlyTrendsResults],
        [stateDistResults],
        [mostAppliedJobResults],
        [jobTitleDistResults],
        [industryDistResults]
      ] = await Promise.all([
        this.bigquery.query({ query: mainQuery, params }),
        this.bigquery.query({ query: employersQuery, params }),
        this.bigquery.query({ query: salaryDistQuery, params }),
        this.bigquery.query({ query: yearlyTrendsQuery }),
        this.bigquery.query({ query: stateDistQuery, params }),
        this.bigquery.query({ query: mostAppliedJobQuery, params }),
        this.bigquery.query({ query: jobTitleDistQuery, params }),
        this.bigquery.query({ query: industryDistQuery, params })
      ]);

      // Process main aggregated data
      const mainData = mainResults[0] || {};

      // Process top employers
      const topEmployers = employerResults.map((row: any) => ({
        employer: row.employer || 'Unknown',
        applications: row.applications || 0,
        avgSalary: Math.round(row.avg_salary || 0),
        topState: row.top_state || 'Unknown'
      }));

      // Process salary distribution
      const salaryDistribution = salaryDistResults.map((row: any) => ({
        range: row.salary_range,
        count: row.count || 0,
        minSalary: row.min_salary || 0,
        maxSalary: row.max_salary || 0
      }));

      // Process yearly trends
      const yearlyTrends = yearlyTrendsResults.map((row: any) => ({
        fiscalYear: row.fiscal_year,
        applications: row.applications || 0,
        avgSalary: Math.round(row.avg_salary || 0),
        medianSalary: Math.round(row.median_salary || 0)
      }));

      // Process state distribution
      const stateDistribution = stateDistResults.map((row: any) => ({
        state: row.state,
        applications: row.applications || 0,
        avgSalary: Math.round(row.avg_salary || 0)
      }));

      // Process most applied job
      const mostAppliedJobData = mostAppliedJobResults[0] || {};
      const mostAppliedJob = {
        title: mostAppliedJobData.job_title || 'N/A',
        applications: mostAppliedJobData.applications || 0
      };

      // Process job title distribution
      const jobTitleDistribution = jobTitleDistResults.map((row: any) => ({
        jobTitle: row.job_title,
        applications: row.applications || 0,
        avgSalary: Math.round(row.avg_salary || 0),
        percentage: row.percentage || 0
      }));

      // Process industry distribution
      const industryDistribution = industryDistResults.map((row: any) => ({
        industry: row.industry,
        applications: row.applications || 0,
        avgSalary: Math.round(row.avg_salary || 0),
        percentage: row.percentage || 0
      }));

      return {
        totalApplications: mainData.total_applications || 0,
        certifiedApplications: mainData.certified_applications || 0,
        deniedApplications: mainData.denied_applications || 0,
        withdrawnApplications: mainData.withdrawn_applications || 0,
        certificationRate: mainData.certification_rate || 0,
        avgSalary: Math.round(mainData.avg_salary || 0),
        medianSalary: Math.round(mainData.median_salary || 0),
        uniqueEmployers: mainData.unique_employers || 0,
        uniqueStates: mainData.unique_states || 0,
        mostAppliedJob,
        topEmployers,
        salaryDistribution,
        yearlyTrends,
        stateDistribution,
        jobTitleDistribution,
        industryDistribution
      };
    } catch (error) {
      console.error('BigQuery error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown BigQuery error';
      throw new Error(`Failed to fetch H1B data: ${errorMessage}`);
    }
  }

  /**
   * Get filter options for the dashboard - simplified to use only LCA table
   */
  async getFilterOptions(): Promise<{
    fiscalYears: string[];
    states: string[];
    jobCategories: string[];
  }> {
    // Get fiscal years - derive from received_date
    const fiscalYearsQuery = `
      SELECT DISTINCT
        CASE 
          WHEN EXTRACT(MONTH FROM received_date) >= 10 
          THEN EXTRACT(YEAR FROM received_date) + 1
          ELSE EXTRACT(YEAR FROM received_date)
        END as fiscal_year
      FROM \`${this.projectId}.${this.datasetId}.lca_applications\`
      WHERE received_date IS NOT NULL
      ORDER BY fiscal_year DESC
      LIMIT 10
    `;

    const statesQuery = `
      SELECT DISTINCT worksite_state as state
      FROM \`${this.projectId}.${this.datasetId}.lca_applications\`
      WHERE worksite_state IS NOT NULL
      ORDER BY worksite_state
      LIMIT 50
    `;

    const jobCategoriesQuery = `
      SELECT DISTINCT soc_title as job_category
      FROM \`${this.projectId}.${this.datasetId}.lca_applications\`
      WHERE soc_title IS NOT NULL
      ORDER BY soc_title
      LIMIT 100
    `;

    try {
      // Execute all queries in parallel
      const [
        [fiscalYearResults],
        [stateResults], 
        [jobCategoryResults]
      ] = await Promise.all([
        this.bigquery.query(fiscalYearsQuery),
        this.bigquery.query(statesQuery),
        this.bigquery.query(jobCategoriesQuery)
      ]);

      return {
        fiscalYears: fiscalYearResults.map((row: any) => row.fiscal_year.toString()).filter(Boolean),
        states: stateResults.map((row: any) => row.state).filter(Boolean),
        jobCategories: jobCategoryResults.map((row: any) => row.job_category).filter(Boolean)
      };
    } catch (error) {
      console.error('BigQuery filter options error:', error);
      return {
        fiscalYears: [],
        states: [],
        jobCategories: []
      };
    }
  }
}
