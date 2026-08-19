'use client';

import React, { createContext, useContext, useMemo, useState, useSyncExternalStore } from 'react';
import { CartItem, Product, ProductVariant } from '@/lib/types';
import { brandConfig } from '@/lib/brandConfig';
import { useToast } from './ToastContext';
import { validateCoupon } from '@/lib/api';

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number, selectedSize?: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotalUSD: number;
  discountUSD: number;
  couponCode: string;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  estimatedShippingUSD: number;
  totalUSD: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function subscribeCart(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('aurelia_cart_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('aurelia_cart_change', callback);
  };
}

function getCartSnapshot(): string {
  if (typeof window === 'undefined') return '[]';
  try {
    return localStorage.getItem('aurelia_cart') || '[]';
  } catch {
    return '[]';
  }
}

function getCartServerSnapshot(): string {
  return '[]';
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cartJson = useSyncExternalStore(subscribeCart, getCartSnapshot, getCartServerSnapshot);

  const items: CartItem[] = useMemo(() => {
    try {
      return JSON.parse(cartJson);
    } catch {
      return [];
    }
  }, [cartJson]);

  const [isOpen, setIsOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountUSD, setDiscountUSD] = useState(0);
  const { success, error, info } = useToast();

  const saveItems = (newItems: CartItem[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('aurelia_cart', JSON.stringify(newItems));
        window.dispatchEvent(new Event('aurelia_cart_change'));
      } catch {
        // ignore write error
      }
    }
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const addToCart = (product: Product, variant?: ProductVariant, quantity: number = 1, selectedSize?: string) => {
    const variantId = variant?.id;
    const unitPriceUSD = variant?.priceUSD || product.priceUSD;
    const metalType = variant?.metalType || product.metalType;
    const purity = variant?.purity || product.purity;
    const stoneType = variant?.stoneType || product.stoneType;
    const size = selectedSize || variant?.size;

    const existingIndex = items.findIndex(
      (item) => item.productId === product.id && item.variantId === variantId && item.size === size
    );

    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...items];
      updated[existingIndex].quantity += quantity;
    } else {
      const newItem: CartItem = {
        id: `${product.id}-${variantId || 'base'}-${size || 'default'}-${Date.now()}`,
        productId: product.id,
        variantId,
        sku: variant?.sku || product.sku,
        name: product.name,
        slug: product.slug,
        image: product.images[0]?.url || '',
        metalType,
        purity,
        size,
        stoneType,
        unitPriceUSD,
        quantity,
      };
      updated = [...items, newItem];
    }

    saveItems(updated);
    success('Added to Acquisition Bag', `${product.name} has been placed in your private selection.`);
    setIsOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    const updated = items
      .map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];

    saveItems(updated);
  };

  const removeFromCart = (id: string) => {
    const itemToRemove = items.find((i) => i.id === id);
    const updated = items.filter((i) => i.id !== id);
    saveItems(updated);
    if (itemToRemove) {
      info('Piece Removed', `${itemToRemove.name} removed from your bag.`);
    }
  };

  const clearCart = () => {
    saveItems([]);
    setCouponCode('');
    setDiscountUSD(0);
  };

  const subtotalUSD = items.reduce((sum, item) => sum + item.unitPriceUSD * item.quantity, 0);

  const applyCoupon = async (code: string): Promise<boolean> => {
    if (!code) return false;
    try {
      const res = await validateCoupon(code, subtotalUSD);
      if (res.success && res.data) {
        setCouponCode(res.data.coupon.code);
        setDiscountUSD(res.data.discountUSD);
        success('Privilege Applied', res.message || 'Promotion applied successfully.');
        return true;
      } else {
        error('Invalid Code', res.error || 'The code entered could not be verified.');
        return false;
      }
    } catch {
      error('Coupon Error', 'Could not apply promotional privilege.');
      return false;
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscountUSD(0);
    info('Privilege Removed', 'Promotional reduction has been cleared.');
  };

  const estimatedShippingUSD = subtotalUSD >= brandConfig.freeShippingThresholdUSD || subtotalUSD === 0 ? 0 : 75;
  const totalUSD = Math.max(0, subtotalUSD - discountUSD + estimatedShippingUSD);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        itemCount,
        subtotalUSD,
        discountUSD,
        couponCode,
        applyCoupon,
        removeCoupon,
        estimatedShippingUSD,
        totalUSD,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
