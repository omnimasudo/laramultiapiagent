'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { categories, apis } from '@/lib/api-data';
import APICard from '@/components/APICard';
import { Search, Filter, X, Terminal } from 'lucide-react';

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
      if (httpsFilter) {
          result = result.filter(api => api.https === true);
      } else {
          result = result.filter(api => api.https === false);
      }
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
    <div className="w-full max-w-7xl mx-auto py-8">
      
      {/* Header */}
      <div className="mb-8 border-l-4 border-cyber-neon pl-4 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-black text-cyber-text-light uppercase tracking-widest mb-1 flex items-center gap-3">
            <Terminal className="w-8 h-8 text-cyber-neon hidden sm:block" />
            Target Catalog
          </h1>
          <p className="font-sans text-cyber-text-light/60">
            Scan, filter, and acquire endpoints for your loadout.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-cyber-surface border-2 border-cyber-border chamfer-sm">
           <div className="w-2 h-2 bg-cyber-neon animate-pulse"></div>
           <span className="font-mono text-[10px] text-cyber-neon uppercase font-bold tracking-widest">Database Sync: OK</span>
        </div>
      </div>

      {/* Control Panel (Search and Filters) */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative group">
            <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center bg-cyber-surface border-r-2 border-cyber-border group-focus-within:border-cyber-neon transition-colors">
              <Search className="w-5 h-5 text-cyber-gold group-focus-within:text-cyber-neon transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Query payload by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-cyber pl-16 text-lg py-4 w-full"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-6 py-4 border-2 transition-all font-mono uppercase font-bold text-sm tracking-widest chamfer-sm ${
              showFilters 
                ? 'bg-cyber-neon text-cyber-bg border-cyber-neon shadow-neon' 
                : 'bg-cyber-surface border-cyber-border text-cyber-text-light hover:border-cyber-neon hover:text-cyber-neon'
            }`}
          >
            <Filter className="w-5 h-5" />
            Parameters
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-cyber-bg border border-current rounded-full ml-1"></span>
            )}
          </button>
        </div>

        {/* Tactical Filter Panel */}
        {showFilters && (
          <div className="bg-cyber-bg border-2 border-cyber-border p-6 relative shadow-[4px_4px_0px_rgba(0,0,0,0.8)] chamfer group">
            {/* Dekorasi Panel */}
            <div className="absolute top-0 left-0 w-full h-1 bg-cyber-surface group-hover:bg-cyber-neon transition-colors"></div>
            
            <div className="flex items-center justify-between mb-6 border-b border-cyber-border pb-4">
              <h3 className="font-heading text-lg font-bold text-cyber-text-light uppercase tracking-widest flex items-center gap-2">
                <div className="w-3 h-3 bg-cyber-gold"></div>
                Refine Search
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="font-mono text-xs text-red-500 hover:text-red-400 flex items-center gap-1 uppercase tracking-widest border border-red-500/30 px-2 py-1 hover:bg-red-950/20 transition-all"
                >
                  <X className="w-3 h-3" />
                  Reset Params
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category */}
              <div>
                <label className="block font-mono text-cyber-gold text-[10px] uppercase tracking-widest mb-2 font-bold">
                  Sector / Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-cyber py-2 text-sm"
                >
                  <option value="all">All Sectors</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name} ({cat.api_count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Auth Type */}
              <div>
                <label className="block font-mono text-cyber-gold text-[10px] uppercase tracking-widest mb-2 font-bold">
                  Clearance (Auth)
                </label>
                <select
                  value={authFilter}
                  onChange={(e) => setAuthFilter(e.target.value)}
                  className="input-cyber py-2 text-sm"
                >
                  <option value="all">All Clearances</option>
                  <option value="No">No Clearance (Free)</option>
                  <option value="apiKey">API Key Required</option>
                  <option value="OAuth">OAuth Protected</option>
                </select>
              </div>

              {/* HTTPS */}
              <div>
                <label className="block font-mono text-cyber-gold text-[10px] uppercase tracking-widest mb-2 font-bold">
                  Encryption (HTTPS)
                </label>
                <select
                  value={httpsFilter === null ? 'all' : httpsFilter ? 'yes' : 'no'}
                  onChange={(e) => setHttpsFilter(e.target.value === 'all' ? null : e.target.value === 'yes')}
                  className="input-cyber py-2 text-sm"
                >
                  <option value="all">Any Protocol</option>
                  <option value="yes">HTTPS Encrypted</option>
                  <option value="no">HTTP Unsecured</option>
                </select>
              </div>

              {/* CORS */}
              <div>
                <label className="block font-mono text-cyber-gold text-[10px] uppercase tracking-widest mb-2 font-bold">
                  Cross-Origin (CORS)
                </label>
                <select
                  value={corsFilter}
                  onChange={(e) => setCorsFilter(e.target.value)}
                  className="input-cyber py-2 text-sm"
                >
                  <option value="all">Any Origin Status</option>
                  <option value="Yes">CORS Enabled</option>
                  <option value="No">CORS Disabled</option>
                  <option value="Unknown">Status Unknown</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count HUD */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 bg-cyber-surface border-y-2 border-cyber-border py-3 px-4">
        <div className="font-mono text-sm text-cyber-text-light/70 uppercase tracking-widest">
          Found <span className="font-bold text-cyber-neon text-lg mx-1">{filteredApis.length}</span> Targets
          {selectedCategory !== 'all' && (
            <span> in sector <span className="text-cyber-canvas-light font-bold">[{categories.find(c => c.slug === selectedCategory)?.name}]</span></span>
          )}
        </div>
      </div>

      {/* API Grid */}
      {filteredApis.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApis.map(api => (
            <APICard key={api.id} api={api} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-cyber-surface border-2 border-dashed border-cyber-border chamfer shadow-tactical">
          <Terminal className="w-12 h-12 text-cyber-text-light/20 mx-auto mb-4" />
          <div className="font-heading text-xl font-bold text-cyber-text-light mb-2 uppercase tracking-widest">
            Scan Returned Zero Results
          </div>
          <p className="font-sans text-cyber-text-light/60 mb-6 text-sm">
            Adjust your filter parameters to locate targets.
          </p>
          <button
            onClick={clearFilters}
            className="btn-cyber-outline inline-flex"
          >
            Reset Parameters
          </button>
        </div>
      )}
    </div>
  );
}

// Loading State (Skeleton)
function CatalogLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto py-8">
      <div className="mb-8 border-l-4 border-cyber-border pl-4">
        <div className="h-8 w-48 skeleton-cyber mb-2"></div>
        <div className="h-4 w-64 skeleton-cyber opacity-50"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-cyber-surface border-2 border-cyber-border p-6 h-56 skeleton-cyber chamfer shadow-[4px_4px_0px_rgba(0,0,0,0.5)]"></div>
        ))}
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