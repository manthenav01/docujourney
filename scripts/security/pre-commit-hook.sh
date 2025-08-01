#!/bin/bash
# Pre-commit hook to prevent committing sensitive files and data
# Install this by copying to .git/hooks/pre-commit and making it executable

set -e

echo "🔍 Checking for sensitive data before commit..."

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Flag to track if any violations are found
violations_found=false

# Function to report violations
report_violation() {
    echo -e "${RED}❌ SECURITY VIOLATION: $1${NC}"
    violations_found=true
}

report_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
}

# Check for common credential file patterns
echo "Checking for credential files..."
credential_files=$(git diff --cached --name-only | grep -E '\.(key|pem|p12|pfx|crt|cert|cer)$|serviceAccount|firebase-admin|credentials\.json|auth\.json|\.env$|secret' || true)

if [ ! -z "$credential_files" ]; then
    report_violation "Attempting to commit credential files:"
    echo "$credential_files"
fi

# Check for hardcoded secrets in code
echo "Checking for hardcoded secrets..."
secret_patterns=(
    "api[_-]?key['\"\s]*[:=]['\"\s]*[a-zA-Z0-9]+"
    "secret[_-]?key['\"\s]*[:=]['\"\s]*[a-zA-Z0-9]+"
    "private[_-]?key['\"\s]*[:=]"
    "-----BEGIN (RSA |DSA |EC |OPENSSH |PGP )?PRIVATE KEY-----"
    "AIza[0-9A-Za-z_-]{35}"
    "sk_live_[0-9a-zA-Z]{24,}"
    "pk_live_[0-9a-zA-Z]{24,}"
    "access_token['\"\s]*[:=]['\"\s]*[a-zA-Z0-9]+"
    "client_secret['\"\s]*[:=]['\"\s]*[a-zA-Z0-9]+"
)

for pattern in "${secret_patterns[@]}"; do
    matches=$(git diff --cached -U0 | grep -E "\+.*$pattern" || true)
    if [ ! -z "$matches" ]; then
        report_violation "Found potential secret in staged changes (pattern: $pattern)"
        echo "$matches"
    fi
done

# Check for Firebase config with hardcoded values
firebase_check=$(git diff --cached -U0 | grep -E "\+.*apiKey.*:.*['\"]AIza" || true)
if [ ! -z "$firebase_check" ]; then
    report_violation "Found hardcoded Firebase API key"
    echo "$firebase_check"
fi

# Check for service account email patterns
sa_email_check=$(git diff --cached -U0 | grep -E "\+.*@.*\.iam\.gserviceaccount\.com" || true)
if [ ! -z "$sa_email_check" ]; then
    report_warning "Found service account email - ensure it's not sensitive"
    echo "$sa_email_check"
fi

# Check file sizes (prevent accidentally committing large credential files)
echo "Checking file sizes..."
large_files=$(git diff --cached --name-only | xargs -I {} sh -c 'if [ -f "{}" ] && [ $(wc -c < "{}") -gt 100000 ]; then echo "{}"; fi' || true)

if [ ! -z "$large_files" ]; then
    report_warning "Large files detected (>100KB) - ensure these are not credential files:"
    echo "$large_files"
fi

# Check for TODO/FIXME related to security
security_todos=$(git diff --cached -U0 | grep -E "\+.*TODO.*security|FIXME.*security|HACK.*security" -i || true)
if [ ! -z "$security_todos" ]; then
    report_warning "Security-related TODOs found - review before commit:"
    echo "$security_todos"
fi

# Final verdict
if [ "$violations_found" = true ]; then
    echo ""
    echo -e "${RED}🚫 COMMIT REJECTED: Security violations detected${NC}"
    echo ""
    echo "Please:"
    echo "1. Remove or encrypt sensitive data"
    echo "2. Use environment variables for secrets"
    echo "3. Review the SECURITY.md file for best practices"
    echo ""
    exit 1
else
    echo -e "${GREEN}✅ Security check passed${NC}"
    exit 0
fi