#!/bin/bash

echo "🚀 BPUT Hackathon - Vercel Deployment Helper"
echo "============================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found!"
    echo "   Run: git init"
    exit 1
fi

# Check if changes are committed
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Uncommitted changes detected. Committing..."
    git add .
    git commit -m "Ready for Vercel deployment - $(date '+%Y-%m-%d %H:%M:%S')"
    echo "✅ Changes committed!"
else
    echo "✅ No uncommitted changes"
fi

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🎯 Next Steps:"
    echo "   1. Go to https://vercel.com/new"
    echo "   2. Import your GitHub repository"
    echo "   3. Click Deploy (Vercel will auto-detect everything!)"
    echo ""
    echo "📖 For detailed instructions, see VERCEL_DEPLOYMENT.md"
else
    echo "❌ Failed to push to GitHub"
    echo "   Please check your GitHub remote configuration"
fi
