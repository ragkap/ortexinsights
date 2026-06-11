import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Get filter parameters
    const contentType = searchParams.get('content_type');
    const ticker = searchParams.get('ticker');
    const severity = searchParams.get('severity');
    const theme = searchParams.get('theme');
    const topics = searchParams.get('topics');
    const exchange = searchParams.get('exchange');
    const pageSize = parseInt(searchParams.get('page_size') || '50');

    // Build SQL query
    let query = 'SELECT * FROM insights WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    // Content Type filter (can be multiple)
    if (contentType) {
      const types = contentType.split(',').map((t) => t.trim());
      query += ` AND content_type = ANY($${paramCount})`;
      params.push(types);
      paramCount++;
    }

    // Ticker filter
    if (ticker) {
      query += ` AND ticker ILIKE $${paramCount}`;
      params.push(`%${ticker}%`);
      paramCount++;
    }

    // Exchange filter
    if (exchange) {
      query += ` AND exchange ILIKE $${paramCount}`;
      params.push(`%${exchange}%`);
      paramCount++;
    }

    // Severity filter
    if (severity) {
      query += ` AND severity = $${paramCount}`;
      params.push(severity.toLowerCase());
      paramCount++;
    }

    // Theme filter (can be multiple)
    if (theme) {
      const themes = theme.split(',').map((t) => t.trim());
      query += ` AND theme = ANY($${paramCount})`;
      params.push(themes);
      paramCount++;
    }

    // Topics filter (can be multiple)
    if (topics) {
      const topicList = topics.split(',').map((t) => t.trim());
      query += ` AND topics && $${paramCount}`;
      params.push(topicList);
      paramCount++;
    }

    // Sort by published date descending
    query += ` ORDER BY published_at DESC`;

    // Limit
    query += ` LIMIT $${paramCount}`;
    params.push(pageSize);

    // Execute query
    const result = await pool.query(query, params);

    // Transform database results to API format
    const insights = result.rows.map((row) => ({
      id: row.id,
      contentType: row.content_type,
      ticker: row.ticker,
      exchange: row.exchange,
      publishedAt: row.published_at,
      headline: row.headline,
      body: row.body,
      severity: row.severity,
      theme: row.theme,
      topics: row.topics,
      detail: {
        id: row.id,
        contentType: row.content_type,
        ticker: row.ticker,
        exchange: row.exchange,
        headline: row.headline,
        body: row.body,
        severity: row.severity,
        theme: row.theme,
        publishedAt: row.published_at,
        topics: row.topics,
        ...row.data?.detail,
      },
    }));

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insights', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
