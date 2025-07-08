
from google.cloud import bigquery
from google.oauth2 import service_account
import pandas as pd

def upload_dataframe_to_bigquery(df, project_id, dataset_id, table_id, key_file_path, schema=None, unique_id_columns=None):
    """Uploads a pandas DataFrame to a BigQuery table, with deduplication based on unique_id_columns."""
    credentials = service_account.Credentials.from_service_account_file(key_file_path)
    client = bigquery.Client(project=project_id, credentials=credentials)
    table_ref = client.dataset(dataset_id).table(table_id)

    df_to_upload = df.copy() # Work on a copy to avoid modifying original DataFrame

    if unique_id_columns and not df.empty:
        new_ids = None # Initialize new_ids
        try:
            # Check if table exists before querying
            client.get_table(table_ref) 
            
            print(f"Checking for existing records in {dataset_id}.{table_id}...")
            # Construct query to get existing unique IDs
            unique_cols_str = ', '.join(unique_id_columns)
            query = f"SELECT {unique_cols_str} FROM `{project_id}.{dataset_id}.{table_id}`"
            
            existing_ids_df = client.query(query).to_dataframe()
            
            # Ensure consistent representation of unique ID columns for comparison
            for col in unique_id_columns:
                existing_ids_df[col] = existing_ids_df[col].astype(str).replace('None', '').replace('nan', '').str.strip()
                df[col] = df[col].astype(str).replace('None', '').replace('nan', '').str.strip()

            # Create a tuple for each unique ID combination for efficient comparison
            existing_ids_set = set(tuple(row) for row in existing_ids_df[unique_id_columns].values)
            incoming_ids_set = set(tuple(row) for row in df[unique_id_columns].values)

            # Identify new records
            new_ids = incoming_ids_set - existing_ids_set
            
            if not new_ids:
                print(f"No new unique records found for {dataset_id}.{table_id}. Skipping upload.")
                return True

            # Filter DataFrame to only include new records
            df_to_upload = df[df[unique_id_columns].apply(tuple, axis=1).isin(new_ids)]
            
            if df_to_upload.empty:
                print(f"All incoming records for {dataset_id}.{table_id} are duplicates. Skipping upload.")
                return True
            
            print(f"Found {len(df_to_upload)} new unique records to upload to {dataset_id}.{table_id}.")

        except Exception as e:
            # If table doesn't exist or other query error, proceed with full upload
            print(f"Warning: Could not check for existing records in {dataset_id}.{table_id} ({e}). Attempting full upload.")
            df_to_upload = df.copy() # Ensure df_to_upload is the full DataFrame

    job_config = bigquery.LoadJobConfig(
        source_format=bigquery.SourceFormat.CSV, # Assuming CSV-like data from DataFrame
        write_disposition=bigquery.WriteDisposition.WRITE_APPEND, # Append to existing table
    )

    if schema:
        job_config.schema = schema
        job_config.autodetect = False # Use provided schema if available
    else:
        job_config.autodetect = True # Autodetect if no schema is provided

    try:
        job = client.load_table_from_dataframe(df_to_upload, table_ref, job_config=job_config)
        job.result()  # Waits for the job to complete.
        print(f"Loaded {job.output_rows} rows into {dataset_id}.{table_id}")
        return True
    except Exception as e:
        print(f"Error uploading data to BigQuery table {dataset_id}.{table_id}: {e}")
        return False
