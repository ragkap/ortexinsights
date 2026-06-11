# Quick Deploy to Railway

## 1. Push to GitHub

```bash
cd /Users/raghavkapoor/projects/ortexinsights

git add .
git commit -m "feat: add ortex insights app with frontend and backend"
git push origin main
```

## 2. Deploy to Railway

### Option A: Via Railway Dashboard (Easiest)

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize GitHub and select `ortexinsights` repo
5. Railway auto-detects `package.json` and `Procfile`
6. Click "Deploy"
7. Go to "Variables" and set:
   - `ORTEX_API_KEY`: Your actual API key
8. Done! Railway handles the rest

### Option B: Via Railway CLI

```bash
# Install Railway CLI (if not already installed)
npm install -g @railway/cli

# Login to Railway
railway login

# Navigate to project
cd /Users/raghavkapoor/projects/ortexinsights

# Initialize Railway
railway init

# Set environment variables
railway variables set ORTEX_API_KEY=your_actual_key_here

# Deploy
railway up
```

## 3. View Your App

After deployment:
1. Go to https://railway.app
2. Open your project
3. Click "Frontend" service
4. Click the URL under "Domains"
5. Your app is live!

## 4. Setup 15-Minute Polling

Railway will run the backend, but you need external polling to refresh data every 15 minutes.

### Using cron-job.org (Free)

1. Go to https://cron-job.org
2. Sign up (free account)
3. Create "New Cronjob"
4. Set:
   - **URL**: `https://your-railway-domain.up.railway.app/api/fetch` 
   - **Schedule**: Custom - `*/15 * * * *`
   - **Notifications**: Email on failure
5. Click "Create"

### Or use Railway's built-in jobs

Contact Railway support to enable background jobs for your account.

## 5. View Logs

```bash
railway logs --follow
```

## 6. Update the App

Just push to GitHub:
```bash
git add .
git commit -m "update: ..."
git push origin main
```

Railway auto-redeploys on push!

## Environment Variables

Set in Railway Dashboard → Variables:

```
ORTEX_API_KEY=your_key_here
```

## Pricing

- **Free tier**: $5/month credit
- **Typical usage**: $10-20/month
  - Frontend: ~$2/month
  - Backend: ~$5-10/month
  - Database (optional): ~$5/month

## Troubleshooting

### App won't start
```bash
railway logs --follow
# Check for Python or Node errors
```

### Insights not updating
- Check if backend is running: look at logs
- Verify cron job is triggering
- Check `ORTEX_API_KEY` is set correctly

### Port issues
Railway automatically assigns port. Frontend should bind to `process.env.PORT || 3000`

## Next Steps

1. Commit and push code
2. Create Railway account
3. Deploy via dashboard
4. Set `ORTEX_API_KEY` environment variable
5. Setup cron-job.org for polling
6. Share the URL!

For Railway docs: https://docs.railway.app
