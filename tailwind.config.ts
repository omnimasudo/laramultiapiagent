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
        // Map to CSS variables from globals.css for Tactical Cyber-Mechanic theme
        cyber: {
          bg: 'var(--cyber-bg)',
          surface: 'var(--cyber-surface)',
          border: 'var(--cyber-border)',
          canvas: 'var(--cyber-canvas)',
          'canvas-light': 'var(--cyber-canvas-light)',
          neon: 'var(--cyber-neon)',
          gold: 'var(--cyber-gold)',
          'text-light': 'var(--cyber-text-light)',
          'text-dark': 'var(--cyber-text-dark)',
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
        heading: ['Orbitron', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 10px rgba(57, 255, 20, 0.5), inset 0 0 5px rgba(57, 255, 20, 0.2)',
        'neon-hover': '0 0 15px rgba(57, 255, 20, 0.8), 0 0 30px rgba(57, 255, 20, 0.4)',
        'tactical': '4px 4px 0px #111',
        'tactical-hover': '4px 4px 0px var(--cyber-neon)',
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(57, 255, 20, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(57, 255, 20, 0.03) 1px, transparent 1px)',
        'cyber-grid-radial': "radial-gradient(circle, rgba(57, 255, 20, 0.1) 1px, transparent 1px)",
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 12s ease-in-out infinite',
        'drift': 'drift 10s linear infinite',
        'scan-line': 'scan-line 8s linear infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'glitch': 'glitch 1s linear infinite',
        'spin-slow': 'spin 12s linear infinite',
        'infinite-scroll': 'infinite-scroll 20s linear infinite',
      },
      keyframes: {
        'scan': {
          '0%': { top: '-10%' },
          '100%': { top: '110%' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        'drift': {
          '0%': { transform: 'translateX(-10%)' },
          '100%': { transform: 'translateX(10%)' }
        },
        'infinite-scroll': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-100%)' },
        },
        'pulse-neon': {
          '0%, 100%': { boxShadow: '0 0 5px var(--cyber-neon), 0 0 10px rgba(57, 255, 20, 0.2)' },
          '50%': { boxShadow: '0 0 10px var(--cyber-neon), 0 0 25px rgba(57, 255, 20, 0.4)' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'glitch': {
          '2%, 64%': { transform: 'translate(2px,0) skew(0deg)' },
          '4%, 60%': { transform: 'translate(-2px,0) skew(0deg)' },
          '62%': { transform: 'translate(0,0) skew(5deg)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;