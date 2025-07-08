import os
from data_loader import load_csv_data, load_excel_data
from data_cleaner import clean_data
from entity_resolver import resolve_employer_names
from bigquery_uploader import upload_dataframe_to_bigquery
from google.cloud import bigquery

# Configuration
PROJECT_ID = 'doctracker-b4528' # Replace with your Google Cloud Project ID
DATASET_ID = 'h1b_data'

LCA_FILE_PATH = '/Users/manthena08/personal-work/docujourney/scripts/data/2025-q2/LCA_Disclosure_Data_FY2025_Q2.xlsx'
EMPLOYER_FILE_PATH = '/Users/manthena08/personal-work/docujourney/scripts/data/2025-q2/Employer Information.xlsx'
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

def run_pipeline():
    print("Starting data pipeline...")

    # --- 1. Load Data ---
    print("Loading LCA data...")
    lca_df = load_excel_data(LCA_FILE_PATH)
    if lca_df is None:
        print("LCA data loading failed. Exiting.")
        return
    print(f"LCA data loaded: {len(lca_df)} rows.")

    print("Loading Employer data...")
    employer_df = load_excel_data(EMPLOYER_FILE_PATH)
    if employer_df is None:
        print("Employer data loading failed. Exiting.")
        return
    print(f"Employer data loaded: {len(employer_df)} rows.")

    # --- 2. Clean Data ---
    print("Cleaning LCA data...")
    lca_df = clean_data(lca_df)
    print("Cleaning Employer data...")
    employer_df = clean_data(employer_df)

    # --- 3. Resolve Employer Names ---
    print("Resolving employer names in LCA data...")
    lca_df = resolve_employer_names(lca_df, CANONICAL_MAP_PATH)
    print("Resolving employer names in Employer data...")
    employer_df = resolve_employer_names(employer_df, CANONICAL_MAP_PATH)

    # --- 4. Upload to BigQuery ---
    print("Uploading cleaned LCA data to BigQuery...")
    lca_upload_success = upload_dataframe_to_bigquery(
        lca_df,
        PROJECT_ID,
        DATASET_ID,
        'lca_applications',
        os.path.join(os.path.dirname(__file__), '../', 'serviceAccountKey.json'),
        schema=lca_schema,
        unique_id_columns=['case_number']
    )
    if not lca_upload_success:
        print("LCA data upload failed. Exiting.")
        return

    print("Uploading cleaned Employer data to BigQuery...")
    employer_upload_success = upload_dataframe_to_bigquery(
        employer_df,
        PROJECT_ID,
        DATASET_ID,
        'employers',
        os.path.join(os.path.dirname(__file__), '..', 'serviceAccountKey.json'),
        schema=employer_schema,
        unique_id_columns=['fiscalyear', 'employerpetitionername', 'taxid']
    )
    if not employer_upload_success:
        print("Employer data upload failed. Exiting.")
        return

    print("Data pipeline completed successfully!")

if __name__ == "__main__":
    run_pipeline()