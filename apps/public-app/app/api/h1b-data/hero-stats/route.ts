import { LATEST_DATA_FISCAL_YEAR } from '@docujourney/utils';
import { NextRequest, NextResponse } from 'next/server';
import { createH1BBigQueryService } from '@/lib/h1bBigQueryService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'general';
    
    console.log(`[DEBUG] Hero stats request for type: ${type}`);
    
    // Log environment info for debugging
    console.log('[DEBUG] H1B Hero Stats API Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID || 'NOT_SET',
      HAS_PRIVATE_KEY: !!process.env.GOOGLE_CLOUD_PRIVATE_KEY,
      HAS_CLIENT_EMAIL: !!process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
      HAS_CREDENTIALS_FILE: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    
    let bigQueryService;
    try {
      bigQueryService = createH1BBigQueryService();
      console.log(`[DEBUG] BigQuery service created successfully`);
    } catch (initError) {
      console.error('[DEBUG] Failed to initialize BigQuery service:', initError);
      
      
      throw initError;
    }

    let stats = {};

    switch (type) {
      case 'employers':
        try {
          console.log(`[DEBUG] Fetching H1B dashboard data for employers...`);
          
          // Get aggregated data which includes top employers and stats
          const aggregatedData = await bigQueryService.getH1BDashboardData({
            fiscalYears: [LATEST_DATA_FISCAL_YEAR],
          });

          console.log(`[DEBUG] Aggregated data received:`, {
            hasTopEmployers: !!aggregatedData.topEmployers,
            topEmployersCount: aggregatedData.topEmployers?.length,
            totalApplications: aggregatedData.totalApplications,
            medianSalary: aggregatedData.medianSalary,
            uniqueEmployers: aggregatedData.uniqueEmployers,
          });

          // Check if employers data exists
          if (!aggregatedData.topEmployers || !Array.isArray(aggregatedData.topEmployers)) {
            console.error('[DEBUG] No employers data found in aggregated data');
            throw new Error('No employers data available');
          }

          // Get top employers from the aggregated data
          const topEmployers = aggregatedData.topEmployers
            .slice(0, 5)
            .map(employer => {
              // Fix: Use correct property name 'employer' from H1BEmployer interface
              const employerName = employer.employer || 'Unknown';
              const safeName = typeof employerName === 'string' ? employerName : 'Unknown';
              
              return {
                text: safeName,
                displayText: safeName.split(' ')[0] || safeName,
                type: 'employer',
                count: employer.applications || 0,
              };
            });

          console.log(`[DEBUG] Top employers processed:`, topEmployers);

          stats = {
            topEmployers,
            stats: {
              totalEmployers: aggregatedData.uniqueEmployers || 0,
              avgSalary: Math.round(aggregatedData.medianSalary || 95000),
              approvalRate: Math.round(aggregatedData.certificationRate || 87),
              totalApplications: aggregatedData.totalApplications || 0,
            },
          };

          console.log(`[DEBUG] Final stats object:`, stats);
        } catch (error) {
          console.error('[DEBUG] Error in employers case:', error);
          console.error('[DEBUG] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
          throw error;
        }
        break;

      case 'jobs':
        try {
          // Get popular jobs sorted by application count (not salary)
          const popularJobs = await bigQueryService.getMostPopularJobs({
            fiscalYears: [LATEST_DATA_FISCAL_YEAR],
          }, 5);

          // Get general stats from aggregated data
          const aggregatedData = await bigQueryService.getH1BDashboardData({
            fiscalYears: [LATEST_DATA_FISCAL_YEAR],
          });

          // Transform popular jobs for UI
          const topJobs = popularJobs.map(job => ({
            text: job.jobTitle || 'Unknown Job',
            type: 'job_title',
            count: job.applications || 0,
            avgSalary: Math.round(job.avgSalary || 100000),
          }));

          stats = {
            topJobs,
            stats: {
              totalJobTitles: aggregatedData.uniqueJobTitles || 0,
              avgSalary: Math.round(aggregatedData.medianSalary || 105000),
              salaryRange: {
                min: 45000, // Estimated minimum
                max: 300000, // Estimated maximum
              },
              totalPositions: aggregatedData.totalApplications,
            },
          };
        } catch (error) {
          console.error('Error fetching jobs data:', error);
          throw error;
        }
        break;

      case 'cities':
        try {
          const aggregatedData = await bigQueryService.getH1BDashboardData({
            fiscalYears: [LATEST_DATA_FISCAL_YEAR],
          });

          // Get top cities/states from state distribution
          const topCities = (aggregatedData.stateDistribution || [])
            .slice(0, 5)
            .map(state => ({
              text: `${state.state}`, // Using 'state' property name
              displayText: state.state || 'Unknown',
              type: 'location',
              count: state.applications || 0,
              avgSalary: Math.round(state.avgSalary || 98000),
            }));

          stats = {
            topCities,
            stats: {
              totalCities: 1200, // Estimated
              totalStates: aggregatedData.uniqueStates || 50,
              totalApplications: aggregatedData.totalApplications,
              avgSalary: Math.round(aggregatedData.medianSalary || 98000),
            },
          };
        } catch (error) {
          console.error('Error fetching cities data:', error);
          throw error;
        }
        break;

      case 'attorneys':
        try {
          const aggregatedData = await bigQueryService.getH1BDashboardData({
            fiscalYears: [LATEST_DATA_FISCAL_YEAR],
          });

          // Get top attorneys from attorneys data
          const topAttorneys = (aggregatedData.topAttorneys || [])
            .slice(0, 5)
            .map(attorney => {
              // Fix: Use correct property name 'attorneyName' from H1BAttorney interface
              const attorneyName = attorney.attorneyName || 'Unknown Attorney';
              const safeName = typeof attorneyName === 'string' ? attorneyName : 'Unknown Attorney';
              
              return {
                text: safeName,
                displayText: safeName.split(' ')[0] || safeName,
                type: 'attorney',
                count: attorney.totalApplications || 0,
                successRate: Math.round(attorney.certificationRate || 89),
              };
            });

          stats = {
            topAttorneys,
            stats: {
              totalAttorneys: aggregatedData.uniqueAttorneys || 0,
              totalCases: aggregatedData.totalApplications,
              avgSuccessRate: Math.round(aggregatedData.certificationRate || 89),
              totalClients: aggregatedData.uniqueEmployers || 15000,
            },
          };
        } catch (error) {
          console.error('Error fetching attorneys data:', error);
          throw error;
        }
        break;

      case 'law-firms':
        try {
          // Get top law firms data using the new method
          const topLawFirmsData = await bigQueryService.getTopLawFirms({
            fiscalYears: [LATEST_DATA_FISCAL_YEAR],
          }, 10);

          const aggregatedData = await bigQueryService.getH1BDashboardData({
            fiscalYears: [LATEST_DATA_FISCAL_YEAR],
          });

          // Transform law firms data for the UI
          const topLawFirms = topLawFirmsData
            .slice(0, 5)
            .map(firm => {
              const firmName = firm.lawFirm || 'Unknown Firm';
              const safeName = typeof firmName === 'string' ? firmName : 'Unknown Firm';
              
              // Create a shorter display name for UI
              let displayName = safeName;
              if (safeName.includes('LLP')) {
                displayName = safeName.replace(', LLP', '').replace(' LLP', '');
              } else if (safeName.includes('LLC')) {
                displayName = safeName.replace(', LLC', '').replace(' LLC', '');
              } else if (safeName.includes('P.C.')) {
                displayName = safeName.replace(', P.C.', '').replace(' P.C.', '');
              }
              
              // Take first part if still too long
              if (displayName.length > 25) {
                const parts = displayName.split(' ');
                displayName = parts.slice(0, Math.max(2, Math.floor(parts.length / 2))).join(' ');
              }
              
              return {
                text: safeName,
                displayText: displayName,
                type: 'law_firm',
                count: firm.totalApplications || 0,
                successRate: Math.round(firm.certificationRate || 89),
                attorneyCount: firm.attorneyCount || 0,
              };
            });

          stats = {
            topLawFirms,
            stats: {
              totalLawFirms: aggregatedData.uniqueLawFirms || 0,
              totalCases: aggregatedData.totalApplications,
              avgSuccessRate: Math.round(
                topLawFirmsData.reduce((sum, firm) => sum + firm.certificationRate, 0) / 
                Math.max(topLawFirmsData.length, 1),
              ),
              totalAttorneys: topLawFirmsData.reduce((sum, firm) => sum + firm.attorneyCount, 0),
            },
          };
        } catch (error) {
          console.error('Error fetching law firms data:', error);
          throw error;
        }
        break;

      default:
        // General statistics for home page
        try {
          const aggregatedData = await bigQueryService.getH1BDashboardData({
            fiscalYears: [LATEST_DATA_FISCAL_YEAR],
          });

          stats = {
            totalApplications: aggregatedData.totalApplications,
            totalEmployers: aggregatedData.uniqueEmployers,
            avgSalary: Math.round(aggregatedData.medianSalary || 95000),
            approvalRate: Math.round(aggregatedData.certificationRate || 87),
          };
        } catch (error) {
          console.error('Error fetching general stats:', error);
          throw error;
        }
    }

    return NextResponse.json(stats, {
      headers: {
        // Dynamic cache based on environment
        'Cache-Control': process.env.NODE_ENV === 'production' 
          ? 'public, s-maxage=86400, stale-while-revalidate=604800' // 5 min cache in prod
          : 'no-store, no-cache, must-revalidate', // No cache in dev
      },
    });
  } catch (error) {
    console.error('[DEBUG] Main error in hero stats API:', error);
    console.error('[DEBUG] Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('[DEBUG] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}