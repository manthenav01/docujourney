
import pandas as pd

def clean_column_names(df):
    """Cleans and standardizes the column names of a DataFrame."""
    cols = df.columns
    new_cols = []
    for col in cols:
        new_col = col.lower().replace(' ', '_').replace('(', '').replace(')', '')
        # Specific replacements for employer data to match desired BigQuery schema
        if new_col == 'fiscal_year___':
            new_col = 'fiscalyear'
        if new_col == 'employer_petitioner_name':
            new_col = 'employerpetitionername'
        if new_col == 'tax_id':
            new_col = 'taxid'
        if new_col == 'petitioner_city':
            new_col = 'petitionercity'
        if new_col == 'petitioner_state':
            new_col = 'petitionerstate'
        if new_col == 'petitioner_zip_code':
            new_col = 'petitionerzipcode'
        if new_col == 'initial_approval':
            new_col = 'initialapproval'
        if new_col == 'initial_denial':
            new_col = 'initialdenial'
        if new_col == 'continuing_approval':
            new_col = 'continuingapproval'
        if new_col == 'continuing_denial':
            new_col = 'continuingdenial'

        new_cols.append(new_col)
    df.columns = new_cols
    return df

def normalize_text_columns(df, columns):
    """Normalizes specified text columns to uppercase and strips whitespace."""
    for col in columns:
        if col in df.columns:
            df[col] = df[col].astype(str).str.upper().str.strip()
    return df

def clean_data(df):
    """Applies a series of cleaning steps to the DataFrame."""
    df = clean_column_names(df)
    
    text_cols = ['employer_name', 'employer_city', 'job_title', 'employerpetitionername', 'worksite_city', 'worksite_state']
    df = normalize_text_columns(df, text_cols)

    # Normalize "doing business as" aliases: "X, LLC D/B/A Y" is the same legal
    # entity as "X, LLC". Without this, a company that adds a D/B/A suffix to
    # its filings splits into two employers with nonsense YoY trends.
    if 'employer_name' in df.columns:
        stripped = df['employer_name'].str.replace(
            r'\s+D[./]?B[./]?A\.?\s+.+$', '', regex=True).str.strip()
        # Keep the original if stripping would leave nothing meaningful
        df['employer_name'] = stripped.where(stripped.str.len() >= 3, df['employer_name'])

    # Standardize data types for BigQuery compatibility
    if 'taxid' in df.columns:
        # Convert to string, strip all whitespace, and remove any trailing .0 if it's a number
        df['taxid'] = df['taxid'].astype(str).str.strip().str.replace(r'\.0$', '', regex=True)
    if 'fiscalyear' in df.columns:
        df['fiscalyear'] = pd.to_numeric(df['fiscalyear'], errors='coerce').fillna(0).astype(int) # Convert to int

    # Ensure employerpetitionername is also aggressively cleaned
    if 'employerpetitionername' in df.columns:
        df['employerpetitionername'] = df['employerpetitionername'].astype(str).replace('NAN', '').str.strip()

    # Convert date columns to YYYY-MM-DD format
    date_cols = ['received_date', 'decision_date', 'original_cert_date', 'begin_date', 'end_date']
    for col in date_cols:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors='coerce').dt.strftime('%Y-%m-%d').replace({pd.NaT: None}) # Replace NaT with None for BigQuery NULL

    return df
