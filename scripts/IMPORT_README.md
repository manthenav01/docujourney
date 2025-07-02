# Batch Import Script

This script allows you to batch import CSV data into your Firebase Firestore database. It's designed to handle large datasets efficiently using Firestore batch operations.

## Prerequisites

1. Make sure you have the Firebase service account key file (`serviceAccountKey.json`) in the project root
2. Alternatively, set the `FIREBASE_SERVICE_ACCOUNT_PATH` environment variable to point to your service account key file
3. Ensure your CSV files are properly formatted and placed in the `scripts/data/` directory

## Expected CSV Files

The script expects the following CSV files in the `scripts/data/` directory:

- `cleaned_employers.csv` - Contains employer data
- `cleaned_lca.csv` - Contains job/LCA data  
- `cleaned_worksites.csv` - Contains worksite data

## Usage

### Import All Data
```bash
npm run import:data
```
or
```bash
node scripts/batch-import.js
```

### Import Specific Collections

#### Import only employers:
```bash
npm run import:employers
```

#### Import only jobs:
```bash
npm run import:jobs
```

#### Import only worksites:
```bash
npm run import:worksites
```

## CSV Column Mapping

### Employers CSV (`cleaned_employers.csv`)
- `Tax ID` → Document ID
- `Employer (Petitioner) Name` → name
- `Petitioner City` → city
- `Petitioner State` → state
- `Petitioner Zip Code` → postal_code
- `Industry (NAICS) Code` → naics_code
- `Initial Approval` → initial_approvals (integer)
- `Initial Denial` → initial_denials (integer)
- `Continuing Approval` → continuing_approvals (integer)
- `Continuing Denial` → continuing_denials (integer)

### Jobs CSV (`cleaned_lca.csv`)
- `CASE_NUMBER` → Document ID
- `EMPLOYER_FEIN` → employer_fein
- `EMPLOYER_NAME` → employer_name
- `VISA_CLASS` → visa_class
- `JOB_TITLE` → job_title
- `SOC_CODE` → soc_code
- `SOC_TITLE` → soc_title
- `FULL_TIME_POSITION` → full_time_position
- `CASE_STATUS` → case_status
- `RECEIVED_DATE` → received_date (Firestore Timestamp)
- `DECISION_DATE` → decision_date (Firestore Timestamp)
- `BEGIN_DATE` → begin_date (Firestore Timestamp)
- `END_DATE` → end_date (Firestore Timestamp)
- `TOTAL_WORKER_POSITIONS` → total_worker_positions (integer)
- `WAGE_RATE_OF_PAY_FROM` → wage_rate_from (float)
- `WAGE_RATE_OF_PAY_TO` → wage_rate_to (float)
- `WAGE_UNIT_OF_PAY` → wage_unit
- `PREVAILING_WAGE` → prevailing_wage (float)
- `PW_UNIT_OF_PAY` → pw_unit
- `PW_OES_YEAR` → pw_oes_year (integer)
- `H_1B_DEPENDENT` → h1b_dependent
- `WILLFUL_VIOLATOR` → willful_violator

### Worksites CSV (`cleaned_worksites.csv`)
- `CASE_NUMBER` → case_number (reference to job)
- `WORKSITE_WORKERS` → workers (integer)
- `SECONDARY_ENTITY` → secondary_entity
- `SECONDARY_ENTITY_BUSINESS_NAME` → secondary_entity_name
- `WORKSITE_ADDRESS1` → address1
- `WORKSITE_CITY` → city
- `WORKSITE_STATE` → state
- `WORKSITE_POSTAL_CODE` → postal_code
- `WAGE_RATE_OF_PAY_FROM` → wage_rate_from (float)
- `WAGE_RATE_OF_PAY_TO` → wage_rate_to (float)
- `WAGE_UNIT_OF_PAY` → wage_unit
- `PREVAILING_WAGE` → prevailing_wage (float)
- `PW_UNIT_OF_PAY` → pw_unit
- `PW_OES_YEAR` → pw_oes_year (integer)

## Features

- **Batch Processing**: Uses Firestore batch operations (max 500 operations per batch) for efficient writes
- **Error Handling**: Comprehensive error handling and logging
- **Rate Limiting**: Includes small delays between batches to avoid hitting Firestore rate limits
- **Flexible Import**: Can import all data at once or specific collections individually
- **Timestamp Conversion**: Automatically converts date strings to Firestore Timestamps
- **Data Validation**: Handles missing values and converts data types appropriately
- **Import Tracking**: Adds `imported_at` timestamp to all documents

## Notes

- The script will automatically create collections if they don't exist
- Large datasets may take several minutes to import
- The script includes progress logging to track import status
- Make sure your Firestore security rules allow write access for the service account
- The script will exit gracefully after completion or error

## Troubleshooting

### Common Issues

1. **File not found errors**: Ensure CSV files are in the correct `scripts/data/` directory
2. **Authentication errors**: Verify your service account key file is valid and accessible
3. **Permission errors**: Check that your Firebase service account has Firestore write permissions
4. **Rate limit errors**: The script includes delays, but very large datasets might need longer delays

### Environment Variables

You can set the following environment variable for custom service account location:
```bash
export FIREBASE_SERVICE_ACCOUNT_PATH="/path/to/your/serviceAccountKey.json"
```
