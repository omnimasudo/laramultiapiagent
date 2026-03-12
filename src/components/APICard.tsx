'use client';

import { useCartStore } from '@/lib/store';
import type { API } from '@/lib/supabase';
import { ExternalLink, Plus, Check, Lock, Globe, Shield, Terminal, Server } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useState } from 'react';

interface APICardProps {
  api: API;
}

export default function APICard({ api }: APICardProps) {
  const { addItem, removeItem, isInCart } = useCartStore();
  const inCart = isInCart(api.id);
  const [isHovered, setIsHovered] = useState(false);

  const toggleCart = () => {
    if (inCart) {
      removeItem(api.id);
    } else if (api) {
      addItem(api);
    }
  };

  const getStatusColor = (auth: string) => {
    switch (auth?.toLowerCase()) {
      case 'apikey': return 'text-cyber-neon border-cyber-neon';
      case 'oauth': return 'text-cyber-gold border-cyber-gold';
      default: return 'text-cyber-text-light/50 border-cyber-text-light/30';
    }
  };

  // Generate deterministic "stats" based on ID for visual flair
  const latency = (api.name.charCodeAt(0) % 50) + 10; 
  const uptime = 99 + (api.name.length % 10) / 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group h-full"
    >
      {/* Background & Clip Path Container */}
      <div className="absolute inset-0 bg-cyber-bg border border-cyber-surface clip-tactical transition-all duration-300 group-hover:border-cyber-neon/50 group-hover:shadow-neon-hover z-0"></div>
      
      {/* Animated Scanline Overlay */}
      <div className="absolute inset-0 clip-tactical overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        <div className="w-full h-[200%] bg-gradient-to-b from-transparent via-cyber-neon/5 to-transparent animate-scan-line"></div>
      </div>

      <div className="relative p-6 flex flex-col h-full z-20">
        {/* Header: Name & Link */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 pr-4 overflow-hidden">
            <h3 className={clsx(
              "font-heading text-lg font-bold uppercase tracking-wider transition-all duration-300 truncate",
              isHovered ? "text-cyber-neon text-glow" : "text-cyber-text-light"
            )}>
              {api.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={clsx("px-2 py-0.5 text-[10px] uppercase font-mono border", getStatusColor(api.auth || ''))}>
                {api.auth || 'Open'}
              </span>
              <span className="text-[10px] font-mono text-cyber-text-light/40 flex items-center gap-1 truncate">
                <Server className="w-3 h-3" /> ID: {api.id.substring(0, 8)}
              </span>
            </div>
          </div>
          
          <a
            href={api.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-cyber-neon/10 rounded-sm group/link transition-colors border border-transparent hover:border-cyber-neon/30"
          >
            <ExternalLink className="w-4 h-4 text-cyber-text-light/50 group-hover/link:text-cyber-neon transition-colors" />
          </a>
        </div>

        {/* Description Styled as Terminal Output */}
        <div className="bg-black/40 border-l-2 border-cyber-border p-3 mb-4 flex-grow font-mono text-xs text-cyber-text-light/70 relative overflow-hidden">
          <div className="absolute top-1 right-1 opacity-20">
            <Terminal className="w-3 h-3" />
          </div>
          <p className="line-clamp-3 leading-relaxed">
            <span className="text-cyber-neon/50 mr-2">$</span>
            {api.description}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-[10px] font-mono border-t border-cyber-surface pt-3">
          <div className="flex items-center justify-between">
            <span className="text-cyber-text-light/40">LATENCY</span>
            <span className="text-cyber-neon">{latency}ms</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-cyber-text-light/40">UPTIME</span>
            <span className="text-cyber-gold">{uptime}%</span>
          </div>
          
          {/* Fake Progress Bar */}
          <div className="col-span-2 h-1 bg-cyber-surface mt-1 overflow-hidden relative">
             <motion.div 
               className="h-full bg-cyber-neon"
               initial={{ width: "30%" }}
               animate={{ width: isHovered ? "100%" : "30%" }}
               transition={{ duration: 1, ease: "circOut" }}
             />
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={toggleCart}
          className={clsx(
            "w-full py-3 px-4 flex items-center justify-center gap-2 font-heading text-sm font-bold uppercase tracking-widest transition-all duration-300 clip-tactical-b",
            inCart 
              ? "bg-cyber-canvas text-cyber-text-dark border-cyber-canvas hover:brightness-110" 
              : "bg-transparent border border-cyber-neon/50 text-cyber-neon hover:bg-cyber-neon hover:text-black hover:shadow-neon"
          )}
        >
          {inCart ? (
            <>
              <Check className="w-4 h-4" /> Initiated
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" /> Deploy Agent
            </>
          )}
        </button>
      </div>
      
      {/* Decorative Corners */}
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyber-border group-hover:border-cyber-neon/50 transition-colors duration-500 z-20"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyber-border group-hover:border-cyber-neon/50 transition-colors duration-500 z-20"></div>
    </motion.div>
  );
}