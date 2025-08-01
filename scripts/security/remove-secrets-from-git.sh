#!/bin/bash
# CRITICAL SECURITY REMEDIATION SCRIPT
# Remove compromised serviceAccountKey.json from git history
# WARNING: This will rewrite git history and require force push

set -e  # Exit on any error

echo "🚨 CRITICAL SECURITY REMEDIATION"
echo "This script will remove serviceAccountKey.json from git history"
echo "WARNING: This rewrites git history and requires force push"
echo ""

# Backup current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# Create backup
echo "Creating backup branch..."
git branch backup-before-security-fix || true

echo ""
echo "⚠️  IMPORTANT WARNINGS:"
echo "1. This will rewrite ALL git history"
echo "2. All team members will need to re-clone the repository"
echo "3. Any open pull requests will need to be recreated"
echo "4. This cannot be undone easily"
echo ""

read -p "Do you want to continue? (type 'YES' to confirm): " confirm
if [ "$confirm" != "YES" ]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "📋 Files to be removed from git history:"
echo "- serviceAccountKey.json"
echo ""

# Check if git filter-repo is available (preferred method)
if command -v git-filter-repo &> /dev/null; then
    echo "Using git-filter-repo (recommended method)..."
    
    # Remove the file from all commits
    git filter-repo --invert-paths --path serviceAccountKey.json --force
    
elif command -v java &> /dev/null; then
    echo "Using BFG Repo-Cleaner (if available)..."
    
    # Download BFG if needed
    if [ ! -f "bfg-1.14.0.jar" ]; then
        echo "Downloading BFG Repo-Cleaner..."
        curl -L "https://search.maven.org/remotecontent?filepath=com/madgag/bfg/1.14.0/bfg-1.14.0.jar" -o bfg-1.14.0.jar
    fi
    
    # Use BFG to remove the file
    java -jar bfg-1.14.0.jar --delete-files serviceAccountKey.json .
    
    # Clean up
    git reflog expire --expire=now --all && git gc --prune=now --aggressive
    
else
    echo "Using git filter-branch (legacy method)..."
    
    # Remove file from all commits using filter-branch
    git filter-branch --force --index-filter \
        'git rm --cached --ignore-unmatch serviceAccountKey.json' \
        --prune-empty --tag-name-filter cat -- --all
    
    # Clean up
    git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
    git reflog expire --expire=now --all
    git gc --prune=now
fi

echo ""
echo "✅ File removed from git history"
echo ""
echo "🔄 NEXT STEPS:"
echo "1. Verify the file is no longer in history: git log --all --full-history -- serviceAccountKey.json"
echo "2. Force push to remote: git push origin --force --all"
echo "3. Force push tags: git push origin --force --tags"
echo "4. Notify all team members to re-clone the repository"
echo "5. Update CI/CD systems that may have cached the old repository"
echo ""
echo "⚠️  Remember to:"
echo "- Revoke the compromised service account key in Google Cloud Console"
echo "- Generate new service account keys"
echo "- Update environment variables in production systems"
echo ""

# Verification
echo "🔍 Verification:"
if git log --all --full-history -- serviceAccountKey.json | grep -q "commit"; then
    echo "❌ WARNING: File may still exist in git history"
    echo "   Manual verification required"
else
    echo "✅ File appears to be removed from git history"
fi