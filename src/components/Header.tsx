'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import { ShoppingCart, Zap, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { items } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0D0D0D]/95 backdrop-blur-sm border-b border-[#2D2D30]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-[#39FF14] flex items-center justify-center chamfer-sm">
              <Zap className="w-6 h-6 text-[#0D0D0D]" />
            </div>
            <span className="text-xl font-bold tracking-wider text-[#E0E0E0] group-hover:text-[#39FF14] transition-colors" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              API<span className="text-[#39FF14]">FORGE</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/catalog"
              className="text-[#B0B0B0] hover:text-[#39FF14] transition-colors font-medium uppercase tracking-wide text-sm"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Catalog
            </Link>
            <Link
              href="/catalog?category=all"
              className="text-[#B0B0B0] hover:text-[#39FF14] transition-colors font-medium uppercase tracking-wide text-sm"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Categories
            </Link>
          </nav>

          {/* Cart Button */}
          <div className="flex items-center gap-4">
            <Link
              href="/cart"
              className="relative flex items-center gap-2 px-4 py-2 border border-[#2D2D30] hover:border-[#39FF14] transition-all group"
            >
              <ShoppingCart className="w-5 h-5 text-[#B0B0B0] group-hover:text-[#39FF14] transition-colors" />
              <span className="hidden sm:inline text-[#B0B0B0] group-hover:text-[#39FF14] transition-colors text-sm font-medium" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                CART
              </span>
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#39FF14] text-[#0D0D0D] text-xs font-bold flex items-center justify-center animate-pulse-neon">
                  {items.length}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-[#B0B0B0] hover:text-[#39FF14]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#2D2D30]">
            <nav className="flex flex-col gap-4">
              <Link
                href="/catalog"
                className="text-[#B0B0B0] hover:text-[#39FF14] transition-colors font-medium uppercase tracking-wide text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Catalog
              </Link>
              <Link
                href="/catalog?category=all"
                className="text-[#B0B0B0] hover:text-[#39FF14] transition-colors font-medium uppercase tracking-wide text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Categories
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
