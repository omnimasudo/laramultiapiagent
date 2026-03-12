'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import { Trash2, ExternalLink, ArrowRight, ShoppingCart, Zap, Lock, Globe, Shield } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, clearCart } = useCartStore();

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

  if (items.length === 0) {
    return (
      <div className="min-h-screen cyber-grid flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 border border-[#2D2D30] flex items-center justify-center chamfer">
            <ShoppingCart className="w-12 h-12 text-[#B0B0B0]" />
          </div>
          <h1 className="text-2xl font-bold text-[#E0E0E0] mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            CART EMPTY
          </h1>
          <p className="text-[#B0B0B0] mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Start adding APIs to your collection
          </p>
          <Link href="/catalog" className="btn-cyber inline-flex items-center gap-2">
            <Zap className="w-5 h-5" />
            BROWSE CATALOG
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-grid py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#E0E0E0] mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              YOUR CART
            </h1>
            <p className="text-[#B0B0B0]" style={{ fontFamily: 'Roboto Mono, monospace' }}>
              {items.length} API{items.length !== 1 ? 's' : ''} selected
            </p>
          </div>
          <button
            onClick={clearCart}
            className="flex items-center gap-2 px-4 py-2 border border-red-500/50 text-red-500 hover:bg-red-500/10 transition-colors"
            style={{ fontFamily: 'Roboto Mono, monospace' }}
          >
            <Trash2 className="w-4 h-4" />
            CLEAR ALL
          </button>
        </div>

        {/* Cart Items */}
        <div className="space-y-4 mb-8">
          {items.map((api) => (
            <div key={api.id} className="card-cyber p-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-[#E0E0E0] font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    {api.name}
                  </h3>
                  <a
                    href={api.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#B0B0B0] hover:text-[#39FF14] transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-[#B0B0B0] text-sm mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {api.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs border ${getAuthColor(api.auth)}`} style={{ fontFamily: 'Roboto Mono, monospace' }}>
                    {getAuthIcon(api.auth)}
                    {api.auth === 'No' ? 'FREE' : api.auth.toUpperCase()}
                  </span>
                  <span className="px-2 py-0.5 text-xs border border-[#8B5A2B]/50 text-[#8B5A2B]" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                    {api.category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeItem(api.id)}
                className="p-2 text-[#B0B0B0] hover:text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card-cyber p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[#B0B0B0]" style={{ fontFamily: 'Roboto Mono, monospace' }}>
              TOTAL APIs
            </span>
            <span className="text-2xl font-bold text-[#39FF14]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              {items.length}
            </span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[#B0B0B0]" style={{ fontFamily: 'Roboto Mono, monospace' }}>
              FREE (No Auth)
            </span>
            <span className="text-[#E0E0E0]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              {items.filter(api => api.auth === 'No').length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#B0B0B0]" style={{ fontFamily: 'Roboto Mono, monospace' }}>
              CATEGORIES
            </span>
            <span className="text-[#E0E0E0]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              {new Set(items.map(api => api.category)).size}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/catalog" className="btn-cyber-outline flex-1 flex items-center justify-center gap-2">
            ADD MORE APIs
          </Link>
          <Link href="/checkout" className="btn-cyber flex-1 flex items-center justify-center gap-2">
            PROCEED TO CHECKOUT
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
