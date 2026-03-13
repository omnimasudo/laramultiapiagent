'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getApisByIds } from '@/lib/api-data';
import { useCartStore } from '@/lib/store';
import type { API } from '@/lib/supabase';
import { ExternalLink, Plus, Check, Share2, ArrowLeft, Lock, Globe, Shield, Download } from 'lucide-react';

function ShareContent() {
  const searchParams = useSearchParams();
  const [collection, setCollection] = useState<{ name: string; apis: API[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addItem, isInCart } = useCartStore();

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const decoded = JSON.parse(atob(data));
        const apis = getApisByIds(decoded.apis);
        setCollection({
          name: decoded.name || 'Shared Collection',
          apis
        });
      } catch (e) {
        setError('Invalid share link');
      }
    } else {
      setError('No collection data found');
    }
  }, [searchParams]);

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

  const addAllToCart = () => {
    if (collection) {
      collection.apis.forEach(api => addItem(api));
    }
  };

  const exportAsJSON = () => {
    if (!collection) return;

    const exportData = {
      name: collection.name,
      exportedAt: new Date().toISOString(),
      totalApis: collection.apis.length,
      apis: collection.apis.map(api => ({
        name: api.name,
        description: api.description,
        url: api.url,
        auth: api.auth,
        https: api.https,
        cors: api.cors,
        category: api.category,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${collection.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#E0E0E0] mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            INVALID LINK
          </h1>
          <p className="text-[#B0B0B0] mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {error}
          </p>
          <Link href="/" className="btn-cyber">
            GO HOME
          </Link>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen cyber-grid flex items-center justify-center">
        <div className="text-[#B0B0B0]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Loading collection...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-grid py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#B0B0B0] hover:text-[#39FF14] transition-colors mb-8"
          style={{ fontFamily: 'Roboto Mono, monospace' }}
        >
          <ArrowLeft className="w-4 h-4" />
          GO HOME
        </Link>

        {/* Header */}
        <div className="card-cyber p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Share2 className="w-6 h-6 text-[#39FF14]" />
            <h1 className="text-2xl font-bold text-[#E0E0E0]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              SHARED COLLECTION
            </h1>
          </div>
          <h2 className="text-xl text-[#39FF14] mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            {collection.name}
          </h2>
          <p className="text-[#B0B0B0]" style={{ fontFamily: 'Roboto Mono, monospace' }}>
            {collection.apis.length} APIs in this collection
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <button onClick={addAllToCart} className="btn-cyber flex items-center gap-2">
            <Plus className="w-5 h-5" />
            ADD ALL TO CART
          </button>
          <button onClick={exportAsJSON} className="btn-cyber-outline flex items-center gap-2">
            <Download className="w-5 h-5" />
            EXPORT JSON
          </button>
        </div>

        {/* API List */}
        <div className="space-y-4">
          {collection.apis.map((api) => {
            const inCart = isInCart(api.id);
            return (
              <div key={api.id} className="card-cyber p-4">
                <div className="flex items-start justify-between gap-4">
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
                      {api.https && (
                        <span className="px-2 py-0.5 text-xs border border-green-500/50 text-green-500" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                          HTTPS
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => addItem(api)}
                    disabled={inCart}
                    className={`px-4 py-2 flex items-center gap-2 text-sm font-bold uppercase transition-all ${
                      inCart
                        ? 'bg-[#39FF14] text-[#0D0D0D] cursor-default'
                        : 'border border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14] hover:text-[#0D0D0D]'
                    }`}
                    style={{ fontFamily: 'Orbitron, sans-serif' }}
                  >
                    {inCart ? (
                      <>
                        <Check className="w-4 h-4" />
                        ADDED
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        ADD
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen cyber-grid flex items-center justify-center">
        <div className="text-[#B0B0B0]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Loading...
        </div>
      </div>
    }>
      <ShareContent />
    </Suspense>
  );
}
