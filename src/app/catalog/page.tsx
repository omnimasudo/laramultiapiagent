// src/app/catalog/page.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bot, Zap, Terminal, Database, ShieldAlert, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import APICard from '@/components/APICard';
import clsx from 'clsx';
import type { API } from '@/lib/supabase';

import apisData from '../../../data/apis.json';

export default function CatalogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const [laraQuery, setLaraQuery] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [laraResponse, setLaraResponse] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  // FIX: Smarter filtering using debounced value to prevent lag
  const filteredApis = useMemo(() => {
    const apisArray = apisData.apis as API[];
    if (!debouncedSearchQuery) return apisArray;

    const lowerQuery = debouncedSearchQuery.toLowerCase();
    return apisArray.filter(
      api => 
        api.name.toLowerCase().includes(lowerQuery) || 
        api.description.toLowerCase().includes(lowerQuery) ||
        api.category?.toLowerCase().includes(lowerQuery)
    );
  }, [debouncedSearchQuery]);

  // Paginated Results
  const totalPages = Math.ceil(filteredApis.length / itemsPerPage);
  const paginatedApis = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredApis.slice(start, start + itemsPerPage);
  }, [filteredApis, currentPage]);

  const handleAskLara = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!laraQuery.trim()) return;

    setIsAiThinking(true);
    setLaraResponse('');

    try {
      const res = await fetch('/api/lara-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: laraQuery, apis: apisData.apis })
      });

      if (!res.ok) throw new Error('Failed to reach Lara Proxy');
      
      const data = await res.json();
      setLaraResponse(data.reply);
    } catch (error) {
      setLaraResponse('SYSTEM ERROR: Unable to establish uplink to Lara central node.');
    } finally {
      setIsAiThinking(false);
    }
  };

  return (
    <div className="min-h-screen text-cyber-text-light pt-24 pb-20 px-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyber-neon/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="mb-12">
          <h1 className="font-heading text-4xl md:text-5xl font-bold uppercase tracking-widest text-cyber-neon text-glow mb-4 flex items-center gap-4">
            <Database className="w-10 h-10" />
            API Core Registry
          </h1>
          <p className="font-mono text-cyber-text-light/60 max-w-2xl text-sm leading-relaxed">
            Access secure endpoints, deploy data streams, and integrate military-grade services into your stack. Use standard search or consult the Lara AI Proxy for tactical recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 mb-12">
          {/* Section 2: Ask Lara (Expanded to full width) */}
          <div className="relative group max-w-2xl mx-auto w-full">
            <div className="absolute inset-0 bg-cyber-gold/5 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <form 
              onSubmit={handleAskLara}
              className="relative bg-black/80 border border-cyber-border clip-tactical p-2 flex items-center gap-2 focus-within:border-cyber-gold focus-within:shadow-[0_0_10px_rgba(255,215,0,0.2)] transition-all duration-300"
            >
              <div className="w-12 h-12 shrink-0 bg-black border border-cyber-gold overflow-hidden flex items-center justify-center shadow-[inset_0_0_10px_rgba(255,215,0,0.2)] relative">
                <img src="/logo.jpeg" alt="LARA" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-yellow-500/10 pointer-events-none"></div>
              </div>
              <input
                type="text"
                value={laraQuery}
                onChange={(e) => setLaraQuery(e.target.value)}
                placeholder="Ask Clara: 'Show me crypto APIs' or 'Find weather data'..."
                className="flex-grow bg-transparent border-none text-cyber-text-light font-mono text-sm px-4 py-3 focus:outline-none focus:ring-0 placeholder:text-cyber-text-light/30"
              />
              <button
                type="submit"
                disabled={isAiThinking || !laraQuery.trim()}
                className="px-6 py-3 bg-cyber-gold/10 border border-cyber-gold text-cyber-gold font-heading text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-cyber-gold hover:text-black hover:shadow-[0_0_15px_rgba(255,215,0,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed clip-tactical-sm"
              >
                {isAiThinking ? <Terminal className="w-4 h-4 animate-pulse" /> : <Zap className="w-4 h-4" />}
                {isAiThinking ? '...' : 'ASK'}
              </button>
            </form>
          </div>
        </div>

        {/* Lara Response Area */}
        <AnimatePresence>
          {laraResponse && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12 bg-cyber-surface/40 border-l-2 border-cyber-gold p-6 font-mono text-sm relative overflow-hidden group/response"
            >
              {/* Scanline effect subset */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>
              
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 shrink-0 bg-black border border-cyber-gold overflow-hidden flex items-center justify-center shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                  <img src="/logo.jpeg" alt="LARA" className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow text-cyber-text-light/90 leading-relaxed whitespace-pre-wrap">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-cyber-gold font-bold tracking-widest uppercase text-xs">CLARA_ADVISOR // TRACE_ACTIVE</span>
                    <div className="w-2 h-2 rounded-full bg-red-600 animate-ping"></div>
                  </div>
                  {laraResponse}
                </div>
                <button 
                   onClick={() => setLaraResponse('')}
                   className="text-cyber-text-light/30 hover:text-cyber-text-light"
                >
                  <Search className="w-4 h-4 rotate-45 transform" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-cyber-border pb-4 mb-8">
          <div className="flex items-center gap-4 text-xs font-mono text-cyber-text-light/50 uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <Eye className="w-3 h-3 text-cyber-neon animate-pulse" />
              Status: <span className="text-cyber-neon">Online</span>
            </span>
            <span className="hidden md:inline">•</span>
            <span>Registry: <span className="text-cyber-gold">Active</span></span>
          </div>
          <div className="font-mono text-xs text-cyber-text-light/50 uppercase">
            Page <span className="text-cyber-neon">{currentPage}</span> of <span className="text-cyber-neon">{totalPages || 1}</span> // 
            Showing <span className="text-cyber-neon">{paginatedApis.length}</span> / {filteredApis.length} targets
          </div>
        </div>

        {filteredApis.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
              {paginatedApis.map((api) => (
                <APICard key={api.id} api={api} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 py-10 border-t border-cyber-border/30 mt-10 relative">
                {/* CCTV Tactical Overlay corners for pagination */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-cyber-neon/30 to-transparent"></div>
                
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="group flex items-center gap-2 px-6 py-2 bg-black border border-cyber-border hover:border-cyber-neon hover:text-cyber-neon transition-all disabled:opacity-30 disabled:cursor-not-allowed clip-tactical-sm font-mono text-xs uppercase tracking-tighter"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev_Sector
                </button>

                <div className="flex items-center gap-2 px-4 py-2 bg-cyber-surface/30 border border-cyber-border/50 font-mono text-xs">
                  <span className="text-cyber-neon animate-pulse">[</span>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((idx) => {
                    // Show only first, last, and current + neighbors if many pages
                    if (
                      totalPages > 5 && 
                      idx !== 1 && 
                      idx !== totalPages && 
                      Math.abs(idx - currentPage) > 1
                    ) {
                      if (idx === 2 || idx === totalPages - 1) return <span key={idx} className="text-cyber-text-light/20">..</span>;
                      return null;
                    }
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(idx)}
                        className={clsx(
                          "w-8 h-8 flex items-center justify-center transition-all",
                          currentPage === idx 
                            ? "bg-cyber-neon text-black font-bold shadow-neon rotate-12" 
                            : "text-cyber-text-light/40 hover:text-cyber-neon"
                        )}
                      >
                        {idx.toString().padStart(2, '0')}
                      </button>
                    );
                  })}
                  <span className="text-cyber-neon animate-pulse text-glow">]</span>
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="group flex items-center gap-2 px-6 py-2 bg-black border border-cyber-border hover:border-cyber-neon hover:text-cyber-neon transition-all disabled:opacity-30 disabled:cursor-not-allowed clip-tactical-sm font-mono text-xs uppercase tracking-tighter"
                >
                  Next_Sector
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center border border-dashed border-cyber-border bg-black/30">
            <ShieldAlert className="w-12 h-12 text-cyber-text-light/30 mb-4" />
            <h3 className="font-heading text-xl text-cyber-text-light/70 uppercase tracking-widest mb-2">No Endpoints Found</h3>
            <p className="font-mono text-sm text-cyber-text-light/40">Try adjusting your search parameters or query Lara for alternatives.</p>
          </div>
        )}
      </div>
    </div>
  );
}