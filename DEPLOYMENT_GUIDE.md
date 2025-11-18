# 🚀 Vercel Deployment Guide - AvoSpace Dev

**Quick Start**: Deploy to Vercel in 5 minutes for multi-user testing

---

## 📋 Prerequisites

- ✅ GitHub account
- ✅ Vercel account (free tier is fine)
- ✅ Firebase project configured (already done)
- ✅ Code ready to deploy (current state)

---

## 🎯 Deployment Steps

### Option A: Deploy via Vercel CLI (Recommended - Fastest)

#### 1. Install Vercel CLI
```bash
npm i -g vercel
```

#### 2. Login to Vercel
```bash
vercel login
```

#### 3. Deploy from Project Root
```bash
# From /Users/fisher/Documents/GitHub/avospace/
vercel
```

When prompted:
- **Set up and deploy?** → Yes
- **Which scope?** → Your personal account
- **Link to existing project?** → No (first time)
- **Project name?** → `avospace-dev` (or keep default)
- **Directory?** → `./ ` (just hit Enter)
- **Override settings?** → No

#### 4. Deploy Production Version
```bash
vercel --prod
```

Your site will be live at: `https://avospace-dev.vercel.app` (or similar)

---

### Option B: Deploy via Vercel Dashboard (Web UI)

#### 1. Push Code to GitHub (if not already)
```bash
git add .
git commit -m "feat: username and phone number profile upgrade"
git push origin avo_study
```

#### 2. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Click **"Add New Project"**
- Click **"Import Git Repository"**

#### 3. Import from GitHub
- Select your GitHub account
- Find `avospace` repository
- Click **"Import"**

#### 4. Configure Project
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (leave default)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

**Environment Variables**: None needed! Firebase config is in code.

#### 5. Deploy
- Click **"Deploy"**
- Wait 2-3 minutes for build
- Get your URL: `https://avospace-{random}.vercel.app`

---

## 🔥 Deploy Firebase Rules & Indexes

**Before testing, deploy the updated Firestore rules:**

```bash
# Make sure you're in the project root
cd /Users/fisher/Documents/GitHub/avospace

# Deploy Firestore rules (includes username validation fix)
firebase deploy --only firestore:rules

# Deploy Firestore indexes (username index for uniqueness)
firebase deploy --only firestore:indexes
```

Wait 5-10 minutes for indexes to build (check Firebase Console).

---

## ✅ Post-Deployment Testing

### Test 1: Registration with Username
1. Open your Vercel URL: `https://avospace-xxx.vercel.app`
2. Click "Sign up"
3. Enter email, username, optional phone, password
4. Watch for real-time username validation
5. Register successfully

### Test 2: Multi-User Scenario
1. **User 1**: Register with username "fisher"
2. **User 2** (different browser/incognito): 
   - Try to register with "fisher" → Should show "already taken"
   - Register with "avocado_fan" → Should work
3. **User 1**: Check in at "Doe Library" with status "Open to study"
4. **User 2**: 
   - Go to AvoStudy page
   - See User 1's check-in
   - Click "Send Study Request"
   - Send a message

### Test 3: Real-Time Features
1. User 1 checks in → User 2 sees it instantly (real-time listener)
2. User 2 sends study request → User 1 sees in inbox
3. Test phone number editing in profile

---

## 🔧 Vercel Configuration (Optional)

Create `vercel.json` for custom settings:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sfo1"],
  "env": {},
  "build": {
    "env": {}
  }
}
```

---

## 🌿 Git Branch Strategy

### Current Setup
- **Branch**: `avo_study`
- **Status**: Ahead of origin by 3 commits + new changes

### Before Deploying
```bash
# Check current status
git status

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: add username/phone profile upgrade + deployment config"

# Push to GitHub
git push origin avo_study
```

### Create Production Branch (Optional)
```bash
# Merge to main for production
git checkout main
git merge avo_study
git push origin main

# Set Vercel to deploy from main branch
```

---

## 🎨 Custom Domain (Optional)

### Add Custom Domain to Vercel
1. Go to Vercel Dashboard → Your Project
2. Click **"Settings"** → **"Domains"**
3. Add your domain (e.g., `avospace.dev`)
4. Follow DNS configuration instructions
5. Vercel auto-provisions SSL certificate

---

## 📊 Monitoring & Logs

### View Deployment Logs
- **Vercel Dashboard**: Click on deployment → View logs
- **CLI**: `vercel logs`

### Check Build Status
```bash
vercel inspect <deployment-url>
```

### View Runtime Logs
1. Vercel Dashboard → Your Project
2. Click **"Logs"** tab
3. See real-time application logs

---

## 🐛 Common Issues

### Issue: Build Failed - Module Not Found
**Solution**: Make sure all dependencies are in `package.json`
```bash
npm install
npm run build  # Test locally first
```

### Issue: Firebase Not Connecting
**Solution**: Check Firebase config in `src/lib/firebase.ts`
- Verify API key and project ID
- Check Firebase Console → Project Settings

### Issue: Firestore Permission Denied
**Solution**: Deploy updated rules
```bash
firebase deploy --only firestore:rules
```

### Issue: Username Validation Still Failing
**Solution**: 
1. Verify rules are deployed
2. Wait for index to build (5-10 min)
3. Check Firebase Console → Firestore → Indexes

---

## 🔄 Continuous Deployment

Vercel automatically deploys on every push to `avo_study` branch:

```bash
# Make changes
git add .
git commit -m "fix: update username validation"
git push origin avo_study

# Vercel auto-deploys in 2-3 minutes
```

### View Deployment Status
- Check GitHub commits → Vercel bot comment
- Or visit Vercel Dashboard

---

## 📱 Preview Deployments

Every pull request gets a preview URL:

1. Create PR from `avo_study` → `main`
2. Vercel creates preview deployment
3. Test on preview URL
4. Merge when ready → Deploys to production

---

## 🎯 Quick Commands Reference

```bash
# First deployment
vercel

# Production deployment
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Inspect specific deployment
vercel inspect <url>

# Remove deployment
vercel rm <deployment-id>

# Deploy Firebase rules
firebase deploy --only firestore:rules

# Deploy Firebase indexes
firebase deploy --only firestore:indexes

# Deploy everything to Firebase
firebase deploy
```

---

## 🌐 Your Deployment URLs

After deploying, you'll get:

- **Dev/Preview**: `https://avospace-dev-xxx.vercel.app`
- **Production**: `https://avospace.vercel.app`
- **Custom Domain**: (if configured)

---

## 📞 Next Steps After Deployment

1. ✅ **Test Registration**: Try creating multiple users
2. ✅ **Test Username Validation**: Check uniqueness works
3. ✅ **Test AvoStudy**: Check-ins, study requests, real-time updates
4. ✅ **Test on Mobile**: Open Vercel URL on phone
5. ✅ **Share with Friends**: Get real multi-user feedback!

---

## 🎉 Success Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Deployment successful
- [ ] Firebase rules deployed
- [ ] Firebase indexes built
- [ ] Can register users with usernames
- [ ] Username uniqueness validation works
- [ ] Real-time check-ins working
- [ ] Study requests working
- [ ] Mobile responsive

---

**Ready to Deploy? Run these commands:**

```bash
# 1. Deploy Firebase rules/indexes
firebase deploy --only firestore:rules,firestore:indexes

# 2. Commit and push (if not done)
git add .
git commit -m "feat: ready for deployment"
git push origin avo_study

# 3. Deploy to Vercel
vercel --prod
```

**Your app will be live in ~3 minutes!** 🚀

