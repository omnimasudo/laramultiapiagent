'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import { ShoppingCart, Menu, X, Terminal, Cpu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { items } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  const navLinks = [
    { href: '/', label: 'Base' },
    { href: '/catalog', label: 'Catalog' },
    { href: '/share', label: 'Share API' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cyber-bg/90 backdrop-blur-md border-b border-cyber-surface/50">
      {/* Top decorated border line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-neon/40 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LOGO AREA */}
          <Link href="/" className="flex items-center gap-4 group relative">
            <div className="relative w-12 h-12 flex items-center justify-center bg-cyber-bg border border-cyber-border group-hover:border-cyber-neon/50 transition-colors clip-tactical-b text-cyber-neon">
               <Cpu className="w-6 h-6 animate-pulse" />
               <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyber-gold/50 rounded-full"></div>
               <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-cyber-neon/50 rounded-full"></div>
            </div>
            
            <div className="flex flex-col">
              <h1 className="font-heading text-xl md:text-2xl font-black text-cyber-text-light uppercase tracking-widest leading-none group-hover:text-glow transition-all">
                API<span className="text-cyber-neon">FORGE</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 bg-cyber-neon rounded-full animate-pulse"></span>
                <span className="font-mono text-[10px] text-cyber-text-light/50 tracking-[0.2em] uppercase">
                  Sys.Online
                </span>
              </div>
            </div>
          </Link>


          {/* DESKTOP NAVIGATION */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-5 py-2 group overflow-hidden"
                >
                  <span className={clsx(
                    "relative z-10 font-mono text-sm font-bold uppercase tracking-widest transition-colors duration-300",
                    isActive ? "text-cyber-neon" : "text-cyber-text-light/70 group-hover:text-cyber-neon"
                  )}>
                    {link.label}
                  </span>
                  
                  {/* Hover Glitch Effect Background */}
                  <span className="absolute inset-0 bg-cyber-neon/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 skew-x-12 origin-left"></span>
                  
                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div 
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-0 w-full h-[2px] bg-cyber-neon shadow-[0_0_10px_var(--cyber-neon)]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ACTIONS */}
          <div className="flex items-center gap-6">
            <Link
              href="/cart"
              className="relative group p-2"
            >
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-cyber-text-light group-hover:text-cyber-neon transition-colors" />
                {mounted && items.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-cyber-neon text-black text-[10px] font-bold font-mono rounded-sm shadow-neon animate-pulse-slow">
                    {items.length}
                  </span>
                )}
              </div>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-cyber-text-light hover:text-cyber-neon transition-colors border border-transparent hover:border-cyber-neon/30"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-cyber-bg border-b border-cyber-neon/20 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block font-heading text-xl font-bold uppercase tracking-wider text-cyber-text-light hover:text-cyber-neon hover:pl-2 transition-all"
                >
                  <span className="text-cyber-neon mr-2">{`>`}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}