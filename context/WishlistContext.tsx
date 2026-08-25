'use client';

import React, { createContext, useContext, useMemo, useSyncExternalStore } from 'react';
import { Product } from '@/lib/types';
import { useToast } from './ToastContext';

interface WishlistContextType {
  wishlist: Product[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function subscribeWishlist(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('aurelic_wishlist_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('aurelic_wishlist_change', callback);
  };
}

function getWishlistSnapshot(): string {
  if (typeof window === 'undefined') return '[]';
  try {
    return localStorage.getItem('aurelic_wishlist') || '[]';
  } catch {
    return '[]';
  }
}

function getWishlistServerSnapshot(): string {
  return '[]';
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const wishlistJson = useSyncExternalStore(subscribeWishlist, getWishlistSnapshot, getWishlistServerSnapshot);

  const wishlist: Product[] = useMemo(() => {
    try {
      return JSON.parse(wishlistJson);
    } catch {
      return [];
    }
  }, [wishlistJson]);

  const { success, info } = useToast();

  const saveWishlist = (items: Product[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('aurelic_wishlist', JSON.stringify(items));
        window.dispatchEvent(new Event('aurelic_wishlist_change'));
      } catch {
        // ignore write error
      }
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      const updated = wishlist.filter((item) => item.id !== product.id);
      saveWishlist(updated);
      info('Removed from Desired Curations', `${product.name} removed from your wishlist.`);
    } else {
      const updated = [...wishlist, product];
      saveWishlist(updated);
      success('Added to Desired Curations', `${product.name} has been preserved in your wishlist.`);
    }
  };

  const removeFromWishlist = (productId: string) => {
    const updated = wishlist.filter((item) => item.id !== productId);
    saveWishlist(updated);
  };

  const clearWishlist = () => {
    saveWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        count: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
