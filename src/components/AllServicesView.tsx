import { useState, useMemo } from 'react';
import type { AWSService } from '../types';

interface AllServicesViewProps {
  services: AWSService[];
  onBack: () => void;
}

export function AllServicesView({ services, onBack }: AllServicesViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDepth, setSelectedDepth] = useState<number | 'all'>('all');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const categories = useMemo(() => {
    const cats = [...new Set(services.map((s) => s.category))];
    return cats.sort();
  }, [services]);

  const filtered = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        searchTerm === '' ||
        service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.problemSolved.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;

      const matchesDepth = selectedDepth === 'all' || service.knowledgeDepth === selectedDepth;

      return matchesSearch && matchesCategory && matchesDepth;
    });
  }, [services, searchTerm, selectedCategory, selectedDepth]);

  const getDepthBadge = (depth: number) => {
    const labels = ['Beginner', 'Intermediate', 'Advanced'];
    const colors = ['bg-green-100 text-green-800', 'bg-yellow-100 text-yellow-800', 'bg-red-100 text-red-800'];
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${colors[depth] || colors[0]}`}>
        {labels[depth] || 'Unknown'}
      </span>
    );
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 sticky top-0 z-10 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">All AWS Services</h1>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Search Bar */}
        <div className="max-w-6xl mx-auto">
          <input
            type="text"
            placeholder="Search by service name or problem solved..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg text-gray-800 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-300"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-9 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Filter */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Depth Filter */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Knowledge Depth
              </label>
              <select
                value={selectedDepth}
                onChange={(e) => setSelectedDepth(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="all">All Levels</option>
                <option value={0}>Beginner</option>
                <option value={1}>Intermediate</option>
                <option value={2}>Advanced</option>
              </select>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-3">
            Showing {filtered.length} of {services.length} services
          </p>
        </div>
      </div>

      {/* Services List */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No services found matching your filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((service, index) => (
              <div
                key={`${service.category}-${service.serviceName}`}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="w-full px-6 py-4 text-left focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{service.serviceName}</h3>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(service.serviceName, index);
                          }}
                          className={`p-1.5 rounded transition-all cursor-pointer ${
                            copiedIndex === index
                              ? 'bg-green-100 text-green-600'
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'
                          }`}
                          title={copiedIndex === index ? 'Copied!' : 'Copy service name'}
                        >
                          {copiedIndex === index ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-sm text-gray-500">{service.category}</span>
                        {getDepthBadge(service.knowledgeDepth)}
                      </div>
                    </div>
                    <div className="text-2xl ml-4 text-gray-400">
                      {expandedIndex === index ? '▼' : '▶'}
                    </div>
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedIndex === index && (
                  <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Problem Solved</h4>
                      <p className="text-gray-600">{service.problemSolved}</p>
                    </div>
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Scenario & Solution</h4>
                      <p className="text-gray-600">{service.scenarioAndSolution}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Step-by-Step Usage</h4>
                      <p className="text-gray-600 text-sm">{service.simpleStepByStepUsage}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
