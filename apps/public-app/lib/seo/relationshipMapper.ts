/**
 * Relationship Mapping System for H1B Data
 * Discovers and maps relationships between employers, jobs, locations, and other data points
 */

export interface H1BRelationship {
  type: 'employer_jobs' | 'employer_locations' | 'job_locations' | 'job_salaries' | 'location_employers' | 'similar_jobs' | 'competitor_employers';
  source: {
    type: 'employer' | 'job' | 'location' | 'salary_range';
    name: string;
    slug: string;
  };
  targets: Array<{
    type: 'employer' | 'job' | 'location' | 'salary_range';
    name: string;
    slug: string;
    relevanceScore: number;
    relationship: string;
  }>;
}

export interface RelationshipContext {
  employer?: string;
  job?: string;
  city?: string;
  state?: string;
  salaryRange?: [number, number];
  year?: string;
}

/**
 * Maps data relationships for contextual linking
 */
export class H1BRelationshipMapper {
  private baseUrl: string;
  
  constructor(baseUrl: string = 'https://www.usimmigrantcentral.com') {
    this.baseUrl = baseUrl;
  }
  
  /**
   * Discovers all relationships for a given context
   */
  async discoverRelationships(context: RelationshipContext): Promise<H1BRelationship[]> {
    const relationships: H1BRelationship[] = [];
    
    if (context.employer) {
      relationships.push(...await this.getEmployerRelationships(context.employer));
    }
    
    if (context.job) {
      relationships.push(...await this.getJobRelationships(context.job));
    }
    
    if (context.city || context.state) {
      const location = context.city || context.state!;
      relationships.push(...await this.getLocationRelationships(location, context.state));
    }
    
    if (context.salaryRange) {
      relationships.push(...await this.getSalaryRelationships(context.salaryRange));
    }
    
    return this.deduplicateAndScore(relationships);
  }
  
  /**
   * Gets relationships for a specific employer
   */
  private async getEmployerRelationships(employerName: string): Promise<H1BRelationship[]> {
    const relationships: H1BRelationship[] = [];
    
    try {
      // Get jobs at this employer
      const jobsResponse = await this.fetchAPI(`/api/h1b-data?category=employerJobs&employer=${encodeURIComponent(employerName)}&limit=20`);
      if (jobsResponse?.data?.jobs) {
        relationships.push({
          type: 'employer_jobs',
          source: {
            type: 'employer',
            name: employerName,
            slug: this.createSlug(employerName),
          },
          targets: jobsResponse.data.jobs.map((job: any) => ({
            type: 'job' as const,
            name: job.job_title || job.title,
            slug: this.createSlug(job.job_title || job.title),
            relevanceScore: this.calculateJobRelevance(job),
            relationship: `${job.applications || job.count || 0} applications`,
          })),
        });
      }
      
      // Get locations for this employer
      const locationsResponse = await this.fetchAPI(`/api/h1b-data?category=employerLocations&employer=${encodeURIComponent(employerName)}&limit=15`);
      if (locationsResponse?.data?.locations) {
        relationships.push({
          type: 'employer_locations',
          source: {
            type: 'employer',
            name: employerName,
            slug: this.createSlug(employerName),
          },
          targets: locationsResponse.data.locations.map((location: any) => ({
            type: 'location' as const,
            name: location.city || location.state,
            slug: this.createSlug(location.city || location.state),
            relevanceScore: this.calculateLocationRelevance(location),
            relationship: `${location.applications || location.count || 0} applications`,
          })),
        });
      }
      
      // Get similar/competitor employers
      const competitorResponse = await this.fetchAPI(`/api/h1b-data?category=similarEmployers&employer=${encodeURIComponent(employerName)}&limit=10`);
      if (competitorResponse?.data?.employers) {
        relationships.push({
          type: 'competitor_employers',
          source: {
            type: 'employer',
            name: employerName,
            slug: this.createSlug(employerName),
          },
          targets: competitorResponse.data.employers.map((employer: any) => ({
            type: 'employer' as const,
            name: employer.employer_name || employer.name,
            slug: this.createSlug(employer.employer_name || employer.name),
            relevanceScore: this.calculateEmployerSimilarity(employer),
            relationship: `Similar employer (${employer.applications || 0} applications)`,
          })),
        });
      }
    } catch (error) {
      console.warn('Failed to fetch employer relationships:', error);
    }
    
    return relationships;
  }
  
