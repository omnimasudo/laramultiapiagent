'use client';

import { create } from 'zustand';
import type { API } from './supabase';

interface CartState {
  items: API[];
  addItem: (api: API) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  initializeFromStorage: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (api: API) => {
    const exists = get().items.some(item => item.id === api.id);
    if (!exists) {
      const newItems = [...get().items, api];
      set({ items: newItems });
      if (typeof window !== 'undefined') {
        localStorage.setItem('api-forge-cart', JSON.stringify(newItems));
      }
    }
  },
  removeItem: (id: string) => {
    const newItems = get().items.filter(item => item.id !== id);
    set({ items: newItems });
    if (typeof window !== 'undefined') {
      localStorage.setItem('api-forge-cart', JSON.stringify(newItems));
    }
  },
  clearCart: () => {
    set({ items: [] });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('api-forge-cart');
    }
  },
  isInCart: (id: string) => get().items.some(item => item.id === id),
  initializeFromStorage: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('api-forge-cart');
      if (stored) {
        try {
          const items = JSON.parse(stored);
          set({ items });
        } catch (e) {
          console.error('Failed to parse cart');
        }
      }
    }
  },
}));
