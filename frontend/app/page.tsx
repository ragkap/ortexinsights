'use client';

import { useState, useEffect } from 'react';
import FilterPanel from '@/components/FilterPanel';
import InsightCard from '@/components/InsightCard';
import axios from 'axios';

interface Insight {
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
}

export default function Home() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    content_type: '',
    ticker: '',
    severity: '',
    theme: '',
    topics: '',
    exchange: '',
    page_size: '50',
  });

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async (currentFilters?: typeof filters) => {
    try {
      setLoading(true);
      setError(null);
      const params = currentFilters || filters;
      const query = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value) query.append(key, value);
      });

      const response = await axios.get(`/api/insights?${query.toString()}`);
      setInsights(response.data.insights || []);

      if (response.data.message && response.data.insights.length === 0) {
        setError(response.data.message);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch insights';
      setError(errorMsg);
      console.error('Insights fetch error:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    fetchInsights(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Ortex Insights</h1>
          <p className="text-gray-600 mt-1">Market intelligence and analysis</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <FilterPanel filters={filters} onFilterChange={handleFilterChange} />

        <div className="lg:col-span-3">
          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading insights...</p>
            </div>
          )}

          {error && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700">
              {error}
            </div>
          )}

          {!loading && insights.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-gray-500">No insights found. Try adjusting your filters.</p>
            </div>
          )}

          <div className="space-y-4">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>

          {!loading && insights.length > 0 && (
            <div className="mt-8 text-center text-sm text-gray-500">
              Showing {insights.length} insights
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
