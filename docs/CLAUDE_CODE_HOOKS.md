# Claude Code Hooks Documentation

This document explains how to use the Claude Code hooks system implemented in this repository for BigQuery data validation and safety.

## Overview

Claude Code hooks are pre-execution validation scripts that run before Claude executes bash commands. Our implementation focuses on protecting BigQuery operations and H1B data integrity.

## Current Implementation

### BigQuery Validation Hook

**Purpose**: Validates all BigQuery operations to prevent accidental data loss and ensure data integrity.

**Location**: `/Users/manthena08/personal-work/docujourney/scripts/validate-bigquery.sh`

**Configuration**: `/Users/manthena08/.claude/settings.json`

### Features

#### 🛡️ Safety Protections
- **Dangerous Operation Blocking**: Prevents `DROP TABLE`, `DELETE FROM`, `TRUNCATE`, `DROP DATASET`, `ALTER TABLE`, `UPDATE` operations
- **Production Safety**: Extra validation for production database operations
- **Project Validation**: Only allows operations on approved project IDs

#### 📊 Monitoring & Logging
- **Audit Trail**: All operations logged to `/Users/manthena08/personal-work/docujourney/logs/bigquery-operations.log`
- **Real-time Feedback**: Color-coded console output showing validation status
- **Metadata Tracking**: Timestamps, operation types, and approval/blocking decisions

#### 🔧 Environment Awareness
- **Project ID Validation**: Ensures operations target approved projects
- **Credential Checking**: Warns when `GOOGLE_APPLICATION_CREDENTIALS` is missing
- **Data Pipeline Integration**: Special handling for H1B data pipeline scripts

## How It Works

### Hook Configuration

The hook is configured in Claude's settings file:

```json
{
  "hooks": {
    "pre-tool-use-hook": [
      {
        "matcher": "Bash.*",
        "hooks": [
          {
            "type": "command", 
            "command": "/Users/manthena08/personal-work/docujourney/scripts/validate-bigquery.sh \"$CLAUDE_TOOL_ARGS\""
          }
        ]
      }
    ]
  }
}
```

### Validation Process

1. **Command Interception**: Every bash command is intercepted before execution
2. **BigQuery Detection**: Script identifies BigQuery-related operations
3. **Safety Checks**: Multiple validation layers are applied
4. **Logging**: All operations are logged with timestamps
5. **Decision**: Command is either approved or blocked

### Approved Projects

```bash
ALLOWED_PROJECTS=("doctracker-b4528" "immigrant-central" "immigrant-central-test")
```

### Protected Tables

```bash
PROTECTED_TABLES=("lca_applications")
```

## Usage Examples

### ✅ Safe Operations (Allowed)

```bash
# Read queries
bq query --project_id=immigrant-central 'SELECT COUNT(*) FROM h1b_data.lca_applications LIMIT 10'

# Data pipeline operations  
python3 data_pipeline.py --year-folder 2024 --project-id immigrant-central

# Analysis queries
bq query 'SELECT employer_name, COUNT(*) as apps FROM immigrant-central.h1b_data.lca_applications GROUP BY employer_name LIMIT 10'
```

### ❌ Dangerous Operations (Blocked)

```bash
# These will be blocked:
bq query 'DROP TABLE immigrant-central.h1b_data.lca_applications'
bq query 'DELETE FROM immigrant-central.h1b_data.lca_applications WHERE employer_name = "test"'
bq query 'TRUNCATE TABLE immigrant-central.h1b_data.lca_applications'
```

## Log Analysis

### Log Location
```bash
/Users/manthena08/personal-work/docujourney/logs/bigquery-operations.log
```

> **⚠️ Security Note**: Log files contain sensitive operation data including database commands, project IDs, and query patterns. These files are automatically excluded from git commits via `.gitignore` to prevent exposure of sensitive information.

### Log Format
```
[2025-08-15 19:05:10] VALIDATION: bq query --project_id=immigrant-central 'SELECT COUNT(*) FROM h1b_data.lca_applications LIMIT 1'
[2025-08-15 19:05:10] WARNING: Production operation: bq query --project_id=immigrant-central 'SELECT COUNT(*) FROM h1b_data.lca_applications LIMIT 1'  
[2025-08-15 19:05:10] APPROVED: bq query --project_id=immigrant-central 'SELECT COUNT(*) FROM h1b_data.lca_applications LIMIT 1'
[2025-08-15 19:05:26] BLOCKED: Dangerous operation 'DROP TABLE' in command: bq query 'DROP TABLE immigrant-central.h1b_data.lca_applications'
```

### Log Entry Types
- **VALIDATION**: Command being validated
- **WARNING**: Alerts for production operations or missing credentials  
- **APPROVED**: Safe operation allowed to proceed
- **BLOCKED**: Dangerous operation prevented
- **H1B_DATA**: Operation on protected H1B tables
- **PIPELINE**: Data pipeline operations

## Console Output

The hook provides real-time feedback with color-coded messages:

- 🔍 **Yellow**: Validation in progress
- ✅ **Green**: Operation approved  
- ❌ **Red**: Operation blocked
- ⚠️ **Yellow**: Warnings for production operations

## Customization

### Adding New Protected Tables

Edit the `PROTECTED_TABLES` array in `validate-bigquery.sh`:

```bash
PROTECTED_TABLES=("lca_applications" "your_new_table")
```

### Adding New Project IDs

Edit the `ALLOWED_PROJECTS` array:

```bash
ALLOWED_PROJECTS=("doctracker-b4528" "immigrant-central" "immigrant-central-test" "your-new-project")
```

### Modifying Dangerous Operations

Edit the `DANGEROUS_OPS` array:

```bash
DANGEROUS_OPS=("DROP TABLE" "DELETE FROM" "TRUNCATE" "DROP DATASET" "ALTER TABLE" "UPDATE" "YOUR_NEW_OPERATION")
```

## Benefits

### 🛡️ Data Protection
- Prevents accidental data loss
- Blocks destructive operations on production data
- Maintains audit trail for compliance

### 🔍 Visibility  
- Real-time operation monitoring
- Comprehensive logging for troubleshooting
- Clear feedback on why operations are blocked

### 🚀 Development Safety
- Allows safe experimentation with BigQuery
- Catches dangerous operations before execution
- Maintains data integrity across team collaboration

## Troubleshooting

### Hook Not Running
1. Check Claude settings file location: `~/.claude/settings.json`
2. Verify script permissions: `chmod +x /Users/manthena08/personal-work/docujourney/scripts/validate-bigquery.sh`
3. Ensure script path is correct in settings

### Operations Being Blocked Incorrectly  
1. Check if project ID is in `ALLOWED_PROJECTS`
2. Verify operation doesn't contain dangerous keywords
3. Review log file for specific blocking reason

### Missing Logs
1. Ensure logs directory exists: `/Users/manthena08/personal-work/docujourney/logs/`
2. Check script permissions for writing to log file
3. Verify log path in script configuration

## Security Considerations

- Hook runs with your local user permissions
- **Log files contain sensitive command details** - automatically excluded from git via `.gitignore`
- Script validates but doesn't modify commands
- Production operations require extra validation
- **Never commit log files** - they expose database structure and operations

## Future Enhancements

Potential improvements to consider:

- Integration with more Claude Code tools
- Email/Slack notifications for blocked operations  
- Whitelist support for trusted dangerous operations
- Integration with external approval workflows
- Support for additional database systems