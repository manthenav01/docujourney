import os
import sys
import argparse
import glob
import pandas as pd
from pathlib import Path
from data_loader import load_csv_data, load_excel_data
from data_cleaner import clean_data
from entity_resolver import resolve_employer_names
from bigquery_uploader import upload_dataframe_to_bigquery
from google.cloud import bigquery

# Configuration
PROJECT_ID = 'doctracker-b4528'
DATASET_ID = 'h1b_data'
BASE_DATA_PATH = '/Users/manthena08/personal-work/docujourney/scripts/data'
CANONICAL_MAP_PATH = '/Users/manthena08/personal-work/docujourney/scripts/config/canonical_employer_map.csv'

# Define BigQuery Schemas
lca_schema = [
    bigquery.SchemaField("case_number", "STRING"),
    bigquery.SchemaField("case_status", "STRING"),
    bigquery.SchemaField("received_date", "DATE"),
    bigquery.SchemaField("decision_date", "DATE"),
    bigquery.SchemaField("original_cert_date", "DATE"),
    bigquery.SchemaField("visa_class", "STRING"),
    bigquery.SchemaField("job_title", "STRING"),
    bigquery.SchemaField("soc_code", "STRING"),
    bigquery.SchemaField("soc_title", "STRING"),
    bigquery.SchemaField("full_time_position", "BOOLEAN"),
    bigquery.SchemaField("begin_date", "DATE"),
    bigquery.SchemaField("end_date", "DATE"),
    bigquery.SchemaField("total_worker_positions", "INTEGER"),
    bigquery.SchemaField("new_employment", "STRING"),
    bigquery.SchemaField("continued_employment", "STRING"),
    bigquery.SchemaField("change_previous_employment", "STRING"),
    bigquery.SchemaField("new_concurrent_employment", "STRING"),
    bigquery.SchemaField("change_employer", "STRING"),
    bigquery.SchemaField("amended_petition", "STRING"),
    bigquery.SchemaField("employer_name", "STRING"),
    bigquery.SchemaField("trade_name_dba", "STRING"),
    bigquery.SchemaField("employer_address1", "STRING"),
    bigquery.SchemaField("employer_address2", "STRING"),
    bigquery.SchemaField("employer_city", "STRING"),
    bigquery.SchemaField("employer_state", "STRING"),
    bigquery.SchemaField("employer_postal_code", "STRING"),
    bigquery.SchemaField("employer_country", "STRING"),
    bigquery.SchemaField("employer_province", "STRING"),
    bigquery.SchemaField("employer_phone", "STRING"),
    bigquery.SchemaField("employer_phone_ext", "STRING"),
    bigquery.SchemaField("employer_fein", "STRING"),
    bigquery.SchemaField("naics_code", "STRING"),
    bigquery.SchemaField("employer_poc_last_name", "STRING"),
    bigquery.SchemaField("employer_poc_first_name", "STRING"),
    bigquery.SchemaField("employer_poc_middle_name", "STRING"),
    bigquery.SchemaField("employer_poc_job_title", "STRING"),
    bigquery.SchemaField("employer_poc_address1", "STRING"),
    bigquery.SchemaField("employer_poc_address2", "STRING"),
    bigquery.SchemaField("employer_poc_city", "STRING"),
    bigquery.SchemaField("employer_poc_state", "STRING"),
    bigquery.SchemaField("employer_poc_postal_code", "STRING"),
    bigquery.SchemaField("employer_poc_country", "STRING"),
    bigquery.SchemaField("employer_poc_province", "STRING"),
    bigquery.SchemaField("employer_poc_phone", "STRING"),
    bigquery.SchemaField("employer_poc_phone_ext", "STRING"),
    bigquery.SchemaField("employer_poc_email", "STRING"),
    bigquery.SchemaField("agent_representing_employer", "STRING"),
    bigquery.SchemaField("agent_attorney_last_name", "STRING"),
    bigquery.SchemaField("agent_attorney_first_name", "STRING"),
    bigquery.SchemaField("agent_attorney_middle_name", "STRING"),
    bigquery.SchemaField("agent_attorney_address1", "STRING"),
    bigquery.SchemaField("agent_attorney_address2", "STRING"),
    bigquery.SchemaField("agent_attorney_city", "STRING"),
    bigquery.SchemaField("agent_attorney_state", "STRING"),
    bigquery.SchemaField("agent_attorney_postal_code", "STRING"),
    bigquery.SchemaField("agent_attorney_country", "STRING"),
    bigquery.SchemaField("agent_attorney_province", "STRING"),
    bigquery.SchemaField("agent_attorney_phone", "STRING"),
    bigquery.SchemaField("agent_attorney_phone_ext", "STRING"),
    bigquery.SchemaField("agent_attorney_email_address", "STRING"),
    bigquery.SchemaField("lawfirm_name_business_name", "STRING"),
    bigquery.SchemaField("state_of_highest_court", "STRING"),
    bigquery.SchemaField("name_of_highest_state_court", "STRING"),
    bigquery.SchemaField("worksite_workers", "INTEGER"),
    bigquery.SchemaField("secondary_entity", "STRING"),
    bigquery.SchemaField("secondary_entity_business_name", "STRING"),
    bigquery.SchemaField("worksite_address1", "STRING"),
    bigquery.SchemaField("worksite_address2", "STRING"),
    bigquery.SchemaField("worksite_city", "STRING"),
    bigquery.SchemaField("worksite_county", "STRING"),
    bigquery.SchemaField("worksite_state", "STRING"),
    bigquery.SchemaField("worksite_postal_code", "STRING"),
    bigquery.SchemaField("wage_rate_of_pay_from", "FLOAT"),
    bigquery.SchemaField("wage_rate_of_pay_to", "FLOAT"),
    bigquery.SchemaField("wage_unit_of_pay", "STRING"),
    bigquery.SchemaField("prevailing_wage", "FLOAT"),
    bigquery.SchemaField("pw_unit_of_pay", "STRING"),
    bigquery.SchemaField("pw_tracking_number", "STRING"),
    bigquery.SchemaField("pw_wage_level", "STRING"),
    bigquery.SchemaField("pw_oes_year", "STRING"),
    bigquery.SchemaField("pw_other_source", "STRING"),
    bigquery.SchemaField("pw_other_year", "STRING"),
    bigquery.SchemaField("pw_survey_publisher", "STRING"),
    bigquery.SchemaField("pw_survey_name", "STRING"),
    bigquery.SchemaField("total_worksite_locations", "INTEGER"),
    bigquery.SchemaField("agree_to_lc_statement", "STRING"),
    bigquery.SchemaField("h_1b_dependent", "BOOLEAN"),
    bigquery.SchemaField("willful_violator", "BOOLEAN"),
    bigquery.SchemaField("support_h1b", "STRING"),
    bigquery.SchemaField("statutory_basis", "STRING"),
    bigquery.SchemaField("appendix_a_attached", "STRING"),
    bigquery.SchemaField("public_disclosure", "STRING"),
    bigquery.SchemaField("preparer_last_name", "STRING"),
    bigquery.SchemaField("preparer_first_name", "STRING"),
    bigquery.SchemaField("preparer_middle_initial", "STRING"),
    bigquery.SchemaField("preparer_business_name", "STRING"),
    bigquery.SchemaField("preparer_email", "STRING"),
]

