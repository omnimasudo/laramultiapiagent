// src/components/APICard.tsx
'use client';

import type { API } from '@/lib/supabase';
import { ArrowUpRight, Plus, Check, Box } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { useCartStore } from '@/lib/store';

interface APICardProps {
  api: API;
}

export default function APICard({ api }: APICardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Cart Integration
  const { addItem, removeItem, isInCart } = useCartStore();
  const inCart = isInCart(api.id);

  const toggleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCart) {
      removeItem(api.id);
    } else {
      addItem(api);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group h-full flex flex-col"
    >
      <div className="absolute inset-0 bg-cyber-bg border border-cyber-surface clip-tactical transition-all duration-300 group-hover:border-cyber-neon/60 group-hover:shadow-neon-hover z-0"></div>
      
      <div className="absolute inset-0 clip-tactical overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        <div className="w-full h-[200%] bg-gradient-to-b from-transparent via-cyber-neon/5 to-transparent animate-scan-line"></div>
      </div>

      <div className="relative p-6 flex flex-col h-full z-20 flex-grow">
        
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 bg-cyber-surface/50 border border-cyber-border flex items-center justify-center rounded-sm shrink-0 group-hover:border-cyber-neon/40 transition-colors">
            <Box className={clsx("w-5 h-5 transition-colors duration-300", isHovered ? "text-cyber-neon" : "text-cyber-text-light")} />
          </div>
          
          <div className="flex-1 overflow-hidden">
            <h3 className={clsx("font-heading text-lg font-bold tracking-wide truncate transition-all duration-300", isHovered ? "text-cyber-neon text-glow" : "text-cyber-text-light")}>
              {api.name}
            </h3>
            <p className="text-[10px] font-mono uppercase tracking-widest text-cyber-text-light/50 mt-1">
              {api.category || 'API SERVICE'}
            </p>
          </div>
        </div>

        <div className="flex-grow mb-6">
          <p className="font-mono text-sm text-cyber-text-light/70 line-clamp-3 leading-relaxed">
            {api.description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 mt-auto pt-4 border-t border-cyber-surface/50">
          
          <div className="flex gap-2 flex-1">
            <Link 
              href={`/catalog/${api.id}`}
              className="flex-1 py-3 px-3 text-center font-heading text-[11px] font-bold uppercase tracking-widest bg-cyber-neon/10 border border-cyber-neon/30 text-cyber-neon hover:bg-cyber-neon hover:text-black transition-all duration-300 clip-tactical-sm group-hover:shadow-[0_0_10px_rgba(57,255,20,0.2)]"
            >
              Initialize Details
            </Link>
          </div>

          <div className="shrink-0 w-8 h-8 flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="w-5 h-5 text-cyber-neon" />
          </div>
          
        </div>
      </div>
      
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber-border group-hover:border-cyber-neon/50 transition-colors duration-500 z-20"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber-border group-hover:border-cyber-neon/50 transition-colors duration-500 z-20"></div>
    </motion.div>
  );
}