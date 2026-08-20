'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Sparkles, ShieldCheck, Gem, Award, ArrowRight, Star, ChevronRight, Check } from 'lucide-react';
import { Product, Category, Collection } from '@/lib/types';
import { getProducts, getCategories, getCollections } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { useCurrency } from '@/context/CurrencyContext';
import { brandConfig } from '@/lib/brandConfig';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeTab, setActiveTab] = useState<'featured' | 'new' | 'bestsellers'>('featured');
  const { formatPrice } = useCurrency();

  useEffect(() => {
    async function loadData() {
      const [prodRes, catRes, colRes] = await Promise.all([
        getProducts({ limit: 8 }),
        getCategories(),
        getCollections(),
      ]);
      if (prodRes.success && prodRes.data) setProducts(prodRes.data);
      if (catRes.success && catRes.data) setCategories(catRes.data);
      if (colRes.success && colRes.data) setCollections(colRes.data);
    }
    loadData();
  }, []);

  const displayedProducts = products.filter((p) => {
    if (activeTab === 'new') return p.isNewArrival;
    if (activeTab === 'bestsellers') return p.isBestSeller;
    return p.isFeatured;
  });

  return (
    <div className="space-y-24 sm:space-y-32 bg-[#FDFCF8]">
      {/* 1. ARTISTIC FLAIR EDITORIAL HERO SECTION */}
      <section className="relative w-full border-b border-black/5 bg-[#FDFCF8] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[680px] lg:min-h-[740px]">
          {/* Left Column: Editorial Typography & Actions */}
          <div className="lg:col-span-5 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-16 space-y-8 z-10">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-3"
            >
              <p className="text-[10px] uppercase tracking-[0.45em] text-[#C5A059] font-semibold">
                Haute Joaillerie • Collection 2026
              </p>
              <h1 className="serif text-5xl sm:text-6xl xl:text-7xl leading-[1.08] font-light text-[#1A1A1A] tracking-tight">
                Eternal<br />
                <span className="italic font-normal text-[#C5A059]">Luminescence</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-xs sm:text-sm leading-relaxed text-[#1A1A1A]/70 max-w-md font-light"
            >
              Discover a masterclass in French precision. Hand-carved 18K champagne gold and certified untreated gemstones meet the world’s most rare conflict-free diamonds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="pt-2 flex flex-wrap items-center gap-8 sm:gap-12"
            >
              <Link
                href="/shop"
                className="px-8 sm:px-10 py-4 bg-[#1A1A1A] text-white text-[11px] uppercase tracking-widest hover:bg-[#C5A059] transition-colors shadow-sm"
              >
                Discover the Creations
              </Link>
              <div className="flex flex-col">
                <span className="serif italic text-xl font-normal text-[#1A1A1A]">{formatPrice(12450)}</span>
                <span className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/50">Inc. Global Duties & Insurance</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Concentric Geometric Art Showcase with Gold Accents */}
          <div className="lg:col-span-7 relative bg-[#F5F2ED] flex items-center justify-center p-8 sm:p-12 overflow-hidden min-h-[420px] lg:min-h-full">
            {/* Background layered circles motif */}
            <div className="relative w-[340px] sm:w-[460px] h-[340px] sm:h-[460px] rounded-full border border-black/5 flex items-center justify-center p-8 sm:p-12 animate-in fade-in zoom-in-95 duration-1000">
              <div className="w-full h-full rounded-full border border-black/10 flex items-center justify-center p-8 sm:p-12">
                <div className="w-full h-full rounded-full border border-[#C5A059]/40 relative flex items-center justify-center">
                  <div className="relative w-48 sm:w-64 h-48 sm:h-64 rounded-full overflow-hidden shadow-2xl border-4 border-white/80">
                    <Image
                      src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=85"
                      alt="Artisan Fine Jewellery Solitaire Masterpiece"
                      fill
                      priority
                      className="object-cover scale-105 hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Signature side gold accent bar */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1.5 h-24 bg-[#C5A059]"></div>

            {/* Bottom Right Floating Badge */}
            <div className="absolute bottom-8 right-8 text-right bg-[#FDFCF8]/90 backdrop-blur-xs p-3 px-5 border border-black/5">
              <p className="serif italic text-xs text-[#1A1A1A]/50">Artisan Series 01</p>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]">Place Vendôme Paris</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAISON PILLARS / PROMISES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10 border-y border-black/5 bg-[#F5F2ED]/60 px-6 sm:px-10">
          <div className="flex items-start gap-4">
            <Gem className="w-5 h-5 text-[#C5A059] shrink-0 mt-1" />
            <div>
              <h4 className="serif text-base text-[#1A1A1A] uppercase tracking-wider font-medium">
                GIA & IGI Certified
              </h4>
              <p className="text-xs text-[#1A1A1A]/60 mt-1 leading-relaxed font-light">
                Individually laser-inscribed conflict-free diamonds with official gemological dossiers.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <ShieldCheck className="w-5 h-5 text-[#C5A059] shrink-0 mt-1" />
            <div>
              <h4 className="serif text-base text-[#1A1A1A] uppercase tracking-wider font-medium">
                Armored Air Courier
              </h4>
              <p className="text-xs text-[#1A1A1A]/60 mt-1 leading-relaxed font-light">
                Complimentary insured global delivery via Ferrari Group & FedEx Valuables with direct signature.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Award className="w-5 h-5 text-[#C5A059] shrink-0 mt-1" />
            <div>
              <h4 className="serif text-base text-[#1A1A1A] uppercase tracking-wider font-medium">
                30-Day Privilege Return
              </h4>
              <p className="text-xs text-[#1A1A1A]/60 mt-1 leading-relaxed font-light">
                Complimentary worldwide return and resizing with full authenticity certificate.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Sparkles className="w-5 h-5 text-[#C5A059] shrink-0 mt-1" />
            <div>
              <h4 className="serif text-base text-[#1A1A1A] uppercase tracking-wider font-medium">
                Bespoke Atelier
              </h4>
              <p className="text-xs text-[#1A1A1A]/60 mt-1 leading-relaxed font-light">
                Collaborate directly with our master gemologists in Paris for custom bridal commissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CURATED HIGH JEWELLERY CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-12 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#C5A059] font-semibold">
            Fine Jewellery Disciplines
          </span>
          <h2 className="serif text-3xl sm:text-4xl text-[#1A1A1A] font-light tracking-wide uppercase">
            Curated Categories
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.slice(0, 5).map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group relative aspect-3/4 overflow-hidden bg-[#F5F2ED] border border-black/5"
            >
              <Image
                src={cat.imageUrl}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 50vw, 20vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                <span className="text-[9px] uppercase tracking-widest text-[#C5A059] font-medium">
                  {cat.itemCount} Pieces
                </span>
                <h3 className="serif text-lg sm:text-xl text-white group-hover:text-[#C5A059] transition-colors">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. MASTERPIECES SHOWCASE (TABS: FEATURED / NEW / BEST SELLERS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-12 space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-black/5 pb-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#C5A059] font-semibold">
              Place Vendôme Selection
            </span>
            <h2 className="serif text-2xl sm:text-3xl text-[#1A1A1A] font-light tracking-wide uppercase">
              Iconic Masterpieces
            </h2>
          </div>

          <div className="flex items-center gap-1 bg-[#F5F2ED] p-1 border border-black/5">
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-4 py-2 text-[11px] uppercase tracking-widest transition-colors ${
                activeTab === 'featured'
                  ? 'bg-[#1A1A1A] text-[#C5A059] font-semibold shadow-xs'
                  : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
              }`}
            >
              Featured
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-4 py-2 text-[11px] uppercase tracking-widest transition-colors ${
                activeTab === 'new'
                  ? 'bg-[#1A1A1A] text-[#C5A059] font-semibold shadow-xs'
                  : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
              }`}
            >
              New Arrivals
            </button>
            <button
              onClick={() => setActiveTab('bestsellers')}
              className={`px-4 py-2 text-[11px] uppercase tracking-widest transition-colors ${
                activeTab === 'bestsellers'
                  ? 'bg-[#1A1A1A] text-[#C5A059] font-semibold shadow-xs'
                  : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
              }`}
            >
              Best Sellers
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(displayedProducts.length > 0 ? displayedProducts : products.slice(0, 4)).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center pt-4">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1A1A1A] hover:bg-[#C5A059] text-white text-[11px] uppercase tracking-widest font-medium transition-colors"
          >
            <span>View All {products.length} Fine Creations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 5. EDITORIAL SPOTLIGHT / CRAFTSMANSHIP STORY */}
      <section className="bg-[#1A1A1A] text-white py-20 px-4 sm:px-12 border-y border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative aspect-4/3 sm:aspect-16/10 overflow-hidden border border-white/10">
            <Image
              src="https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?auto=format&fit=crop&w=1400&q=85"
              alt="Maison Auralic Master Goldsmith Crafting Fine Jewellery"
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="lg:col-span-6 space-y-6">
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#C5A059] font-semibold">
              The Parisian Atelier
            </span>
            <h2 className="serif text-3xl sm:text-4xl md:text-5xl font-light tracking-wide uppercase leading-tight">
              Where Fire Meets <br />
              <span className="italic font-normal text-[#C5A059]">Flawless Precision</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-light">
              Every creation at Maison Auralic is forged by generational French artisans with over 30 years of discipline. From initial gouache sketches to high-precision micro-prong setting under microscope, we ensure that every diamond facet captures and returns maximum luminosity.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-2">
              <div className="border-l-2 border-[#C5A059] pl-4 space-y-1">
                <span className="serif text-2xl text-[#C5A059]">100%</span>
                <p className="text-xs text-white/60">Certified Conflict-Free Kimberley Process</p>
              </div>
              <div className="border-l-2 border-[#C5A059] pl-4 space-y-1">
                <span className="serif text-2xl text-[#C5A059]">18K & 22K</span>
                <p className="text-xs text-white/60">Solid Gold & 950 Platinum Alloy Hallmarks</p>
              </div>
            </div>
            <div className="pt-4">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-[#C5A059] hover:text-white transition-colors border-b border-[#C5A059] pb-1"
              >
                <span>Discover Maison Heritage</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FEATURED HIGH JEWELLERY COLLECTIONS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-12 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#C5A059] font-semibold">
            Signature Curation
          </span>
          <h2 className="serif text-3xl sm:text-4xl text-[#1A1A1A] font-light tracking-wide uppercase">
            Maison Collections
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {collections.slice(0, 3).map((col) => (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              className="group relative aspect-4/5 overflow-hidden bg-[#F5F2ED] border border-black/5 flex flex-col justify-end p-6"
            >
              <Image
                src={col.bannerImage}
                alt={col.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="relative z-10 space-y-2">
                <span className="text-[9px] uppercase tracking-widest text-[#C5A059]">
                  Haute Collection
                </span>
                <h3 className="serif text-2xl text-white group-hover:text-[#C5A059] transition-colors">
                  {col.name}
                </h3>
                <p className="text-xs text-white/70 line-clamp-2 leading-relaxed font-light">
                  {col.subtitle}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-[#C5A059] pt-1 font-medium">
                  <span>Explore Collection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. PATRON REVIEWS & TESTIMONIALS */}
      <section className="bg-[#F5F2ED] py-20 px-4 sm:px-12 border-y border-black/5">
        <div className="max-w-5xl mx-auto space-y-12 text-center">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#C5A059] font-semibold">
              Verified Client Impressions
            </span>
            <h2 className="serif text-3xl sm:text-4xl text-[#1A1A1A] font-light tracking-wide uppercase">
              Patron Testimonials
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-[#FDFCF8] p-6 border border-black/5 space-y-3 shadow-xs">
              <div className="flex items-center gap-1 text-[#C5A059]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#C5A059]" />
                ))}
              </div>
              <h4 className="serif text-base text-[#1A1A1A]">
                &quot;The fire of the oval solitaire is extraordinary&quot;
              </h4>
              <p className="text-xs text-[#1A1A1A]/70 leading-relaxed font-light">
                The knife-edge band creates the illusion that the 2.5ct diamond is floating on air. Delivered securely by armored courier directly to our suite in Geneva.
              </p>
              <div className="pt-2 border-t border-black/5 text-[11px] text-[#1A1A1A]">
                <strong>Elena Rostova</strong> • Geneva, Switzerland
              </div>
            </div>

            <div className="bg-[#FDFCF8] p-6 border border-black/5 space-y-3 shadow-xs">
              <div className="flex items-center gap-1 text-[#C5A059]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#C5A059]" />
                ))}
              </div>
              <h4 className="serif text-base text-[#1A1A1A]">
                &quot;The ultimate diamond tennis bracelet&quot;
              </h4>
              <p className="text-xs text-[#1A1A1A]/70 leading-relaxed font-light">
                Noticeably whiter and more brilliant than pieces from conventional Madison Avenue houses. The double-locking safety clasp is beautifully engineered.
              </p>
              <div className="pt-2 border-t border-black/5 text-[11px] text-[#1A1A1A]">
                <strong>Victoria S.</strong> • London, UK
              </div>
            </div>

            <div className="bg-[#FDFCF8] p-6 border border-black/5 space-y-3 shadow-xs">
              <div className="flex items-center gap-1 text-[#C5A059]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#C5A059]" />
                ))}
              </div>
              <h4 className="serif text-base text-[#1A1A1A]">
                &quot;Substantial platinum weight and quiet prestige&quot;
              </h4>
              <p className="text-xs text-[#1A1A1A]/70 leading-relaxed font-light">
                The men’s cushion black diamond signet feels heavy and authoritative. Exceptional craftsmanship and discreet concierge communication.
              </p>
              <div className="pt-2 border-t border-black/5 text-[11px] text-[#1A1A1A]">
                <strong>Marcus Vance</strong> • Dubai, UAE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. BESPOKE ATELIER & CUSTOM DESIGN BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-12 pb-12">
        <div className="bg-[#1A1A1A] text-white p-8 sm:p-12 md:p-16 border border-white/10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#C5A059] font-semibold">
              Bespoke Atelier & Custom Commissions
            </span>
            <h3 className="serif text-3xl sm:text-4xl text-white font-light uppercase tracking-wide">
              Modify Any Design or Create An Heirloom
            </h3>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-light">
              Customize any creation from our catalog with your preferred gold karats, rare gemstones, prong styles, and laser engravings — or submit your own sketch for an original bespoke masterpiece crafted at Place Vendôme.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
            <Link
              href="/custom-jewellery"
              className="px-6 py-3.5 bg-[#C5A059] hover:bg-[#D4AF37] text-[#1A1A1A] text-[11px] uppercase tracking-widest font-semibold text-center transition-colors"
            >
              Custom Design Studio
            </Link>
            <Link
              href="/shop"
              className="px-6 py-3.5 border border-white/30 hover:border-white text-white text-[11px] uppercase tracking-widest font-medium text-center transition-colors"
            >
              Explore Ready-To-Wear
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
