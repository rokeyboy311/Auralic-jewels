'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { Product, Collection } from '@/lib/types';
import { getProducts, getCollections } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function CollectionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCollectionData() {
      setIsLoading(true);
      const [colsRes, prodsRes] = await Promise.all([
        getCollections(),
        getProducts({ collection: slug }),
      ]);

      if (colsRes.success && colsRes.data) {
        const found = colsRes.data.find((c) => c.slug === slug || c.id === slug);
        if (found) {
          setCollection(found);
        }
      }

      if (prodsRes.success && prodsRes.data) {
        setProducts(prodsRes.data);
      }
      setIsLoading(false);
    }
    loadCollectionData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center font-serif text-xl text-[#73685a]">
        Opening Collection Archive...
      </div>
    );
  }

  if (!collection && products.length === 0) {
    return notFound();
  }

  const title = collection?.name || slug.replace(/-/g, ' ').toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#73685a] uppercase tracking-wider">
        <Link href="/" className="hover:text-[#141210]">
          Maison
        </Link>
        <ChevronRight className="w-3 h-3 text-[#c5b49e]" />
        <Link href="/collections" className="hover:text-[#141210]">
          Collections
        </Link>
        <ChevronRight className="w-3 h-3 text-[#c5b49e]" />
        <span className="text-[#141210] font-medium">{title}</span>
      </nav>

      {/* Collection Hero Banner */}
      <div className="relative min-h-[400px] bg-[#141210] text-[#faf8f5] p-8 sm:p-16 border border-[#38312b] overflow-hidden flex flex-col justify-end">
        {collection?.bannerImage && (
          <Image
            src={collection.bannerImage}
            alt={title}
            fill
            priority
            className="object-cover opacity-35"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-black/40 to-transparent" />

        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.35em] text-[#d4af37] uppercase font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Haute Joaillerie Collection</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#faf8f5] font-light uppercase tracking-wide">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-[#d0c6b8] leading-relaxed font-light">
            {collection?.description}
          </p>
        </div>
      </div>

      {/* Products */}
      <div className="space-y-6">
        <div className="flex justify-between items-center text-xs text-[#73685a] border-b border-[#ebdccd] pb-3">
          <span>{products.length} Masterpieces in this Collection</span>
          <Link href="/shop" className="text-[#9b7e46] hover:underline flex items-center gap-1 uppercase tracking-wider">
            <span>Explore All Creations</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
