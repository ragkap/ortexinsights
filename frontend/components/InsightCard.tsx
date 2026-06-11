'use client';

import { useMemo } from 'react';
import MarkdownIt from 'markdown-it';

interface InsightCardProps {
  insight: {
    id: string;
    contentType: string;
    ticker: string;
    exchange?: string;
    publishedAt: string;
    headline?: string;
    body?: string;
    severity?: string;
    theme?: string;
    detail?: any;
  };
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 border-red-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  low: 'bg-green-100 text-green-800 border-green-300',
};

const CONTENT_TYPE_COLORS: Record<string, string> = {
  pulse: 'bg-blue-50 border-blue-200',
  trader_note: 'bg-purple-50 border-purple-200',
  earnings_preview: 'bg-indigo-50 border-indigo-200',
  weekly_digest: 'bg-cyan-50 border-cyan-200',
  convergence_report: 'bg-pink-50 border-pink-200',
  market_commentary: 'bg-green-50 border-green-200',
};

export default function InsightCard({ insight }: InsightCardProps) {
  const md = useMemo(() => new MarkdownIt(), []);

  // Use detail fields if available, fallback to top-level fields
  const headline = insight.detail?.headline || insight.headline;
  const body = insight.detail?.body || insight.body;
  const theme = insight.detail?.theme || insight.theme;
  const provenance = insight.detail?.provenance;
  const identifiers = insight.detail?.identifiers;
  const topics = insight.detail?.topics || insight.topics;

  const htmlContent = useMemo(
    () => (body ? md.render(body) : ''),
    [body, md]
  );

  const severityColor = insight.severity
    ? SEVERITY_COLORS[insight.severity] || 'bg-gray-100 text-gray-800'
    : 'bg-gray-100 text-gray-800';

  const contentTypeColor =
    CONTENT_TYPE_COLORS[insight.contentType] || 'bg-gray-50 border-gray-200';

  const publishedDate = new Date(insight.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className={`rounded-lg border-2 p-6 ${contentTypeColor}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold text-gray-900">
              {insight.ticker || 'N/A'}
            </span>
            {(insight.exchange || insight.detail?.exchange) && (
              <span className="text-sm text-gray-600">
                {insight.exchange || insight.detail?.exchange}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {headline || 'No headline'}
          </h3>
        </div>
        {insight.severity && (
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium border whitespace-nowrap ml-4 ${severityColor}`}
          >
            {insight.severity}
          </span>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium">
          {insight.contentType.replace(/_/g, ' ')}
        </span>
        {theme && (
          <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium">
            {theme}
          </span>
        )}
      </div>

      {/* Metadata */}
      <div className="text-xs text-gray-600 mb-4">
        Published on {publishedDate}
      </div>

      {/* Topics */}
      {topics && topics.length > 0 && (
        <div className="mb-4 pb-4 border-b border-gray-300">
          <p className="text-xs font-semibold text-gray-600 mb-2">Topics</p>
          <div className="flex flex-wrap gap-1">
            {topics.map((topic: string) => (
              <span
                key={topic}
                className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Mentioned Companies/Tickers */}
      {identifiers && identifiers.length > 0 && (
        <div className="mb-4 pb-4 border-b border-gray-300">
          <p className="text-xs font-semibold text-gray-600 mb-2">Mentioned</p>
          <div className="flex flex-wrap gap-2">
            {identifiers.map((id: any, i: number) => (
              <span
                key={i}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
              >
                {id.exchange}: {id.ticker}
                {id.isin && <span className="text-gray-700"> [{id.isin}]</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Data Sources */}
      {provenance?.dataSources && provenance.dataSources.length > 0 && (
        <div className="mb-4 pb-4 border-b border-gray-300">
          <p className="text-xs font-semibold text-gray-600 mb-2">Data Sources</p>
          <div className="flex flex-wrap gap-1">
            {provenance.dataSources.map((source: string) => (
              <span
                key={source}
                className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs"
              >
                {source}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Full Content */}
      {body && (
        <details className="mt-4 cursor-pointer">
          <summary className="text-sm font-medium text-blue-600 hover:text-blue-700 mb-3">
            View Full Content
          </summary>
          <div
            className="prose prose-sm max-w-none text-gray-800 bg-gray-50 p-4 rounded border border-gray-200"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </details>
      )}

      {/* Raw JSON for reference */}
      {insight.detail && (
        <details className="mt-4 cursor-pointer">
          <summary className="text-xs font-medium text-gray-600 hover:text-gray-800">
            Raw JSON
          </summary>
          <pre className="mt-2 bg-gray-800 text-gray-100 p-3 rounded text-xs overflow-auto max-h-48">
            {JSON.stringify(insight.detail, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
