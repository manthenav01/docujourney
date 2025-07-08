
import { NextRequest, NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';

const bigquery = new BigQuery({
    keyFilename: 'serviceAccountKey.json',
    projectId: 'doctracker-b4528',
});

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year') || '2025';
    const quarter = searchParams.get('quarter') || '1';
    const topN = parseInt(searchParams.get('topN') || '10', 10);
    const filterType = searchParams.get('filterType') || 'employer_name';

    const getQuarterDateRange = (year: string, quarter: string) => {
        const yearNum = parseInt(year, 10);
        const quarterNum = parseInt(quarter, 10);
        const startDate = new Date(yearNum, (quarterNum - 1) * 3, 1);
        const endDate = new Date(yearNum, quarterNum * 3, 0);
        return {
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0],
        };
    };

    const { start, end } = getQuarterDateRange(year, quarter);

    try {
        const allowedFilterTypes = ['employer_name', 'job_title'];
        if (!allowedFilterTypes.includes(filterType)) {
            return NextResponse.json({ error: 'Invalid filter type' }, { status: 400 });
        }

        // Top Employers/Job Titles Query
        const topQuery = `
            SELECT
                ${filterType} as name,
                COUNT(*) as count
            FROM
                \`doctracker-b4528.h1b_data.lca_applications\`
            WHERE
                received_date BETWEEN @start_date AND @end_date
            GROUP BY
                name
            ORDER BY
                count DESC
            LIMIT @limit
        `;

        const topOptions = {
            query: topQuery,
            location: 'US',
            params: {
                start_date: start,
                end_date: end,
                limit: topN
            },
        };

        const [topEmployers] = await bigquery.query(topOptions);

        // Case Status Trend Query
        const caseStatusQuery = `
            SELECT
                FORMAT_DATE('%Y-%m', received_date) as month,
                case_status,
                COUNT(*) as count
            FROM
                \`doctracker-b4528.h1b_data.lca_applications\`
            WHERE
                received_date BETWEEN @start_date AND @end_date
            GROUP BY
                month, case_status
            ORDER BY
                month
        `;

        const caseStatusOptions = {
            query: caseStatusQuery,
            location: 'US',
            params: {
                start_date: start,
                end_date: end
            },
        };

        const [caseStatusResult] = await bigquery.query(caseStatusOptions);

        // Process case status data
        const caseStatusData = caseStatusResult.reduce((acc, row) => {
            const { month, case_status, count } = row;
            if (!acc[month]) {
                acc[month] = { month };
            }
            acc[month][case_status] = count;
            return acc;
        }, {});

        return NextResponse.json({ topEmployers, caseStatusData: Object.values(caseStatusData) });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch data from BigQuery' }, { status: 500 });
    }
}
