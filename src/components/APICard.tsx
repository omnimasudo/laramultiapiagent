'use client';

import { useCartStore } from '@/lib/store';
import type { API } from '@/lib/supabase';
import { ExternalLink, Plus, Check, Lock, Globe, Shield } from 'lucide-react';

interface APICardProps {
  api: API;
}

export default function APICard({ api }: APICardProps) {
  const { addItem, removeItem, isInCart } = useCartStore();
  const inCart = isInCart(api.id);

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
        return 'border-[#39FF14] text-[#39FF14]';
      case 'oauth':
        return 'border-yellow-500 text-yellow-500';
      default:
        return 'border-[#B0B0B0]/50 text-[#B0B0B0]/50';
    }
  };

  return (
    <div className="card-cyber p-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3
          className="text-[#E0E0E0] font-bold text-lg leading-tight truncate"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          {api.name}
        </h3>
        <a
          href={api.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 p-1.5 text-[#B0B0B0] hover:text-[#39FF14] hover:bg-[#39FF14]/10 transition-colors"
          title="View Documentation"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Description */}
      <p className="text-[#B0B0B0] text-sm mb-4 line-clamp-2 flex-grow" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        {api.description}
      </p>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs border ${getAuthColor(api.auth)}`} style={{ fontFamily: 'Roboto Mono, monospace' }}>
          {getAuthIcon(api.auth)}
          {api.auth === 'No' ? 'FREE' : api.auth.toUpperCase()}
        </span>
        {api.https && (
          <span className="inline-flex items-center px-2 py-0.5 text-xs border border-green-500/50 text-green-500" style={{ fontFamily: 'Roboto Mono, monospace' }}>
            HTTPS
          </span>
        )}
        {api.cors === 'Yes' && (
          <span className="inline-flex items-center px-2 py-0.5 text-xs border border-blue-500/50 text-blue-500" style={{ fontFamily: 'Roboto Mono, monospace' }}>
            CORS
          </span>
        )}
      </div>

      {/* Category */}
      <div className="text-xs text-[#8B5A2B] mb-4 uppercase tracking-wide" style={{ fontFamily: 'Roboto Mono, monospace' }}>
        {api.category}
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={() => inCart ? removeItem(api.id) : addItem(api)}
        className={`w-full py-2.5 flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-sm transition-all ${
          inCart
            ? 'bg-[#39FF14] text-[#0D0D0D]'
            : 'border border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14] hover:text-[#0D0D0D]'
        }`}
        style={{
          fontFamily: 'Orbitron, sans-serif',
          clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
        }}
      >
        {inCart ? (
          <>
            <Check className="w-4 h-4" />
            IN CART
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            ADD TO CART
          </>
        )}
      </button>
    </div>
  );
}
