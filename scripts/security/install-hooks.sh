#!/bin/bash
# Install security hooks for git

echo "🔧 Installing security git hooks..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Please run this from the project root."
    exit 1
fi

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Install pre-commit hook
echo "Installing pre-commit hook..."
cp scripts/security/pre-commit-hook.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

echo "✅ Pre-commit hook installed successfully!"
echo ""
echo "The hook will now:"
echo "  - Check for credential files before each commit"
echo "  - Scan for hardcoded secrets in code"
echo "  - Warn about large files"
echo "  - Check for security-related TODOs"
echo ""
echo "To test the hook, try committing a file with 'TODO: security' in it."