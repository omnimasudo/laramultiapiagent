import Link from 'next/link';
import { categories, apis, getStats } from '@/lib/api-data';
import { Zap, Database, Shield, Globe, ArrowRight, Code, Terminal, Cpu } from 'lucide-react';

export default function Home() {
  const stats = getStats();

  // Get featured categories (top 8 by API count)
  const featuredCategories = [...categories]
    .sort((a, b) => b.api_count - a.api_count)
    .slice(0, 8);

  // Get sample APIs for hero section
  const sampleApis = apis.slice(0, 6);

  return (
    <div className="cyber-grid min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 border border-[#39FF14]/20 rotate-45"></div>
          <div className="absolute bottom-40 right-20 w-48 h-48 border border-[#8B5A2B]/20 rotate-12"></div>
          <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-[#39FF14] animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-[#39FF14] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1A1D] border border-[#2D2D30] mb-8" style={{ fontFamily: 'Roboto Mono, monospace' }}>
              <span className="w-2 h-2 bg-[#39FF14] animate-pulse"></span>
              <span className="text-[#B0B0B0] text-sm uppercase tracking-wider">SYSTEM ONLINE</span>
              <span className="text-[#39FF14] text-sm">// {stats.totalApis} APIs INDEXED</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-6 leading-tight" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              <span className="text-[#E0E0E0]">FORGE YOUR</span>
              <br />
              <span className="text-[#39FF14] text-glow">API ARSENAL</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-[#B0B0B0] max-w-2xl mx-auto mb-10" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Discover, collect, and export free public APIs from a curated catalog of
              <span className="text-[#39FF14]"> {stats.totalApis}+ </span>
              endpoints across
              <span className="text-[#8B5A2B]"> {stats.totalCategories} </span>
              categories.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/catalog" className="btn-cyber flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                BROWSE CATALOG
              </Link>
              <Link href="/catalog?view=categories" className="btn-cyber-outline flex items-center gap-2">
                <Database className="w-5 h-5" />
                VIEW CATEGORIES
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-[#2D2D30]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-[#39FF14] mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {stats.totalApis}+
              </div>
              <div className="text-[#B0B0B0] text-sm uppercase tracking-wider" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                APIs Indexed
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-[#8B5A2B] mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {stats.totalCategories}
              </div>
              <div className="text-[#B0B0B0] text-sm uppercase tracking-wider" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                Categories
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-[#E0E0E0] mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {stats.authTypes.none}
              </div>
              <div className="text-[#B0B0B0] text-sm uppercase tracking-wider" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                No Auth Required
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-[#39FF14] mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                100%
              </div>
              <div className="text-[#B0B0B0] text-sm uppercase tracking-wider" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                Free to Use
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#E0E0E0] mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                TOP CATEGORIES
              </h2>
              <p className="text-[#B0B0B0]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Browse APIs by domain
              </p>
            </div>
            <Link
              href="/catalog?view=categories"
              className="hidden sm:flex items-center gap-2 text-[#39FF14] hover:text-[#2ACC10] transition-colors"
              style={{ fontFamily: 'Roboto Mono, monospace' }}
            >
              VIEW ALL <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredCategories.map((category) => (
              <Link
                key={category.id}
                href={`/catalog?category=${category.slug}`}
                className="card-cyber p-6 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 border border-[#39FF14]/50 flex items-center justify-center group-hover:border-[#39FF14] group-hover:bg-[#39FF14]/10 transition-all">
                    <Code className="w-5 h-5 text-[#39FF14]" />
                  </div>
                </div>
                <h3 className="text-[#E0E0E0] font-bold mb-1 group-hover:text-[#39FF14] transition-colors" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  {category.name}
                </h3>
                <p className="text-[#B0B0B0] text-sm" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                  {category.api_count} APIs
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-[#2D2D30]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#E0E0E0] mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              FORGE CAPABILITIES
            </h2>
            <p className="text-[#B0B0B0] max-w-xl mx-auto" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Powerful tools for discovering and organizing APIs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-cyber p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 border border-[#39FF14] flex items-center justify-center chamfer">
                <Database className="w-8 h-8 text-[#39FF14]" />
              </div>
              <h3 className="text-xl font-bold text-[#E0E0E0] mb-3" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                CURATED CATALOG
              </h3>
              <p className="text-[#B0B0B0]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Browse 1400+ free APIs organized by category with detailed info on auth, HTTPS, and CORS support.
              </p>
            </div>

            <div className="card-cyber p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 border border-[#8B5A2B] flex items-center justify-center chamfer">
                <Cpu className="w-8 h-8 text-[#8B5A2B]" />
              </div>
              <h3 className="text-xl font-bold text-[#E0E0E0] mb-3" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                AI RECOMMENDATIONS
              </h3>
              <p className="text-[#B0B0B0]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Get intelligent API suggestions powered by AI based on your selected APIs.
              </p>
            </div>

            <div className="card-cyber p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 border border-[#39FF14] flex items-center justify-center chamfer">
                <Globe className="w-8 h-8 text-[#39FF14]" />
              </div>
              <h3 className="text-xl font-bold text-[#E0E0E0] mb-3" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                SHARE & EXPORT
              </h3>
              <p className="text-[#B0B0B0]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Export your collection as JSON or Markdown, or share via unique link.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-[#2D2D30]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#E0E0E0] mb-6" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            READY TO BUILD?
          </h2>
          <p className="text-[#B0B0B0] text-lg mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Start exploring the catalog and forge your perfect API collection.
          </p>
          <Link href="/catalog" className="btn-cyber inline-flex items-center gap-2">
            <Zap className="w-5 h-5" />
            START FORGING
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[#2D2D30]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#39FF14]" />
              <span className="text-[#B0B0B0] text-sm" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                API FORGE // BUILT BY MINIMAX AGENT
              </span>
            </div>
            <div className="text-[#B0B0B0] text-sm" style={{ fontFamily: 'Roboto Mono, monospace' }}>
              Data sourced from public-apis
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
