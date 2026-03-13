'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import { ShoppingCart, Menu, X, Terminal, Cpu, Github, Twitter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { items, initializeFromStorage } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    initializeFromStorage();
    setMounted(true);
  }, [initializeFromStorage]);

  const navLinks = [
    { href: '/', label: 'Base' },
    { href: '/catalog', label: 'Catalog' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cyber-bg/90 backdrop-blur-md border-b border-cyber-surface/50">
      {/* Top decorated border line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-neon/40 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LOGO AREA */}
          <Link href="/" className="flex items-center gap-4 group relative">
            <div className="relative w-12 h-12 flex items-center justify-center bg-cyber-bg border border-cyber-border group-hover:border-cyber-neon/50 transition-colors clip-tactical-b overflow-hidden">
               <img 
                 src="/logo.jpeg" 
                 alt="LARA Logo" 
                 className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-cyber-neon/20 to-transparent pointer-events-none"></div>
               <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyber-gold/50 rounded-full z-10"></div>
               <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-cyber-neon/50 rounded-full z-10"></div>
            </div>
            
            <div className="flex flex-col">
              <h1 className="font-heading text-xl md:text-2xl font-black text-cyber-text-light uppercase tracking-widest leading-none group-hover:text-glow transition-all">
                LARA<span className="text-cyber-neon">MULTIAPIAGENT</span>
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
            
            {/* Social Links */}
            <div className="hidden md:flex items-center gap-4 border-r border-cyber-text-light/20 pr-6">
               <a 
                 href="https://github.com/omnimasudo/laramultiapiagent" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="text-cyber-text-light/70 hover:text-cyber-neon transition-colors transform hover:scale-110"
                 aria-label="GitHub Repository"
               >
                  <Github className="w-5 h-5" />
               </a>
               <a 
                 href="https://x.com/Laraagentt" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="text-cyber-text-light/70 hover:text-cyber-neon transition-colors transform hover:scale-110"
                 aria-label="X (Twitter) Profile"
               >
                  <Twitter className="w-5 h-5" />
               </a>
            </div>

            <Link
              href="/catalog"
              className="flex items-center gap-2 px-4 py-2 bg-cyber-neon/10 hover:bg-cyber-neon/20 border border-cyber-neon/50 text-cyber-neon font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 clip-tactical-sm hover:shadow-neon"
            >
              <Terminal className="w-4 h-4" />
              Access Hub
            </Link>

            {/* Mobile Menu Button - Kept for mobile nav */}
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