'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import type { API } from '@/lib/supabase';
import { Download, Share2, Copy, Check, Cpu, Loader2, ExternalLink, ArrowLeft, Sparkles } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [collectionName, setCollectionName] = useState('My API Collection');
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<API[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Fetch AI recommendations (client-side fallback for static export)
  useEffect(() => {
    if (items.length > 0) {
      fetchRecommendations();
    }
  }, [items]);

  const fetchRecommendations = async () => {
    setLoadingRecs(true);
    try {
      // Simple category-based recommendations (works without API)
      const { apis } = await import('@/lib/api-data');
      const selectedIds = items.map(api => api.id);
      const selectedCategories = [...new Set(items.map(api => api.category))];

      const recs = apis
        .filter(api => !selectedIds.includes(api.id))
        .filter(api => selectedCategories.includes(api.category))
        .slice(0, 3);

      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
    setLoadingRecs(false);
  };

  const generateShareLink = async () => {
    setLoading(true);
    try {
      // Generate a unique share ID
      const shareId = Math.random().toString(36).substring(2, 10);

      // For now, we'll create a client-side share link with base64 encoded data
      const shareData = {
        name: collectionName,
        apis: items.map(api => api.id),
      };
      const encoded = btoa(JSON.stringify(shareData));
      const link = `${window.location.origin}/share?data=${encoded}`;
      setShareLink(link);
    } catch (error) {
      console.error('Failed to generate share link:', error);
    }
    setLoading(false);
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportAsJSON = () => {
    const exportData = {
      name: collectionName,
      exportedAt: new Date().toISOString(),
      totalApis: items.length,
      apis: items.map(api => ({
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
    a.download = `${collectionName.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsMarkdown = () => {
    let markdown = `# ${collectionName}\n\n`;
    markdown += `> Exported from API FORGE on ${new Date().toLocaleDateString()}\n\n`;
    markdown += `**Total APIs:** ${items.length}\n\n`;
    markdown += `---\n\n`;

    // Group by category
    const byCategory = items.reduce((acc, api) => {
      if (!acc[api.category]) acc[api.category] = [];
      acc[api.category].push(api);
      return acc;
    }, {} as Record<string, typeof items>);

    for (const [category, apis] of Object.entries(byCategory)) {
      markdown += `## ${category}\n\n`;
      markdown += `| API | Description | Auth | HTTPS | CORS |\n`;
      markdown += `|-----|-------------|------|-------|------|\n`;
      for (const api of apis) {
        markdown += `| [${api.name}](${api.url}) | ${api.description} | ${api.auth} | ${api.https ? 'Yes' : 'No'} | ${api.cors} |\n`;
      }
      markdown += `\n`;
    }

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${collectionName.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen cyber-grid flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#E0E0E0] mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            NO APIs SELECTED
          </h1>
          <p className="text-[#B0B0B0] mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Add some APIs to your cart first
          </p>
          <Link href="/catalog" className="btn-cyber">
            BROWSE CATALOG
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-grid py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-[#B0B0B0] hover:text-[#39FF14] transition-colors mb-8"
          style={{ fontFamily: 'Roboto Mono, monospace' }}
        >
          <ArrowLeft className="w-4 h-4" />
          BACK TO CART
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#E0E0E0] mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            CHECKOUT
          </h1>
          <p className="text-[#B0B0B0]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Export or share your API collection
          </p>
        </div>

        {/* Collection Name */}
        <div className="card-cyber p-6 mb-6">
          <label className="block text-[#B0B0B0] text-sm mb-2" style={{ fontFamily: 'Roboto Mono, monospace' }}>
            COLLECTION NAME
          </label>
          <input
            type="text"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            className="input-cyber"
            placeholder="Enter collection name..."
          />
        </div>

        {/* Summary */}
        <div className="card-cyber p-6 mb-6">
          <h2 className="text-xl font-bold text-[#E0E0E0] mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            COLLECTION SUMMARY
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 border border-[#2D2D30]">
              <div className="text-2xl font-bold text-[#39FF14]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {items.length}
              </div>
              <div className="text-[#B0B0B0] text-sm" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                APIs
              </div>
            </div>
            <div className="text-center p-4 border border-[#2D2D30]">
              <div className="text-2xl font-bold text-[#8B5A2B]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {new Set(items.map(api => api.category)).size}
              </div>
              <div className="text-[#B0B0B0] text-sm" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                Categories
              </div>
            </div>
            <div className="text-center p-4 border border-[#2D2D30]">
              <div className="text-2xl font-bold text-[#E0E0E0]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {items.filter(api => api.auth === 'No').length}
              </div>
              <div className="text-[#B0B0B0] text-sm" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                Free APIs
              </div>
            </div>
          </div>

          {/* API List */}
          <div className="max-h-60 overflow-y-auto space-y-2">
            {items.map((api) => (
              <div key={api.id} className="flex items-center justify-between p-3 bg-[#0D0D0D] border border-[#2D2D30]">
                <div className="flex items-center gap-3">
                  <span className="text-[#E0E0E0] font-medium" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {api.name}
                  </span>
                  <span className="text-xs text-[#8B5A2B]" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                    {api.category}
                  </span>
                </div>
                <a
                  href={api.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#B0B0B0] hover:text-[#39FF14]"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        {(loadingRecs || recommendations.length > 0) && (
          <div className="card-cyber p-6 mb-6 border-[#8B5A2B]">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-5 h-5 text-[#8B5A2B]" />
              <h2 className="text-xl font-bold text-[#E0E0E0]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                AI RECOMMENDATIONS
              </h2>
            </div>
            {loadingRecs ? (
              <div className="flex items-center gap-3 text-[#B0B0B0]">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Analyzing your selection...</span>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[#B0B0B0] text-sm mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Based on your selection, you might also like:
                </p>
                {recommendations.map((api) => (
                  <div key={api.id} className="flex items-center justify-between p-3 bg-[#0D0D0D] border border-[#8B5A2B]/30">
                    <div>
                      <span className="text-[#E0E0E0] font-medium" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        {api.name}
                      </span>
                      <span className="text-xs text-[#B0B0B0] ml-2">
                        {api.description.slice(0, 50)}...
                      </span>
                    </div>
                    <Sparkles className="w-4 h-4 text-[#8B5A2B]" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Export Options */}
        <div className="card-cyber p-6 mb-6">
          <h2 className="text-xl font-bold text-[#E0E0E0] mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            EXPORT OPTIONS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={exportAsJSON}
              className="btn-cyber-outline flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              EXPORT AS JSON
            </button>
            <button
              onClick={exportAsMarkdown}
              className="btn-cyber-outline flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              EXPORT AS MARKDOWN
            </button>
          </div>
        </div>

        {/* Share Options */}
        <div className="card-cyber p-6 mb-6">
          <h2 className="text-xl font-bold text-[#E0E0E0] mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            SHARE COLLECTION
          </h2>
          {!shareLink ? (
            <button
              onClick={generateShareLink}
              disabled={loading}
              className="btn-cyber w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  GENERATING...
                </>
              ) : (
                <>
                  <Share2 className="w-5 h-5" />
                  GENERATE SHARE LINK
                </>
              )}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="input-cyber flex-1"
                />
                <button
                  onClick={() => copyToClipboard(shareLink)}
                  className="btn-cyber flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                      COPIED
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      COPY
                    </>
                  )}
                </button>
              </div>
              <p className="text-[#B0B0B0] text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Share this link to let others view your API collection
              </p>
            </div>
          )}
        </div>

        {/* Done Button */}
        <div className="flex gap-4">
          <Link href="/catalog" className="btn-cyber-outline flex-1 flex items-center justify-center">
            CONTINUE BROWSING
          </Link>
          <button
            onClick={() => {
              clearCart();
              router.push('/');
            }}
            className="btn-cyber flex-1 flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            DONE
          </button>
        </div>
      </div>
    </div>
  );
}