employer_schema = [
    bigquery.SchemaField("line_by_line", "INTEGER"),
    bigquery.SchemaField("fiscalyear", "INTEGER"),
    bigquery.SchemaField("employerpetitionername", "STRING"),
    bigquery.SchemaField("taxid", "STRING"),
    bigquery.SchemaField("industry_naics_code", "STRING"),
    bigquery.SchemaField("petitionercity", "STRING"),
    bigquery.SchemaField("petitionerstate", "STRING"),
    bigquery.SchemaField("petitionerzipcode", "STRING"),
    bigquery.SchemaField("initialapproval", "INTEGER"),
    bigquery.SchemaField("initialdenial", "INTEGER"),
    bigquery.SchemaField("continuingapproval", "INTEGER"),
    bigquery.SchemaField("continuingdenial", "INTEGER"),
]

def clean_column_names(df):
    """Clean column names: remove spaces, convert to lowercase"""
    df.columns = df.columns.str.replace(' ', '').str.lower()
    return df

def validate_and_clean_dataframe(df, unique_id_column, data_type):
    """Validate and clean dataframe with unique ID validation"""
    print(f"Cleaning {data_type} data...")
    initial_count = len(df)
    
    if unique_id_column in df.columns:
        # Remove rows with null or empty unique ID
        df = df.dropna(subset=[unique_id_column])
        df = df[df[unique_id_column].astype(str).str.strip() != '']
        df = df[df[unique_id_column].astype(str).str.strip() != 'nan']
        # Convert to string and clean
        df[unique_id_column] = df[unique_id_column].astype(str).str.strip()
        
        # Remove duplicates
        duplicates = df[unique_id_column].duplicated().sum()
        if duplicates > 0:
            print(f"  Found {duplicates} duplicate {unique_id_column}s - removing...")
            df = df.drop_duplicates(subset=[unique_id_column], keep='first')
    
    final_count = len(df)
    print(f"  {data_type}: {initial_count} → {final_count} rows (removed {initial_count - final_count} invalid records)")
    return df

