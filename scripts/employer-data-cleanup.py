import pandas as pd

# Load datasets
print("Loading LCA data...")
lca_data = pd.read_excel('scripts/data/h1b/2025/LCA_Disclosure_Data_FY2025_Q2.xlsx')
print(f"LCA data loaded: {len(lca_data)} rows")

print("Loading Worksite data...")
worksite_data = pd.read_excel('scripts/data/h1b/2025/LCA_Worksites_FY2025_Q2.xlsx')
print(f"Worksite data loaded: {len(worksite_data)} rows")

print("Loading Employer data...")
employer_data = pd.read_excel('scripts/data/h1b/2025/Employer Information.xlsx')
print(f"Employer data loaded: {len(employer_data)} rows")

# Debug: Print column names to see what's available
print("\nOriginal column names:")
print("LCA columns:", lca_data.columns.tolist())
print("Worksite columns:", worksite_data.columns.tolist())
print("Employer columns:", employer_data.columns.tolist())

# Clean column names: remove spaces, convert to lowercase
print("\nCleaning column names...")
lca_data.columns = lca_data.columns.str.replace(' ', '').str.lower()
worksite_data.columns = worksite_data.columns.str.replace(' ', '').str.lower()
employer_data.columns = employer_data.columns.str.replace(' ', '').str.lower()

print("\nCleaned column names:")
print("LCA columns:", lca_data.columns.tolist())
print("Worksite columns:", worksite_data.columns.tolist())
print("Employer columns:", employer_data.columns.tolist())


# # Try different encodings for the CSV file
# try:
#     employer_data = pd.read_csv('scripts/data/h1b/2025/Employer Information.csv', 
#                                encoding='utf-8', 
#                                on_bad_lines='skip',
#                                sep=',',
#                                quotechar='"')
# except UnicodeDecodeError:
#     try:
#         employer_data = pd.read_csv('scripts/data/h1b/2025/Employer Information.csv', 
#                                    encoding='latin-1',
#                                    on_bad_lines='skip',
#                                    sep=',',
#                                    quotechar='"')
#     except UnicodeDecodeError:
#         employer_data = pd.read_csv('scripts/data/h1b/2025/Employer Information.csv', 
#                                    encoding='cp1252',
#                                    on_bad_lines='skip',
#                                    sep=',',
#                                    quotechar='"')

# Select relevant columns (normalized: no spaces, lowercase)
print("\nFiltering columns...")
lca_columns = ['case_number', 'case_status', 'received_date', 'decision_date', 'visa_class', 'job_title', 'soc_code', 'soc_title', 'full_time_position', 'begin_date', 'end_date', 'total_worker_positions', 'employer_name', 'employer_city', 'employer_state', 'employer_postal_code', 'employer_fein', 'naics_code', 'wage_rate_of_pay_from', 'wage_rate_of_pay_to', 'wage_unit_of_pay', 'prevailing_wage', 'pw_unit_of_pay', 'pw_oes_year', 'h_1b_dependent', 'willful_violator']
worksite_columns = ['case_number', 'worksite_workers', 'secondary_entity', 'secondary_entity_business_name', 'worksite_address1', 'worksite_city', 'worksite_state', 'worksite_postal_code', 'wage_rate_of_pay_from', 'wage_rate_of_pay_to', 'wage_unit_of_pay', 'prevailing_wage', 'pw_unit_of_pay', 'pw_oes_year']
employer_columns = ['fiscalyear', 'employer(petitioner)name', 'taxid', 'industry(naics)code', 'petitionercity', 'petitionerstate', 'petitionerzipcode', 'initialapproval', 'initialdenial', 'continuingapproval', 'continuingdenial']

# Filter columns if they exist
print("Filtering LCA columns...")
available_lca_columns = [col for col in lca_columns if col in lca_data.columns]
lca_data = lca_data[available_lca_columns]
print(f"Using {len(available_lca_columns)} LCA columns")

print("Filtering Worksite columns...")
available_worksite_columns = [col for col in worksite_columns if col in worksite_data.columns]
worksite_data = worksite_data[available_worksite_columns]
print(f"Using {len(available_worksite_columns)} Worksite columns")

print("Filtering Employer columns...")
available_employer_columns = [col for col in employer_columns if col in employer_data.columns]
employer_data = employer_data[available_employer_columns]
print(f"Using {len(available_employer_columns)} Employer columns")

