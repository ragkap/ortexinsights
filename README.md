# Ortex Insights Fetcher

A Python app that fetches market intelligence insights from Ortex API and stores them locally.

## Setup

1. Clone or download this repository

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file with your Ortex API key:
   ```bash
   cp .env.example .env
   # Edit .env and add your ORTEX_API_KEY
   ```

4. (Optional) Customize filters in `main.py` — edit `DEFAULT_PARAMS` to set your preferred content types, tickers, severity levels, etc.

5. Test the script locally:
   ```bash
   python main.py
   ```

## Deployment on cron-job.org

1. **Prepare your script for HTTP execution:**
   - Upload `main.py` and `requirements.txt` to a web-accessible location (e.g., GitHub raw content or your own server)
   - Or create a wrapper endpoint that runs the script

2. **Configure cron-job.org:**
   - Log in to https://cron-job.org/
   - Create a new cron job
   - Set the URL to your deployment endpoint
   - Set schedule to every 15 minutes: `*/15 * * * *`

3. **Alternative: Use a webhook endpoint**
   - Deploy this script on a service like Heroku, Railway, or AWS Lambda
   - Configure the cron job to POST/GET to your endpoint
   - The endpoint calls `main.py`

## Output

- Insights are saved to `insights.json` with timestamps
- Each poll appends a new entry to the file
- Format:
  ```json
  [
    {
      "timestamp": "2026-06-11T...",
      "insights": { ... }
    }
  ]
  ```

## Features

- Fetches insights from Ortex market intelligence API
- Filters by: content type, ticker, severity, theme, topics, exchange, and more
- Automatically enriches each insight with detailed information
- Appends all data with timestamps to `insights.json`
- Handles API errors gracefully

## Query Parameters

Edit `DEFAULT_PARAMS` in `main.py` to filter results. Supported parameters:

- `content_type` — pulse, earnings_preview, trader_note, weekly_digest, convergence_report, market_commentary
- `ticker` — e.g., "NYSE:AAPL" or "AAPL" (with separate `exchange` param)
- `exchange` — NYSE, NASDAQ, LSE, etc. (case-insensitive)
- `severity` — critical, high, medium, low
- `pulse_type` — short_interest, analyst, options, institutional, ctb, utilization, signal, convergence
- `theme` — week_ahead, overall, short_interest, analyst, options, convergence, general, events, insider, money_flow
- `topics` — analyst, earnings, options, short_interest, signals, utilization, etc. (comma-separated)
- `q` — Free-text search across headline + body
- `page` — Page number (default: 1)
- `page_size` — Results per page (default: varies)
- `include` — Additional fields: headline, body, provenance, theme, pulseType, identifiers (comma-separated)

Example:
```python
DEFAULT_PARAMS = {
    "content_type": "pulse",
    "ticker": "NYSE:AAPL",
    "severity": "high",
    "page_size": 50
}
```

## Deployment Notes

When deploying to cron-job.org:
- Ensure the `.env` file is in the same directory as `main.py`
- Never commit `.env` to version control (add to `.gitignore`)
- On serverless platforms (Lambda, Cloud Functions), set `ORTEX_API_KEY` as an environment variable instead

## How to Run

1. **One-time fetch:**
   ```bash
   python main.py
   ```

2. **For recurring 15-minute fetches on cron-job.org:**
   - Deploy this app to a hosting service (Railway, Heroku, etc.)
   - Create a webhook/endpoint that runs `python main.py`
   - Configure cron-job.org to call that endpoint every 15 minutes

## Notes

- The script fetches up to 1000 insights per poll
- It enriches the first 20 insights with detailed information to avoid rate limiting
- Insights accumulate in `insights.json` (consider archiving old data periodically)
- The API key is sent in the Authorization header as a Bearer token
- Detail fetch includes: headline, body, pulseType, theme, provenance, identifiers, and topics
# ortexinsights
