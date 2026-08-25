'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Collection } from '@/lib/types';
import { getCollections } from '@/lib/api';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await getCollections();
      if (res.success && res.data) {
        setCollections(res.data);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-12">
      <div className="text-center space-y-2 max-w-2xl mx-auto border-b border-[#ebdccd] pb-8">
        <span className="text-[10px] tracking-[0.35em] text-[#9b7e46] uppercase font-medium">
          Aurelic Jewels Curation Portfolio
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#141210] uppercase font-light">
          Haute Joaillerie Collections
        </h1>
        <p className="text-xs sm:text-sm text-[#73685a] font-light">
          Each Aurelic collection explores a dedicated gemological discipline, from exceptional GIA certified solitaires to hand-carved 22K heritage gold.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {collections.map((col) => (
          <Link
            key={col.id}
            href={`/collections/${col.slug}`}
            className="group bg-[#faf8f5] border border-[#c5b49e]/40 overflow-hidden flex flex-col justify-between"
          >
            <div className="relative aspect-4/5 w-full bg-[#ede5d8] overflow-hidden">
              <Image
                src={col.bannerImage}
                alt={col.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-[#faf8f5]">
                <span className="text-[10px] tracking-widest text-[#d4af37] uppercase">
                  Haute Collection
                </span>
                <h3 className="font-serif text-2xl text-[#faf8f5] group-hover:text-[#d4af37] transition-colors">
                  {col.name}
                </h3>
              </div>
            </div>

            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <p className="text-xs text-[#73685a] leading-relaxed line-clamp-3">
                {col.description}
              </p>
              <div className="pt-2 border-t border-[#ebdccd] flex items-center justify-between text-xs text-[#9b7e46] font-medium uppercase tracking-wider">
                <span>View Collection Masterpieces</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
