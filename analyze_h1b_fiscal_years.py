
#!/usr/bin/env python3
"""
Analyze BigQuery H1B data to understand fiscal year distribution and mapping.
This script queries the h1b_data.lca_applications table to:
1. Find the actual received_date range
2. Calculate fiscal years (starts in October)
3. Show data distribution by fiscal year
4. Verify availability of fiscal years 2022 and 2023
"""

import os
from google.cloud import bigquery
from google.oauth2 import service_account
from datetime import datetime, date
import pandas as pd

def get_fiscal_year(received_date):
    """
    Calculate fiscal year from received_date.
    Fiscal year starts in October (month 10).
    """
    if received_date.month >= 10:
        return received_date.year + 1
    else:
        return received_date.year

def main():
    # Set up BigQuery client
    service_account_path = "/Users/manthena08/personal-work/docujourney/serviceAccountKey.json"
    project_id = "doctracker-b4528"
    
    if not os.path.exists(service_account_path):
        print(f"Error: Service account key not found at {service_account_path}")
        return
    
    credentials = service_account.Credentials.from_service_account_file(
        service_account_path,
        scopes=["https://www.googleapis.com/auth/cloud-platform"]
    )
    
    client = bigquery.Client(credentials=credentials, project=project_id)
    
    print("Analyzing H1B BigQuery data for fiscal year distribution...")
    print("=" * 60)
    
    # Query 1: Get min/max received_date and total count
    date_range_query = """
    SELECT 
        MIN(received_date) as min_date,
        MAX(received_date) as max_date,
        COUNT(*) as total_records
    FROM `h1b_data.lca_applications`
    WHERE received_date IS NOT NULL
    """
    
    print("1. Overall data range:")
    try:
        date_range_result = client.query(date_range_query).to_dataframe()
        min_date = date_range_result['min_date'].iloc[0]
        max_date = date_range_result['max_date'].iloc[0]
        total_records = date_range_result['total_records'].iloc[0]
        
        print(f"   Min received_date: {min_date}")
        print(f"   Max received_date: {max_date}")
        print(f"   Total records: {total_records:,}")
        
        # Calculate fiscal year range
        min_fiscal_year = get_fiscal_year(min_date)
        max_fiscal_year = get_fiscal_year(max_date)
        print(f"   Fiscal year range: {min_fiscal_year} to {max_fiscal_year}")
        
    except Exception as e:
        print(f"   Error querying date range: {e}")
        return
    
    print()
    
    # Query 2: Get records by fiscal year using BigQuery's fiscal year calculation
    fiscal_year_query = """
    SELECT 
        CASE 
            WHEN EXTRACT(MONTH FROM received_date) >= 10 
            THEN EXTRACT(YEAR FROM received_date) + 1
            ELSE EXTRACT(YEAR FROM received_date)
        END as fiscal_year,
        COUNT(*) as record_count,
        MIN(received_date) as earliest_date,
        MAX(received_date) as latest_date
    FROM `h1b_data.lca_applications`
    WHERE received_date IS NOT NULL
    GROUP BY fiscal_year
    ORDER BY fiscal_year
    """
    
    print("2. Records by fiscal year:")
    try:
        fiscal_year_result = client.query(fiscal_year_query).to_dataframe()
        
        for _, row in fiscal_year_result.iterrows():
            fy = int(row['fiscal_year'])
            count = int(row['record_count'])
            earliest = row['earliest_date']
            latest = row['latest_date']
            print(f"   FY {fy}: {count:,} records ({earliest} to {latest})")
            
    except Exception as e:
        print(f"   Error querying fiscal year data: {e}")
        return
    
    print()
    
    # Query 3: Specific analysis for fiscal years 2022 and 2023
    print("3. Fiscal years 2022 and 2023 analysis:")
    
    # FY 2022: Oct 1, 2021 to Sep 30, 2022
    # FY 2023: Oct 1, 2022 to Sep 30, 2023
    fy_specific_query = """
    SELECT 
        'FY 2022' as fiscal_year_label,
        '2021-10-01 to 2022-09-30' as date_range,
        COUNT(*) as record_count,
        MIN(received_date) as earliest_date,
        MAX(received_date) as latest_date
    FROM `h1b_data.lca_applications`
    WHERE received_date >= '2021-10-01' AND received_date <= '2022-09-30'
    
    UNION ALL
    
    SELECT 
        'FY 2023' as fiscal_year_label,
        '2022-10-01 to 2023-09-30' as date_range,
        COUNT(*) as record_count,
        MIN(received_date) as earliest_date,
        MAX(received_date) as latest_date
    FROM `h1b_data.lca_applications`
    WHERE received_date >= '2022-10-01' AND received_date <= '2023-09-30'
    
    ORDER BY fiscal_year_label
    """
    
    try:
        fy_specific_result = client.query(fy_specific_query).to_dataframe()
        
        for _, row in fy_specific_result.iterrows():
            fy_label = row['fiscal_year_label']
            date_range = row['date_range']
            count = int(row['record_count'])
            earliest = row['earliest_date'] if pd.notna(row['earliest_date']) else 'No data'
            latest = row['latest_date'] if pd.notna(row['latest_date']) else 'No data'
            
            print(f"   {fy_label} ({date_range}):")
            print(f"     Records: {count:,}")
            if count > 0:
                print(f"     Actual date range: {earliest} to {latest}")
            else:
                print(f"     No data available")
            print()
            
    except Exception as e:
        print(f"   Error querying specific fiscal year data: {e}")
        return
    
    # Query 4: Sample of recent data to understand structure
    print("4. Sample of recent data (last 5 records):")
    sample_query = """
    SELECT 
        received_date,
        case_status,
        employer_name,
        job_title,
        worksite_state
    FROM `h1b_data.lca_applications`
    WHERE received_date IS NOT NULL
    ORDER BY received_date DESC
    LIMIT 5
    """
    
    try:
        sample_result = client.query(sample_query).to_dataframe()
        
        for _, row in sample_result.iterrows():
            received_date = row['received_date']
            fiscal_year = get_fiscal_year(received_date)
            print(f"   {received_date} (FY {fiscal_year}) - {row['case_status']} - {row['employer_name']}")
            
    except Exception as e:
        print(f"   Error querying sample data: {e}")
    
    print()
    print("Analysis complete!")
    print()
    print("Summary:")
    print(f"- Data spans from {min_date} to {max_date}")
    print(f"- Fiscal years available: {min_fiscal_year} to {max_fiscal_year}")
    
    # Check if FY 2022 and 2023 have data
    fy_2022_data = fiscal_year_result[fiscal_year_result['fiscal_year'] == 2022]
    fy_2023_data = fiscal_year_result[fiscal_year_result['fiscal_year'] == 2023]
    
    if not fy_2022_data.empty:
        print(f"- FY 2022: {int(fy_2022_data.iloc[0]['record_count']):,} records available")
    else:
        print("- FY 2022: No data available")
        
    if not fy_2023_data.empty:
        print(f"- FY 2023: {int(fy_2023_data.iloc[0]['record_count']):,} records available")
    else:
        print("- FY 2023: No data available")

if __name__ == "__main__":
    main()