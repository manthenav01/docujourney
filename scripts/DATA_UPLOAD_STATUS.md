# H1B Data Upload Status

This document tracks the status of H1B data uploads to BigQuery for the DocuJourney application.

## 📊 Current Data Coverage

### BigQuery Dataset: `h1b_data`
- **Project ID**: `doctracker-b4528`
- **Dataset**: `h1b_data`
- **Tables**: `lca_applications`, `employers`

## 📅 Data Available by Year

### ✅ 2025 (Current)
- **Status**: ✅ **UPLOADED**
- **Source**: `/scripts/data/2025-q2/`
- **Files Processed**:
  - `LCA_Disclosure_Data_FY2025_Q2.xlsx` - LCA applications
  - `Employer Information.xlsx` - Employer data
- **Notes**: Complete data with all schema fields including `employer_fein`

### ✅ 2024 
- **Status**: ✅ **UPLOADED** 
- **Source**: `/scripts/data/2024/`
- **Files Processed**:
  - `LCA_Disclosure_Data_FY2024_Q1.xlsx` - Q1 LCA applications
  - `LCA_Disclosure_Data_FY2024_Q2.xlsx` - Q2 LCA applications  
  - `LCA_Disclosure_Data_FY2024_Q4.xlsx` - Q4 LCA applications
- **Notes**: Complete data with all schema fields including `employer_fein`

### ✅ 2023
- **Status**: ✅ **UPLOADED** (Complete Year)
- **Source**: `/scripts/data/2023/`
- **Files Processed**:
  - `LCA_Disclosure_Data_FY2023_Q1.xlsx` - Q1 LCA applications (~94,812 new records)
  - `LCA_Disclosure_Data_FY2023_Q2.xlsx` - Q2 LCA applications (~129,287 new records)
  - `LCA_Disclosure_Data_FY2023_Q3.xlsx` - Q3 LCA applications (~181,995 new records)
  - `LCA_Disclosure_Data_FY2023_Q4.xlsx` - Q4 LCA applications (~127,939 records)
- **Total Records**: ~534,033 LCA applications (all quarters)
- **Notes**: 
  - ⚠️ Missing `employer_fein` field (handled as NULL in BigQuery)
  - No employer summary data available for this year
  - ✅ Complete year data now available (Q1-Q4)

### ✅ 2022
- **Status**: ✅ **UPLOADED**
- **Source**: `/scripts/data/2022/`
- **Files Processed**:
  - `LCA_Disclosure_Data_FY2022_Q2.xlsx` - Q2 LCA applications (~151,603 records)
  - `LCA_Disclosure_Data_FY2022_Q3.xlsx` - Q3 LCA applications (~235,530 records)  
  - `LCA_Disclosure_Data_FY2022_Q4.xlsx` - Q4 LCA applications (~118,645 records)
- **Total Records**: ~501,387 LCA applications
- **Notes**: 
  - ⚠️ Missing `employer_fein` field (handled as NULL in BigQuery)
  - No employer summary data available for this year
  - Q1 data not available

## 🗂️ Data Schema Differences

### Complete Schema (2024-2025)
- All 97 fields available including `employer_fein`
- Full employer and LCA data available

### Legacy Schema (2022-2023)  
- 96 original fields + 1 NULL field (`employer_fein`)
- `employer_fein` field added as NULL values for compatibility
- No impact on application functionality (field is unused in queries)

## 📈 Total Data Volume

| Year | LCA Applications | Employer Data | Status |
|------|-----------------|---------------|--------|
| 2025 | ~XXX,XXX | Available | ✅ Complete |
| 2024 | ~XXX,XXX | Available | ✅ Complete |
| 2023 | ~534,033 | Not Available | ✅ Complete (All Quarters) |
| 2022 | ~501,387 | Not Available | ✅ Complete |
| **Total** | **~1,035,420+** | **2 years** | **✅ Complete** |

## 🔧 Technical Details

### Upload Method
- **Pipeline**: `data_pipeline.py` with BigQuery integration
- **Deduplication**: Automatic based on `case_number` for LCA data
- **Schema Handling**: Automatic addition of missing fields as NULL
- **Error Handling**: Graceful handling of missing columns across years

### Data Processing Features
- ✅ Column name normalization
- ✅ Data type conversion for BigQuery compatibility  
- ✅ Duplicate record removal
- ✅ Schema consistency across different data years
- ✅ Employer name resolution and canonicalization

### BigQuery Configuration
- **Write Mode**: Append (preserves existing data)
- **Deduplication**: Automatic based on unique case numbers
- **Table Expiration**: 59 days (sandbox mode)
- **Schema**: Fixed schema with optional fields for backward compatibility

## 🚀 Usage Commands

### Process New Data
```bash
# Process specific year folder
python data_pipeline.py --year-folder 2023

# Process specific files
python data_pipeline.py --files path/to/file1.xlsx path/to/file2.xlsx

# Test without uploading
python data_pipeline.py --year-folder 2022 --no-upload

# List available data
python data_pipeline.py --list-files
```

### Alternative Import Methods
```bash
# Use npm scripts (Firestore only)
npm run import:data           # Import all cleaned CSV data
npm run cleanup:employer-data # Clean raw Excel files first
npm run import:test          # Test Firebase connection
```

## ⚠️ Important Notes

1. **Schema Compatibility**: The pipeline automatically handles missing fields by adding NULL values
2. **Employer FEIN**: Field is stored but not used by application queries (safe to be NULL)
3. **Data Quality**: All uploads include validation and duplicate removal
4. **Incremental Updates**: Pipeline skips existing records automatically
5. **Error Recovery**: Failed uploads can be safely retried

## 📝 Next Steps

For future data uploads:

1. **Place data files** in appropriate `/scripts/data/YYYY/` folders
2. **Run pipeline** using `python data_pipeline.py --year-folder YYYY`
3. **Verify upload** in BigQuery console
4. **Update this document** with new data volumes and status

## 🔗 Related Documentation

- [Main README](./README.md) - Complete data processing documentation
- [Import README](./IMPORT_README.md) - Detailed import process
- [CLAUDE.md](../CLAUDE.md) - Development commands and architecture

---

**Last Updated**: July 2025
**Data Coverage**: 2022-2025 (4 years)
**Status**: ✅ All available data uploaded successfully

## 🔄 Recent Updates

### July 24, 2025
- ✅ **Added complete 2023 data**: Uploaded Q1, Q2, Q3 quarterly files
- 📊 **New records added**: ~406,094 additional 2023 LCA applications  
- 🎯 **2023 now complete**: All four quarters (Q1-Q4) available
- 📈 **Total increase**: Database now contains 1M+ H1B records