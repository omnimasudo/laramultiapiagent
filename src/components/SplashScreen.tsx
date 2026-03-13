'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, Lock, Zap, Terminal } from 'lucide-react';

export default function SplashScreen() {
  const [show, setShow] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    const hasVisited = sessionStorage.getItem('splashShown_laramultiapiagent');
    if (hasVisited) {
      setShow(false);
      return;
    }
    
    setShow(true);

    const bootSequence = [
      "ESTABLISHING CCTV UPLINK...",
      "BYPASSING ENCRYPTION GATEWAY [OK]",
      "SYNCING LARA_AGENT_v2.0...",
      "MOUNTING TACTICAL INTERFACE...",
      "CALIBRATING OPTIC SENSORS [OK]",
      "UPLINK STABLE. WELCOME OPERATOR."
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < bootSequence.length) {
        setLogs(prev => [...prev, bootSequence[currentIndex]]);
        currentIndex++;
        setPercent(Math.floor((currentIndex / bootSequence.length) * 100));
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setShow(false);
          sessionStorage.setItem('splashShown_laramultiapiagent', 'true');
        }, 1200);
      }
    }, 600);

    return () => clearInterval(interval);
  }, []);

  if (!mounted || !show) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 font-mono text-cyber-neon selection:bg-transparent overflow-hidden">
      
      {/* CCTV / VHS Noise Style Background */}
      <div className="absolute inset-0 opacity-10 cctv-noise"></div>
      
      {/* Static Scanlines Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] z-20"></div>

      {/* CCTV HUD Elements */}
      <div className="absolute top-8 left-8 p-4 border-l-2 border-t-2 border-cyber-neon/30 w-24 h-24">
        <div className="flex items-center gap-2 text-[10px] opacity-70">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
          REC ● LIVE
        </div>
      </div>
      <div className="absolute top-8 right-8 p-4 border-r-2 border-t-2 border-cyber-neon/30 w-24 h-24 text-right">
        <div className="text-[10px] opacity-70 uppercase">CAM_01_RECON</div>
        <div className="text-[10px] opacity-70 font-mono mt-1">AX-700_SYS</div>
      </div>
      <div className="absolute bottom-8 left-8 p-4 border-l-2 border-b-2 border-cyber-neon/30 w-24 h-24 flex items-end">
        <div className="text-[10px] opacity-70">UPLINK_STABLE</div>
      </div>
      <div className="absolute bottom-8 right-8 p-4 border-r-2 border-b-2 border-cyber-neon/30 w-24 h-24 flex items-end justify-end">
        <div className="text-[10px] opacity-70">2026.AR.99</div>
      </div>

      {/* Center Logo Area */}
      <div className="relative mb-12 flex flex-col items-center">
        <div className="relative w-48 h-48 md:w-64 md:h-64 overflow-hidden border-2 border-cyber-neon/40 shadow-[0_0_40px_rgba(57,255,20,0.15)] clip-tactical-b">
          <img 
            src="/logo.jpeg" 
            alt="LARA Splash"
            className="w-full h-full object-cover grayscale brightness-50 contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/80"></div>
          
          {/* Static Reticle Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
             <div className="absolute w-[80%] h-px bg-cyber-neon/40"></div>
             <div className="absolute h-[80%] w-px bg-cyber-neon/40"></div>
             <div className="w-12 h-12 border border-cyber-neon rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-cyber-neon rounded-full"></div>
             </div>
          </div>
        </div>
        
        <div className="mt-8 text-center px-4 py-2 border-y border-cyber-neon/20 backdrop-blur-sm">
           <h2 className="text-xl md:text-2xl font-black uppercase tracking-[0.4em] text-glow mb-1">
             LARA<span className="text-cyber-neon opacity-70">CONTROL</span>
           </h2>
           <div className="font-mono text-[9px] text-cyber-gold/80 tracking-[0.5em]">
             S.Y.S_O.V.E.R.L.O.R.D_v2.0
           </div>
        </div>
      </div>

      {/* Boot Progress & Logs */}
      <div className="max-w-md w-full relative z-10 px-4">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-cyber-neon/10 mb-6 relative overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            className="h-full bg-cyber-neon shadow-[0_0_10px_var(--cyber-neon)]"
          />
        </div>

        <div className="space-y-2 h-32 overflow-hidden flex flex-col justify-end">
          {logs.map((log, index) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              key={index} 
              className="flex items-center gap-3 text-[10px] md:text-xs"
            >
              <span className="text-cyber-gold font-bold">[{index}]</span> 
              <span className="tracking-tighter opacity-80">{log}</span>
            </motion.div>
          ))}
          {logs.length < 6 && (
            <div className="flex items-center gap-2">
              <span className="text-cyber-neon animate-pulse leading-none text-xs">_</span>
            </div>
          )}
        </div>
      </div>

      {/* Full-screen Glitch Trigger Overlay */}
      <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-10 bg-white/5 animate-pulse"></div>
    </div>
  );
}