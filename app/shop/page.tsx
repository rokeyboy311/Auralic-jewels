'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, RefreshCw } from 'lucide-react';
import { Product, Category, Collection } from '@/lib/types';
import { getProducts, getCategories, getCollections } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { useCurrency } from '@/context/CurrencyContext';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialCollection = searchParams.get('collection') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedCollection, setSelectedCollection] = useState<string>(initialCollection);
  const [selectedMetal, setSelectedMetal] = useState<string>('all');
  const [selectedPurity, setSelectedPurity] = useState<string>('all');
  const [selectedStone, setSelectedStone] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [maxPriceUSD, setMaxPriceUSD] = useState<number>(30000);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  const { formatPrice } = useCurrency();

  // Load products, categories, collections
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const [prodRes, catRes, colRes] = await Promise.all([
        getProducts({ search: initialSearch }),
        getCategories(),
        getCollections(),
      ]);
      if (isMounted) {
        if (prodRes.success && prodRes.data) setProducts(prodRes.data);
        if (catRes.success && catRes.data) setCategories(catRes.data);
        if (colRes.success && colRes.data) setCollections(colRes.data);
        setIsLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [initialSearch]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedCategory !== 'all') {
          const categoryObj = categories.find((c) => c.slug === selectedCategory);
          const catName = categoryObj ? categoryObj.name.toLowerCase() : selectedCategory.toLowerCase();
          if (!p.category.toLowerCase().includes(catName) && !p.category.toLowerCase().includes(selectedCategory.toLowerCase())) {
            return false;
          }
        }
        if (selectedCollection !== 'all') {
          const colObj = collections.find((c) => c.slug === selectedCollection);
          const colName = colObj ? colObj.name.toLowerCase() : selectedCollection.toLowerCase();
          if (p.collection && !p.collection.toLowerCase().includes(colName) && !p.collection.toLowerCase().includes(selectedCollection.toLowerCase())) {
            return false;
          }
        }
        if (selectedMetal !== 'all' && !p.metalType.toLowerCase().includes(selectedMetal.toLowerCase())) {
          return false;
        }
        if (selectedPurity !== 'all' && p.purity !== selectedPurity) {
          return false;
        }
        if (selectedStone !== 'all') {
          if (selectedStone === 'Diamond' && !p.stoneType.toLowerCase().includes('diamond')) return false;
          if (selectedStone === 'Emerald' && !p.stoneType.toLowerCase().includes('emerald')) return false;
          if (selectedStone === 'Sapphire' && !p.stoneType.toLowerCase().includes('sapphire')) return false;
          if (selectedStone === 'Ruby' && !p.stoneType.toLowerCase().includes('ruby')) return false;
          if (selectedStone === 'None' && p.stoneType !== 'None') return false;
        }
        if (selectedGender !== 'all' && p.gender !== selectedGender) {
          return false;
        }
        if (p.priceUSD > maxPriceUSD) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.priceUSD - b.priceUSD;
        if (sortBy === 'price-high') return b.priceUSD - a.priceUSD;
        if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
        if (sortBy === 'rating') return b.rating - a.rating;
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [
    products,
    categories,
    collections,
    selectedCategory,
    selectedCollection,
    selectedMetal,
    selectedPurity,
    selectedStone,
    selectedGender,
    maxPriceUSD,
    sortBy,
  ]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedCollection('all');
    setSelectedMetal('all');
    setSelectedPurity('all');
    setSelectedStone('all');
    setSelectedGender('all');
    setMaxPriceUSD(30000);
    setSortBy('featured');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedCollection !== 'all' ||
    selectedMetal !== 'all' ||
    selectedPurity !== 'all' ||
    selectedStone !== 'all' ||
    selectedGender !== 'all' ||
    maxPriceUSD < 30000;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-12 py-10 space-y-8 bg-[#FDFCF8]">
      {/* Page Heading */}
      <div className="space-y-2 text-center sm:text-left border-b border-black/5 pb-6">
        <span className="text-[10px] uppercase tracking-[0.4em] text-[#C5A059] font-semibold">
          Maison Discovery Grid
        </span>
        <h1 className="serif text-3xl sm:text-4xl text-[#1A1A1A] font-light uppercase tracking-wide">
          Fine Jewellery Creations
        </h1>
        <p className="text-xs sm:text-sm text-[#1A1A1A]/70 max-w-2xl font-light">
          Explore certified solitaire diamonds, Colombian emeralds, and solid 18K/22K gold heirlooms.
        </p>
      </div>

      {/* Control Bar: Filter Toggle (mobile), Active Tag Count, Sort By */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#F5F2ED] p-4 border border-black/5">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 bg-[#1A1A1A] text-white text-xs uppercase tracking-wider font-medium"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#C5A059]" />
            <span>Filters</span>
          </button>

          <span className="text-xs text-[#1A1A1A]/80 tracking-wider uppercase font-medium">
            Showing <strong>{filteredProducts.length}</strong> of {products.length} Masterpieces
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-[#C5A059] hover:underline flex items-center gap-1 uppercase tracking-wider font-semibold"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#1A1A1A]/70 tracking-wider uppercase whitespace-nowrap font-medium">
              Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#FDFCF8] border border-black/10 px-3 py-1.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C5A059]"
            >
              <option value="featured">Maison Featured</option>
              <option value="newest">Newest Acquisitions</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated by Patrons</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Faceted Sidebar + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* DESKTOP FACETED FILTERS SIDEBAR */}
        <aside className="hidden lg:block lg:col-span-3 bg-[#F5F2ED] p-6 border border-black/5 space-y-6">
          <div className="flex items-center justify-between border-b border-black/5 pb-3">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#1A1A1A]">
              Refine By
            </span>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-[11px] uppercase tracking-wider text-[#C5A059] hover:underline"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <label className="block text-[11px] uppercase tracking-widest text-[#C5A059] font-semibold">
              Category
            </label>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`block w-full text-left py-1 transition-colors ${
                  selectedCategory === 'all' ? 'text-[#C5A059] font-bold' : 'text-[#1A1A1A]/80 hover:text-[#C5A059]'
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.slug)}
                  className={`block w-full text-left py-1 transition-colors ${
                    selectedCategory === c.slug ? 'text-[#C5A059] font-bold' : 'text-[#1A1A1A]/80 hover:text-[#C5A059]'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Metal Type */}
          <div className="space-y-2 pt-3 border-t border-black/5">
            <label className="block text-[11px] uppercase tracking-widest text-[#C5A059] font-semibold">
              Metal & Alloy
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['all', 'Yellow Gold', 'White Gold', 'Rose Gold', 'Platinum'].map((metal) => (
                <button
                  key={metal}
                  onClick={() => setSelectedMetal(metal)}
                  className={`px-2.5 py-1 text-[11px] uppercase border transition-colors ${
                    selectedMetal === metal
                      ? 'bg-[#1A1A1A] text-[#C5A059] border-[#1A1A1A]'
                      : 'bg-white text-[#1A1A1A] border-black/10 hover:border-[#C5A059]'
                  }`}
                >
                  {metal === 'all' ? 'All' : metal}
                </button>
              ))}
            </div>
          </div>

          {/* Gemstone Type */}
          <div className="space-y-2 pt-3 border-t border-black/5">
            <label className="block text-[11px] uppercase tracking-widest text-[#C5A059] font-semibold">
              Precious Gemstone
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['all', 'Diamond', 'Emerald', 'Sapphire', 'Ruby', 'None'].map((stone) => (
                <button
                  key={stone}
                  onClick={() => setSelectedStone(stone)}
                  className={`px-2.5 py-1 text-[11px] uppercase border transition-colors ${
                    selectedStone === stone
                      ? 'bg-[#1A1A1A] text-[#C5A059] border-[#1A1A1A]'
                      : 'bg-white text-[#1A1A1A] border-black/10 hover:border-[#C5A059]'
                  }`}
                >
                  {stone === 'all' ? 'All' : stone}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2 pt-3 border-t border-black/5">
            <div className="flex justify-between text-xs">
              <label className="text-[11px] uppercase tracking-widest text-[#C5A059] font-semibold">
                Max Price
              </label>
              <span className="serif font-medium text-[#1A1A1A]">{formatPrice(maxPriceUSD)}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="30000"
              step="500"
              value={maxPriceUSD}
              onChange={(e) => setMaxPriceUSD(Number(e.target.value))}
              className="w-full accent-[#C5A059] cursor-pointer"
            />
          </div>
        </aside>

        {/* PRODUCT RESULTS GRID */}
        <main className="lg:col-span-9 space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="h-96 bg-[#F5F2ED] animate-pulse border border-black/5" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-[#F5F2ED] p-12 text-center space-y-4 border border-black/5">
              <span className="text-[10px] uppercase tracking-[0.35em] text-[#C5A059] font-semibold">
                No Exact Matches Found
              </span>
              <h3 className="serif text-2xl text-[#1A1A1A]">
                No Masterpieces Meet This Precise Filter
              </h3>
              <p className="text-xs text-[#1A1A1A]/70 max-w-md mx-auto">
                Adjust your gemstone, metal, or category parameters to discover other haute joaillerie acquisitions.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 bg-[#1A1A1A] text-white hover:bg-[#C5A059] text-xs uppercase tracking-widest transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* MOBILE DRAWER FILTERS */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-[#FDFCF8] h-full p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-black/5 pb-4">
                <h3 className="serif text-xl text-[#1A1A1A]">Filter Pieces</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-[#1A1A1A] hover:text-[#C5A059]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#C5A059] font-semibold mb-2">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`p-2 border text-left ${
                      selectedCategory === 'all'
                        ? 'bg-[#1A1A1A] text-[#C5A059] border-[#1A1A1A]'
                        : 'bg-white border-black/10'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.slug)}
                      className={`p-2 border text-left ${
                        selectedCategory === c.slug
                          ? 'bg-[#1A1A1A] text-[#C5A059] border-[#1A1A1A]'
                          : 'bg-white border-black/10'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-3 bg-[#1A1A1A] hover:bg-[#C5A059] text-white text-xs uppercase tracking-widest transition-colors"
            >
              View {filteredProducts.length} Pieces
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="text-center py-24 serif text-lg">Curating high jewellery collection...</div>}>
      <ShopContent />
    </Suspense>
  );
}
