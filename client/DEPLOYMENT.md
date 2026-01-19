# Deployment Guide

This guide explains how to deploy your website so **all features work**, including the Plan Generator and Chatbot.

## 🎯 Recommended: Deploy to Vercel

**Vercel is the best option** because it supports:
- ✅ Static frontend hosting (your React app)
- ✅ Serverless functions (your API endpoints)
- ✅ Environment variables (for API keys)
- ✅ Automatic deployments from GitHub
- ✅ Free tier with generous limits

## 📋 Pre-Deployment Checklist

### 1. Ensure Your Code is on GitHub

```bash
# If not already done:
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Prepare Environment Variables

You'll need to set these in Vercel:
- `OPENAI_API_KEY` - Your OpenAI API key (for Plan Generator & Chatbot)
- (Optional) `ANTHROPIC_API_KEY` - Alternative to OpenAI

## 🚀 Step-by-Step Vercel Deployment

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign up/login with your GitHub account

2. **Import Your Repository**
   - Click "Add New Project"
   - Select your GitHub repository
   - Vercel will auto-detect it's a Vite project

3. **Configure Project Settings**
   - **Root Directory:** Set to `client` (important!)
   - **Framework Preset:** Vite (auto-detected)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `dist` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add:
     - `OPENAI_API_KEY` = `sk-your-key-here`
     - (Optional) `ANTHROPIC_API_KEY` = `sk-ant-your-key-here`
   - Make sure to add for all environments (Production, Preview, Development)

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your site will be live at `https://your-project.vercel.app`

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to client directory
cd client

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? (your-project-name)
# - Directory? ./client
# - Override settings? No

# Set environment variables
vercel env add OPENAI_API_KEY
# Paste your key when prompted

# Deploy to production
vercel --prod
```

## 🔧 Vercel Configuration

Your `vercel.json` is already configured correctly:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

This ensures:
- API routes (`/api/*`) are handled by serverless functions
- All other routes serve your React app (for client-side routing)

## ✅ Verify Deployment

After deployment, test these features:

1. **Plan Generator** ("What I'd Do" section):
   - Enter a company name and job description
   - Click "Generate My First 90 Days Plan"
   - Should generate a plan (not show errors)

2. **Chatbot**:
   - Click the chat icon
   - Send a message
   - Should receive a response

3. **Static Features**:
   - Navigation
   - Card expansions
   - Dark mode
   - All sections should load

## 🌐 Custom Domain (Optional)

1. In Vercel dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Vercel will automatically set up SSL

## 🔄 Continuous Deployment

Once connected to GitHub:
- Every push to `main` branch = automatic production deployment
- Pull requests = automatic preview deployments
- No manual deployment needed!

## 🐛 Troubleshooting

### API Endpoints Not Working

**Problem:** Plan Generator or Chatbot return 404 errors

**Solution:**
- Ensure `client/api/` folder is in your repository
- Check Vercel build logs for errors
- Verify environment variables are set correctly

### Build Fails

**Problem:** Build fails during deployment

**Solution:**
- Check build logs in Vercel dashboard
- Ensure `package.json` has all dependencies
- Verify Node.js version (Vercel uses Node 18+ by default)

### Environment Variables Not Working

**Problem:** API calls fail with "No API key" errors

**Solution:**
- Go to Vercel → Project → Settings → Environment Variables
- Ensure variables are added for **Production** environment
- Redeploy after adding variables

### API Functions Timeout

**Problem:** Plan generation takes too long and times out

**Solution:**
- Vercel free tier has 10s timeout for serverless functions
- Hobby tier has 60s timeout
- Consider upgrading if you need longer timeouts

## 📊 Alternative: Split Deployment (Advanced)

If you want to use GitHub Pages for frontend:

1. **Deploy API to Vercel separately:**
   - Create a separate Vercel project for just the API
   - Deploy only the `client/api/` folder
   - Get the API URL (e.g., `https://api-project.vercel.app`)

2. **Deploy Frontend to GitHub Pages:**
   - Build: `npm run build`
   - Deploy `dist/` folder to GitHub Pages
   - Set `VITE_API_URL=https://api-project.vercel.app/api/analyze-company` in build

3. **Update Frontend:**
   - The frontend already supports `VITE_API_URL` for plan generator
   - You'd need to update chatbot to use it too

**Note:** This is more complex and not recommended unless you have specific requirements.

## 🎉 You're Done!

Once deployed to Vercel, all features will work:
- ✅ Static content
- ✅ Plan Generator
- ✅ Chatbot
- ✅ All interactions and animations

Your site will be live and automatically update on every GitHub push!
