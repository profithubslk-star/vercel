# Deployment Guide

This guide will help you deploy your trading platform to get a public URL.

## Quick Deploy Options

### Option 1: Vercel (Recommended - Easiest)

1. **Sign up/Login**: Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. **Import Project**:
   - Click "Add New..." → "Project"
   - Import your Git repository
3. **Configure**:
   - Framework: Auto-detected (Vite)
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables**: Add these in Vercel dashboard:
   ```
   VITE_SUPABASE_URL=https://follajepfhzkqevrwezv.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvbGxhamVwZmh6a3FldnJ3ZXp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MjEyNTcsImV4cCI6MjA4NjQ5NzI1N30.WX8g5y4MHcwlzgjFBPoy00kNe5CiIVQf9q26CYsFnDQ
   VITE_DERIV_APP_ID=your_app_id_here
   ```
5. **Deploy**: Click "Deploy"
6. **Get URL**: Your app will be at `https://your-project.vercel.app`

### Option 2: Netlify

1. **Sign up/Login**: Go to [netlify.com](https://netlify.com) and sign in
2. **Add New Site**:
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository
3. **Configure**:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
4. **Environment Variables**: Add in Site Settings → Environment Variables:
   ```
   VITE_SUPABASE_URL=https://follajepfhzkqevrwezv.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvbGxhamVwZmh6a3FldnJ3ZXp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MjEyNTcsImV4cCI6MjA4NjQ5NzI1N30.WX8g5y4MHcwlzgjFBPoy00kNe5CiIVQf9q26CYsFnDQ
   VITE_DERIV_APP_ID=your_app_id_here
   ```
5. **Deploy**: Click "Deploy site"
6. **Get URL**: Your app will be at `https://your-project.netlify.app`

## After Deployment

Once deployed, you'll get a URL like:
- Vercel: `https://your-project.vercel.app`
- Netlify: `https://your-project.netlify.app`

### Configure Deriv OAuth

1. Copy your production URL
2. Go to [Deriv API Dashboard](https://api.deriv.com/app-registration/)
3. Edit your app
4. Add redirect URL: `https://your-project.vercel.app/auth/callback`
5. Update your `.env` file (or environment variables in hosting):
   ```
   VITE_DERIV_APP_ID=your_actual_app_id
   ```
6. Redeploy if needed

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify build runs locally: `npm run build`

### Environment Variables Not Working
- Make sure to redeploy after adding env vars
- Check variable names start with `VITE_`

### 404 on Refresh
- Vercel/Netlify config files are included to handle this
- They redirect all routes to `index.html` for client-side routing

## Custom Domain (Optional)

Both Vercel and Netlify allow you to add custom domains:
1. Go to your project settings
2. Add custom domain
3. Update DNS records as instructed
4. SSL certificate is automatically provisioned

## Next Steps

After deployment:
1. Test the app at your production URL
2. Connect Deriv account using OAuth or API Token
3. Verify all features work correctly
4. Share the URL with users!