def discover_files(year_folder):
    """Discover LCA and Employer files in the specified year folder"""
    base_path = Path(BASE_DATA_PATH) / year_folder
    if not base_path.exists():
        print(f"Error: Folder {base_path} does not exist")
        return [], []
    
    # Find LCA files (usually contain 'LCA_Disclosure')
    lca_files = list(base_path.glob('*LCA*.xlsx')) + list(base_path.glob('*LCA*.csv'))
    
    # Find Employer files (usually contain 'Employer')
    employer_files = list(base_path.glob('*Employer*.xlsx')) + list(base_path.glob('*Employer*.csv'))
    
    return lca_files, employer_files

def process_lca_file(file_path):
    """Process a single LCA file"""
    print(f"\n--- Processing LCA file: {file_path.name} ---")
    
    # Load data
    if file_path.suffix.lower() == '.xlsx':
        df = load_excel_data(str(file_path))
    else:
        df = load_csv_data(str(file_path))
    
    if df is None:
        print(f"Failed to load {file_path}")
        return None
    
    print(f"Loaded: {len(df)} rows")
    
    # Clean column names
    df = clean_column_names(df)
    
    # Use all columns from BigQuery schema
    lca_columns = [field.name for field in lca_schema]
    
    available_columns = [col for col in lca_columns if col in df.columns]
    df = df[available_columns]
    print(f"Using {len(available_columns)} columns")
    
    # Validate and clean
    df = validate_and_clean_dataframe(df, 'case_number', 'LCA')
    
    # Clean data
    df = clean_data(df)
    
    # Resolve employer names
    df = resolve_employer_names(df, CANONICAL_MAP_PATH)
    
    return df

def process_employer_file(file_path):
    """Process a single Employer file"""
    print(f"\n--- Processing Employer file: {file_path.name} ---")
    
    # Load data
    if file_path.suffix.lower() == '.xlsx':
        df = load_excel_data(str(file_path))
    else:
        df = load_csv_data(str(file_path))
    
    if df is None:
        print(f"Failed to load {file_path}")
        return None
    
    print(f"Loaded: {len(df)} rows")
    
    # Clean column names
    df = clean_column_names(df)
    
    # Filter relevant columns
    employer_columns = ['fiscalyear', 'employer(petitioner)name', 'taxid', 'industry(naics)code', 
                       'petitionercity', 'petitionerstate', 'petitionerzipcode', 'initialapproval', 
                       'initialdenial', 'continuingapproval', 'continuingdenial']
    
    available_columns = [col for col in employer_columns if col in df.columns]
    df = df[available_columns]
    print(f"Using {len(available_columns)} columns")
    
    # Validate and clean
    df = validate_and_clean_dataframe(df, 'taxid', 'Employer')
    
    # Clean data
    df = clean_data(df)
    
    # Resolve employer names
    df = resolve_employer_names(df, CANONICAL_MAP_PATH)
    
    return df

