import { NextRequest, NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';
import { bigQueryConfig } from '@/lib/config';

// Use static values for Next.js config
export const revalidate = 3600;
export const dynamic = 'force-dynamic';

interface Sponsor {
  employer_name: string;
  total_applications: number;
  certified_count: number;
  approval_rate: number;
  avg_salary: number;
  min_salary: number;
  max_salary: number;
  top_job_titles: string[];
  top_states: string[];
  latest_year: number;
  rank: number;
}

interface PaginatedResponse {
  sponsors: Sponsor[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  metadata: {
    lastUpdated: string;
    source: string;
  };
}

export async function GET(request: NextRequest): Promise<NextResponse<PaginatedResponse | { error: string }>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '10', 10)));
    const search = searchParams.get('search') || '';
    const industry = searchParams.get('industry') || '';
    const state = searchParams.get('state') || '';
    const minSalary = searchParams.get('minSalary') ? parseInt(searchParams.get('minSalary')!, 10) : undefined;
    const maxSalary = searchParams.get('maxSalary') ? parseInt(searchParams.get('maxSalary')!, 10) : undefined;
    const offset = (page - 1) * limit;
    
    console.log(`📄 Fetching sponsors page ${page} with limit ${limit}, search: '${search}', industry: '${industry}', state: '${state}'`);

    // Create BigQuery client
    const bigquery = new BigQuery({
      projectId: bigQueryConfig.projectId,
      credentials: bigQueryConfig.credentials,
    });

    // Build where conditions for filtering
    const whereConditions = [
      'employer_name IS NOT NULL',
      'employer_name != \'\'',
      'employer_name != \'N/A\'',
      'received_date >= \'2024-10-01\'',
    ];
    
    if (search) {
      whereConditions.push(`UPPER(employer_name) LIKE UPPER('%${search.replace(/'/g, '\'\'')}%')`);
    }
    if (state) {
      whereConditions.push(`worksite_state = '${state.replace(/'/g, '\'\'')}'`);
    }
    if (industry) {
      // You might want to map industry to job titles or SOC codes
      whereConditions.push(`UPPER(job_title) LIKE UPPER('%${industry.replace(/'/g, '\'\'')}%')`);
    }
    if (minSalary !== undefined) {
      whereConditions.push(`prevailing_wage >= ${minSalary}`);
    }
    if (maxSalary !== undefined) {
      whereConditions.push(`prevailing_wage <= ${maxSalary}`);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Get total count of unique employers with filters
    const countQuery = `
      SELECT COUNT(DISTINCT employer_name) as total_count
      FROM \`${bigQueryConfig.projectId}.${bigQueryConfig.datasetId}.${bigQueryConfig.tableId}\`
      WHERE ${whereClause}
    `;

    // Get paginated sponsors with aggregated data
    const sponsorsQuery = `
      WITH employer_stats AS (
        SELECT 
          TRIM(UPPER(employer_name)) as employer_name,
          COUNT(*) as total_applications,
          COUNTIF(UPPER(case_status) = 'CERTIFIED') as certified_count,
          ROUND(SAFE_DIVIDE(COUNTIF(UPPER(case_status) = 'CERTIFIED'), COUNT(*)) * 100, 1) as approval_rate,
          ROUND(AVG(CASE 
            WHEN prevailing_wage > 30000 AND prevailing_wage < 500000 
            THEN prevailing_wage 
            ELSE NULL 
          END)) as avg_salary,
          ROUND(MIN(CASE 
            WHEN prevailing_wage > 30000 AND prevailing_wage < 500000 
            THEN prevailing_wage 
            ELSE NULL 
          END)) as min_salary,
          ROUND(MAX(CASE 
            WHEN prevailing_wage > 30000 AND prevailing_wage < 500000 
            THEN prevailing_wage 
            ELSE NULL 
          END)) as max_salary,
          MAX(EXTRACT(YEAR FROM received_date)) as latest_year
        FROM \`${bigQueryConfig.projectId}.${bigQueryConfig.datasetId}.${bigQueryConfig.tableId}\`
        WHERE ${whereClause}
        GROUP BY employer_name
        HAVING COUNT(*) >= 1  -- Show all employers with FY 2025 applications
      ),
      ranked_employers AS (
        SELECT 
          *,
          ROW_NUMBER() OVER (ORDER BY total_applications DESC, employer_name) as rank
        FROM employer_stats
      ),
      top_job_titles AS (
        SELECT 
          re.employer_name,
          ARRAY_AGG(job_title ORDER BY job_count DESC LIMIT 3) as job_titles
        FROM ranked_employers re
        JOIN (
          SELECT 
            TRIM(UPPER(employer_name)) as employer_name,
            job_title,
            COUNT(*) as job_count
          FROM \`${bigQueryConfig.projectId}.${bigQueryConfig.datasetId}.${bigQueryConfig.tableId}\`
          WHERE received_date >= '2024-10-01'
            AND job_title IS NOT NULL
            AND ${whereClause}
          GROUP BY employer_name, job_title
        ) job_counts ON job_counts.employer_name = re.employer_name
        WHERE re.rank > ${offset} AND re.rank <= ${offset + limit}
        GROUP BY re.employer_name
      ),
      top_states AS (
        SELECT 
          re.employer_name,
          ARRAY_AGG(worksite_state ORDER BY state_count DESC LIMIT 3) as states
        FROM ranked_employers re
        JOIN (
          SELECT 
            TRIM(UPPER(employer_name)) as employer_name,
            worksite_state,
            COUNT(*) as state_count
          FROM \`${bigQueryConfig.projectId}.${bigQueryConfig.datasetId}.${bigQueryConfig.tableId}\`
          WHERE received_date >= '2024-10-01'
            AND worksite_state IS NOT NULL
            AND ${whereClause}
          GROUP BY employer_name, worksite_state
        ) state_counts ON state_counts.employer_name = re.employer_name
        WHERE re.rank > ${offset} AND re.rank <= ${offset + limit}
        GROUP BY re.employer_name
      ),
      employer_details AS (
        SELECT 
          re.employer_name,
          re.total_applications,
          re.certified_count,
          re.approval_rate,
          re.avg_salary,
          re.min_salary,
          re.max_salary,
          re.latest_year,
          re.rank,
          COALESCE(tj.job_titles, []) as top_job_titles,
          COALESCE(ts.states, []) as top_states
        FROM ranked_employers re
        LEFT JOIN top_job_titles tj ON tj.employer_name = re.employer_name
        LEFT JOIN top_states ts ON ts.employer_name = re.employer_name
        WHERE re.rank > ${offset} AND re.rank <= ${offset + limit}
      )
      SELECT * FROM employer_details
      ORDER BY rank
    `;

    // Execute queries in parallel
    const [countResults, sponsorsResults] = await Promise.all([
      bigquery.query(countQuery),
      bigquery.query(sponsorsQuery),
    ]);

    const totalCount = countResults[0][0]?.total_count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    
    // Process sponsors data
    const sponsors: Sponsor[] = sponsorsResults[0].map((row: any) => ({
      employer_name: row.employer_name,
      total_applications: parseInt(row.total_applications),
      certified_count: parseInt(row.certified_count),
      approval_rate: parseFloat(row.approval_rate) || 0,
      avg_salary: parseInt(row.avg_salary) || 0,
      min_salary: parseInt(row.min_salary) || 0,
      max_salary: parseInt(row.max_salary) || 0,
      top_job_titles: row.top_job_titles || [],
      top_states: row.top_states || [],
      latest_year: parseInt(row.latest_year),
      rank: parseInt(row.rank),
    }));

    const response: PaginatedResponse = {
      sponsors,
      pagination: {
        page,
        limit,
        totalPages,
        totalCount: parseInt(totalCount),
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      metadata: {
        lastUpdated: new Date().toISOString(),
        source: 'BigQuery',
      },
    };

    console.log(`✅ Successfully fetched ${sponsors.length} sponsors for page ${page}`);

    // Check if we're in development mode - Next.js sets this
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                          process.env.VERCEL_ENV === 'development' ||
                          (!process.env.VERCEL_ENV && process.env.NODE_ENV !== 'production');
    
    const cacheControl = isDevelopment
      ? 'no-store, no-cache, must-revalidate'
      : 'public, s-maxage=3600, max-age=3600, stale-while-revalidate=3600';
    
    if (isDevelopment) {
      console.log('🔧 Development mode: Cache disabled');
    }
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': cacheControl,
      },
    });

  } catch (error) {
    console.error('❌ Error fetching sponsors:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch H1B sponsors',
        message: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  }
}