  /**
   * Gets relationships for a specific job title
   */
  private async getJobRelationships(jobTitle: string): Promise<H1BRelationship[]> {
    const relationships: H1BRelationship[] = [];
    
    try {
      // Get employers hiring for this job
      const employersResponse = await this.fetchAPI(`/api/h1b-data?category=jobEmployers&job=${encodeURIComponent(jobTitle)}&limit=20`);
      if (employersResponse?.data?.employers) {
        relationships.push({
          type: 'employer_jobs',
          source: {
            type: 'job',
            name: jobTitle,
            slug: this.createSlug(jobTitle),
          },
          targets: employersResponse.data.employers.map((employer: any) => ({
            type: 'employer' as const,
            name: employer.employer_name || employer.name,
            slug: this.createSlug(employer.employer_name || employer.name),
            relevanceScore: this.calculateEmployerRelevance(employer),
            relationship: `Hires ${jobTitle} (${employer.applications || 0} applications)`,
          })),
        });
      }
      
      // Get locations for this job
      const locationsResponse = await this.fetchAPI(`/api/h1b-data?category=jobLocations&job=${encodeURIComponent(jobTitle)}&limit=15`);
      if (locationsResponse?.data?.locations) {
        relationships.push({
          type: 'job_locations',
          source: {
            type: 'job',
            name: jobTitle,
            slug: this.createSlug(jobTitle),
          },
          targets: locationsResponse.data.locations.map((location: any) => ({
            type: 'location' as const,
            name: location.city || location.state,
            slug: this.createSlug(location.city || location.state),
            relevanceScore: this.calculateLocationRelevance(location),
            relationship: `${location.applications || 0} ${jobTitle} applications`,
          })),
        });
      }
      
      // Get similar jobs
      const similarJobsResponse = await this.fetchAPI(`/api/h1b-data?category=similarJobs&job=${encodeURIComponent(jobTitle)}&limit=10`);
      if (similarJobsResponse?.data?.jobs) {
        relationships.push({
          type: 'similar_jobs',
          source: {
            type: 'job',
            name: jobTitle,
            slug: this.createSlug(jobTitle),
          },
          targets: similarJobsResponse.data.jobs.map((job: any) => ({
            type: 'job' as const,
            name: job.job_title || job.title,
            slug: this.createSlug(job.job_title || job.title),
            relevanceScore: this.calculateJobSimilarity(job),
            relationship: `Similar role (${job.applications || 0} applications)`,
          })),
        });
      }
    } catch (error) {
      console.warn('Failed to fetch job relationships:', error);
    }
    
    return relationships;
  }
  
  /**
   * Gets relationships for a specific location
   */
  private async getLocationRelationships(location: string, state?: string): Promise<H1BRelationship[]> {
    const relationships: H1BRelationship[] = [];
    
    try {
      // Get top employers in this location
      const employersResponse = await this.fetchAPI(`/api/h1b-data?category=locationEmployers&${state ? 'state' : 'city'}=${encodeURIComponent(location)}&limit=15`);
      if (employersResponse?.data?.employers) {
        relationships.push({
          type: 'location_employers',
          source: {
            type: 'location',
            name: location,
            slug: this.createSlug(location),
          },
          targets: employersResponse.data.employers.map((employer: any) => ({
            type: 'employer' as const,
            name: employer.employer_name || employer.name,
            slug: this.createSlug(employer.employer_name || employer.name),
            relevanceScore: this.calculateEmployerRelevance(employer),
            relationship: `Major employer in ${location} (${employer.applications || 0} applications)`,
          })),
        });
      }
      
      // Get top jobs in this location
      const jobsResponse = await this.fetchAPI(`/api/h1b-data?category=locationJobs&${state ? 'state' : 'city'}=${encodeURIComponent(location)}&limit=15`);
      if (jobsResponse?.data?.jobs) {
        relationships.push({
          type: 'job_locations',
          source: {
            type: 'location',
            name: location,
            slug: this.createSlug(location),
          },
          targets: jobsResponse.data.jobs.map((job: any) => ({
            type: 'job' as const,
            name: job.job_title || job.title,
            slug: this.createSlug(job.job_title || job.title),
            relevanceScore: this.calculateJobRelevance(job),
            relationship: `Popular job in ${location} (${job.applications || 0} applications)`,
          })),
        });
      }
    } catch (error) {
      console.warn('Failed to fetch location relationships:', error);
    }
    
    return relationships;
  }
  
