import { NextRequest, NextResponse } from 'next/server';
import { H1BBigQueryService } from '@/lib/h1bBigQueryService';
import { H1BQueryFilters } from '@/lib/types';
import { cacheService } from '@/lib/cacheService';
import path from 'path';

// Initialize BigQuery service
const bigQueryService = new H1BBigQueryService({
  projectId: 'doctracker-b4528',
  keyFilename: path.join(process.cwd(), '../../serviceAccountKey.json'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Check if this is a filter options request
    if (searchParams.get('type') === 'filterOptions') {
      const options = {
        fiscalYears: ['2025', '2024', '2023'],
        states: ['CA', 'NY', 'TX', 'WA', 'FL'],
        jobTitles: ['Software Engineer', 'Data Scientist', 'Product Manager'],
        employers: ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta'],
        salaryRanges: { min: 50000, max: 300000 }
      };
      return NextResponse.json(options);
    }
    
    // Return mock data for testing
    const mockData = {
      totalApplications: 50000,
      certifiedApplications: 42500,
      deniedApplications: 5000,
      withdrawnApplications: 2500,
      certificationRate: 85.0,
      avgSalary: 95000,
      medianSalary: 88000,
      uniqueEmployers: 1200,
      uniqueStates: 48,
      mostAppliedJob: {
        title: 'Software Engineer',
        applications: 8500,
      },
      topEmployers: [
        { employer: 'Google', applications: 2500, avgSalary: 130000, topState: 'CA' },
        { employer: 'Microsoft', applications: 2200, avgSalary: 125000, topState: 'WA' },
        { employer: 'Amazon', applications: 2000, avgSalary: 115000, topState: 'WA' },
        { employer: 'Apple', applications: 1800, avgSalary: 135000, topState: 'CA' },
        { employer: 'Meta', applications: 1600, avgSalary: 140000, topState: 'CA' },
      ],
      topAttorneys: [
        {
          attorneyName: 'John Smith',
          lawFirm: 'Smith & Associates',
          totalApplications: 450,
          certifiedApplications: 405,
          certificationRate: 90.0,
          avgSalary: 120000,
          topStates: ['CA', 'NY', 'TX'],
          topJobCategories: ['Software', 'Engineering'],
          city: 'San Francisco',
          state: 'CA'
        },
        {
          attorneyName: 'Sarah Johnson',
          lawFirm: 'Johnson Law Group',
          totalApplications: 380,
          certifiedApplications: 342,
          certificationRate: 90.0,
          avgSalary: 115000,
          topStates: ['NY', 'NJ', 'CA'],
          topJobCategories: ['Finance', 'Technology'],
          city: 'New York',
          state: 'NY'
        },
        {
          attorneyName: 'Michael Chen',
          lawFirm: 'Chen Immigration Law',
          totalApplications: 320,
          certifiedApplications: 288,
          certificationRate: 90.0,
          avgSalary: 110000,
          topStates: ['CA', 'WA', 'TX'],
          topJobCategories: ['Technology', 'Healthcare'],
          city: 'Los Angeles',
          state: 'CA'
        },
        {
          attorneyName: 'Emily Rodriguez',
          lawFirm: 'Rodriguez Legal Services',
          totalApplications: 290,
          certifiedApplications: 261,
          certificationRate: 90.0,
          avgSalary: 105000,
          topStates: ['TX', 'FL', 'CA'],
          topJobCategories: ['Business', 'Technology'],
          city: 'Houston',
          state: 'TX'
        },
        {
          attorneyName: 'David Williams',
          lawFirm: 'Williams Immigration Firm',
          totalApplications: 275,
          certifiedApplications: 248,
          certificationRate: 90.2,
          avgSalary: 108000,
          topStates: ['NY', 'NJ', 'CT'],
          topJobCategories: ['Finance', 'Consulting'],
          city: 'New York',
          state: 'NY'
        },
      ],
      salaryDistribution: [
        { range: '$50K-$75K', count: 5000, minSalary: 50000, maxSalary: 75000 },
        { range: '$75K-$100K', count: 12000, minSalary: 75000, maxSalary: 100000 },
        { range: '$100K-$125K', count: 15000, minSalary: 100000, maxSalary: 125000 },
        { range: '$125K-$150K', count: 10000, minSalary: 125000, maxSalary: 150000 },
        { range: '$150K+', count: 8000, minSalary: 150000, maxSalary: 300000 },
      ],
      yearlyTrends: [
        { fiscalYear: '2025', applications: 50000, avgSalary: 95000, medianSalary: 88000 },
        { fiscalYear: '2024', applications: 48000, avgSalary: 92000, medianSalary: 85000 },
        { fiscalYear: '2023', applications: 45000, avgSalary: 89000, medianSalary: 82000 },
      ],
      stateDistribution: [
        { state: 'CA', applications: 15000, avgSalary: 110000, highestSalary: 200000 },
        { state: 'NY', applications: 8000, avgSalary: 105000, highestSalary: 180000 },
        { state: 'TX', applications: 7000, avgSalary: 95000, highestSalary: 150000 },
        { state: 'WA', applications: 6000, avgSalary: 115000, highestSalary: 190000 },
        { state: 'FL', applications: 4000, avgSalary: 88000, highestSalary: 140000 },
      ],
      jobTitleDistribution: [
        { jobTitle: 'Software Engineer', applications: 8500, avgSalary: 105000, percentage: 17.0 },
        { jobTitle: 'Data Scientist', applications: 4500, avgSalary: 110000, percentage: 9.0 },
        { jobTitle: 'Product Manager', applications: 3500, avgSalary: 120000, percentage: 7.0 },
        { jobTitle: 'Business Analyst', applications: 3000, avgSalary: 85000, percentage: 6.0 },
        { jobTitle: 'Research Scientist', applications: 2500, avgSalary: 125000, percentage: 5.0 },
      ],
      industryDistribution: [
        { industry: 'Technology', applications: 25000, avgSalary: 108000, percentage: 50.0 },
        { industry: 'Finance', applications: 8000, avgSalary: 95000, percentage: 16.0 },
        { industry: 'Healthcare', applications: 6000, avgSalary: 92000, percentage: 12.0 },
        { industry: 'Consulting', applications: 5000, avgSalary: 88000, percentage: 10.0 },
        { industry: 'Education', applications: 3000, avgSalary: 75000, percentage: 6.0 },
      ],
      isFromCache: false,
    };
    
    return NextResponse.json(mockData);
    
  } catch (error) {
    console.error('Error in mock H1B data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to fetch H1B data', details: errorMessage },
      { status: 500 },
    );
  }
}

