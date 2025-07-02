# H1B Data Processing and Import Pipeline

This directory contains scripts for processing H1B visa data from Excel files and importing them into Firebase Firestore. The process involves two main steps: data cleaning/preparation and database import.

## 📋 Overview

The pipeline processes three types of H1B data:
- **Employer Information** - Company details and approval/denial statistics
- **LCA (Labor Condition Application) Data** - Individual job applications and details
- **Worksite Data** - Location information for approved positions

## 🔄 Complete Process Flow

```
Raw Excel Files → Python Cleanup Script → Clean CSV Files → Node.js Import Script → Firestore Database
```

## 📁 File Structure

```
scripts/
├── README.md                           # This file
├── employer-data-cleanup.py             # Python script for data cleaning
├── batch-import.js                     # Node.js script for Firestore import
├── import-setup.js                     # Testing and setup utilities
├── IMPORT_README.md                    # Detailed import documentation
└── data/
    └── h1b/
        └── 2025/
            ├── Employer Information.xlsx           # Raw employer data
            ├── LCA_Disclosure_Data_FY2025_Q2.xlsx  # Raw LCA data
            ├── LCA_Worksites_FY2025_Q2.xlsx        # Raw worksite data
            └── cleanup/
                ├── cleaned_employers.csv           # Processed employer data
                ├── cleaned_lca.csv                 # Processed LCA data
                └── cleaned_worksites.csv           # Processed worksite data
```

## 🐍 Step 1: Data Cleaning (Python)

### Prerequisites
- Python environment with pandas and openpyxl installed
- Raw Excel files in `scripts/data/h1b/2025/`

### What the cleanup script does:
1. **Loads Excel files** from the data directory
2. **Normalizes column names** - removes spaces, converts to lowercase
3. **Filters relevant columns** - keeps only necessary data fields
4. **Validates unique IDs** - ensures all document IDs are valid for Firestore
5. **Removes invalid records** - filters out rows with missing/empty IDs
6. **Removes duplicates** - eliminates duplicate records based on unique IDs
7. **Exports clean CSV files** - saves processed data for import

### Running the cleanup script:
```bash
# Using the npm script (recommended)
npm run cleanup:employer-data

# Or directly with Python
.venv/bin/python scripts/employer-data-cleanup.py
```

### What gets cleaned:
- **Empty/null unique IDs** - Rows without valid `taxid` (employers) or `case_number` (jobs/worksites)
- **Duplicate records** - Multiple entries with the same unique ID
- **Invalid characters** - Special characters that could cause Firestore issues
- **Malformed data** - Records that don't meet minimum data requirements

### Output:
- `cleaned_employers.csv` - Clean employer data with valid `taxid` values
- `cleaned_lca.csv` - Clean job application data with valid `case_number` values  
- `cleaned_worksites.csv` - Clean worksite data with valid `case_number` references

## 🔥 Step 2: Firestore Import (Node.js)

### Prerequisites
- Node.js environment with required dependencies installed
- Firebase service account key (`serviceAccountKey.json`) in project root
- Clean CSV files from Step 1

### What the import script does:
1. **Connects to Firestore** using Firebase Admin SDK
2. **Reads CSV files** from the cleanup directory
3. **Batches operations** - groups writes for efficiency (max 500 per batch)
4. **Converts data types** - handles dates, numbers, and strings appropriately
5. **Creates collections** - stores data in `employers`, `jobs`, and `worksites` collections
6. **Adds metadata** - includes import timestamps for tracking

### Available import commands:
```bash
# Import all data (recommended)
npm run import:data

# Import specific collections
npm run import:employers    # Only employer data
npm run import:jobs         # Only job/LCA data
npm run import:worksites    # Only worksite data

# Test Firebase connection
npm run import:test

# Create sample data for testing
npm run import:sample

# Complete setup (sample + test)
npm run import:setup
```

## 🚀 Complete Workflow

### 1. Initial Setup
```bash
# Install dependencies
npm install

# Test Firebase connection
npm run import:test
```

### 2. Data Processing
```bash
# Step 1: Clean the raw data
npm run cleanup:employer-data

# Step 2: Import to Firestore
npm run import:data
```

### 3. Verification
Check your Firestore console to verify the data was imported correctly:
- `employers` collection - Company information
- `jobs` collection - Job applications  
- `worksites` collection - Work locations

## 📊 Data Schema

