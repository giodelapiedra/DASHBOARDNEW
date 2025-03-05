# Vercel Deployment Guide

Follow these steps to deploy your Next.js application to Vercel:

## 1. Prepare Your Repository

Make sure your code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## 2. Deploy Through Vercel Web Interface

1. **Go to the Vercel dashboard**:
   - Open your browser and go to https://vercel.com/dashboard

2. **Create a new project**:
   - Click on "Add New..." > "Project"
   - Select your GitHub repository "DASHBOARDNEW"
   - Click "Import"

3. **Configure project settings**:
   - **Framework Preset**: Make sure Next.js is selected
   - **Root Directory**: Keep as `.`
   - **Build Command**: Enter `next build --no-lint --no-types`
   - **Output Directory**: Keep as `.next`

4. **Environment Variables** (this is crucial):
   - Add the following environment variables:
     - Name: `MONGODB_URI` 
       Value: `mongodb+srv://database:Giopogi24@cluster0.aaex8.mongodb.net/news_dashboard?retryWrites=true&w=majority`
     
     - Name: `NEXTAUTH_SECRET` 
       Value: `news_dashboard_secret_key_change_this_in_production`
     
     - Name: `NEXTAUTH_URL` 
       Value: The URL of your deployed site (you'll need to update this after deployment)

5. **Deploy**:
   - Click "Deploy"

6. **After deployment**:
   - Update the `NEXTAUTH_URL` environment variable with your actual deployed URL in the project settings

## 3. Troubleshooting

If you encounter build errors:

1. **Check the build logs** for specific errors
2. **Verify environment variables** are set correctly
3. **Consider using a static export** if dynamic API routes are causing issues:
   - Update your `next.config.js` to include `output: 'export'`
   - Remove or adapt server-side API routes

## 4. Alternative Deployment Options

If Vercel deployment continues to fail, consider:

1. **Netlify**: Similar to Vercel but with different build processes
2. **Traditional hosting**: Deploy using the instructions in your `deploy-instructions.md` file
3. **Static export**: Generate static files with `next build && next export` and host them on any static hosting service 