def run_pipeline(year_folder=None, specific_files=None, upload_to_bigquery=True):
    """Enhanced data pipeline with flexible file processing"""
    print("🚀 Starting Enhanced Data Pipeline...")
    
    lca_dataframes = []
    employer_dataframes = []
    
    if specific_files:
        # Process specific files
        print(f"\nProcessing specific files: {specific_files}")
        for file_path in specific_files:
            path = Path(file_path)
            if not path.exists():
                print(f"Warning: File {file_path} does not exist")
                continue
            
            if 'lca' in path.name.lower():
                df = process_lca_file(path)
                if df is not None:
                    lca_dataframes.append(df)
            elif 'employer' in path.name.lower():
                df = process_employer_file(path)
                if df is not None:
                    employer_dataframes.append(df)
    
    elif year_folder:
        # Discover and process files in year folder
        print(f"\nDiscovering files in folder: {year_folder}")
        lca_files, employer_files = discover_files(year_folder)
        
        print(f"Found {len(lca_files)} LCA files and {len(employer_files)} Employer files")
        
        # Process LCA files
        for file_path in lca_files:
            df = process_lca_file(file_path)
            if df is not None:
                lca_dataframes.append(df)
        
        # Process Employer files
        for file_path in employer_files:
            df = process_employer_file(file_path)
            if df is not None:
                employer_dataframes.append(df)
    
    else:
        print("Error: No files specified. Use --year-folder or --files")
        return False
    
    # Combine dataframes
    print("\n--- Combining Data ---")
    
    combined_lca_df = None
    if lca_dataframes:
        combined_lca_df = pd.concat(lca_dataframes, ignore_index=True)
        print(f"Combined LCA data: {len(combined_lca_df)} rows")
        
        # Remove duplicates across files
        if 'case_number' in combined_lca_df.columns:
            duplicates = combined_lca_df['case_number'].duplicated().sum()
            if duplicates > 0:
                print(f"Removing {duplicates} cross-file LCA duplicates...")
                combined_lca_df = combined_lca_df.drop_duplicates(subset=['case_number'], keep='first')
                print(f"Final LCA data: {len(combined_lca_df)} rows")
    
    combined_employer_df = None
    if employer_dataframes:
        combined_employer_df = pd.concat(employer_dataframes, ignore_index=True)
        print(f"Combined Employer data: {len(combined_employer_df)} rows")
        
        # Remove duplicates across files
        if 'taxid' in combined_employer_df.columns:
            duplicates = combined_employer_df['taxid'].duplicated().sum()
            if duplicates > 0:
                print(f"Removing {duplicates} cross-file Employer duplicates...")
                combined_employer_df = combined_employer_df.drop_duplicates(subset=['taxid'], keep='first')
                print(f"Final Employer data: {len(combined_employer_df)} rows")
    
    # Upload to BigQuery if requested
    if upload_to_bigquery:
        print("\n--- Uploading to BigQuery ---")
        service_account_path = os.path.join(os.path.dirname(__file__), '..', 'serviceAccountKey.json')
        
        if combined_lca_df is not None:
            print("Uploading LCA data...")
            lca_success = upload_dataframe_to_bigquery(
                combined_lca_df,
                PROJECT_ID,
                DATASET_ID,
                'lca_applications',
                service_account_path,
                schema=lca_schema,
                unique_id_columns=['case_number']
            )
            if not lca_success:
                print("LCA upload failed")
                return False
        
        if combined_employer_df is not None:
            print("Uploading Employer data...")
            employer_success = upload_dataframe_to_bigquery(
                combined_employer_df,
                PROJECT_ID,
                DATASET_ID,
                'employers',
                service_account_path,
                schema=employer_schema,
                unique_id_columns=['fiscalyear', 'employerpetitionername', 'taxid']
            )
            if not employer_success:
                print("Employer upload failed")
                return False
    
    print("\n🎉 Data pipeline completed successfully!")
    return True

def main():
    parser = argparse.ArgumentParser(description='Enhanced H1B Data Pipeline')
    
    # Mutually exclusive group for input method
    input_group = parser.add_mutually_exclusive_group(required=True)
    input_group.add_argument('--year-folder', type=str, 
                           help='Year folder to process (e.g., "2024", "2025-q2")')
    input_group.add_argument('--files', nargs='+', 
                           help='Specific files to process')
    
    parser.add_argument('--no-upload', action='store_true',
                       help='Skip BigQuery upload (useful for testing)')
    
    parser.add_argument('--list-files', action='store_true',
                       help='List available files in data directory')
    
    args = parser.parse_args()
    
    if args.list_files:
        print("Available data folders:")
        data_path = Path(BASE_DATA_PATH)
        for folder in data_path.iterdir():
            if folder.is_dir():
                print(f"  📁 {folder.name}")
                lca_files, employer_files = discover_files(folder.name)
                for lca_file in lca_files:
                    print(f"    📄 {lca_file.name}")
                for emp_file in employer_files:
                    print(f"    📄 {emp_file.name}")
        return
    
    # Run pipeline
    success = run_pipeline(
        year_folder=args.year_folder,
        specific_files=args.files,
        upload_to_bigquery=not args.no_upload
    )
    
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()