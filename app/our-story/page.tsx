'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Gem, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { brandConfig } from '@/lib/brandConfig';

export default function OurStoryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-12 py-12 space-y-16">
      {/* Editorial Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.35em] text-[#9b7e46] uppercase font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Chronicle of Haute Joaillerie</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#141210] uppercase font-light tracking-wide">
          Our Story & Parisian Atelier
        </h1>
        <p className="text-xs sm:text-sm text-[#73685a] leading-relaxed font-light">
          A century of uncompromising dedication to the rarest natural gemstones, master goldsmithing traditions, and bespoke family heirlooms.
        </p>
      </div>

      {/* Hero Narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 order-2 lg:order-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#9b7e46] font-bold block">
            Genesis in Place Vendôme
          </span>
          <h2 className="font-serif text-3xl text-[#141210]">
            The Art of Hand-Crafted High Jewellery
          </h2>
          <p className="text-xs sm:text-sm text-[#4a4237] leading-relaxed">
            {brandConfig.name} was established with a singular vision: to restore the intimacy and peerless craftsmanship of classic European haute joaillerie. Each jewel is individually sculpted, hand-finished, and set by master artisans who have perfected their discipline over decades.
          </p>
          <p className="text-xs sm:text-sm text-[#4a4237] leading-relaxed">
            We reject high-volume casting in favour of solid 18-karat and 22-karat gold formulations, hand-selected D-FL GIA diamonds, and untreated Colombian emeralds chosen for their extraordinary inner fire.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#141210] hover:bg-[#9b7e46] text-[#faf8f5] text-xs uppercase tracking-[0.2em] font-medium transition-colors"
            >
              <span>Explore Masterpiece Vault</span>
              <ArrowRight className="w-4 h-4 text-[#d4af37]" />
            </Link>
          </div>
        </div>

        <div className="relative aspect-4/3 w-full bg-[#f5efe6] overflow-hidden border border-[#c5b49e]/40 order-1 lg:order-2">
          <Image
            src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=1200&q=80"
            alt="Artisan creating High Jewellery"
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Milestones & Heritage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[#ebdccd]">
        <div className="bg-[#faf8f5] border border-[#c5b49e]/40 p-6 sm:p-8 space-y-3">
          <Clock className="w-6 h-6 text-[#9b7e46]" />
          <h3 className="font-serif text-lg text-[#141210]">Time-Honored Techniques</h3>
          <p className="text-xs text-[#73685a] leading-relaxed">
            Preserving classical French filigree, micro-pavé setting, and hand-burnished bezel work that withstands generations.
          </p>
        </div>

        <div className="bg-[#faf8f5] border border-[#c5b49e]/40 p-6 sm:p-8 space-y-3">
          <Gem className="w-6 h-6 text-[#9b7e46]" />
          <h3 className="font-serif text-lg text-[#141210]">Exceptional Gemology</h3>
          <p className="text-xs text-[#73685a] leading-relaxed">
            Direct relationships with ethical mines in Colombia, Sri Lanka, and Botswana ensuring authentic provenance.
          </p>
        </div>

        <div className="bg-[#faf8f5] border border-[#c5b49e]/40 p-6 sm:p-8 space-y-3">
          <ShieldCheck className="w-6 h-6 text-[#9b7e46]" />
          <h3 className="font-serif text-lg text-[#141210]">Generational Heirlooms</h3>
          <p className="text-xs text-[#73685a] leading-relaxed">
            Every creation is accompanied by lifetime care, restorative polishing, and GIA gemological dossier authentication.
          </p>
        </div>
      </div>
    </div>
  );
}