### Employers Collection
```javascript
{
  // Document ID: taxid
  fiscal_year: "2025",
  name: "Tech Corp Inc",
  city: "San Francisco", 
  state: "CA",
  postal_code: "94105",
  naics_code: "541511",
  initial_approvals: 100,
  initial_denials: 5,
  continuing_approvals: 150,
  continuing_denials: 10,
  imported_at: Timestamp
}
```

### Jobs Collection
```javascript
{
  // Document ID: case_number
  case_status: "Certified",
  received_date: Timestamp,
  decision_date: Timestamp,
  visa_class: "H-1B",
  job_title: "Software Engineer",
  soc_code: "15-1132",
  soc_title: "Software Developers",
  full_time_position: "Y",
  begin_date: Timestamp,
  end_date: Timestamp,
  total_worker_positions: 1,
  employer_name: "Tech Corp Inc",
  employer_city: "San Francisco",
  employer_state: "CA",
  employer_postal_code: "94105",
  employer_fein: "123456789",
  naics_code: "541511",
  wage_rate_from: 120000,
  wage_rate_to: 130000,
  wage_unit: "Year",
  prevailing_wage: 115000,
  pw_unit: "Year",
  pw_oes_year: 2023,
  h1b_dependent: "N",
  willful_violator: "N",
  imported_at: Timestamp
}
```

### Worksites Collection
```javascript
{
  // Document ID: auto-generated
  case_number: "I-200-12345", // Reference to job
  workers: 1,
  secondary_entity: "N",
  secondary_entity_name: "",
  address1: "123 Tech Street",
  city: "San Francisco",
  state: "CA", 
  postal_code: "94105",
  wage_rate_from: 120000,
  wage_rate_to: 130000,
  wage_unit: "Year",
  prevailing_wage: 115000,
  pw_unit: "Year",
  pw_oes_year: 2023,
  imported_at: Timestamp
}
```

## 🔧 Configuration

### Environment Variables
```bash
# Optional: Custom service account path
export FIREBASE_SERVICE_ACCOUNT_PATH="/path/to/serviceAccountKey.json"
```

### Firebase Setup
1. Ensure your Firebase project is set up
2. Download the service account key file
3. Place it as `serviceAccountKey.json` in the project root
4. Verify Firestore security rules allow write access

## 📝 Logging and Monitoring

Both scripts provide detailed logging:
- **Cleanup script**: Shows data quality metrics and cleanup results
- **Import script**: Shows batch progress and import statistics

Example output:
```
=== Data Validation and Cleanup ===
Cleaning LCA case_number...
  LCA: 50000 → 49850 rows (removed 150 invalid case_numbers)
Cleaning Employer taxid...
  Employer: 25000 → 24950 rows (removed 50 invalid taxids)

✓ Data validation and cleanup completed
🎉 Data cleanup completed successfully!

Starting batch import process...
Batch 1 committed for employers (500 documents)
Batch 2 committed for employers (450 documents)
✓ Employers import completed

🎉 All data imported successfully!
```

## ⚠️ Important Notes

1. **Order matters**: Always run the cleanup script before the import script
2. **Data validation**: The cleanup script removes invalid records - check logs for what was filtered out
3. **Batch size**: Import uses 500 documents per batch to stay within Firestore limits
4. **Rate limiting**: Small delays between batches prevent hitting rate limits
5. **Idempotency**: Re-running imports will overwrite existing documents with the same IDs

## 🐛 Troubleshooting

### Common Issues

**"File not found" errors:**
- Ensure Excel files are in `scripts/data/h1b/2025/`
- Run cleanup script before import script

**"Invalid resource path" errors:**
- Run cleanup script to remove invalid document IDs
- Check that unique ID fields (taxid, case_number) are not empty

**Authentication errors:**
- Verify `serviceAccountKey.json` is in project root
- Check Firebase service account permissions

**Import failures:**
- Ensure Firestore security rules allow writes
- Check network connectivity to Firebase
- Verify data types in CSV files

### Getting Help

1. Check the logs for specific error messages
2. Run `npm run import:test` to verify Firebase connection
3. Review the data after cleanup to ensure quality
4. Use `npm run import:sample` to test with small dataset first

## 📈 Performance

- **Cleanup**: Processes ~100K records per minute
- **Import**: Imports ~1K records per minute (limited by Firestore)
- **Memory**: Cleanup script loads full dataset into memory (ensure sufficient RAM)
- **Network**: Import speed depends on network connection to Firebase

---

For detailed import documentation, see `IMPORT_README.md`.
