'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, ShieldCheck, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { brandConfig } from '@/lib/brandConfig';

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
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
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const freeShippingThreshold = brandConfig.freeShippingThresholdUSD;
  const progressToFreeShipping = Math.min(100, (subtotalUSD / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotalUSD);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    setIsApplyingPromo(true);
    const success = await applyCoupon(promoInput.trim());
    setIsApplyingPromo(false);
    if (success) {
      setPromoInput('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Side Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="w-screen max-w-md bg-[#faf8f5] text-[#141210] shadow-2xl flex flex-col justify-between border-l border-[#c5b49e]/40"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-[#ebdccd] flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl tracking-wider text-[#141210]">Your Acquisition Bag</h2>
                  <p className="text-xs text-[#9b7e46] tracking-widest uppercase mt-0.5">
                    {items.length} {items.length === 1 ? 'Selected Piece' : 'Selected Pieces'}
                  </p>
                </div>
                <button
                  onClick={closeCart}
                  className="p-2 text-[#6b6257] hover:text-[#141210] transition-colors"
                  aria-label="Close bag"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Free Shipping Progress Indicator */}
              <div className="bg-[#f2ece2] px-6 py-3 border-b border-[#ebdccd]">
                {subtotalUSD >= freeShippingThreshold ? (\r
                  <div className="flex items-center gap-2 text-xs text-[#2b2621]">
                    <ShieldCheck className="w-4 h-4 text-[#9b7e46]" />
                    <span>Complimentary Armored Courier unlocked for this acquisition.</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between text-xs text-[#4a4237] mb-1">
                      <span>Add {formatPrice(remainingForFreeShipping)} for complimentary armored courier</span>
                      <span>{Math.round(progressToFreeShipping)}%</span>
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

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-[#f0e8dc] flex items-center justify-center text-[#9b7e46] mb-4">
                      <Tag className="w-6 h-6" />
                    </div>
                    <p className="font-serif text-xl text-[#141210]">Your bag is currently empty</p>
                    <p className="text-xs text-[#73685a] max-w-xs mt-2 leading-relaxed">
                      Discover our exquisite diamond solitaires, high jewellery necklaces, and 18K gold masterworks.
                    </p>
                    <button
                      onClick={closeCart}
                      className="mt-6 px-6 py-2.5 bg-[#141210] text-[#f4efe9] text-xs tracking-[0.2em] uppercase font-medium hover:bg-[#9b7e46] transition-colors"
                    >
                      <Link href="/shop">Explore Creations</Link>
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 pb-6 border-b border-[#ebdccd] last:border-b-0 items-start"
                    >
                      <div className="relative w-20 h-24 bg-[#ede6dc] shrink-0 overflow-hidden border border-[#c5b49e]/30">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : null}
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="font-serif text-base text-[#141210] hover:text-[#9b7e46] transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <div className="text-xs text-[#73685a] mt-1 space-y-0.5">
                          <p>
                            {item.purity} {item.metalType}
                            {item.size ? ` • Size ${item.size}` : ''}
                          </p>
                          {item.stoneType && item.stoneType !== 'None' && (
                            <p className="text-[11px] text-[#9b7e46]">{item.stoneType}</p>
                          )}
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          {/* Quantity selector */}
                          <div className="flex items-center border border-[#c5b49e]/60 bg-white">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1 text-[#6b6257] hover:text-[#141210] hover:bg-[#f0e8dc] transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2.5 text-xs font-mono text-[#141210]">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1 text-[#6b6257] hover:text-[#141210] hover:bg-[#f0e8dc] transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Item Price */}
                          <div className="text-right">
                            <p className="font-serif text-base text-[#141210] font-medium">
                              {formatPrice(item.unitPriceUSD * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[#998b79] hover:text-red-700 p-1 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer & Checkout Action */}
              {items.length > 0 && (
                <div className="p-6 bg-[#f4efe9] border-t border-[#ebdccd] space-y-4">
                  {/* Promo code box */}
                  {couponCode ? (
                    <div className="flex items-center justify-between bg-[#ebdccd] px-3 py-2 text-xs">
                      <div className="flex items-center gap-1.5 text-[#2b2621]">
                        <Tag className="w-3.5 h-3.5 text-[#9b7e46]" />
                        <span>
                          Code <strong>{couponCode}</strong> applied (-{formatPrice(discountUSD)})
                        </span>
                      </div>
                      <button onClick={removeCoupon} className="text-red-700 text-[11px] underline">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                      <label htmlFor="cart-drawer-coupon-input" className="sr-only">
                        Patron Privilege Promotion Code
                      </label>
                      <input
                        id="cart-drawer-coupon-input"
                        name="couponCode"
                        type="text"
                        placeholder="Patron Privilege Code (e.g. WELCOME10)"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}\r
                        className="flex-1 bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] uppercase tracking-wider focus:outline-none focus:border-[#9b7e46]"
                      />
                      <button
                        type="submit"
                        disabled={isApplyingPromo}
                        className="px-4 py-2 bg-[#2a2825] text-white text-xs uppercase tracking-widest hover:bg-[#9b7e46] transition-colors disabled:opacity-50"
                      >
                        Apply
                      </button>
                    </form>
                  )}

                  {/* Pricing Breakdown */}
                  <div className="space-y-1.5 text-xs text-[#4a4237]">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-mono text-[#141210]">{formatPrice(subtotalUSD)}</span>
                    </div>
                    {discountUSD > 0 && (
                      <div className="flex justify-between text-[#9b7e46]">
                        <span>Patron Privilege Discount</span>
                        <span className="font-mono">-{formatPrice(discountUSD)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Insured Armored Courier</span>
                      <span className="font-mono">
                        {estimatedShippingUSD === 0 ? 'Complimentary' : formatPrice(estimatedShippingUSD)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-[#ebdccd] flex justify-between text-base font-serif text-[#141210]">
                      <span className="font-medium">Estimated Acquisition Total</span>
                      <span className="font-medium text-lg text-[#9b7e46]">{formatPrice(totalUSD)}</span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="w-full py-3.5 bg-[#141210] hover:bg-[#9b7e46] text-[#f4efe9] text-xs uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <span>Proceed to Secure Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-[#73685a] pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#9b7e46]" />
                    <span>256-Bit Encrypted Haute Joaillerie Checkout</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
