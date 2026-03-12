'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import { Trash2, ExternalLink, ArrowRight, ShoppingCart, Zap, Lock, Globe, Shield, Terminal } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Mencegah hydration mismatch saat load dari local storage
  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  const getAuthIcon = (auth: string) => {
    switch (auth.toLowerCase()) {
      case 'apikey':
        return <Lock className="w-3 h-3" />;
      case 'oauth':
        return <Shield className="w-3 h-3" />;
      default:
        return <Globe className="w-3 h-3" />;
    }
  };

  const getAuthColor = (auth: string) => {
    switch (auth.toLowerCase()) {
      case 'apikey':
        return 'border-cyber-neon text-cyber-neon';
      case 'oauth':
        return 'border-cyber-gold text-cyber-gold';
      default:
        return 'border-cyber-border text-cyber-text-light/50';
    }
  };

  if (!mounted) return null;

  // EMPTY STATE
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 w-full">
        <div className="bg-cyber-surface border-2 border-cyber-border p-12 text-center chamfer shadow-tactical max-w-lg w-full relative">
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyber-neon -translate-x-2 translate-y-2"></div>
          
          <div className="w-20 h-20 mx-auto mb-6 bg-cyber-bg border-2 border-cyber-border flex items-center justify-center chamfer-sm">
            <ShoppingCart className="w-10 h-10 text-cyber-text-light/30" />
          </div>
          <h1 className="font-heading text-2xl font-black text-cyber-text-light mb-4 uppercase tracking-widest">
            PAYLOAD EMPTY
          </h1>
          <p className="font-mono text-sm text-cyber-text-light/60 mb-8 uppercase tracking-wider">
            No targets acquired. Scan the catalog.
          </p>
          <Link href="/catalog" className="btn-cyber inline-flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Access Terminal
          </Link>
        </div>
      </div>
    );
  }

  // ACTIVE CART STATE
  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-l-4 border-cyber-neon pl-4">
        <div>
          <h1 className="font-heading text-3xl font-black text-cyber-text-light mb-1 uppercase tracking-widest">
            Active Payload
          </h1>
          <div className="inline-flex items-center gap-2 font-mono text-cyber-neon text-xs uppercase tracking-widest font-bold">
            <span className="w-2 h-2 bg-cyber-neon animate-pulse"></span>
            {items.length} Target{items.length !== 1 ? 's' : ''} Locked
          </div>
        </div>
        <button
          onClick={clearCart}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-950/20 border-2 border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-all font-mono text-xs uppercase font-bold tracking-widest chamfer-sm group"
        >
          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
          Abort All
        </button>
      </div>

      {/* Cart Items List */}
      <div className="space-y-4 mb-8">
        {items.map((api) => (
          <div key={api.id} className="card-cyber p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 group">
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-heading text-xl font-bold text-cyber-text-light uppercase tracking-wide group-hover:text-cyber-neon transition-colors">
                  {api.name}
                </h3>
                <a
                  href={api.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyber-text-light/40 hover:text-cyber-neon transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <p className="font-sans text-sm text-cyber-text-light/70 mb-4 line-clamp-2">
                {api.description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border bg-cyber-bg ${getAuthColor(api.auth)}`}>
                  {getAuthIcon(api.auth)}
                  {api.auth === 'No' ? 'NO CLEARANCE' : api.auth.toUpperCase()}
                </span>
                <span className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border border-cyber-canvas-light text-cyber-canvas-light bg-cyber-bg">
                  {api.category}
                </span>
              </div>
            </div>

            <button
              onClick={() => removeItem(api.id)}
              className="w-full sm:w-auto p-3 sm:p-2 bg-cyber-bg border-2 border-cyber-border text-cyber-text-light/50 hover:border-red-500 hover:text-red-500 hover:bg-red-950/20 transition-all flex justify-center chamfer-sm"
              title="Remove Target"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Tactical Summary */}
      <div className="card-cyber p-6 mb-8 border-cyber-neon shadow-[4px_4px_0px_var(--cyber-neon)]">
        <h2 className="font-heading text-lg font-bold text-cyber-text-light mb-6 uppercase tracking-widest border-b border-cyber-border pb-2 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyber-neon" />
          Payload Summary
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-cyber-text-light/70 text-xs uppercase tracking-widest font-bold">
              Total Targets
            </span>
            <span className="font-heading text-2xl font-black text-cyber-neon">
              {items.length}
            </span>
          </div>
          
          <div className="flex items-center justify-between border-t border-cyber-border pt-4">
            <span className="font-mono text-cyber-text-light/70 text-xs uppercase tracking-widest font-bold">
              No Clearance Req (Free)
            </span>
            <span className="font-heading text-xl font-bold text-cyber-text-light">
              {items.filter(api => api.auth === 'No').length}
            </span>
          </div>
          
          <div className="flex items-center justify-between border-t border-cyber-border pt-4">
            <span className="font-mono text-cyber-text-light/70 text-xs uppercase tracking-widest font-bold">
              Active Sectors
            </span>
            <span className="font-heading text-xl font-bold text-cyber-gold">
              {new Set(items.map(api => api.category)).size}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/catalog" className="btn-cyber-outline flex-1 flex items-center justify-center gap-2 bg-cyber-surface">
          Scan Catalog
        </Link>
        <Link href="/checkout" className="btn-cyber flex-1 flex items-center justify-center gap-2 font-black shadow-neon">
          Initialize Extraction
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
      
    </div>
  );
}