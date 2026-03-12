import type { Metadata } from "next";
import { Space_Grotesk, Orbitron, Roboto_Mono } from "next/font/google";
import "./globals.css";

// Import komponen UI pendukung (pastikan kamu membuat file ini nanti sesuai panduan sebelumnya)
import Header from "@/components/Header";
import InteractiveBG from "@/components/InteractiveBG";
import SplashScreen from "@/components/SplashScreen";

// Konfigurasi Font
const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"], 
  variable: "--font-space-grotesk",
  display: 'swap',
});

const orbitron = Orbitron({ 
  subsets: ["latin"], 
  variable: "--font-orbitron",
  display: 'swap',
});

const robotoMono = Roboto_Mono({ 
  subsets: ["latin"], 
  variable: "--font-roboto-mono",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "laramultiapiagent | Tactical API Forge",
  description: "Advanced multi-API agent routing and management system with a tactical cyber-mechanic interface.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${orbitron.variable} ${robotoMono.variable}`}>
      <body className="font-sans antialiased relative min-h-screen flex flex-col bg-cyber-bg text-cyber-text-light selection:bg-cyber-neon selection:text-cyber-bg">
        
        {/* Efek Background dan Splash Screen Interaktif */}
        <SplashScreen />
        <InteractiveBG />
        
        {/* Header Navigasi */}
        <Header />
        
        {/* Konten Utama */}
        <main className="flex-grow pt-24 pb-12 px-4 md:px-8 relative z-10 flex flex-col"> 
          {/* pt-24 memberikan ruang agar konten tidak tertutup fixed header */}
          {children}
        </main>

        {/* Footer Minimalis Tactical */}
        <footer className="w-full border-t-2 border-cyber-border bg-cyber-surface py-4 px-8 mt-auto relative z-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs font-mono text-cyber-gold opacity-80">
            <div>
              <span className="text-cyber-neon mr-2">SYS.STAT:</span> ONLINE // SECURE
            </div>
            <div>
              &copy; {new Date().getFullYear()} laramultiapiagent. OPERATOR: MADE NARAYAN.
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}