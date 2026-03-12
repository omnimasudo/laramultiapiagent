'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getApisByIds } from '@/lib/api-data';
import { useCartStore } from '@/lib/store';
import type { API } from '@/lib/supabase';
import { ExternalLink, Plus, Check, Share2, ArrowLeft, Lock, Globe, Shield, Download, Terminal } from 'lucide-react';
import ActionOverlay from '@/components/ActionOverlay';

function ShareContent() {
  const searchParams = useSearchParams();
  const [collection, setCollection] = useState<{ name: string; apis: API[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addItem, isInCart } = useCartStore();
  
  // State untuk animasi Action Overlay
  const [overlay, setOverlay] = useState({ isOpen: false, message: '' });

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const decoded = JSON.parse(atob(data));
        const apis = getApisByIds(decoded.apis);
        setCollection({
          name: decoded.name || 'Classified Payload',
          apis
        });
      } catch (e) {
        setError('TRANSMISSION CORRUPTED: Invalid share link');
      }
    } else {
      setError('TRANSMISSION FAILED: No payload data found');
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
        return 'border-cyber-neon text-cyber-neon';
      case 'oauth':
        return 'border-cyber-gold text-cyber-gold';
      default:
        return 'border-cyber-border text-cyber-text-light/50';
    }
  };

  const addAllToCart = async () => {
    if (collection) {
      setOverlay({ isOpen: true, message: 'ACQUIRING ALL PAYLOADS...' });
      
      // Simulasi delay komputasi
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      collection.apis.forEach(api => addItem(api));
      
      setOverlay({ isOpen: false, message: '' });
    }
  };

  const exportAsJSON = async () => {
    if (!collection) return;

    setOverlay({ isOpen: true, message: 'EXTRACTING PAYLOAD TO JSON...' });
    
    // Simulasi delay komputasi
    await new Promise(resolve => setTimeout(resolve, 1200));

    const exportData = {
      name: collection.name,
      exportedAt: new Date().toISOString(),
      totalApis: collection.apis.length,
      operator: 'laramultiapiagent - received share',
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

    setOverlay({ isOpen: false, message: '' });
  };

  // Tampilan Error
  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 w-full">
        <div className="bg-cyber-surface border-2 border-cyber-border p-12 text-center chamfer shadow-tactical max-w-lg w-full">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-950/30 border-2 border-red-500/50 flex items-center justify-center chamfer-sm">
            <Terminal className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="font-heading text-2xl font-black text-red-500 mb-4 uppercase tracking-widest">
            ERROR 404
          </h1>
          <p className="font-mono text-sm text-cyber-text-light/70 mb-8">
            {error}
          </p>
          <Link href="/" className="btn-cyber inline-flex">
            RETURN TO BASE
          </Link>
        </div>
      </div>
    );
  }

  // Tampilan Loading Awal
  if (!collection) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center w-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyber-border border-t-cyber-neon rounded-full animate-spin"></div>
          <div className="font-mono text-cyber-neon text-sm uppercase tracking-widest font-bold animate-pulse">
            Decrypting Transmission...
          </div>
        </div>
      </div>
    );
  }

  // Tampilan Utama (Berhasil Load)
  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      {/* Panggil komponen Overlay */}
      <ActionOverlay isOpen={overlay.isOpen} message={overlay.message} />

      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 font-mono text-cyber-text-light/60 hover:text-cyber-neon transition-colors mb-8 uppercase text-sm font-bold tracking-widest"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Base
      </Link>

      {/* Header Info */}
      <div className="card-cyber p-6 mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-neon opacity-[0.03] blur-2xl group-hover:opacity-[0.1] transition-opacity"></div>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-cyber-bg border-2 border-cyber-border flex items-center justify-center chamfer-sm">
            <Share2 className="w-5 h-5 text-cyber-neon" />
          </div>
          <h1 className="font-heading text-xl font-bold text-cyber-text-light uppercase tracking-widest">
            Incoming Payload
          </h1>
        </div>
        
        <h2 className="font-heading text-3xl font-black text-cyber-neon mb-2 uppercase tracking-wide text-glow">
          {collection.name}
        </h2>
        
        <div className="inline-flex items-center gap-2 font-mono text-cyber-gold text-xs uppercase tracking-widest border border-cyber-gold/30 px-3 py-1 bg-cyber-bg">
          <span className="w-2 h-2 bg-cyber-gold animate-pulse"></span>
          {collection.apis.length} Targets Acquired
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10">
        <button onClick={addAllToCart} className="btn-cyber flex-1 flex items-center justify-center gap-2 text-sm">
          <Plus className="w-5 h-5" />
          Acquire All Targets
        </button>
        <button onClick={exportAsJSON} className="btn-cyber-outline flex-1 flex items-center justify-center gap-2 text-sm">
          <Download className="w-5 h-5" />
          Extract to JSON
        </button>
      </div>

      {/* API List */}
      <div className="space-y-4">
        <div className="font-heading text-lg font-bold text-cyber-text-light uppercase tracking-widest mb-4 border-b-2 border-cyber-border pb-2">
          Payload Details
        </div>
        
        {collection.apis.map((api) => {
          const inCart = isInCart(api.id);
          return (
            <div key={api.id} className="card-cyber p-5 hover:border-cyber-neon transition-colors group">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-heading text-xl font-bold text-cyber-text-light uppercase tracking-wide">
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
                    {api.https && (
                      <span className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border border-cyber-neon/50 text-cyber-neon bg-cyber-bg">
                        HTTPS
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-2 sm:mt-0 flex-shrink-0">
                  <button
                    onClick={() => addItem(api)}
                    disabled={inCart}
                    className={`w-full sm:w-auto px-6 py-2.5 flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-widest transition-all chamfer-sm ${
                      inCart
                        ? 'bg-cyber-neon text-cyber-bg cursor-not-allowed shadow-neon'
                        : 'border-2 border-cyber-neon text-cyber-neon hover:bg-cyber-neon hover:text-cyber-bg hover:shadow-neon'
                    }`}
                  >
                    {inCart ? (
                      <>
                        <Check className="w-4 h-4" />
                        Acquired
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Acquire
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center w-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyber-border border-t-cyber-neon rounded-full animate-spin"></div>
          <div className="font-mono text-cyber-neon text-sm uppercase tracking-widest font-bold animate-pulse">
            Establishing Link...
          </div>
        </div>
      </div>
    }>
      <ShareContent />
    </Suspense>
  );
}