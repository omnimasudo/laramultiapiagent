'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { categories, apis } from '@/lib/api-data';
import APICard from '@/components/APICard';
import { Search, Filter, X } from 'lucide-react';

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [authFilter, setAuthFilter] = useState<string>('all');
  const [httpsFilter, setHttpsFilter] = useState<boolean | null>(null);
  const [corsFilter, setCorsFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredApis = useMemo(() => {
    let result = apis;

    // Category filter
    if (selectedCategory !== 'all') {
      const category = categories.find(c => c.slug === selectedCategory);
      if (category) {
        result = result.filter(api => api.category_id === category.id);
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(api =>
        api.name.toLowerCase().includes(query) ||
        api.description.toLowerCase().includes(query)
      );
    }

    // Auth filter
    if (authFilter !== 'all') {
      result = result.filter(api => api.auth === authFilter);
    }

    // HTTPS filter
    if (httpsFilter !== null) {
      result = result.filter(api => api.https === httpsFilter);
    }

    // CORS filter
    if (corsFilter !== 'all') {
      result = result.filter(api => api.cors === corsFilter);
    }

    return result;
  }, [searchQuery, selectedCategory, authFilter, httpsFilter, corsFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setAuthFilter('all');
    setHttpsFilter(null);
    setCorsFilter('all');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || authFilter !== 'all' || httpsFilter !== null || corsFilter !== 'all';

  return (
    <div className="min-h-screen cyber-grid py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#E0E0E0] mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            API CATALOG
          </h1>
          <p className="text-[#B0B0B0]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Browse and add APIs to your collection
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B0B0B0]" />
              <input
                type="text"
                placeholder="Search APIs by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-cyber pl-12"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 border transition-all ${
                showFilters ? 'border-[#39FF14] text-[#39FF14]' : 'border-[#2D2D30] text-[#B0B0B0] hover:border-[#39FF14] hover:text-[#39FF14]'
              }`}
              style={{ fontFamily: 'Roboto Mono, monospace' }}
            >
              <Filter className="w-5 h-5" />
              FILTERS
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-[#39FF14] rounded-full"></span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="card-cyber p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#E0E0E0] font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  FILTERS
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-[#39FF14] text-sm flex items-center gap-1 hover:underline"
                    style={{ fontFamily: 'Roboto Mono, monospace' }}
                  >
                    <X className="w-4 h-4" />
                    CLEAR ALL
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-[#B0B0B0] text-sm mb-2" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                    CATEGORY
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input-cyber"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name} ({cat.api_count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Auth Type */}
                <div>
                  <label className="block text-[#B0B0B0] text-sm mb-2" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                    AUTH TYPE
                  </label>
                  <select
                    value={authFilter}
                    onChange={(e) => setAuthFilter(e.target.value)}
                    className="input-cyber"
                  >
                    <option value="all">All Auth Types</option>
                    <option value="No">No Auth (Free)</option>
                    <option value="apiKey">API Key</option>
                    <option value="OAuth">OAuth</option>
                  </select>
                </div>

                {/* HTTPS */}
                <div>
                  <label className="block text-[#B0B0B0] text-sm mb-2" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                    HTTPS
                  </label>
                  <select
                    value={httpsFilter === null ? 'all' : httpsFilter ? 'yes' : 'no'}
                    onChange={(e) => setHttpsFilter(e.target.value === 'all' ? null : e.target.value === 'yes')}
                    className="input-cyber"
                  >
                    <option value="all">All</option>
                    <option value="yes">HTTPS Only</option>
                    <option value="no">HTTP Only</option>
                  </select>
                </div>

                {/* CORS */}
                <div>
                  <label className="block text-[#B0B0B0] text-sm mb-2" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                    CORS
                  </label>
                  <select
                    value={corsFilter}
                    onChange={(e) => setCorsFilter(e.target.value)}
                    className="input-cyber"
                  >
                    <option value="all">All</option>
                    <option value="Yes">CORS Enabled</option>
                    <option value="No">No CORS</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-[#B0B0B0]" style={{ fontFamily: 'Roboto Mono, monospace' }}>
            SHOWING <span className="text-[#39FF14]">{filteredApis.length}</span> APIs
            {selectedCategory !== 'all' && (
              <span className="text-[#8B5A2B]"> in {categories.find(c => c.slug === selectedCategory)?.name}</span>
            )}
          </p>
        </div>

        {/* API Grid */}
        {filteredApis.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApis.map(api => (
              <APICard key={api.id} api={api} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-[#B0B0B0] text-lg mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              No APIs found matching your criteria
            </div>
            <button
              onClick={clearFilters}
              className="btn-cyber-outline"
            >
              CLEAR FILTERS
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CatalogLoading() {
  return (
    <div className="min-h-screen cyber-grid py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="h-10 w-48 skeleton-cyber mb-2"></div>
          <div className="h-6 w-64 skeleton-cyber"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card-cyber p-6 h-48 skeleton-cyber"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<CatalogLoading />}>
      <CatalogContent />
    </Suspense>
  );
}
