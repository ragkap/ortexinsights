'use client';

import { useState } from 'react';

interface FilterPanelProps {
  filters: {
    content_type: string;
    ticker: string;
    severity: string;
    theme: string;
    topics: string;
    exchange: string;
    page_size: string;
  };
  onFilterChange: (filters: any) => void;
}

const CONTENT_TYPES = [
  'convergence_report',
  'earnings_preview',
  'market_commentary',
  'pulse',
  'trader_note',
  'weekly_digest',
];

const SEVERITIES = ['critical', 'high', 'medium', 'low'];

const THEMES = [
  'analyst',
  'convergence',
  'events',
  'general',
  'insider',
  'money_flow',
  'options',
  'overall',
  'short_interest',
  'week_ahead',
];

const TOPICS = [
  'analyst',
  'convergence',
  'cost_to_borrow',
  'earnings',
  'general',
  'insider',
  'institutional',
  'money_flow',
  'options',
  'short_interest',
  'signals',
  'utilization',
];

const EXCHANGES = ['NYSE', 'NASDAQ', 'LSE', 'XETRA', 'TSE'];

export default function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (key: string, value: string) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handleMultiSelect = (key: string, items: string[]) => {
    const value = items.join(',');
    handleChange(key, value);
  };

  const getSelectedItems = (value: string): string[] => {
    return value ? value.split(',').filter(v => v.trim()) : [];
  };

  const handleReset = () => {
    const reset = {
      content_type: '',
      ticker: '',
      severity: '',
      theme: '',
      topics: '',
      exchange: '',
      page_size: '50',
    };
    setLocalFilters(reset);
    onFilterChange(reset);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 h-fit sticky top-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Filters</h2>

      <div className="space-y-6">
        {/* Content Type - Multi-select */}
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-3">
            Content Type
          </legend>
          <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3 bg-white">
            {CONTENT_TYPES.map((type) => {
              const selected = getSelectedItems(localFilters.content_type);
              return (
                <label key={type} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.includes(type)}
                    onChange={(e) => {
                      const items = [...selected];
                      if (e.target.checked) {
                        items.push(type);
                      } else {
                        items.splice(items.indexOf(type), 1);
                      }
                      handleMultiSelect('content_type', items);
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {type.replace(/_/g, ' ')}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Ticker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ticker
          </label>
          <input
            type="text"
            value={localFilters.ticker}
            onChange={(e) => handleChange('ticker', e.target.value)}
            placeholder="e.g., NYSE:AAPL"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Exchange */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Exchange
          </label>
          <select
            value={localFilters.exchange}
            onChange={(e) => handleChange('exchange', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            {EXCHANGES.map((ex) => (
              <option key={ex} value={ex}>
                {ex}
              </option>
            ))}
          </select>
        </div>

        {/* Severity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Severity
          </label>
          <select
            value={localFilters.severity}
            onChange={(e) => handleChange('severity', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            {SEVERITIES.map((sev) => (
              <option key={sev} value={sev}>
                {sev.charAt(0).toUpperCase() + sev.slice(1)}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Note: Only available for certain content types
          </p>
        </div>

        {/* Theme - Multi-select */}
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-3">
            Theme
          </legend>
          <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3 bg-white">
            {THEMES.map((theme) => {
              const selected = getSelectedItems(localFilters.theme);
              return (
                <label key={theme} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.includes(theme)}
                    onChange={(e) => {
                      const items = [...selected];
                      if (e.target.checked) {
                        items.push(theme);
                      } else {
                        items.splice(items.indexOf(theme), 1);
                      }
                      handleMultiSelect('theme', items);
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {theme.replace(/_/g, ' ')}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Topics - Multi-select */}
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-3">
            Topics
          </legend>
          <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3 bg-white">
            {TOPICS.map((topic) => {
              const selected = getSelectedItems(localFilters.topics);
              return (
                <label key={topic} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.includes(topic)}
                    onChange={(e) => {
                      const items = [...selected];
                      if (e.target.checked) {
                        items.push(topic);
                      } else {
                        items.splice(items.indexOf(topic), 1);
                      }
                      handleMultiSelect('topics', items);
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {topic.replace(/_/g, ' ')}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Page Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Results per Page
          </label>
          <select
            value={localFilters.page_size}
            onChange={(e) => handleChange('page_size', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
