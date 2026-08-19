'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const { wishlist, clearWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#ede5d8] text-[#9b7e46] flex items-center justify-center mx-auto">
          <Heart className="w-7 h-7" />
        </div>
        <h1 className="font-serif text-3xl text-[#141210]">Your Desired Curations are Empty</h1>
        <p className="text-xs sm:text-sm text-[#73685a] max-w-md mx-auto leading-relaxed">
          Save your favourite diamond solitaires, high necklaces, and 18K/22K gold masterworks to review or acquire later.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#141210] text-[#faf8f5] text-xs uppercase tracking-[0.2em] hover:bg-[#9b7e46] transition-colors"
        >
          <span>Explore Haute Joaillerie</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#ebdccd] pb-4">
        <div>
          <span className="text-[10px] tracking-[0.35em] text-[#9b7e46] uppercase font-medium">
            Private Patron Curations
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#141210] uppercase font-light">
            Your Desired Pieces ({wishlist.length})
          </h1>
        </div>

        <button
          onClick={clearWishlist}
          className="text-xs text-[#998b79] hover:text-red-700 uppercase tracking-wider flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Wishlist</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
