# Ortex Insights

A full-stack app for fetching, storing, and viewing Ortex market intelligence insights.

**Components:**
- **Backend**: Python script fetches from Ortex API every X minutes (configurable)
- **Frontend**: Next.js app for browsing and filtering insights
- **Database**: PostgreSQL stores all insights with full-text search support

## Quick Start

### Prerequisites
- Python 3.9+
- PostgreSQL database (local or cloud)
- Node.js 18+ (for frontend)

### 1. Setup Backend

```bash
# Create .env file
cp .env.example .env

# Edit .env with your config:
# ORTEX_API_KEY=your_actual_key
# DATABASE_URL=postgresql://user:password@localhost:5432/ortex_insights
# POLL_INTERVAL_MINUTES=15  (how often cron fetches data)
```

```bash
# Install Python dependencies
pip install -r requirements.txt

# Test locally (creates DB schema and fetches insights)
python main.py
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3001 to browse insights.

## Features

### Backend
- Fetches from Ortex API every X minutes (configurable via `POLL_INTERVAL_MINUTES`)
- Enriches first 20 insights with full details
- Stores in PostgreSQL (not JSON files)
- Automatic database schema creation
- Error handling and logging

### Frontend
- **Multi-select filters**: Content type, theme, topics
- **Single filters**: Ticker, exchange, severity
- **Display fields**: 
  - Headline + body (markdown → HTML)
  - Mentioned companies with ISIN codes
  - Data sources (short_interest, options, etc.)
  - Topics tags
- **Sorting**: By published date (newest first)
- **Expandable details**: Full content + raw JSON
- **Responsive design**: Works on desktop/tablet/mobile

## Configuration

### Environment Variables

**Backend (.env)**
```
ORTEX_API_KEY=your_api_key_here
DATABASE_URL=postgresql://user:password@localhost:5432/ortex_insights
POLL_INTERVAL_MINUTES=15
```

**Configurable options:**
- `POLL_INTERVAL_MINUTES`: How often the cronjob should fetch (default: 15)
- Data is stored in PostgreSQL, so you can run multiple polling instances

## Deployment

### Deploy to Railway

1. Push to GitHub
2. Go to https://railway.app
3. New Project → Deploy from GitHub repo
4. Select `ortexinsights`
5. Set environment variables:
   - `ORTEX_API_KEY`: Your Ortex API key
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `POLL_INTERVAL_MINUTES`: (optional, default: 15)
6. Railway auto-deploys on git push

### Setup 15-Minute Polling

The backend runs when deployed, but you need external cron to trigger it regularly:

**Option A: Use cron-job.org (Free)**
1. Go to https://cron-job.org
2. New Cronjob
3. URL: `https://your-railway-app.up.railway.app/`
4. Schedule: `*/15 * * * *` (every 15 minutes)

**Option B: Use Railway background jobs**
- Contact Railway support to enable background job runner

## Database Schema

The PostgreSQL database stores:

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary key (Ortex insight ID) |
| content_type | VARCHAR(50) | pulse, market_commentary, etc. |
| ticker | VARCHAR(20) | Stock ticker |
| exchange | VARCHAR(20) | NYSE, NASDAQ, etc. |
| published_at | TIMESTAMP | When insight was published |
| headline | TEXT | Insight headline |
| body | TEXT | Full markdown content |
| severity | VARCHAR(20) | critical, high, medium, low |
| theme | VARCHAR(50) | Theme/category |
| topics | TEXT[] | Array of topics |
| data | JSONB | Raw JSON from API |
| created_at | TIMESTAMP | When row was created |
| updated_at | TIMESTAMP | When row was last updated |

Indexes on `published_at` for fast queries.

## API Endpoints

### GET /api/insights

Filter insights with query parameters:

```
/api/insights?content_type=pulse,market_commentary&severity=high&page_size=50
```

**Parameters:**
- `content_type`: Comma-separated (pulse, market_commentary, etc.)
- `ticker`: Stock ticker or exchange:ticker
- `exchange`: Exchange filter (NYSE, NASDAQ, etc.)
- `severity`: critical, high, medium, low
- `theme`: Comma-separated themes
- `topics`: Comma-separated topics
- `page_size`: Results per page (default: 50)

**Response:**
```json
{
  "insights": [
    {
      "id": 97840,
      "contentType": "market_commentary",
      "ticker": null,
      "exchange": null,
      "publishedAt": "2026-06-11T00:50:25.156962Z",
      "headline": "Earnings, Short Bets, and Insider Signals Collide",
      "body": "# Markdown content...",
      "severity": null,
      "theme": "general",
      "topics": ["general", "short_interest"],
      "detail": { ...full details... }
    }
  ]
}
```

## Local Development

### Start both services

Terminal 1 - Backend:
```bash
python main.py
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### Test the flow

1. Backend fetches from Ortex API → stores in PostgreSQL
2. Frontend reads from `/api/insights` → displays in UI
3. Filtering happens in the API route (client sends filter params)

## Troubleshooting

### "ERROR: database "ortex_insights" does not exist"
- Create the database first: `createdb ortex_insights`
- Or update `DATABASE_URL` to point to an existing database

### Frontend shows "Failed to fetch insights"
- Check backend is running
- Verify `DATABASE_URL` is correct
- Check logs: `python main.py`

### Insights not updating
- Check if backend cron job is running
- Verify `ORTEX_API_KEY` is set correctly
- Check cron-job.org shows successful pings

### Port already in use
- Frontend: `npm run dev -- -p 3002` (use different port)

## Cost

- **Railway**: $10-20/month (frontend + database)
- **PostgreSQL**: Free tier available on Railway, or use external DB
- **cron-job.org**: Free

## Next Steps

1. Setup PostgreSQL database
2. Configure `.env` with API key and DB URL
3. Test locally: `python main.py`
4. Deploy to Railway
5. Setup cron-job.org for polling
6. Share the app URL!

For more: See DEPLOY.md and RAILWAY_DEPLOYMENT.md
