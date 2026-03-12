'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [show, setShow] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mencegah hydration mismatch di Next.js
    // eslint-disable-next-line
    setMounted(true);
    
    // Cek apakah user sudah pernah melihat splash screen di sesi ini
    const hasVisited = sessionStorage.getItem('splashShown_laramultiapiagent');
    if (hasVisited) {
      setShow(false);
      return;
    }
    
    // Jika belum, tampilkan splash screen
    setShow(true);

    const bootSequence = [
      "INITIALIZING TACTICAL PROTOCOL...",
      "LOADING laramultiapiagent KERNEL [OK]",
      "BYPASSING SECURITY CLEARANCE [OK]",
      "MOUNTING CYBER-MECHANIC UI [OK]",
      "ESTABLISHING SECURE CONNECTION...",
      "SYSTEM READY."
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < bootSequence.length) {
        setLogs(prev => [...prev, bootSequence[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
        // Beri jeda sejenak setelah log terakhir sebelum menutup layar
        setTimeout(() => {
          setShow(false);
          sessionStorage.setItem('splashShown_laramultiapiagent', 'true');
        }, 1000);
      }
    }, 400); // Kecepatan ketikan log (400ms per baris)

    return () => clearInterval(interval);
  }, []);

  // Jangan render apapun jika tidak perlu ditampilkan (agar tidak nge-block UI)
  if (!mounted || !show) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-cyber-bg flex flex-col justify-end p-6 md:p-12 font-mono text-cyber-neon text-sm md:text-base border-8 border-cyber-border selection:bg-transparent overflow-hidden">
      
      {/* Background overlay redup untuk feel terminal */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(26,26,26,0.8)_100%)] pointer-events-none"></div>
      
      <div className="max-w-4xl w-full mx-auto relative z-10 mb-10">
        <div className="mb-6 text-cyber-gold animate-pulse font-bold tracking-widest uppercase text-xs md:text-sm border-b-2 border-cyber-border pb-2 inline-block">
          LARAMULTIAPIAGENT // BOOT SEQUENCE INITIATED
        </div>
        
        <div className="space-y-3">
          {logs.map((log, index) => (
            <div key={index} className="flex items-start">
              <span className="opacity-50 mr-4 text-cyber-text-light">{`root@operator:~#`}</span> 
              <span className="tracking-wider text-glow drop-shadow-[0_0_8px_rgba(57,255,20,0.8)]">{log}</span>
            </div>
          ))}
          
          {/* Kursor berkedip saat log belum selesai */}
          {logs.length < 6 && (
            <div className="flex items-center mt-2">
              <span className="opacity-50 mr-4 text-cyber-text-light">{`root@operator:~#`}</span>
              <div className="animate-pulse mt-1 w-3 h-5 bg-cyber-neon inline-block shadow-neon" />
            </div>
          )}
        </div>
      </div>

      {/* Efek garis scan CRT (Scanline) */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-50 opacity-20"></div>
    </div>
  );
}