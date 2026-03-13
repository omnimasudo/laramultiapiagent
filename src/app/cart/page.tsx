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
      
      {/* Header with tactical visuals */}
      <div className="relative mb-10 p-6 border border-cyber-border bg-cyber-surface/50 overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="absolute top-0 left-0 w-1 h-full bg-cyber-neon shadow-[0_0_10px_var(--cyber-neon)]"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyber-neon/10 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="w-3 h-3 bg-red-600 animate-pulse rounded-full shadow-[0_0_8px_red]"></div>
               <span className="font-mono text-xs text-red-500 tracking-widest uppercase">System Protocol: PURGE_READY</span>
            </div>
            <h1 className="font-heading text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyber-text-light to-gray-500 uppercase tracking-widest mb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              Active Payload
            </h1>
            <div className="inline-flex items-center gap-2 font-mono text-cyber-neon text-xs uppercase tracking-widest font-bold border border-cyber-neon/30 px-3 py-1 bg-cyber-neon/5">
              <span className="w-2 h-2 bg-cyber-neon animate-pulse"></span>
              STATUS: {items.length} Target{items.length !== 1 ? 's' : ''} Locked
            </div>
          </div>
          
          <button
            onClick={clearCart}
            className="group relative px-6 py-2 overflow-hidden bg-black border border-red-900/50 text-red-500 font-mono text-xs uppercase font-bold tracking-widest hover:text-red-400 transition-all hover:border-red-500 hover:shadow-[0_0_15px_rgba(220,38,38,0.4)]"
          >
            <span className="absolute inset-0 w-full h-full bg-red-900/10 group-hover:bg-red-900/20 transition-all"></span>
            <span className="relative flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Abort Sequence
            </span>
          </button>
        </div>
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