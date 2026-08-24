'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '@/lib/types';
import { getProducts } from '@/lib/api';
import { useCurrency } from '@/context/CurrencyContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { formatPrice } = useCurrency();
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestedTerms = [
    'Oval Solitaire Ring',
    'Colombian Emerald',
    'Diamond Tennis Bracelet',
    '22K Solid Gold Bangle',
    'Men’s Signet Ring',
    'Sapphire Pendant',
  ];

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const res = await getProducts({ search: trimmed });
      if (res.success && res.data) {
        setResults(res.data);
      }
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleClose = () => {
    setQuery('');
    setResults([]);
    onClose();
  };

  const displayedResults = query.trim() ? results : [];

  return (\r
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm p-4 sm:p-6 md:p-12 flex justify-center items-start">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-3xl bg-[#FDFCF8] shadow-2xl border border-black/10 overflow-hidden my-8"
          >
            {/* Search Input Bar */}
            <div className="relative p-6 border-b border-black/5 flex items-center gap-4 bg-[#FDFCF8]">
              <Search className="w-5 h-5 text-[#C5A059] shrink-0" />
              <label htmlFor="global-search-query-input" className="sr-only">
                Search Haute Joaillerie Catalogue
              </label>
              <input
                ref={inputRef}
                id="global-search-query-input"
                name="searchQuery"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search gemstone, metal purity (18K, 22K), SKU, or creation name..."
                className="w-full text-base sm:text-lg bg-transparent text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus:outline-none serif"
              />
              <button
                onClick={handleClose}
                className="p-1.5 text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors"
                aria-label="Close search"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {!query.trim() ? (
                <div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-semibold mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Popular Curations & Inquiries</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTerms.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-3.5 py-1.5 bg-[#F5F2ED] hover:bg-[#1A1A1A] hover:text-[#C5A059] text-xs text-[#1A1A1A] tracking-wide transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              ) : isLoading ? (
                <div className="text-center py-12 text-sm text-[#1A1A1A]/60 serif italic">
                  Consulting Maison Archives...
                </div>
              ) : displayedResults.length === 0 ? (
                <div className="text-center py-12">
                  <p className="serif text-lg text-[#1A1A1A]">No pieces matched your inquiry</p>
                  <p className="text-xs text-[#1A1A1A]/60 mt-1 font-light">
                    Try searching for &quot;Emerald&quot;, &quot;Solitaire&quot;, &quot;18K Gold&quot; or request a custom bespoke commission.
                  </p>
                  <Link
                    href="/custom-jewellery"
                    onClick={handleClose}
                    className="inline-block mt-4 text-xs tracking-widest uppercase text-[#C5A059] border-b border-[#C5A059] pb-0.5"
                  >
                    Bespoke Atelier Inquiry →
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs text-[#1A1A1A]/70 border-b border-black/5 pb-2">
                    <span>{displayedResults.length} Pieces Discovered</span>
                    <Link
                      href={`/shop?search=${encodeURIComponent(query)}`}
                      onClick={handleClose}
                      className="text-[#C5A059] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>View in Full Discovery Grid</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {displayedResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        onClick={handleClose}
                        className="flex gap-3 p-3 bg-white hover:bg-[#F5F2ED] border border-black/5 transition-colors group"
                      >
                        <div className="relative w-16 h-20 bg-[#F5F2ED] shrink-0 overflow-hidden">
                          {product.images[0] && (
                            <Image
                              src={product.images[0].url}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] text-[#C5A059] tracking-wider uppercase font-semibold">
                            {product.purity} {product.metalType}
                          </p>
                          <h4 className="serif text-sm text-[#1A1A1A] group-hover:text-[#C5A059] transition-colors truncate">
                            {product.name}
                          </h4>
                          <p className="serif text-sm font-medium text-[#1A1A1A] mt-1">
                            {formatPrice(product.priceUSD)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
