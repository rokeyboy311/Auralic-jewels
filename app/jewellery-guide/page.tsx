import React from 'react';
import Link from 'next/link';
import { Gem, ShieldCheck, Sparkles, Award } from 'lucide-react';

export default function JewelleryGuidePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-[10px] tracking-[0.35em] text-[#9b7e46] uppercase font-medium">
          Maison Aurelia Gemological Dossier
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#141210] uppercase font-light">
          The Fine Jewellery Connoisseur&apos;s Guide
        </h1>
        <p className="text-xs sm:text-sm text-[#73685a] max-w-xl mx-auto font-light leading-relaxed">
          Master the fundamentals of diamond grading (the 4Cs), precious metal purities, and rare untreated gemstones to acquire heirloom creations with total confidence.
        </p>
      </div>

      {/* The 4Cs of Diamonds */}
      <section className="space-y-6 bg-[#faf8f5] border border-[#c5b49e]/40 p-6 sm:p-10">
        <div className="border-b border-[#ebdccd] pb-3">
          <span className="text-[10px] text-[#9b7e46] uppercase tracking-wider font-bold">Chapter 01</span>
          <h2 className="font-serif text-2xl text-[#141210] uppercase">The 4Cs of Exceptional Diamonds</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-[#4a4237]">
          <div className="space-y-1.5">
            <h3 className="font-serif text-base text-[#141210] font-medium">1. Cut (Proportions & Brilliance)</h3>
            <p className="leading-relaxed">
              The cut dictates how light refracts within the diamond facets. Maison Aurelia exclusively selects &apos;Excellent&apos; and &apos;Ideal&apos; cuts to deliver unparalleled brilliance and rainbow fire.
            </p>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-serif text-base text-[#141210] font-medium">2. Color (D to F Colorless)</h3>
            <p className="leading-relaxed">
              We exclusively set diamonds in the D–F (Completely Colorless) and G–H (Near Colorless) spectrums, ensuring maximum purity when set in platinum or warm 18K yellow gold.
            </p>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-serif text-base text-[#141210] font-medium">3. Clarity (FL to VS1)</h3>
            <p className="leading-relaxed">
              Every diamond is graded Flawless (FL), Internally Flawless (IF), or Very Slightly Included (VS1/VS2), guaranteeing that inclusions are invisible to the naked eye.
            </p>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-serif text-base text-[#141210] font-medium">4. Carat Weight & Spread</h3>
            <p className="leading-relaxed">
              Our master cutters maximize the visible millimeter table spread of each carat weight, yielding larger apparent diameter without sacrificing depth or optical brilliance.
            </p>
          </div>
        </div>
      </section>

      {/* Gold & Metallurgy Comparison */}
      <section className="space-y-6 bg-[#faf8f5] border border-[#c5b49e]/40 p-6 sm:p-10">
        <div className="border-b border-[#ebdccd] pb-3">
          <span className="text-[10px] text-[#9b7e46] uppercase tracking-wider font-bold">Chapter 02</span>
          <h2 className="font-serif text-2xl text-[#141210] uppercase">Precious Metallurgy: 18K vs 22K vs Platinum</h2>
        </div>

        <div className="space-y-4 text-xs text-[#4a4237] leading-relaxed">
          <div className="p-4 bg-white border border-[#ebdccd] space-y-1">
            <h3 className="font-serif text-sm font-medium text-[#141210]">18K Solid Gold (75.0% Pure Gold)</h3>
            <p>
              The gold standard of international haute joaillerie. Blended with copper, silver, and zinc to achieve extraordinary durability for daily wear while retaining a rich, radiant golden luster.
            </p>
          </div>

          <div className="p-4 bg-white border border-[#ebdccd] space-y-1">
            <h3 className="font-serif text-sm font-medium text-[#141210]">22K Heritage Gold (91.6% Pure Gold)</h3>
            <p>
              Prized in Middle Eastern and South Asian royal jewelry traditions. Boasts an intense, warm marigold hue and weighty hand feel, reserved for traditional bangles and bridal necklaces.
            </p>
          </div>

          <div className="p-4 bg-white border border-[#ebdccd] space-y-1">
            <h3 className="font-serif text-sm font-medium text-[#141210]">950 Platinum (95.0% Pure Platinum)</h3>
            <p>
              Naturally white and hyper-dense, platinum never fades or tarnishes. Its supreme tensile strength holds large diamond solitaires with absolute security.
            </p>
          </div>
        </div>
      </section>

      <div className="text-center pt-4">
        <Link
          href="/shop"
          className="inline-block px-8 py-3.5 bg-[#141210] hover:bg-[#9b7e46] text-[#faf8f5] text-xs uppercase tracking-[0.2em] font-medium transition-colors"
        >
          Explore Certified Masterpieces
        </Link>
      </div>
    </div>
  );
}
