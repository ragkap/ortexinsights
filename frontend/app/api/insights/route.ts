import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Read insights from the JSON file
    const insightsPath = path.join(process.cwd(), '..', 'insights.json');

    if (!fs.existsSync(insightsPath)) {
      return NextResponse.json(
        { insights: [], message: 'No insights data found. Run the Python backend first.' },
        { status: 200 }
      );
    }

    const fileContent = fs.readFileSync(insightsPath, 'utf-8');
    const allData = JSON.parse(fileContent);

    // Get the latest insights (last entry in the array)
    const latestData = allData[allData.length - 1];
    let insightsResponse = latestData?.insights || {};

    // Extract the array from response structure
    let insights = [];
    if (Array.isArray(insightsResponse)) {
      insights = insightsResponse;
    } else if (insightsResponse.rows) {
      insights = insightsResponse.rows;
    } else if (insightsResponse.data) {
      insights = insightsResponse.data;
    }

    // Apply filters
    const contentType = searchParams.get('content_type');
    const ticker = searchParams.get('ticker');
    const severity = searchParams.get('severity');
    const theme = searchParams.get('theme');
    const topics = searchParams.get('topics');
    const exchange = searchParams.get('exchange');
    const pageSize = parseInt(searchParams.get('page_size') || '50');

    let filtered = insights.filter((insight: any) => {
      // Content Type - can be multiple (comma-separated)
      if (contentType) {
        const contentTypes = contentType.split(',').map((t) => t.trim().toLowerCase());
        const insightType = (insight.contentType || '').toLowerCase();
        if (!contentTypes.includes(insightType)) {
          return false;
        }
      }

      // Ticker
      if (ticker) {
        const insightTicker = (insight.ticker || '').toLowerCase();
        const searchTicker = ticker.toLowerCase();
        if (!insightTicker.includes(searchTicker)) {
          return false;
        }
      }

      // Severity - only filter if it has a value
      if (
        severity &&
        insight.severity?.toLowerCase() !== severity.toLowerCase()
      ) {
        return false;
      }

      // Theme - can be multiple (comma-separated)
      if (theme) {
        const themes = theme.split(',').map((t) => t.trim().toLowerCase());
        const detailTheme = (insight.detail?.theme || insight.theme || '').toLowerCase();
        if (!themes.includes(detailTheme)) {
          return false;
        }
      }

      // Exchange
      if (exchange) {
        const insightEx = (insight.exchange || '').toLowerCase();
        const searchEx = exchange.toLowerCase();
        if (!insightEx.includes(searchEx)) {
          return false;
        }
      }

      // Topics - can be multiple (comma-separated)
      if (topics) {
        const topicList = topics.split(',').map((t) => t.trim().toLowerCase());
        const insightTopics = (insight.topics || []).map((t: string) =>
          t.toLowerCase()
        );
        const hasMatch = topicList.some((t) =>
          insightTopics.some((it: string) => it.includes(t) || t.includes(it))
        );
        if (!hasMatch && topicList.length > 0) {
          return false;
        }
      }

      return true;
    });

    // Paginate results
    filtered = filtered.slice(0, pageSize);

    return NextResponse.json({ insights: filtered });
  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}
