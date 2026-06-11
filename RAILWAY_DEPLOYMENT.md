# Deploying to Railway

Railway makes it easy to deploy both backend (Python) and frontend (Next.js). Here's how:

## Option 1: Separate Services (Recommended)

Deploy as 2 separate Railway services for better scalability and isolation.

### Step 1: Setup Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Create a new project

### Step 2: Deploy Frontend

1. In Railway dashboard, click "New Project"
2. Select "Deploy from GitHub"
3. Connect your repo
4. Select the `ortexinsights` repo
5. In Settings, set:
   - **Root Directory**: `frontend`
   - **Start Command**: `npm start`
   - **Build Command**: `npm run build`

### Step 3: Deploy Backend

1. In the same Railway project, click "Add Service"
2. Select "GitHub"
3. Same repo
4. In Settings, set:
   - **Root Directory**: `.` (project root)
   - **Start Command**: `python main.py`
   - **Build Command**: (leave empty)
5. Add environment variables:
   - `ORTEX_API_KEY`: Your actual API key
   - `RAILWAY_ENVIRONMENT`: production

### Step 4: Share Data Between Services

The backend generates `insights.json` which the frontend reads.

**Option A: Shared Volume (Simple)**
- Both services mount the same volume
- Backend writes to `/data/insights.json`
- Frontend reads from `/data/insights.json`

**Option B: PostgreSQL Database (Better for production)**
- Backend writes insights to database
- Frontend reads from database via API

### Step 5: Setup Automatic Polling

The backend runs once when deployed. For 15-minute intervals:

**Use an external cron service:**
1. Go to https://cron-job.org
2. Create a new cron job
3. Set URL to: `https://your-railway-app.up.railway.app/api/fetch`
4. Set schedule: `*/15 * * * *` (every 15 minutes)

---

## Option 2: Single Monolithic Service (Simpler)

Deploy everything as one service on Railway.

### Requirements
- Node.js and Python both available
- One `package.json` that runs both services

### Setup

1. Create root `Procfile`:
```
backend: python main.py
frontend: cd frontend && npm start
```

2. Or create root `package.json`:
```json
{
  "scripts": {
    "start": "concurrently \"python main.py\" \"cd frontend && npm start\""
  }
}
```

3. Deploy to Railway
4. Set **Start Command**: `npm start`

---

## Quick Start

### Prerequisites
```bash
# Install Railway CLI
npm install -g @railway/cli

# Or with homebrew
brew install railway
```

### Deploy in 3 commands
```bash
# Login
railway login

# Link to project
railway init

# Deploy
railway up
```

### View logs
```bash
railway logs --follow
```

### Set environment variables
```bash
railway variables set ORTEX_API_KEY=your_key_here
```

---

## Environment Variables Needed

For Railway, set these in the Dashboard or via CLI:

**Backend:**
- `ORTEX_API_KEY`: Your Ortex API key

**Frontend:**
- `NEXT_PUBLIC_API_URL`: (optional, defaults to same origin)

---

## Database Option (Recommended for Production)

Instead of `insights.json`, use a database:

### Add PostgreSQL
1. In Railway dashboard: "Add Service" → "PostgreSQL"
2. It auto-injects `DATABASE_URL` into your services

### Update Backend (`main.py`)
```python
import os
import psycopg2

db_url = os.getenv('DATABASE_URL')
# Connect and write insights to database instead of JSON file
```

### Update Frontend API
```typescript
// Read from database instead of insights.json
const response = await fetch('/api/insights', {
  params: { ... }
});
```

---

## Pricing

Railway charges per service per hour:
- Free tier: First $5/month
- Frontend: ~$1-2/month
- Backend (always running): ~$5-10/month
- PostgreSQL: ~$5-15/month

Total: ~$15-30/month (very affordable)

---

## Troubleshooting

### Insights not updating
- Check if backend service is running: `railway logs`
- Verify `ORTEX_API_KEY` is set correctly
- Check cron-job.org shows successful pings

### Frontend can't read insights.json
- Ensure both services use same volume
- Or switch to database instead

### Build fails
- Check logs: `railway logs --follow`
- Ensure `package.json` exists in frontend
- Ensure `requirements.txt` exists in root

---

## Next Steps

1. Push code to GitHub
2. Go to https://railway.app
3. Create new project
4. Connect GitHub
5. Select repository
6. Set environment variables
7. Deploy!

For detailed Railway docs: https://docs.railway.app