# Clean up data and ensure unique ID fields are valid
print("\n=== Data Validation and Cleanup ===")

# Clean LCA data - ensure case_number exists and is valid
if 'case_number' in lca_data.columns:
    print("Cleaning LCA case_number...")
    initial_lca_count = len(lca_data)
    # Remove rows with null or empty case_number
    lca_data = lca_data.dropna(subset=['case_number'])
    lca_data = lca_data[lca_data['case_number'].astype(str).str.strip() != '']
    lca_data = lca_data[lca_data['case_number'].astype(str).str.strip() != 'nan']
    # Convert to string and remove any invalid characters for Firestore document IDs
    lca_data['case_number'] = lca_data['case_number'].astype(str).str.strip()
    final_lca_count = len(lca_data)
    print(f"  LCA: {initial_lca_count} → {final_lca_count} rows (removed {initial_lca_count - final_lca_count} invalid case_numbers)")

# Clean Worksite data - ensure case_number exists and is valid
if 'case_number' in worksite_data.columns:
    print("Cleaning Worksite case_number...")
    initial_worksite_count = len(worksite_data)
    # Remove rows with null or empty case_number
    worksite_data = worksite_data.dropna(subset=['case_number'])
    worksite_data = worksite_data[worksite_data['case_number'].astype(str).str.strip() != '']
    worksite_data = worksite_data[worksite_data['case_number'].astype(str).str.strip() != 'nan']
    # Convert to string and remove any invalid characters for Firestore document IDs
    worksite_data['case_number'] = worksite_data['case_number'].astype(str).str.strip()
    final_worksite_count = len(worksite_data)
    print(f"  Worksite: {initial_worksite_count} → {final_worksite_count} rows (removed {initial_worksite_count - final_worksite_count} invalid case_numbers)")

# Clean Employer data - ensure taxid exists and is valid
if 'taxid' in employer_data.columns:
    print("Cleaning Employer taxid...")
    initial_employer_count = len(employer_data)
    # Remove rows with null or empty taxid
    employer_data = employer_data.dropna(subset=['taxid'])
    employer_data = employer_data[employer_data['taxid'].astype(str).str.strip() != '']
    employer_data = employer_data[employer_data['taxid'].astype(str).str.strip() != 'nan']
    # Convert to string and remove any invalid characters for Firestore document IDs
    employer_data['taxid'] = employer_data['taxid'].astype(str).str.strip()
    final_employer_count = len(employer_data)
    print(f"  Employer: {initial_employer_count} → {final_employer_count} rows (removed {initial_employer_count - final_employer_count} invalid taxids)")

# Additional data quality checks
print("\n=== Additional Data Quality Checks ===")

# Check for duplicate IDs
if 'case_number' in lca_data.columns:
    lca_duplicates = lca_data['case_number'].duplicated().sum()
    if lca_duplicates > 0:
        print(f"  Found {lca_duplicates} duplicate case_numbers in LCA data - removing duplicates...")
        lca_data = lca_data.drop_duplicates(subset=['case_number'], keep='first')

if 'taxid' in employer_data.columns:
    employer_duplicates = employer_data['taxid'].duplicated().sum()
    if employer_duplicates > 0:
        print(f"  Found {employer_duplicates} duplicate taxids in Employer data - removing duplicates...")
        employer_data = employer_data.drop_duplicates(subset=['taxid'], keep='first')

print("✓ Data validation and cleanup completed")

# Create output directory if it doesn't exist
import os
print("\nCreating output directory...")
os.makedirs('scripts/data/h1b/2025/cleanup', exist_ok=True)

# Save cleaned CSVs
print("Saving cleaned LCA data...")
lca_data.to_csv('scripts/data/h1b/2025/cleanup/cleaned_lca.csv', index=False)
print("✓ LCA data saved")

print("Saving cleaned Worksite data...")
worksite_data.to_csv('scripts/data/h1b/2025/cleanup/cleaned_worksites.csv', index=False)
print("✓ Worksite data saved")

print("Saving cleaned Employer data...")
employer_data.to_csv('scripts/data/h1b/2025/cleanup/cleaned_employers.csv', index=False)
print("✓ Employer data saved")

print("\n🎉 Data cleanup completed successfully!")
print(f"Output files saved in: scripts/data/h1b/2025/cleanup/")