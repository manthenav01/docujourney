#!/bin/bash

# Claude Code Hook: BigQuery Data Validation
# Validates BigQuery operations before execution to ensure data integrity

set -e

# Configuration
LOG_FILE="/Users/manthena08/personal-work/docujourney/logs/bigquery-operations.log"
REPO_ROOT="/Users/manthena08/personal-work/docujourney"
ALLOWED_PROJECTS=("doctracker-b4528" "immigrant-central" "immigrant-central-test")
PROTECTED_TABLES=("lca_applications")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log_operation() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] $1" >> "$LOG_FILE"
}

# Create logs directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Get the command that Claude is about to execute
COMMAND="$1"

echo -e "${YELLOW}🔍 BigQuery Hook: Validating operation...${NC}"

# Log the attempted operation
log_operation "VALIDATION: $COMMAND"

# Check if this is a BigQuery operation
if [[ "$COMMAND" == *"bq"* ]] || [[ "$COMMAND" == *"bigquery"* ]] || [[ "$COMMAND" == *"BIGQUERY"* ]]; then
    echo -e "${YELLOW}📊 Detected BigQuery operation${NC}"
    
    # Dangerous operations check
    DANGEROUS_OPS=("DROP TABLE" "DELETE FROM" "TRUNCATE" "DROP DATASET" "ALTER TABLE" "UPDATE ")
    
    for op in "${DANGEROUS_OPS[@]}"; do
        if [[ "$COMMAND" == *"$op"* ]]; then
            echo -e "${RED}❌ BLOCKED: Dangerous operation detected: $op${NC}"
            log_operation "BLOCKED: Dangerous operation '$op' in command: $COMMAND"
            echo -e "${RED}This operation could modify or delete data. Please review carefully.${NC}"
            exit 1
        fi
    done
    
    # Check for production project operations
    if [[ "$COMMAND" == *"immigrant-central"* ]] && [[ "$COMMAND" != *"immigrant-central-test"* ]]; then
        echo -e "${YELLOW}⚠️  Production project detected: immigrant-central${NC}"
        
        # Extra validation for production
        if [[ "$COMMAND" == *"DELETE"* ]] || [[ "$COMMAND" == *"DROP"* ]] || [[ "$COMMAND" == *"TRUNCATE"* ]]; then
            echo -e "${RED}❌ BLOCKED: No destructive operations allowed on production${NC}"
            log_operation "BLOCKED: Production destructive operation: $COMMAND"
            exit 1
        fi
        
        log_operation "WARNING: Production operation: $COMMAND"
        echo -e "${YELLOW}⚠️  Production operation logged${NC}"
    fi
    
    # Check environment variables
    if [[ -z "$GOOGLE_APPLICATION_CREDENTIALS" ]]; then
        echo -e "${YELLOW}⚠️  GOOGLE_APPLICATION_CREDENTIALS not set${NC}"
        log_operation "WARNING: Missing GOOGLE_APPLICATION_CREDENTIALS"
    fi
    
    # Validate project ID in command
    PROJECT_FOUND=false
    for project in "${ALLOWED_PROJECTS[@]}"; do
        if [[ "$COMMAND" == *"$project"* ]]; then
            PROJECT_FOUND=true
            echo -e "${GREEN}✅ Allowed project detected: $project${NC}"
            break
        fi
    done
    
    if [[ "$PROJECT_FOUND" = false ]]; then
        echo -e "${RED}❌ BLOCKED: No recognized project ID found${NC}"
        echo -e "${RED}Allowed projects: ${ALLOWED_PROJECTS[*]}${NC}"
        log_operation "BLOCKED: Unrecognized project in: $COMMAND"
        exit 1
    fi
    
    # Check for H1B data table operations
    for table in "${PROTECTED_TABLES[@]}"; do
        if [[ "$COMMAND" == *"$table"* ]]; then
            echo -e "${GREEN}✅ H1B data table operation detected: $table${NC}"
            log_operation "H1B_DATA: Operation on protected table '$table': $COMMAND"
            break
        fi
    done
    
    echo -e "${GREEN}✅ BigQuery operation validated successfully${NC}"
    log_operation "APPROVED: $COMMAND"
    
elif [[ "$COMMAND" == *"python"* ]] && [[ "$COMMAND" == *"data_pipeline"* ]]; then
    echo -e "${YELLOW}🐍 Detected H1B data pipeline operation${NC}"
    
    # Check for required environment variables
    if [[ -z "$GOOGLE_APPLICATION_CREDENTIALS" ]]; then
        echo -e "${RED}❌ BLOCKED: GOOGLE_APPLICATION_CREDENTIALS required for data pipeline${NC}"
        log_operation "BLOCKED: Missing credentials for data pipeline: $COMMAND"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Data pipeline operation validated${NC}"
    log_operation "PIPELINE: $COMMAND"
    
else
    # Not a BigQuery operation, allow it
    echo -e "${GREEN}✅ Non-BigQuery operation, proceeding${NC}"
fi

echo -e "${GREEN}🚀 Operation approved, proceeding...${NC}"

# Return success (allow the operation to proceed)
exit 0