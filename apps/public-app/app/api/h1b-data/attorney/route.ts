import { NextRequest, NextResponse } from 'next/server';
import { H1BBigQueryService } from '@/lib/h1bBigQueryService';
import path from 'path';

// Initialize BigQuery service
const bigQueryService = new H1BBigQueryService({
  projectId: 'doctracker-b4528',
  keyFilename: path.join(process.cwd(), '../../serviceAccountKey.json'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const attorneyName = searchParams.get('name');
    const lawFirm = searchParams.get('firm');
    
    if (!attorneyName) {
      return NextResponse.json(
        { error: 'Attorney name is required' },
        { status: 400 }
      );
    }
    
    console.log('Fetching attorney data for:', { attorneyName, lawFirm });
    
    // Return mock data for testing
    const mockData = {
      attorneyName: attorneyName,
      lawFirm: lawFirm || 'Test Law Firm',
      city: 'San Francisco',
      state: 'CA',
      totalApplications: 450,
      certifiedApplications: 405,
      deniedApplications: 35,
      withdrawnApplications: 10,
      certificationRate: 90.0,
      avgSalary: 120000,
      medianSalary: 115000,
      minSalary: 75000,
      maxSalary: 180000,
      topEmployers: [
        {
          employer: 'Google Inc.',
          applications: 85,
          percentage: 18.9,
          avgSalary: 135000,
          certificationRate: 92.5
        },
        {
          employer: 'Microsoft Corporation',
          applications: 72,
          percentage: 16.0,
          avgSalary: 128000,
          certificationRate: 89.0
        },
        {
          employer: 'Amazon.com Inc.',
          applications: 68,
          percentage: 15.1,
          avgSalary: 125000,
          certificationRate: 91.2
        },
        {
          employer: 'Apple Inc.',
          applications: 55,
          percentage: 12.2,
          avgSalary: 140000,
          certificationRate: 94.5
        },
        {
          employer: 'Meta Platforms Inc.',
          applications: 48,
          percentage: 10.7,
          avgSalary: 145000,
          certificationRate: 87.5
        }
      ],
      topStates: [
        {
          state: 'CA',
          applications: 180,
          percentage: 40.0,
          avgSalary: 135000
        },
        {
          state: 'WA',
          applications: 95,
          percentage: 21.1,
          avgSalary: 125000
        },
        {
          state: 'NY',
          applications: 70,
          percentage: 15.6,
          avgSalary: 115000
        },
        {
          state: 'TX',
          applications: 50,
          percentage: 11.1,
          avgSalary: 105000
        },
        {
          state: 'FL',
          applications: 30,
          percentage: 6.7,
          avgSalary: 95000
        }
      ],
      topJobCategories: [
        {
          jobCategory: 'Computer and Mathematical Occupations',
          applications: 220,
          percentage: 48.9,
          avgSalary: 125000,
          certificationRate: 92.0
        },
        {
          jobCategory: 'Engineering Occupations',
          applications: 95,
          percentage: 21.1,
          avgSalary: 118000,
          certificationRate: 88.5
        },
        {
          jobCategory: 'Management Occupations',
          applications: 65,
          percentage: 14.4,
          avgSalary: 135000,
          certificationRate: 90.8
        },
        {
          jobCategory: 'Business and Financial Operations',
          applications: 45,
          percentage: 10.0,
          avgSalary: 108000,
          certificationRate: 87.0
        },
        {
          jobCategory: 'Life, Physical, and Social Science',
          applications: 25,
          percentage: 5.6,
          avgSalary: 115000,
          certificationRate: 96.0
        }
      ],
      yearlyTrends: [
        {
          fiscalYear: '2025',
          applications: 120,
          certifiedApplications: 108,
          certificationRate: 90.0,
          avgSalary: 125000
        },
        {
          fiscalYear: '2024',
          applications: 110,
          certifiedApplications: 99,
          certificationRate: 90.0,
          avgSalary: 120000
        },
        {
          fiscalYear: '2023',
          applications: 105,
          certifiedApplications: 95,
          certificationRate: 90.5,
          avgSalary: 115000
        },
        {
          fiscalYear: '2022',
          applications: 95,
          certifiedApplications: 86,
          certificationRate: 90.5,
          avgSalary: 110000
        },
        {
          fiscalYear: '2021',
          applications: 20,
          certifiedApplications: 17,
          certificationRate: 85.0,
          avgSalary: 105000
        }
      ],
      salaryDistribution: [
        { range: 'Under $50K', count: 5 },
        { range: '$50K - $75K', count: 15 },
        { range: '$75K - $100K', count: 85 },
        { range: '$100K - $125K', count: 145 },
        { range: '$125K - $150K', count: 125 },
        { range: '$150K - $200K', count: 60 },
        { range: '$200K+', count: 10 }
      ],
      recentActivity: [
        { month: 'Jan 2025', applications: 36, certificationRate: 91.7 },
        { month: 'Feb 2025', applications: 54, certificationRate: 92.6 },
        { month: 'Mar 2025', applications: 68, certificationRate: 89.7 },
        { month: 'Apr 2025', applications: 90, certificationRate: 90.0 },
        { month: 'May 2025', applications: 81, certificationRate: 88.9 },
        { month: 'Jun 2025', applications: 121, certificationRate: 91.7 }
      ]
    };
    
    console.log('Attorney mock data returned successfully:', {
      totalApplications: mockData.totalApplications,
      certificationRate: mockData.certificationRate,
      topEmployersCount: mockData.topEmployers.length,
      topStatesCount: mockData.topStates.length,
    });
    
    return NextResponse.json(mockData);
    
  } catch (error) {
    console.error('Error fetching attorney data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to fetch attorney data', details: errorMessage },
      { status: 500 }
    );
  }
}