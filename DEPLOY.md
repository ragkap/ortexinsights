# Deploy to Railway

## Quick Start (3 steps)

### 1. Push to GitHub
```bash
git add .
git commit -m "fix: railway config"
git push origin main
```

### 2. Go to Railway Dashboard
1. https://railway.app
2. New Project → Deploy from GitHub
3. Select `ortexinsights` repo
4. Wait for deployment to complete

### 3. Set Environment Variable
1. Click on your project
2. Go to "Variables"
3. Add: `ORTEX_API_KEY` = your actual API key
4. Redeploy (or just wait for the next push)

**Your app is live!** 🚀

---

## After Deployment

### View Your App
- Click your project → "Frontend" service → click the domain URL
- App runs on Next.js production server

### View Logs
```bash
railway logs --follow
```

### Setup 15-Minute Data Polling

The app needs to fetch from Ortex every 15 minutes. Use a free cron service:

1. Go to https://cron-job.org
2. Create account (free)
3. New Cronjob:
   - **URL**: `https://your-railway-domain.up.railway.app/`
   - **Schedule**: Every 15 minutes (`*/15 * * * *`)
4. Save

**Note:** The backend Python script would normally run via cron-job.org pinging the endpoint.

---

## Troubleshooting

### Build fails with "Script start.sh not found"
- ✅ Fixed! Uses `railway.json` instead

### App won't load
1. Check logs: `railway logs --follow`
2. Verify `ORTEX_API_KEY` is set
3. Check frontend builds correctly: `npm run build` locally

### Insights showing "No insights data found"
- This is normal on first load
- Run the Python script locally once: `python main.py`
- Or setup the cron job to fetch data regularly

---

## Cost

- **Free tier**: $5/month credit
- **Typical**: ~$10-20/month
  - Frontend: ~$2/month
  - Storage/processing: minimal

---

## Architecture

```
GitHub (source) 
    ↓
Railway (builds & deploys)
    ↓
Next.js Frontend (Node.js server)
    ↓
/api/insights endpoint (filters data)
    ↓
insights.json (data file)
```

The backend Python script runs on-demand (no background job support).

---

## Questions?

- Railway docs: https://docs.railway.app
- Next.js docs: https://nextjs.org
- See RAILWAY_DEPLOYMENT.md for advanced options
