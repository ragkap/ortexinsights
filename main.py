import requests
import json
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import Json

load_dotenv()

ORTEX_API_KEY = os.getenv("ORTEX_API_KEY")
ORTEX_API_URL = "https://api.ortex.com/api/v1/market_intelligence/content"
DATABASE_URL = os.getenv("DATABASE_URL")
POLL_INTERVAL_MINUTES = int(os.getenv("POLL_INTERVAL_MINUTES", "15"))

if not ORTEX_API_KEY:
    raise ValueError("ORTEX_API_KEY not found in .env file")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in .env file")

# Default query parameters - customize as needed
DEFAULT_PARAMS = {
    # "content_type": "pulse",  # Filter by type
    # "ticker": "NYSE:AAPL",    # Filter by ticker
    # "severity": "high",        # Filter by severity
    # "page_size": 50,           # Results per page
}


def init_db():
    """Initialize PostgreSQL database schema."""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        # Create insights table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS insights (
                id INTEGER PRIMARY KEY,
                content_type VARCHAR(50),
                ticker VARCHAR(20),
                exchange VARCHAR(20),
                published_at TIMESTAMP,
                headline TEXT,
                body TEXT,
                severity VARCHAR(20),
                theme VARCHAR(50),
                topics TEXT[],
                data JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Create index on published_at for faster queries
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_published_at ON insights(published_at DESC);
        """)

        conn.commit()
        cur.close()
        conn.close()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Error initializing database: {e}")
        raise


def fetch_ortex_insights(params=None, minutes_back=None):
    """Fetch insights from Ortex API.

    Args:
        params: Dict of query parameters to filter results.
        minutes_back: Only fetch insights published in the last X minutes.
                     If None, uses POLL_INTERVAL_MINUTES.
    """
    try:
        query_params = DEFAULT_PARAMS.copy()
        if params:
            query_params.update(params)

        # If minutes_back not specified, use polling interval
        if minutes_back is None:
            minutes_back = POLL_INTERVAL_MINUTES

        # Calculate cutoff time (go back a bit extra to avoid missing edge cases)
        cutoff_time = datetime.utcnow() - timedelta(minutes=minutes_back + 2)
        cutoff_iso = cutoff_time.isoformat() + "Z"

        # Add publishedAfter filter to only get recent insights
        query_params["publishedAfter"] = cutoff_iso

        print(f"Fetching insights published after: {cutoff_iso}")

        response = requests.get(
            ORTEX_API_URL,
            headers={
                "accept": "application/json",
                "Authorization": f"Bearer {ORTEX_API_KEY}"
            },
            params=query_params,
            timeout=30
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching Ortex insights: {e}")
        return None


def fetch_insight_detail(insight_id):
    """Fetch detailed information for a specific insight."""
    try:
        detail_url = f"{ORTEX_API_URL}/{insight_id}"
        response = requests.get(
            detail_url,
            headers={
                "accept": "application/json",
                "Authorization": f"Bearer {ORTEX_API_KEY}"
            },
            timeout=30
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching detail for insight {insight_id}: {e}")
        return None


def enrich_insights(insights, max_details=20):
    """Fetch detailed info for each insight.

    Args:
        insights: API response containing insights
        max_details: Maximum number of insights to enrich (default 20 to avoid rate limits)
    """
    if not insights:
        return insights

    # Check if insights is a list or dict with rows/data key
    if isinstance(insights, list):
        insight_list = insights
    elif isinstance(insights, dict):
        insight_list = insights.get("rows", insights.get("data", []))
    else:
        insight_list = []

    print(f"Found {len(insight_list)} total insights")
    print(f"Enriching first {min(max_details, len(insight_list))} with details...")

    for i, insight in enumerate(insight_list[:max_details]):
        insight_id = insight.get("id")
        if insight_id:
            detail = fetch_insight_detail(insight_id)
            if detail:
                insight["detail"] = detail
                print(f"  [{i+1}/{min(max_details, len(insight_list))}] Fetched detail for ID {insight_id}")

    return insights


def save_to_db(insights):
    """Save insights to PostgreSQL database."""
    if not insights:
        return

    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        # Extract rows from API response
        if isinstance(insights, list):
            insight_list = insights
        elif isinstance(insights, dict):
            insight_list = insights.get("rows", insights.get("data", []))
        else:
            insight_list = []

        inserted_count = 0
        updated_count = 0

        for insight in insight_list:
            insight_id = insight.get("id")
            content_type = insight.get("contentType")
            ticker = insight.get("ticker")
            exchange = insight.get("exchange")
            published_at = insight.get("publishedAt")
            topics = insight.get("topics", [])

            # Detail fields
            detail = insight.get("detail", {})
            headline = detail.get("headline")
            body = detail.get("body")
            severity = detail.get("severity")
            theme = detail.get("theme")

            try:
                # Insert or update insight
                cur.execute("""
                    INSERT INTO insights (
                        id, content_type, ticker, exchange, published_at,
                        headline, body, severity, theme, topics, data
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO UPDATE SET
                        updated_at = CURRENT_TIMESTAMP,
                        data = EXCLUDED.data
                    RETURNING id;
                """, (
                    insight_id, content_type, ticker, exchange, published_at,
                    headline, body, severity, theme, topics, Json(insight)
                ))

                result = cur.fetchone()
                if result:
                    inserted_count += 1

            except Exception as e:
                print(f"Error saving insight {insight_id}: {e}")

        conn.commit()
        cur.close()
        conn.close()

        print(f"Saved to database: {inserted_count} insights")

    except Exception as e:
        print(f"Error saving insights to database: {e}")


def main(custom_params=None):
    """Main entry point for the cronjob.

    Args:
        custom_params: Optional dict of query parameters to override defaults.
    """
    print(f"Starting Ortex insights fetch at {datetime.utcnow().isoformat()}")
    print(f"Poll interval: {POLL_INTERVAL_MINUTES} minutes")

    # Initialize database
    init_db()

    # Fetch insights published in the last POLL_INTERVAL_MINUTES
    insights = fetch_ortex_insights(custom_params, minutes_back=POLL_INTERVAL_MINUTES)
    if insights:
        print(f"Fetched insights successfully")
        enriched = enrich_insights(insights, max_details=20)
        save_to_db(enriched)
        print(f"Complete! Insights saved to PostgreSQL database")
    else:
        print("No insights fetched")


if __name__ == "__main__":
    main()