  /**
   * Gets relationships for salary ranges
   */
  private async getSalaryRelationships(salaryRange: [number, number]): Promise<H1BRelationship[]> {
    const relationships: H1BRelationship[] = [];
    
    try {
      // Get jobs in this salary range
      const jobsResponse = await this.fetchAPI(`/api/h1b-data?category=salaryJobs&minSalary=${salaryRange[0]}&maxSalary=${salaryRange[1]}&limit=15`);
      if (jobsResponse?.data?.jobs) {
        relationships.push({
          type: 'job_salaries',
          source: {
            type: 'salary_range',
            name: `$${(salaryRange[0] / 1000).toFixed(0)}K-$${(salaryRange[1] / 1000).toFixed(0)}K`,
            slug: `${salaryRange[0]}-${salaryRange[1]}`,
          },
          targets: jobsResponse.data.jobs.map((job: any) => ({
            type: 'job' as const,
            name: job.job_title || job.title,
            slug: this.createSlug(job.job_title || job.title),
            relevanceScore: this.calculateSalaryRelevance(job, salaryRange),
            relationship: `Avg salary: $${(job.avg_salary || 0).toLocaleString()}`,
          })),
        });
      }
    } catch (error) {
      console.warn('Failed to fetch salary relationships:', error);
    }
    
    return relationships;
  }
  
  /**
   * API fetch helper with error handling
   */
  private async fetchAPI(endpoint: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn(`Failed to fetch ${endpoint}:`, error);
      return null;
    }
  }
  
  /**
   * Creates URL-friendly slug
   */
  private createSlug(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  
  /**
   * Deduplicates and scores relationships
   */
  private deduplicateAndScore(relationships: H1BRelationship[]): H1BRelationship[] {
    const seen = new Set<string>();
    const deduplicated = relationships.filter(rel => {
      const key = `${rel.type}-${rel.source.type}-${rel.source.name}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
    
    // Sort by relevance and limit
    return deduplicated.map(rel => ({
      ...rel,
      targets: rel.targets
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 10), // Limit to top 10 most relevant
    }));
  }
  
  /**
   * Relevance scoring functions
   */
  private calculateJobRelevance(job: any): number {
    const applications = job.applications || job.count || 0;
    const salary = job.avg_salary || job.salary || 0;
    return Math.log(applications + 1) * 0.7 + Math.log(salary / 1000) * 0.3;
  }
  
  private calculateEmployerRelevance(employer: any): number {
    const applications = employer.applications || employer.count || 0;
    const avgSalary = employer.avg_salary || employer.salary || 0;
    return Math.log(applications + 1) * 0.8 + Math.log(avgSalary / 1000) * 0.2;
  }
  
  private calculateLocationRelevance(location: any): number {
    const applications = location.applications || location.count || 0;
    const avgSalary = location.avg_salary || location.salary || 0;
    return Math.log(applications + 1) * 0.6 + Math.log(avgSalary / 1000) * 0.4;
  }
  
  private calculateEmployerSimilarity(employer: any): number {
    return this.calculateEmployerRelevance(employer) * 0.8; // Similar but slightly lower
  }
  
  private calculateJobSimilarity(job: any): number {
    return this.calculateJobRelevance(job) * 0.8; // Similar but slightly lower
  }
  
  private calculateSalaryRelevance(job: any, salaryRange: [number, number]): number {
    const jobSalary = job.avg_salary || job.salary || 0;
    const rangeMid = (salaryRange[0] + salaryRange[1]) / 2;
    const salaryDistance = Math.abs(jobSalary - rangeMid) / rangeMid;
    return Math.max(0, 1 - salaryDistance) * Math.log(job.applications || 1);
  }
}