'use client';

import { Terminal } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ActionOverlayProps {
  isOpen: boolean;
  message?: string;
}

export default function ActionOverlay({ 
  isOpen, 
  message = "PROCESSING PAYLOAD..." 
}: ActionOverlayProps) {
  const [dots, setDots] = useState('');

  // Efek animasi titik tiga (...) yang berulang
  useEffect(() => {
    if (!isOpen) {
      setDots('');
      return;
    }

    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-cyber-bg/80 backdrop-blur-sm p-4">
      {/* Container utama dengan vibe tactical mechanic */}
      <div className="w-full max-w-md bg-cyber-surface border-2 border-cyber-neon p-8 relative shadow-neon chamfer">
        
        {/* Dekorasi sudut */}
        <div className="absolute top-2 left-2 w-2 h-2 bg-cyber-neon animate-pulse"></div>
        <div className="absolute bottom-2 right-2 w-2 h-2 border border-cyber-neon"></div>

        <div className="flex flex-col items-center text-center">
          
          {/* Ikon Terminal / Gear Loading */}
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-cyber-border rounded-full flex items-center justify-center">
              <Terminal className="w-8 h-8 text-cyber-neon animate-pulse" />
            </div>
            {/* Spinning ring luar */}
            <div className="absolute inset-0 border-4 border-transparent border-t-cyber-neon border-r-cyber-neon rounded-full animate-spin"></div>
            <div className="absolute inset-[-8px] border-2 border-dashed border-cyber-canvas-light rounded-full animate-[spin_3s_linear_infinite_reverse] opacity-50"></div>
          </div>

          {/* Pesan Status */}
          <h3 className="font-heading text-xl font-bold text-cyber-text-light uppercase tracking-widest mb-2">
            System Alert
          </h3>
          <p className="font-mono text-sm text-cyber-neon font-bold tracking-wider mb-6 min-h-[1.5rem]">
            {message}{dots}
          </p>

          {/* Tactical Progress Bar */}
          <div className="w-full bg-cyber-bg border-2 border-cyber-border h-4 relative overflow-hidden chamfer-sm">
            {/* Garis scanning yang bergerak maju mundur */}
            <div className="absolute top-0 left-0 h-full bg-cyber-neon w-1/3 animate-[pulse-neon_1.5s_ease-in-out_infinite] shadow-neon"></div>
            {/* Grid pattern overlay di atas progress bar */}
            <div className="absolute inset-0 cyber-grid opacity-50 mix-blend-overlay pointer-events-none"></div>
          </div>
          
          <div className="w-full flex justify-between mt-2 font-mono text-[10px] text-cyber-text-light/50 uppercase tracking-widest">
            <span>Standby</span>
            <span>Do not close terminal</span>
          </div>

        </div>
      </div>
    </div>
  );
}