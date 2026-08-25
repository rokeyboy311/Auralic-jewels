'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Award, ShieldCheck, Sparkles, Sliders, ArrowRight } from 'lucide-react';
import { brandConfig } from '@/lib/brandConfig';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-12 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.35em] text-[#9b7e46] uppercase font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Place Vendôme Heritage</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#141210] uppercase font-light tracking-wide">
          Our Heritage & Haute Joaillerie
        </h1>
        <p className="text-xs sm:text-sm text-[#73685a] leading-relaxed font-light">
          Founded in Paris, {brandConfig.name} represents the pinnacle of ethical high jewellery, marrying classical French goldsmith techniques with innovative bespoke custom design.
        </p>
      </div>

      {/* Main Narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="relative aspect-4/3 w-full bg-[#f5efe6] overflow-hidden border border-[#c5b49e]/40">
          <Image
            src="https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80"
            alt="Maison Auralic Atelier Craftsmanship"
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="space-y-6">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#9b7e46] font-bold block">
            Artisanal Mastery
          </span>
          <h2 className="font-serif text-3xl text-[#141210]">
            From Gouache Sketches to 22K Solid Gold Masterpieces
          </h2>
          <p className="text-xs sm:text-sm text-[#4a4237] leading-relaxed">
            Every creation at Maison Auralic is born from a dialogue between the customer and the master artisan. We do not mass manufacture; our Master Jewellers cast in 18K and 22K gold alloy formulations, meticulously setting each GIA-certified diamond and Colombian emerald under 40x stereoscopic microscopes.
          </p>
          <p className="text-xs sm:text-sm text-[#4a4237] leading-relaxed">
            Beyond our signature ready-to-wear collections, our customers enjoy complete creative freedom to modify any design in our catalog or commission an entirely new bespoke piece from personal concepts.
          </p>
          <div className="pt-2">
            <Link
              href="/custom-jewellery"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#141210] hover:bg-[#9b7e46] text-[#faf8f5] text-xs uppercase tracking-[0.2em] font-medium transition-colors"
            >
              <span>Explore Custom Design Studio</span>
              <ArrowRight className="w-4 h-4 text-[#d4af37]" />
            </Link>
          </div>
        </div>
      </div>

      {/* Three Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[#ebdccd]">
        <div className="bg-[#faf8f5] border border-[#c5b49e]/40 p-6 sm:p-8 space-y-3">
          <ShieldCheck className="w-6 h-6 text-[#9b7e46]" />
          <h3 className="font-serif text-lg text-[#141210]">100% Conflict-Free Sourcing</h3>
          <p className="text-xs text-[#73685a] leading-relaxed">
            Member of the Responsible Jewellery Council (RJC). All diamonds are certified under the Kimberley Process and ethically verified.
          </p>
        </div>

        <div className="bg-[#faf8f5] border border-[#c5b49e]/40 p-6 sm:p-8 space-y-3">
          <Award className="w-6 h-6 text-[#9b7e46]" />
          <h3 className="font-serif text-lg text-[#141210]">French State Hallmarking</h3>
          <p className="text-xs text-[#73685a] leading-relaxed">
            Every piece crafted in our Parisian atelier is struck with the prestigious French guarantee hallmark and individual serial registry.
          </p>
        </div>

        <div className="bg-[#faf8f5] border border-[#c5b49e]/40 p-6 sm:p-8 space-y-3">
          <Sliders className="w-6 h-6 text-[#9b7e46]" />
          <h3 className="font-serif text-lg text-[#141210]">Bespoke & Modifications</h3>
          <p className="text-xs text-[#73685a] leading-relaxed">
            Personalize any creation with your chosen metal alloys, gemstone cuts, prong settings, and laser engravings.
          </p>
        </div>
      </div>
    </div>
  );
}
