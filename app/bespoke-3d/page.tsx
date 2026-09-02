'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Gem, ShieldCheck, Award } from 'lucide-react';
import Luxury3DScrollShowcase from '@/components/Luxury3DScrollShowcase';

export default function Bespoke3DStudioPage() {
  return (
    <div className="bg-[#110F0D] text-[#F5F2ED] min-h-screen">
      {/* Top Banner Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-12 py-6 flex items-center justify-between border-b border-white/10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A059] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Boutique</span>
        </Link>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/60">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Place Vendôme 3D Studio</span>
        </div>
      </div>

      {/* Main 3D Scrollytelling Engine */}
      <Luxury3DScrollShowcase />

      {/* Craftsmanship Specs & Certification Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-12 py-20 border-t border-white/10 space-y-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#C5A059] font-semibold">
            Certified French Metallurgy
          </span>
          <h2 className="serif text-3xl sm:text-4xl text-white font-light uppercase tracking-wide">
            The Bespoke Haute Dossier
          </h2>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-light">
            Each bespoke 3D creation is modeled to sub-millimeter tolerances before our generational master goldsmiths forge the piece in 18K solid gold or pure 950 platinum.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#1C1815] border border-white/10 p-8 space-y-4">
            <Gem className="w-6 h-6 text-[#C5A059]" />
            <h3 className="serif text-xl text-white">GIA Triple Excellent</h3>
            <p className="text-xs text-white/70 leading-relaxed font-light">
              Every center diamond is evaluated for Cut, Polish, and Symmetry grades of &apos;Excellent&apos; with zero visible fluorescence.
            </p>
          </div>

          <div className="bg-[#1C1815] border border-white/10 p-8 space-y-4">
            <ShieldCheck className="w-6 h-6 text-[#C5A059]" />
            <h3 className="serif text-xl text-white">French Hallmark Certified</h3>
            <p className="text-xs text-white/70 leading-relaxed font-light">
              Stamped with the official French eagle head for 18K gold or dog head for 950 platinum, plus individual workshop maker mark.
            </p>
          </div>

          <div className="bg-[#1C1815] border border-white/10 p-8 space-y-4">
            <Award className="w-6 h-6 text-[#C5A059]" />
            <h3 className="serif text-xl text-white">Lifetime Authenticity</h3>
            <p className="text-xs text-white/70 leading-relaxed font-light">
              Complimentary annual sonic cleaning, prong inspection, and insured worldwide maintenance via our Paris atelier.
            </p>
          </div>
        </div>

        <div className="text-center pt-8">
          <Link
            href="/custom-jewellery"
            className="inline-flex items-center gap-3 px-10 py-4 bg-[#C5A059] hover:bg-[#d8b566] text-[#110F0D] text-[11px] uppercase tracking-widest font-semibold transition-colors"
          >
            <span>Commission Custom 3D Piece</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
