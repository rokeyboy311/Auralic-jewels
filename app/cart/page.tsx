'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShieldCheck, ArrowRight, Tag, ChevronLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { brandConfig } from '@/lib/brandConfig';

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    subtotalUSD,
    discountUSD,
    couponCode,
    applyCoupon,
    removeCoupon,
    estimatedShippingUSD,
    totalUSD,
  } = useCart();
  const { formatPrice } = useCurrency();
  const [promoInput, setPromoInput] = useState('');

  const freeShippingThreshold = brandConfig.freeShippingThresholdUSD;
  const progressToFreeShipping = Math.min(100, (subtotalUSD / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotalUSD);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const ok = await applyCoupon(promoInput.trim());
    if (ok) setPromoInput('');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-6">
        <h1 className="font-serif text-3xl text-[#141210]">Your Acquisition Bag is Empty</h1>
        <p className="text-xs sm:text-sm text-[#73685a] max-w-md mx-auto leading-relaxed">
          Explore our certified solitaires, Colombian emeralds, and solid gold heirlooms to begin your private curation.
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
      <div className="border-b border-[#ebdccd] pb-4">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1 text-xs text-[#73685a] hover:text-[#141210] uppercase tracking-wider mb-2"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Continue Exploring</span>
        </Link>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#141210] uppercase font-light">
          Your Private Selection ({items.length})
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* LEFT: CART ITEMS */}
        <div className="lg:col-span-8 space-y-6">
          {/* Free shipping progress */}
          <div className="bg-[#f2ece2] p-4 border border-[#ebdccd]">
            {subtotalUSD >= freeShippingThreshold ? (
              <div className="flex items-center gap-2 text-xs text-[#2b2621]">
                <ShieldCheck className="w-4 h-4 text-[#9b7e46]" />
                <span>Complimentary Armored Ferrari Group Courier unlocked for this acquisition.</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#4a4237]">
                  <span>Add {formatPrice(remainingForFreeShipping)} for complimentary armored courier</span>
                  <span className="font-mono">{Math.round(progressToFreeShipping)}%</span>
                </div>
                <div className="w-full bg-[#dfd6c9] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#9b7e46] h-full transition-all duration-500"
                    style={{ width: `${progressToFreeShipping}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#faf8f5] border border-[#c5b49e]/40 divide-y divide-[#ebdccd]">
            {items.map((item) => (
              <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6 items-start">
                <div className="relative w-24 h-28 bg-[#ede5d8] shrink-0 border border-[#c5b49e]/30">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <Link
                    href={`/product/${item.slug}`}
                    className="font-serif text-lg text-[#141210] hover:text-[#9b7e46] transition-colors"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-[#73685a]">
                    {item.purity} {item.metalType} {item.size ? `• Ring Size ${item.size}` : ''}
                  </p>
                  {item.stoneType && item.stoneType !== 'None' && (
                    <p className="text-xs text-[#9b7e46]">{item.stoneType}</p>
                  )}

                  <div className="pt-3 flex items-center justify-between">
                    <div className="flex items-center border border-[#c5b49e]/60 bg-white">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1.5 text-[#6b6257] hover:text-[#141210] transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-mono">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1.5 text-[#6b6257] hover:text-[#141210] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs text-[#998b79] hover:text-red-700 flex items-center gap-1 uppercase tracking-wider"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>

                <div className="text-right sm:self-center font-mono text-lg font-medium text-[#141210]">
                  {formatPrice(item.unitPriceUSD * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: ORDER SUMMARY */}
        <div className="lg:col-span-4 bg-[#faf8f5] border border-[#c5b49e]/40 p-6 space-y-6 sticky top-28">
          <h2 className="font-serif text-xl text-[#141210] uppercase tracking-wider border-b border-[#ebdccd] pb-3">
            Acquisition Summary
          </h2>

          {/* Promo code form */}
          {couponCode ? (
            <div className="flex items-center justify-between bg-[#ebdccd] px-3 py-2 text-xs">
              <div className="flex items-center gap-1.5 text-[#2b2621]">
                <Tag className="w-3.5 h-3.5 text-[#9b7e46]" />
                <span>
                  Privilege <strong>{couponCode}</strong> applied (-{formatPrice(discountUSD)})
                </span>
              </div>
              <button onClick={removeCoupon} className="text-red-700 text-[11px] underline">
                Remove
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input
                type="text"
                placeholder="Patron Privilege Code"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                className="flex-1 bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] uppercase tracking-wider focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#141210] text-[#faf8f5] text-xs uppercase tracking-widest hover:bg-[#9b7e46] transition-colors"
              >
                Apply
              </button>
            </form>
          )}

          <div className="space-y-2 text-xs text-[#4a4237]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono text-[#141210]">{formatPrice(subtotalUSD)}</span>
            </div>
            {discountUSD > 0 && (
              <div className="flex justify-between text-[#9b7e46]">
                <span>Patron Discount</span>
                <span className="font-mono">-{formatPrice(discountUSD)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Estimated Armored Courier</span>
              <span className="font-mono">
                {estimatedShippingUSD === 0 ? 'Complimentary' : formatPrice(estimatedShippingUSD)}
              </span>
            </div>
            <div className="border-t border-[#ebdccd] pt-3 flex justify-between items-baseline">
              <span className="font-serif text-lg text-[#141210] font-medium uppercase">Total</span>
              <span className="font-serif text-2xl text-[#9b7e46] font-semibold">{formatPrice(totalUSD)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full py-4 bg-[#141210] hover:bg-[#9b7e46] text-[#faf8f5] text-xs uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
