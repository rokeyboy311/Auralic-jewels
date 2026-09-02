'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isFavorited = isInWishlist(product.id);
  
  const getImageUrl = (img: any): string => {
    if (!img) return '';
    if (typeof img === 'string') return img;
    if (typeof img === 'object' && img.url) return img.url;
    return '';
  };

  const defaultPlaceholder = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80';
  const primaryImage =
    getImageUrl(product.images?.[0]) ||
    (product as any).image_url ||
    (product as any).imageUrl ||
    (product as any).image ||
    defaultPlaceholder;
    
  const secondaryImage = getImageUrl(product.images?.[1]) || primaryImage;

  return (
    <div className="group relative flex flex-col h-full bg-[#FDFCF8] border border-black/5 hover:border-[#C5A059]/60 transition-all duration-300">
      {/* Image Container with Zoom & Secondary Hover Image */}
      <div className="relative w-full aspect-4/5 overflow-hidden bg-[#F5F2ED]">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-opacity duration-500 group-hover:opacity-0"
            referrerPolicy="no-referrer"
          />
          <Image
            src={secondaryImage}
            alt={`${product.name} detail view`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 scale-105 group-hover:scale-100 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.isNewArrival && (
            <span className="bg-[#1A1A1A] text-white text-[9px] uppercase tracking-widest px-2.5 py-1 font-medium">
              New Acquisition
            </span>
          )}
          {product.isBestSeller && !product.isNewArrival && (
            <span className="bg-[#C5A059] text-white text-[9px] uppercase tracking-widest px-2.5 py-1 font-medium">
              Aurelic Jewels Signature
            </span>
          )}
          {product.stoneType && product.stoneType !== 'None' && (
            <span className="bg-white/90 text-[#1A1A1A] text-[9px] uppercase tracking-widest px-2 py-0.5 border border-black/5">
              {product.stoneType}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-xs transition-all z-10 ${
            isFavorited
              ? 'bg-[#1A1A1A] text-[#C5A059]'
              : 'bg-white/80 text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#C5A059]'
          }`}
          aria-label={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-[#C5A059]' : ''}`} />
        </button>

        {/* Quick Add Overlay on Desktop Hover */}
        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex gap-2">
          <button
            onClick={() => addToCart(product)}
            className="w-full py-2.5 bg-[#1A1A1A] hover:bg-[#C5A059] text-white text-[11px] uppercase tracking-widest font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Quick Acquire</span>
          </button>
        </div>
      </div>

      {/* Product Content & Pricing */}
      <div className="p-5 flex flex-col justify-between flex-1 space-y-3">
        <div>
          <div className="flex items-center justify-between text-[10px] text-[#1A1A1A]/60 uppercase tracking-widest mb-1">
            <span>
              {product.purity} {product.metalType}
            </span>
            {product.rating > 0 && (
              <div className="flex items-center gap-1 text-[#C5A059]">
                <Star className="w-3 h-3 fill-[#C5A059]" />
                <span className="font-medium">{product.rating}</span>
              </div>
            )}
          </div>

          <Link
            href={`/product/${product.slug}`}
            className="serif text-lg text-[#1A1A1A] hover:text-[#C5A059] transition-colors leading-snug line-clamp-1"
          >
            {product.name}
          </Link>

          <p className="text-xs text-[#1A1A1A]/60 line-clamp-2 mt-1 leading-relaxed font-light">
            {product.shortDescription}
          </p>
        </div>

        {/* Price & Weight info */}
        <div className="pt-2 border-t border-black/5 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="serif italic text-lg font-normal text-[#1A1A1A]">
              {formatPrice(product.priceUSD)}
            </span>
            {product.comparePriceUSD && (
              <span className="text-xs text-[#1A1A1A]/40 line-through font-serif">
                {formatPrice(product.comparePriceUSD)}
              </span>
            )}
          </div>
          {product.stoneWeightCarats && (
            <span className="text-[10px] text-[#C5A059] tracking-widest font-semibold uppercase">
              {product.stoneWeightCarats} ct
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
