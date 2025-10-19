# 🚀 BPUT Hackathon - Vercel Deployment Helper
# PowerShell script for Windows

Write-Host "🚀 BPUT Hackathon - Vercel Deployment Helper" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "❌ Git repository not found!" -ForegroundColor Red
    Write-Host "   Run: git init"
    exit 1
}

# Check if changes are committed
$status = git status --porcelain
if ($status) {
    Write-Host "📝 Uncommitted changes detected. Committing..." -ForegroundColor Yellow
    git add .
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "Ready for Vercel deployment - $timestamp"
    Write-Host "✅ Changes committed!" -ForegroundColor Green
} else {
    Write-Host "✅ No uncommitted changes" -ForegroundColor Green
}

# Push to GitHub
Write-Host ""
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Go to https://vercel.com/new"
    Write-Host "   2. Import your GitHub repository"
    Write-Host "   3. Click Deploy (Vercel will auto-detect everything!)"
    Write-Host ""
    Write-Host "📖 For detailed instructions, see VERCEL_DEPLOYMENT.md" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to push to GitHub" -ForegroundColor Red
    Write-Host "   Please check your GitHub remote configuration"
}
