import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Industrial Cyberpunk Palette
        cyber: {
          black: '#0D0D0D',
          gunmetal: '#1A1A1D',
          steel: '#2D2D30',
          rust: '#8B5A2B',
          copper: '#A0522D',
          neon: '#39FF14',
          'neon-dim': '#2ACC10',
          ash: '#E0E0E0',
          smoke: '#B0B0B0',
        },
      },
      fontFamily: {
        heading: ['Orbitron', 'Rajdhani', 'sans-serif'],
        mono: ['Roboto Mono', 'Share Tech Mono', 'monospace'],
        body: ['Space Grotesk', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 5px #39FF14, 0 0 20px rgba(57, 255, 20, 0.3)',
        'neon-lg': '0 0 10px #39FF14, 0 0 40px rgba(57, 255, 20, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(57, 255, 20, 0.1)',
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(57, 255, 20, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(57, 255, 20, 0.03) 1px, transparent 1px)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'glitch': 'glitch 0.3s ease-in-out',
        'scan-line': 'scan-line 8s linear infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { boxShadow: '0 0 5px #39FF14, 0 0 20px rgba(57, 255, 20, 0.3)' },
          '50%': { boxShadow: '0 0 10px #39FF14, 0 0 40px rgba(57, 255, 20, 0.5)' },
        },
        'glitch': {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
