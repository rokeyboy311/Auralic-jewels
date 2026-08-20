import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Droplet, Sun, Wind } from 'lucide-react';

export default function MaterialsCarePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-[10px] tracking-[0.35em] text-[#9b7e46] uppercase font-medium">
          Maison Auralic Longevity Protocol
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#141210] uppercase font-light">
          Fine Jewellery Materials & Care Guide
        </h1>
        <p className="text-xs sm:text-sm text-[#73685a] max-w-lg mx-auto font-light leading-relaxed">
          Preserve the mirror polish of your solid gold and the fire of your certified diamonds across generations with our atelier maintenance recommendations.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-[#faf8f5] border border-[#c5b49e]/40 p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-xl text-[#141210] uppercase">1. Daily Wear & Storage Rituals</h2>
          <p className="text-xs text-[#4a4237] leading-relaxed">
            Apply cosmetics, perfumes, lotions, and hairspray before putting on your jewellery. Store each creation separately inside its dedicated Auralic chamois pouch or velvet-lined jewelry chest to prevent gemstones from scratching adjacent precious metal surfaces.
          </p>
        </div>

        <div className="bg-[#faf8f5] border border-[#c5b49e]/40 p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-xl text-[#141210] uppercase">2. Home Cleaning Protocol for Diamonds & Gold</h2>
          <p className="text-xs text-[#4a4237] leading-relaxed">
            Immerse the piece in a bowl of warm water mixed with a few drops of mild, pH-neutral dish soap for 10–15 minutes. Gently brush behind the diamond pavilion with an ultra-soft infant toothbrush. Rinse thoroughly with clean warm water and pat dry with a lint-free microfiber polishing cloth.
          </p>
        </div>

        <div className="bg-[#faf8f5] border border-[#c5b49e]/40 p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-xl text-[#141210] uppercase">3. Special Care for Emeralds, Pearls & Opals</h2>
          <p className="text-xs text-[#4a4237] leading-relaxed">
            Emeralds, pearls, and opals are organic or oiled gemstones that must never be subjected to ultrasonic cleaning machines or chemical jewelry dips. Clean only with a damp, soft cloth and lukewarm water.
          </p>
        </div>

        <div className="bg-[#faf8f5] border border-[#c5b49e]/40 p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-xl text-[#141210] uppercase">4. Complimentary Annual Atelier Spa</h2>
          <p className="text-xs text-[#4a4237] leading-relaxed">
            Every Auralic piece includes lifetime complimentary annual prong tightening, ultrasonic inspection, and steam polishing at our Place Vendôme atelier or via our insured courier service.
          </p>
        </div>
      </div>
    </div>
  );
}
