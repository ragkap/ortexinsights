import requests
import json
import os
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

ORTEX_API_KEY = os.getenv("ORTEX_API_KEY")
ORTEX_API_URL = "https://api.ortex.com/api/v1/market_intelligence/content"
INSIGHTS_FILE = "insights.json"

if not ORTEX_API_KEY:
    raise ValueError("ORTEX_API_KEY not found in .env file")

# Default query parameters - customize as needed
DEFAULT_PARAMS = {
    # "content_type": "pulse",  # Filter by type
    # "ticker": "NYSE:AAPL",    # Filter by ticker
    # "severity": "high",        # Filter by severity
    # "page_size": 50,           # Results per page
}


def fetch_ortex_insights(params=None):
    """Fetch insights from Ortex API.

    Args:
        params: Dict of query parameters to filter results.
               Supports: content_type, exchange, include, page, page_size,
                        pulse_type, q, severity, theme, ticker, topics
    """
    try:
        query_params = DEFAULT_PARAMS.copy()
        if params:
            query_params.update(params)

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


def save_insights(insights):
    """Save insights to file with timestamp."""
    if not insights:
        return

    data = {
        "timestamp": datetime.utcnow().isoformat(),
        "insights": insights
    }

    # Append to existing file or create new
    all_insights = []
    if Path(INSIGHTS_FILE).exists():
        with open(INSIGHTS_FILE, "r") as f:
            all_insights = json.load(f)

    all_insights.append(data)

    with open(INSIGHTS_FILE, "w") as f:
        json.dump(all_insights, f, indent=2)

    print(f"Saved insights at {data['timestamp']}")


def main(custom_params=None):
    """Main entry point for the cronjob.

    Args:
        custom_params: Optional dict of query parameters to override defaults.
    """
    print(f"Fetching Ortex insights at {datetime.utcnow().isoformat()}")
    insights = fetch_ortex_insights(custom_params)
    if insights:
        enriched = enrich_insights(insights, max_details=20)
        save_insights(enriched)
    else:
        print("No insights fetched")


if __name__ == "__main__":
    main()
