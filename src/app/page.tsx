import Link from 'next/link';
import { categories, apis, getStats } from '@/lib/api-data';
import { Zap, Database, Globe, ArrowRight, Code, Terminal, Cpu } from 'lucide-react';

export default function Home() {
  const stats = getStats();

  // Get featured categories (top 8 by API count)
  const featuredCategories = [...categories]
    .sort((a, b) => b.api_count - a.api_count)
    .slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start w-full">
      
      {/* HERO SECTION */}
      <section className="relative w-full py-20 lg:py-32 overflow-hidden flex justify-center">
        {/* Abstract Tactical Crosshairs / Decorations */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-20 left-10 w-32 h-32 border-2 border-cyber-neon/30 rotate-45 chamfer"></div>
          <div className="absolute bottom-40 right-20 w-48 h-48 border-2 border-cyber-canvas/30 -rotate-12 chamfer"></div>
          <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-cyber-neon animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-cyber-gold animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full text-center z-10">
          
          {/* System Badge */}
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-cyber-surface border-2 border-cyber-border mb-8 shadow-tactical">
            <span className="w-2 h-2 bg-cyber-neon animate-pulse"></span>
            <span className="text-cyber-text-light font-mono text-xs uppercase tracking-widest font-bold">
              laramultiapiagent // ONLINE
            </span>
            <span className="text-cyber-neon font-mono text-xs font-bold border-l-2 border-cyber-border pl-3">
              [{stats.totalApis} TARGETS ACQUIRED]
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-8xl font-black mb-6 leading-none uppercase tracking-tight">
            <span className="text-cyber-text-light">Deploy Your</span>
            <br />
            <span className="text-cyber-neon text-glow drop-shadow-[0_0_15px_rgba(57,255,20,0.5)]">
              API Arsenal
            </span>
          </h1>

          {/* Subheading */}
          <p className="font-sans text-lg sm:text-xl text-cyber-text-light/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover, route, and execute free public APIs from a curated catalog of 
            <strong className="text-cyber-neon mx-1">{stats.totalApis}+</strong> 
            endpoints across 
            <strong className="text-cyber-canvas-light mx-1">{stats.totalCategories}</strong> 
            tactical sectors.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/catalog" className="btn-cyber flex items-center gap-2 w-full sm:w-auto justify-center text-sm md:text-base">
              <Terminal className="w-5 h-5" />
              Access Terminal
            </Link>
            <Link href="/catalog?view=categories" className="btn-cyber-outline flex items-center gap-2 w-full sm:w-auto justify-center text-sm md:text-base bg-cyber-bg">
              <Database className="w-5 h-5" />
              Scan Sectors
            </Link>
          </div>
        </div>
      </section>

      {/* STATS HUD SECTION */}
      <section className="w-full py-12 border-y border-cyber-border bg-[#030303] relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x-0 md:divide-x divide-cyber-border/30">
            <div className="text-center px-4 group">
              <div className="font-heading text-4xl font-bold text-cyber-neon mb-2 group-hover:text-white transition-colors">{stats.totalApis}+</div>
              <div className="font-mono text-cyber-gold text-[10px] uppercase tracking-widest font-bold opacity-70 group-hover:opacity-100 transition-opacity">Endpoints Indexed</div>
            </div>
            <div className="text-center px-4 group">
              <div className="font-heading text-4xl font-bold text-cyber-canvas-light mb-2 group-hover:text-white transition-colors">{stats.totalCategories}</div>
              <div className="font-mono text-cyber-gold text-[10px] uppercase tracking-widest font-bold opacity-70 group-hover:opacity-100 transition-opacity">Active Sectors</div>
            </div>
            <div className="text-center px-4 group">
              <div className="font-heading text-4xl font-bold text-cyber-text-light mb-2 group-hover:text-white transition-colors">{stats.authTypes.none}</div>
              <div className="font-mono text-cyber-gold text-[10px] uppercase tracking-widest font-bold opacity-70 group-hover:opacity-100 transition-opacity">No Clearance Req</div>
            </div>
            <div className="text-center px-4 group">
              <div className="font-heading text-4xl font-bold text-cyber-neon mb-2 group-hover:text-white transition-colors">100%</div>
              <div className="font-mono text-cyber-gold text-[10px] uppercase tracking-widest font-bold opacity-70 group-hover:opacity-100 transition-opacity">Open Source</div>
            </div>
          </div>
        </div>
      </section>

      {/* TACTICAL CATEGORIES SECTION */}
      <section className="w-full py-20 relative overflow-hidden bg-cyber-bg">
        {/* Decorative background elements for this section */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-cyber-neon/5 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-t from-cyber-gold/5 run-scanline to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="font-heading text-3xl font-bold text-cyber-text-light uppercase tracking-widest mb-2 flex items-center gap-3">
                <span className="text-cyber-neon text-4xl leading-none">///</span> Primary Sectors
              </h2>
              <p className="font-mono text-sm text-cyber-text-light/60 max-w-lg mt-2 pl-8 border-l border-cyber-border">
                IDENTIFY AND EXTRACT DATA FROM HIGH-VALUE DOMAINS.
                <br />
                <span className="text-cyber-gold/80 text-xs">SECURE CONNECTION REQUIRED FOR EXTRACTION.</span>
              </p>
            </div>
            <Link
              href="/catalog?view=categories"
              className="group flex items-center gap-2 font-mono text-cyber-neon hover:text-white transition-colors font-bold uppercase text-xs tracking-widest border border-cyber-neon/30 px-6 py-3 hover:bg-cyber-neon/10 clip-tactical"
            >
              Initialize Scan <div className="w-2 h-2 bg-cyber-neon group-hover:animate-pulse shadow-neon" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCategories.map((category, index) => (
              <Link
                key={category.id}
                href={`/catalog?category=${category.slug}`}
                className="group relative h-48 bg-[#050505] border border-cyber-border hover:border-cyber-neon p-6 transition-all duration-300 hover:shadow-[0_0_15px_-3px_rgba(57,255,20,0.15)] overflow-hidden flex flex-col justify-between"
              >
                {/* Hover scanline effect */}
                <div className="absolute top-0 left-0 w-full h-0.5 bg-cyber-neon/50 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out" />
                
                {/* ID Tag */}
                <div className="absolute top-4 right-4 font-mono text-[10px] text-cyber-text-light/20 group-hover:text-cyber-neon/70 transition-colors">
                  SEC-0{index + 1}
                </div>

                {/* Tech corners */}
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyber-border group-hover:border-cyber-neon transition-colors delay-75 opacity-50" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyber-border group-hover:border-cyber-neon transition-colors delay-75 opacity-50" />

                {/* Main Content */}
                <div>
                   <div className="w-8 h-8 flex items-center justify-center mb-3 text-cyber-text-light/50 group-hover:text-cyber-neon transition-colors duration-300">
                      <Code className="w-6 h-6" />
                   </div>
                   <h3 className="font-heading text-xl font-bold text-cyber-text-light mb-1 uppercase tracking-wide group-hover:text-white transition-colors">
                    {category.name}
                  </h3>
                </div>
                  
                {/* Footer Stats */}
                <div className="pt-4 border-t border-dashed border-cyber-border/30 group-hover:border-cyber-neon/30 flex items-end justify-between">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-mono text-cyber-gold/80 uppercase tracking-wider mb-0.5">Payloads</span>
                      <div className="h-0.5 w-8 bg-cyber-gold/50 group-hover:w-12 transition-all duration-500" />
                   </div>
                   <span className="font-mono text-xl font-bold text-cyber-text-light group-hover:text-cyber-neon transition-colors">{category.api_count}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CORE PROTOCOLS (FEATURES) SECTION */}
      <section className="w-full py-24 bg-cyber-bg relative border-t border-cyber-border">
        {/* Subtle grid background for this section */}
        <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-cyber-text-light uppercase tracking-widest mb-4 inline-block pb-2 relative">
              System Capabilities
              <div className="absolute bottom-0 left-0 w-full h-1 bg-cyber-border"></div>
              <div className="absolute bottom-0 left-1/4 w-1/2 h-1 bg-cyber-neon/50"></div>
            </h2>
            <p className="font-mono text-sm text-cyber-text-light/60 max-w-xl mx-auto mt-4">
              EQUIP YOUR DEVELOPMENT WORKFLOW WITH INDUSTRIAL-GRADE TOOLS.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#050505] border border-cyber-border p-8 text-center hover:border-cyber-neon transition-all duration-300 relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-cyber-border group-hover:bg-cyber-neon transition-colors"></div>
              <div className="absolute -right-12 -bottom-12 w-24 h-24 bg-cyber-neon/5 rounded-full blur-xl group-hover:bg-cyber-neon/10 transition-colors"></div>
              
              <div className="w-16 h-16 mx-auto mb-6 bg-cyber-bg border border-cyber-border flex items-center justify-center group-hover:shadow-[0_0_15px_-3px_rgba(57,255,20,0.3)] transition-all relative z-10">
                <Database className="w-8 h-8 text-cyber-text-light/70 group-hover:text-cyber-neon transition-colors" />
                {/* Corner accents for icon */}
                <div className="absolute top-0 left-0 w-1 h-1 bg-cyber-text-light/30 group-hover:bg-cyber-neon"></div>
                <div className="absolute bottom-0 right-0 w-1 h-1 bg-cyber-text-light/30 group-hover:bg-cyber-neon"></div>
              </div>
              
              <h3 className="font-heading text-xl font-bold text-cyber-text-light mb-3 uppercase tracking-wider group-hover:text-white transition-colors">
                Curated Intel
              </h3>
              <p className="font-mono text-xs leading-relaxed text-cyber-text-light/60 group-hover:text-cyber-text-light/80 transition-colors">
                Browse 1400+ free APIs organized by sector with tactical details on auth protocols, HTTPS, and CORS support.
              </p>
            </div>

            <div className="bg-[#050505] border border-cyber-border p-8 text-center hover:border-cyber-gold transition-all duration-300 relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-cyber-border group-hover:bg-cyber-gold transition-colors"></div>
              <div className="absolute -right-12 -bottom-12 w-24 h-24 bg-cyber-gold/5 rounded-full blur-xl group-hover:bg-cyber-gold/10 transition-colors"></div>

              <div className="w-16 h-16 mx-auto mb-6 bg-cyber-bg border border-cyber-border flex items-center justify-center group-hover:shadow-[0_0_15px_-3px_rgba(212,184,86,0.3)] transition-all relative z-10">
                <Cpu className="w-8 h-8 text-cyber-text-light/70 group-hover:text-cyber-gold transition-colors" />
                 {/* Corner accents for icon */}
                <div className="absolute top-0 left-0 w-1 h-1 bg-cyber-text-light/30 group-hover:bg-cyber-gold"></div>
                <div className="absolute bottom-0 right-0 w-1 h-1 bg-cyber-text-light/30 group-hover:bg-cyber-gold"></div>
              </div>
              
              <h3 className="font-heading text-xl font-bold text-cyber-text-light mb-3 uppercase tracking-wider group-hover:text-white transition-colors">
                Automated Targeting
              </h3>
              <p className="font-mono text-xs leading-relaxed text-cyber-text-light/60 group-hover:text-cyber-text-light/80 transition-colors">
                Get intelligent AI recommendations designed to synergize with your selected payload endpoints.
              </p>
            </div>

            <div className="bg-[#050505] border border-cyber-border p-8 text-center hover:border-cyber-neon transition-all duration-300 relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-cyber-border group-hover:bg-cyber-neon transition-colors"></div>
              <div className="absolute -right-12 -bottom-12 w-24 h-24 bg-cyber-neon/5 rounded-full blur-xl group-hover:bg-cyber-neon/10 transition-colors"></div>

              <div className="w-16 h-16 mx-auto mb-6 bg-cyber-bg border border-cyber-border flex items-center justify-center group-hover:shadow-[0_0_15px_-3px_rgba(57,255,20,0.3)] transition-all relative z-10">
                <Globe className="w-8 h-8 text-cyber-text-light/70 group-hover:text-cyber-neon transition-colors" />
                 {/* Corner accents for icon */}
                <div className="absolute top-0 left-0 w-1 h-1 bg-cyber-text-light/30 group-hover:bg-cyber-neon"></div>
                <div className="absolute bottom-0 right-0 w-1 h-1 bg-cyber-text-light/30 group-hover:bg-cyber-neon"></div>
              </div>
              
              <h3 className="font-heading text-xl font-bold text-cyber-text-light mb-3 uppercase tracking-wider group-hover:text-white transition-colors">
                Extract & Deploy
              </h3>
              <p className="font-mono text-xs leading-relaxed text-cyber-text-light/60 group-hover:text-cyber-text-light/80 transition-colors">
                Rapidly export your configured collection as JSON/Markdown, or generate a secure transmission link.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="w-full py-20 border-t border-cyber-border bg-[#030303] text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#080808_1px,transparent_1px),linear-gradient(to_bottom,#080808_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50 pointer-events-none"></div>

        <div className="max-w-3xl mx-auto border border-cyber-border bg-[#050505]/80 backdrop-blur-sm p-12 relative shadow-tactical z-10">
          {/* Decorative Corner Brackets */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber-neon -translate-x-1 -translate-y-1"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyber-neon translate-x-1 -translate-y-1"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyber-neon -translate-x-1 translate-y-1"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber-neon translate-x-1 translate-y-1"></div>

          <h2 className="font-heading text-3xl font-black text-cyber-text-light mb-4 uppercase tracking-widest">
            Initialize Workflow?
          </h2>
          <p className="font-mono text-xs text-cyber-text-light/70 mb-8 max-w-md mx-auto">
            BOOT UP THE INTERFACE, SCAN THE CATALOG, AND ASSEMBLE YOUR TOOLS.
          </p>
          <Link href="/catalog" className="btn-cyber inline-flex items-center gap-2 group">
            <Zap className="w-5 h-5 group-hover:text-black transition-colors" />
            Engage System
          </Link>
        </div>
      </section>

    </div>
  );
}