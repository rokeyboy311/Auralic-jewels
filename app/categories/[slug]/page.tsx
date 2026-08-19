'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { Product, Category } from '@/lib/types';
import { getProducts, getCategories } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCategoryData() {
      setIsLoading(true);
      const [catsRes, prodsRes] = await Promise.all([
        getCategories(),
        getProducts({ category: slug }),
      ]);

      if (catsRes.success && catsRes.data) {
        const found = catsRes.data.find((c) => c.slug === slug || c.id === slug);
        if (found) {
          setCategory(found);
        }
      }

      if (prodsRes.success && prodsRes.data) {
        setProducts(prodsRes.data);
      }
      setIsLoading(false);
    }
    loadCategoryData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center font-serif text-xl text-[#73685a]">
        Consulting Category Archives...
      </div>
    );
  }

  if (!category && products.length === 0) {
    return notFound();
  }

  const categoryName = category?.name || slug.replace(/-/g, ' ').toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#73685a] uppercase tracking-wider">
        <Link href="/" className="hover:text-[#141210]">
          Maison
        </Link>
        <ChevronRight className="w-3 h-3 text-[#c5b49e]" />
        <Link href="/shop" className="hover:text-[#141210]">
          Shop
        </Link>
        <ChevronRight className="w-3 h-3 text-[#c5b49e]" />
        <span className="text-[#141210] font-medium">{categoryName}</span>
      </nav>

      {/* Header Banner */}
      <div className="relative bg-[#141210] text-[#faf8f5] p-8 sm:p-14 border border-[#38312b] overflow-hidden">
        {category?.imageUrl && (
          <div className="absolute inset-0 opacity-25">
            <Image
              src={category.imageUrl}
              alt={categoryName}
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        <div className="relative z-10 space-y-3 max-w-2xl">
          <span className="text-[10px] tracking-[0.35em] text-[#d4af37] uppercase font-medium">
            Maison Jewellery Category
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#faf8f5] font-light uppercase tracking-wide">
            {categoryName}
          </h1>
          <p className="text-xs sm:text-sm text-[#b0a595] leading-relaxed font-light">
            {category?.description || `Explore hand-forged ${categoryName} sculpted with certified diamonds, untreated gemstones, and solid gold alloys.`}
          </p>
        </div>
      </div>

      {/* Product Grid */}
      <div className="space-y-6">
        <div className="flex justify-between items-center text-xs text-[#73685a] border-b border-[#ebdccd] pb-3">
          <span>{products.length} {products.length === 1 ? 'Creation Available' : 'Creations Available'}</span>
          <Link href="/shop" className="text-[#9b7e46] hover:underline flex items-center gap-1 uppercase tracking-wider">
            <span>View All Categories</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#c5b49e]/40 p-8 space-y-3">
            <p className="font-serif text-xl text-[#141210]">Currently Preparing New Pieces in the Atelier</p>
            <p className="text-xs text-[#73685a]">
              Please check back shortly or request a bespoke commission from our Master Gemologists.
            </p>
            <Link
              href="/custom-jewellery"
              className="inline-block mt-2 px-6 py-2.5 bg-[#141210] text-[#faf8f5] text-xs uppercase tracking-widest"
            >
              Bespoke Commission
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
