# 🎯 Quick Reference Card

## ✅ Project Status
- **Location**: `D:\BPUT Hackathon\`
- **Structure**: ✅ Ready for Vercel
- **Build Status**: ✅ Tested & Working
- **Dev Server**: ✅ Running on http://localhost:8081/

## 🚀 Deploy in 3 Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

**OR** use the helper script:
```bash
# PowerShell
.\deploy.ps1

# Or manually
cd "d:\BPUT Hackathon"
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

### 2. Import to Vercel
- Visit: https://vercel.com/new
- Sign in with GitHub
- Click "Import Project"
- Select: `BPUT-Hackathon` repository

### 3. Deploy
- Vercel auto-detects everything! ✨
- Click "Deploy"
- Wait 1-2 minutes
- Your app is live! 🎉

## 📁 Key Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies & scripts |
| `vite.config.ts` | Build configuration |
| `vercel.json` | Vercel deployment config ⭐ |
| `src/App.tsx` | Main app with routing |
| `src/pages/AdminPortal.tsx` | Landing page |

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → Opens at http://localhost:8081/

# Build for production
npm run build
# → Creates dist/ folder

# Preview production build
npm run preview
# → Opens at http://localhost:4173/
```

## 🌐 Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | AdminPortal | Landing page with 2 cards |
| `/e-governance` | EGovernance | E-Gov landing (Schemes + Scholarships) |
| `/schemes` | Schemes | Schemes dashboard |
| `/scholarships` | Scholarships | Scholarships dashboard |
| `/registration-details` | RegistrationDetails | Schemes registration |
| `/scholarship-registration-details` | RegistrationDetails | Scholarships registration |
| `/training` | Training | Training CRM dashboard ⭐ |
| `/transcripts` | Transcripts | Call transcripts viewer |
| `/feedback` | Feedback | Student feedback |

## 📊 Google Sheets Integration

### Sheets
1. **Schemes**: `1y7LyjjyKRMX4XSTjPA3lu4hM9gMl27e2QElXiG4FZp8`
2. **Scholarships**: `1mKHy1nYMGc_EGkA7X1T8609SPYBkhdBMwYlZSzfPfqk`
3. **Training**: `1hyc1ZkQK9C6aVUvLe-jS-EiElQtIfKiUzDR0CNwv_oo`

### Webhooks (n8n.cloud)
- Schemes/Scholarships Approval: `494a460f-803d-4848-b729-9fecebe4ff79`
- Training Email Campaign: `64d94d32-3580-4730-90f9-1e64895c90fe`
- Training Call Campaign: `9ffc0f31-1f1b-4556-92a5-f4762baed323`
- Training WhatsApp Campaign: `78ebcdc8-7562-42c0-bc92-6ac723e2ac4a`
- Training SMS Campaign: `950d3eeb-b0f1-4b1f-a2bc-572856f2e098`
- WhatsApp Feedback: `03bdef8b-fd15-4cc1-9653-42d99b3dfdd7`
- Email Feedback: `3d51c0ec-8f8c-466a-89b0-0982646ebbb3`

## 🎨 Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5.4
- **UI**: Radix UI + Tailwind CSS
- **Routing**: React Router v6
- **Data**: TanStack Query + PapaParse
- **Icons**: Lucide React

## 🐛 Troubleshooting

### Build Fails
```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Routes Don't Work on Vercel
✅ Already fixed! Check `vercel.json` has rewrites

### Google Sheets Not Loading
- Ensure sheets are "Published to web" as CSV
- Check browser console for errors

## 📝 Important Files

```
BPUT Hackathon/
├── VERCEL_DEPLOYMENT.md     ← Full deployment guide
├── RESTRUCTURE_COMPLETE.md   ← What was changed
├── deploy.ps1                ← Quick deploy script
└── vercel.json               ← Vercel configuration ⭐
```

## 🎉 Success Criteria

- [x] Code in main folder
- [x] Build tested (✅ Success)
- [x] Dev server running (✅ Port 8081)
- [x] vercel.json configured
- [x] All routes working
- [x] Google Sheets connected
- [x] Webhooks configured
- [x] Lead counter working
- [x] Ready for deployment

## 🔥 Next Action

**Deploy to Vercel NOW!** 🚀

1. Run: `.\deploy.ps1`
2. Or manually push to GitHub
3. Import to Vercel
4. Click Deploy

**Your app will be live in ~2 minutes!**

---

**Questions?** Check `VERCEL_DEPLOYMENT.md` for detailed instructions.
