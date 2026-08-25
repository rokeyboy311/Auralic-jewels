'use client';

import React, { useState, useId, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  Wand2,
  Gem,
  Sliders,
  Check,
  Upload,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Ruler,
  Compass,
  Award,
  RefreshCw,
} from 'lucide-react';
import * as api from '@/lib/api';
import { Product } from '@/lib/types';
import { brandConfig } from '@/lib/brandConfig';
import { useToast } from '@/context/ToastContext';
import { useCurrency } from '@/context/CurrencyContext';
import ImageUploader from '@/components/ImageUploader';

export default function CustomJewelleryPage() {
  const [activeTab, setActiveTab] = useState<'modify' | 'new' | 'consultation'>('modify');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.getProducts();
        if (res.success && res.data) {
          setProducts(res.data);
          if (res.data.length > 0) setSelectedProductId(res.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load catalog', err);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // Modification Form State
  const [selectedMetal, setSelectedMetal] = useState('18K Solid Yellow Gold');
  const [selectedGemstone, setSelectedGemstone] = useState('Natural GIA Certified Diamond (D-F / VVS)');
  const [selectedSetting, setSelectedSetting] = useState('Classic 4-Claw Cathedral');
  const [customSize, setCustomSize] = useState('7.0 (US)');
  const [customEngraving, setCustomEngraving] = useState('');
  const [surfaceFinish, setSurfaceFinish] = useState('High Mirror Polish');
  const [modificationNotes, setModificationNotes] = useState('');

  // Brand New Design State
  const [scratchType, setScratchType] = useState('Solitaire Diamond Engagement Ring');
  const [scratchMetal, setScratchMetal] = useState('18K Solid Yellow Gold');
  const [scratchStone, setScratchStone] = useState('Natural Diamond (Oval Cut)');
  const [scratchCarats, setScratchCarats] = useState('2.50 Carats');
  const [scratchBudget, setScratchBudget] = useState('$7,500 – $15,000');
  const [scratchDescription, setScratchDescription] = useState('');
  const [scratchImages, setScratchImages] = useState<string[]>([]);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  // Consultation State
  const [atelierCity, setAtelierCity] = useState(brandConfig.boutiques[0].city);
  const [consultationFormat, setConsultationFormat] = useState('Virtual 1-on-1 Master Gemologist Video');
  const [consultationDate, setConsultationDate] = useState('');

  // Common Contact Info
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedRef, setSubmittedRef] = useState('');

  const { formatPrice } = useCurrency();
  const { success, error } = useToast();

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a real integration, submit to bespoke API route
      const payload = {
        category: activeTab,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        metalPreference: activeTab === 'modify' ? selectedMetal : scratchMetal,
        stonePreference: activeTab === 'modify' ? selectedGemstone : scratchStone,
        designDescription: activeTab === 'new' ? scratchDescription : modificationNotes,
        referenceImageUrl: scratchImages[0] || (selectedProduct?.images?.[0]?.url || ''),
      };
      
      const res = await api.submitBespokeInquiry(payload as any);
      
      if (res.success && res.data) {
        setSubmittedRef(res.data.referenceNumber);
        setIsSubmitted(true);
        if (activeTab === 'modify') {
          success(
            'Design Modification Request Entrusted',
            `Reference ${res.data.referenceNumber}: Our Master Goldsmiths will prepare your customized CAD rendering.`
          );
        } else if (activeTab === 'new') {
          success(
            'Bespoke Design Brief Registered',
            `Reference ${res.data.referenceNumber}: Master Gemologists are preparing initial gouache sketches.`
          );
        } else {
          success(
            'Atelier Consultation Confirmed',
            `Reference ${res.data.referenceNumber}: Senior Master Jeweller will contact you within 4 hours.`
          );
        }
      } else {
        error('Submission Failed', res.error || 'Please try again.');
      }
    } catch (err: any) {
      error('Error', err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-12 py-12 space-y-16">
      {/* Editorial Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.35em] text-[#9b7e46] uppercase font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Place Vendôme Haute Joaillerie Atelier</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#141210] uppercase font-light tracking-wide">
          Bespoke Jewellery & Design Modifications
        </h1>
        <p className="text-xs sm:text-sm text-[#73685a] leading-relaxed font-light">
          Whether customizing any piece from our catalog with your choice of metals, rare gemstones, and custom engravings, or commissioning an original one-of-a-kind creation from your own sketch, our Master Goldsmiths bring your singular vision to life.
        </p>
      </div>

      {/* 3 Interactive Mode Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <button
          onClick={() => setActiveTab('modify')}
          className={`p-6 text-left border transition-all ${
            activeTab === 'modify'
              ? 'bg-[#141210] text-[#faf8f5] border-[#141210] shadow-lg'
              : 'bg-white text-[#141210] border-[#c5b49e]/40 hover:border-[#9b7e46]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <Sliders className={`w-5 h-5 ${activeTab === 'modify' ? 'text-[#d4af37]' : 'text-[#9b7e46]'}`} />
            <span className="text-[10px] font-mono tracking-widest uppercase opacity-70">Option A</span>
          </div>
          <h3 className="font-serif text-lg font-medium">Modify An Existing Design</h3>
          <p className={`text-xs mt-1 leading-relaxed ${activeTab === 'modify' ? 'text-white/70' : 'text-[#73685a]'}`}>
            Choose any catalog piece and customize the metal alloy, stone type, prong setting, size, and engraving.
          </p>
        </button>

        <button
          onClick={() => setActiveTab('new')}
          className={`p-6 text-left border transition-all ${
            activeTab === 'new'
              ? 'bg-[#141210] text-[#faf8f5] border-[#141210] shadow-lg'
              : 'bg-white text-[#141210] border-[#c5b49e]/40 hover:border-[#9b7e46]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <Wand2 className={`w-5 h-5 ${activeTab === 'new' ? 'text-[#d4af37]' : 'text-[#9b7e46]'}`} />
            <span className="text-[10px] font-mono tracking-widest uppercase opacity-70">Option B</span>
          </div>
          <h3 className="font-serif text-lg font-medium">Craft From Scratch</h3>
          <p className={`text-xs mt-1 leading-relaxed ${activeTab === 'new' ? 'text-white/70' : 'text-[#73685a]'}`}>
            Upload your own sketch, photo, or dream concept. We engineer the 3D model, cast the metal, and source rare stones.
          </p>
        </button>

        <button
          onClick={() => setActiveTab('consultation')}
          className={`p-6 text-left border transition-all ${
            activeTab === 'consultation'
              ? 'bg-[#141210] text-[#faf8f5] border-[#141210] shadow-lg'
              : 'bg-white text-[#141210] border-[#c5b49e]/40 hover:border-[#9b7e46]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <Compass className={`w-5 h-5 ${activeTab === 'consultation' ? 'text-[#d4af37]' : 'text-[#9b7e46]'}`} />
            <span className="text-[10px] font-mono tracking-widest uppercase opacity-70">Option C</span>
          </div>
          <h3 className="font-serif text-lg font-medium">Master Jeweller Consultation</h3>
          <p className={`text-xs mt-1 leading-relaxed ${activeTab === 'consultation' ? 'text-white/70' : 'text-[#73685a]'}`}>
            Book a private video or in-atelier session with our Chief Gemologist in Paris, New York, London, or Dubai.
          </p>
        </button>
      </div>

      {/* Main Studio Interface */}
      <div className="bg-[#faf8f5] border border-[#c5b49e]/50 p-6 sm:p-10 shadow-xs">
        {isSubmitted ? (
          <div className="text-center py-12 space-y-6 max-w-xl mx-auto">
            <div className="w-20 h-20 bg-[#ede5d8] text-[#9b7e46] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="font-mono text-xs uppercase text-[#9b7e46] tracking-widest font-bold block">
                Bespoke Dossier Reference: {submittedRef}
              </span>
              <h2 className="font-serif text-3xl text-[#141210]">Your Custom Vision Has Been Entrusted</h2>
              <p className="text-xs sm:text-sm text-[#73685a] leading-relaxed pt-2">
                Thank you, <strong className="text-[#141210]">{customerName}</strong>. Our Master Goldsmiths and Chief Gemologist at Place Vendôme Atelier are reviewing your specifications. You will receive 3D gouache sketches and metallurgic quotation within 4–8 business hours.
              </p>
            </div>

            <div className="p-5 bg-[#f2ece2] border border-[#c5b49e]/40 text-left text-xs space-y-2">
              <div className="flex justify-between text-[#73685a]">
                <span>Commission Type:</span>
                <span className="font-medium text-[#141210]">
                  {activeTab === 'modify' ? 'Catalog Design Customization' : activeTab === 'new' ? 'New Creation from Scratch' : 'Master Consultation'}
                </span>
              </div>
              {activeTab === 'modify' && (
                <div className="flex justify-between text-[#73685a]">
                  <span>Selected Creation:</span>
                  <span className="font-medium text-[#141210]">{selectedProduct?.name}</span>
                </div>
              )}
              <div className="flex justify-between text-[#73685a]">
                <span>Target Metal:</span>
                <span className="font-medium text-[#141210]">{activeTab === 'modify' ? selectedMetal : scratchMetal}</span>
              </div>
              <div className="flex justify-between text-[#73685a]">
                <span>Contact Email:</span>
                <span className="font-medium text-[#141210]">{customerEmail}</span>
              </div>
              <div className="flex justify-between text-[#73685a]">
                <span>Telephone:</span>
                <span className="font-medium text-[#141210]">{customerPhone}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <button
                onClick={() => setIsSubmitted(false)}
                className="px-6 py-3 bg-[#141210] hover:bg-[#9b7e46] text-[#faf8f5] text-xs uppercase tracking-[0.2em] font-medium transition-colors"
              >
                Submit Another Request
              </button>
              <Link
                href="/shop"
                className="px-6 py-3 bg-white border border-[#c5b49e] hover:border-[#141210] text-[#141210] text-xs uppercase tracking-[0.2em] font-medium transition-colors inline-block"
              >
                Explore Current Collection
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* TAB 1: MODIFY EXISTING DESIGN */}
            {activeTab === 'modify' && (
              <div className="space-y-8">
                {/* Step 1: Select Piece to Modify */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#9b7e46] font-bold">
                        Step 01
                      </span>
                      <h3 className="font-serif text-2xl text-[#141210]">Select Base Piece from Catalog</h3>
                    </div>
                    <span className="text-xs text-[#73685a]">
                      Showing {products.length} Ready-to-Wear Creations
                    </span>
                  </div>

                  {/* Horizontal Scroll / Grid of Catalog Items */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {products.map((prod) => {
                      const isSelected = prod.id === selectedProductId;
                      return (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => setSelectedProductId(prod.id)}
                          className={`p-3 text-left border transition-all flex flex-col ${
                            isSelected
                              ? 'bg-white border-[#141210] ring-2 ring-[#141210] shadow-md'
                              : 'bg-[#f5efe6]/50 border-[#c5b49e]/40 hover:border-[#9b7e46]'
                          }`}
                        >
                          <div className="relative aspect-square w-full bg-white mb-2 overflow-hidden">
                            {prod.images[0] && (
                              <Image
                                src={prod.images[0].url}
                                alt={prod.name}
                                fill
                                className="object-cover"
                                referrerPolicy="no-referrer"
                              />
                            )}
                          </div>
                          <span className="text-[10px] text-[#9b7e46] uppercase font-mono tracking-wider">
                            {prod.category}
                          </span>
                          <span className="font-serif text-xs font-medium text-[#141210] line-clamp-1">
                            {prod.name}
                          </span>
                          <span className="text-[11px] font-mono text-[#73685a] mt-1">
                            Base: {formatPrice(prod.priceUSD)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Customization Parameters */}
                <div className="space-y-4 pt-6 border-t border-[#ebdccd]">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#9b7e46] font-bold">
                    Step 02
                  </span>
                  <h3 className="font-serif text-2xl text-[#141210]">Specify Your Custom Modifications</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Metal Option */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] font-medium mb-1">
                        Gold Alloy & Karat
                      </label>
                      <select
                        value={selectedMetal}
                        onChange={(e) => setSelectedMetal(e.target.value)}
                        className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2.5 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                      >
                        <option>18K Solid Yellow Gold</option>
                        <option>18K Solid White Gold</option>
                        <option>18K Solid Rose Gold</option>
                        <option>22K Heritage Solid Gold</option>
                        <option>950 Pure Platinum</option>
                        <option>Two-Tone 18K Yellow + Platinum Shank</option>
                      </select>
                    </div>

                    {/* Gemstone Option */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] font-medium mb-1">
                        Gemstone / Diamond Preference
                      </label>
                      <select
                        value={selectedGemstone}
                        onChange={(e) => setSelectedGemstone(e.target.value)}
                        className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2.5 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                      >
                        <option>Natural GIA Certified Diamond (D-F / VVS)</option>
                        <option>IGI Certified Lab-Grown Diamond (VVS1)</option>
                        <option>Colombian Muzo Emerald (Untreated)</option>
                        <option>Burmese Pigeon Blood Ruby</option>
                        <option>Royal Ceylon Blue Sapphire</option>
                        <option>Provide My Own Heirloom Gemstone</option>
                      </select>
                    </div>

                    {/* Setting & Prongs */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] font-medium mb-1">
                        Prong & Setting Architecture
                      </label>
                      <select
                        value={selectedSetting}
                        onChange={(e) => setSelectedSetting(e.target.value)}
                        className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2.5 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                      >
                        <option>Classic 4-Claw Cathedral</option>
                        <option>Iconic 6-Claw Auralic Crown</option>
                        <option>Protective Full Bezel Mount</option>
                        <option>Hidden Diamond Halo Undermount</option>
                        <option>Vintage Hand-Milgrain Pavé</option>
                        <option>Flush Floating Tension Mount</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Custom Sizing */}
                    <div>
                      <label htmlFor="custom-page-size-input" className="block text-[11px] uppercase tracking-wider text-[#4a4237] font-medium mb-1">
                        Custom Size / Dimensions
                      </label>
                      <input
                        id="custom-page-size-input"
                        name="customSize"
                        type="text"
                        value={customSize}
                        onChange={(e) => setCustomSize(e.target.value)}
                        placeholder="e.g. Ring Size 6.25, 17.5cm Wrist, 18-inch Chain"
                        className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2.5 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                      />
                    </div>

                    {/* Surface Finish */}
                    <div>
                      <label htmlFor="custom-page-finish-select" className="block text-[11px] uppercase tracking-wider text-[#4a4237] font-medium mb-1">
                        Metal Surface Finish
                      </label>
                      <select
                        id="custom-page-finish-select"
                        name="surfaceFinish"
                        value={surfaceFinish}
                        onChange={(e) => setSurfaceFinish(e.target.value)}
                        className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2.5 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                      >
                        <option>High Mirror Polish</option>
                        <option>Satin Matte Brushing</option>
                        <option>Artisanal Hand-Hammered</option>
                        <option>Sandblasted Velvet Texture</option>
                      </select>
                    </div>

                    {/* Laser Engraving */}
                    <div>
                      <label htmlFor="custom-page-engraving-input" className="block text-[11px] uppercase tracking-wider text-[#4a4237] font-medium mb-1">
                        Laser Engraving (Complimentary)
                      </label>
                      <input
                        id="custom-page-engraving-input"
                        name="customEngraving"
                        type="text"
                        maxLength={35}
                        value={customEngraving}
                        onChange={(e) => setCustomEngraving(e.target.value)}
                        placeholder="e.g. Forever Yours • 24.12.2025"
                        className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2.5 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                      />
                    </div>
                  </div>

                  {/* Engraving Live Visualizer */}
                  {customEngraving && (
                    <div className="p-4 bg-[#211E1B] text-[#faf8f5] border border-[#d4af37]/40 flex items-center justify-between">
                      <div className="text-xs space-y-0.5">
                        <span className="text-[10px] uppercase tracking-widest text-[#d4af37]">
                          Micro-Laser Engraving Preview
                        </span>
                        <div className="font-serif italic text-lg tracking-widest text-[#FDFCF8]">
                          &ldquo;{customEngraving}&rdquo;
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-mono text-[#d4af37] px-2 py-1 border border-[#d4af37]/40">
                        Inside Shank Inscribed
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] font-medium mb-1">
                      Detailed Modification Notes
                    </label>
                    <textarea
                      rows={3}
                      value={modificationNotes}
                      onChange={(e) => setModificationNotes(e.target.value)}
                      placeholder="Please note any specific adjustments such as band width (e.g. 2.2mm), center stone height, claw orientation, or matching band requests..."
                      className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2.5 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DESIGN FROM SCRATCH */}
            {activeTab === 'new' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#9b7e46] font-bold">
                    Custom Creation
                  </span>
                  <h3 className="font-serif text-2xl text-[#141210]">Commission an Original Masterpiece</h3>
                  <p className="text-xs text-[#73685a] mt-1">
                    Provide your inspiration, reference images, or rough sketches. Our Master Gemologists and CAD designers will forge an original piece from pure gold and hand-selected stones.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] font-medium mb-1">
                      Creation Archetype
                    </label>
                    <select
                      value={scratchType}
                      onChange={(e) => setScratchType(e.target.value)}
                      className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2.5 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                    >
                      <option>Solitaire Diamond Engagement Ring</option>
                      <option>Eternity Band / Wedding Creation</option>
                      <option>High Diamond Collar / Tennis Necklace</option>
                      <option>Tennis Bracelet / Rigid Gold Bangle</option>
                      <option>Pendant / Statement Talisman</option>
                      <option>Chandelier / Celestial Drop Earrings</option>
                      <option>Men’s Architectural Signet Ring</option>
                      <option>Full Royal Bridal Parure Suite</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] font-medium mb-1">
                      Gold Alloy
                    </label>
                    <select
                      value={scratchMetal}
                      onChange={(e) => setScratchMetal(e.target.value)}
                      className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2.5 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                    >
                      <option>18K Solid Yellow Gold</option>
                      <option>18K Solid White Gold</option>
                      <option>18K Solid Rose Gold</option>
                      <option>22K Solid Gold</option>
                      <option>950 Pure Platinum</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] font-medium mb-1">
                      Target Budget Range
                    </label>
                    <select
                      value={scratchBudget}
                      onChange={(e) => setScratchBudget(e.target.value)}
                      className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2.5 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                    >
                      <option>$3,000 – $7,500</option>
                      <option>$7,500 – $15,000</option>
                      <option>$15,000 – $35,000</option>
                      <option>$35,000 – $100,000+ (High Jewellery / Rare Stones)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] font-medium mb-1">
                      Desired Gemstone & Cut
                    </label>
                    <select
                      value={scratchStone}
                      onChange={(e) => setScratchStone(e.target.value)}
                      className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2.5 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                    >
                      <option>Natural Diamond (Round Brilliant)</option>
                      <option>Natural Diamond (Oval Cut)</option>
                      <option>Natural Diamond (Emerald Cut)</option>
                      <option>Natural Diamond (Radiant / Cushion)</option>
                      <option>Natural Diamond (Pear / Marquise)</option>
                      <option>Colombian Muzo Emerald</option>
                      <option>Burmese Pigeon Blood Ruby</option>
                      <option>Royal Ceylon Blue Sapphire</option>
                      <option>IGI Certified Lab Diamond</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="custom-scratch-carats-input" className="block text-[11px] uppercase tracking-wider text-[#4a4237] font-medium mb-1">
                      Target Carat Weight
                    </label>
                    <input
                      id="custom-scratch-carats-input"
                      name="scratchCarats"
                      type="text"
                      value={scratchCarats}
                      onChange={(e) => setScratchCarats(e.target.value)}
                      placeholder="e.g. 2.00 Carats or 5.00 Total Carat Weight"
                      className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2.5 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                    />
                  </div>
                </div>

                {/* Upload Sketch/Photo */}
                <ImageUploader
                  label="Upload Sketches, Inspiration Photos, or CAD Drawings (Optional)"
                  helperText="Attach your own sketches, reference photos, or heirloom jewellery concepts (JPG, PNG, WEBP, up to 15MB)"
                  multiple={true}
                  maxFiles={4}
                  value={scratchImages}
                  onMultipleChange={(imgs) => {
                    setScratchImages(imgs);
                    if (imgs.length > 0) setUploadedFile(`${imgs.length} image(s) attached`);
                    else setUploadedFile(null);
                  }}
                  onChange={(img) => {
                    if (img && !scratchImages.includes(img)) {
                      const updated = [...scratchImages, img];
                      setScratchImages(updated);
                      setUploadedFile(`${updated.length} image(s) attached`);
                    }
                  }}
                />

                <div>
                  <label htmlFor="custom-scratch-description-textarea" className="block text-[11px] uppercase tracking-wider text-[#4a4237] font-medium mb-1">
                    Describe Your Vision in Detail
                  </label>
                  <textarea
                    id="custom-scratch-description-textarea"
                    name="scratchDescription"
                    rows={4}
                    value={scratchDescription}
                    onChange={(e) => setScratchDescription(e.target.value)}
                    placeholder="Describe specific design nuances, meaningful symbols, bezel vs prong preference, band profiles, vintage art-deco influences, or special heirloom gemstones you wish to incorporate..."
                    className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2.5 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: CONSULTATION */}
            {activeTab === 'consultation' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#9b7e46] font-bold">
                    Private Client Services
                  </span>
                  <h3 className="font-serif text-2xl text-[#141210]">Master Jeweller Consultation</h3>
                  <p className="text-xs text-[#73685a] mt-1">
                    Connect directly with our senior gemological directors and master goldsmiths for a dedicated 1-on-1 session.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="custom-consultation-format-select" className="block text-[11px] uppercase tracking-wider text-[#4a4237] font-medium mb-1">
                      Consultation Format
                    </label>
                    <select
                      id="custom-consultation-format-select"
                      name="consultationFormat"
                      value={consultationFormat}
                      onChange={(e) => setConsultationFormat(e.target.value)}
                      className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2.5 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                    >
                      <option>Virtual 1-on-1 Master Gemologist Video Consultation</option>
                      <option>In-Atelier Appointment at Place Vendôme, Paris</option>
                      <option>In-Atelier Appointment at Madison Avenue, New York</option>
                      <option>In-Atelier Appointment at New Bond Street, London</option>
                      <option>In-Atelier Appointment at DIFC Atelier, Dubai</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="custom-consultation-date-input" className="block text-[11px] uppercase tracking-wider text-[#4a4237] font-medium mb-1">
                      Preferred Date
                    </label>
                    <input
                      id="custom-consultation-date-input"
                      name="consultationDate"
                      type="date"
                      value={consultationDate}
                      onChange={(e) => setConsultationDate(e.target.value)}
                      className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2.5 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Common Customer Contact Fields */}
            <div className="pt-6 border-t border-[#ebdccd] space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9b7e46] font-bold">
                  Step 03
                </span>
                <h4 className="font-serif text-xl text-[#141210]">Customer Contact Information</h4>
                <p className="text-xs text-[#73685a]">
                  We will send your bespoke dossier, high-resolution CAD renderings, and metallurgical quotation confidentially.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="custom-customer-name-input-full" className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                    Full Name *
                  </label>
                  <input
                    id="custom-customer-name-input-full"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Victoria Sterling"
                    className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2.5 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                  />
                </div>

                <div>
                  <label htmlFor="custom-customer-email-input-full" className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                    Email Address *
                  </label>
                  <input
                    id="custom-customer-email-input-full"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="customer@domain.com"
                    className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2.5 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                  />
                </div>

                <div>
                  <label htmlFor="custom-customer-phone-input-full" className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                    Telephone Number *
                  </label>
                  <input
                    id="custom-customer-phone-input-full"
                    name="tel"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+1 (212) 555-0100"
                    className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2.5 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-4 bg-[#141210] hover:bg-[#9b7e46] text-[#faf8f5] text-xs uppercase tracking-[0.2em] font-medium transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#d4af37]" />
                <span>
                  {activeTab === 'modify'
                    ? `Submit Customization Request for ${selectedProduct?.name}`
                    : activeTab === 'new'
                    ? 'Submit Bespoke Design Brief'
                    : 'Schedule Master Jeweller Consultation'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Trust & Craftsmanship Guarantees */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-[#ebdccd]">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#9b7e46] shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <span className="font-serif font-medium text-[#141210] block">GIA & IGI Certified</span>
            <p className="text-[#73685a]">All natural and lab-grown stones are laser-inscribed with gemological certificates.</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Award className="w-5 h-5 text-[#9b7e46] shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <span className="font-serif font-medium text-[#141210] block">Place Vendôme Hallmarking</span>
            <p className="text-[#73685a]">Every custom creation bears the French state eagle head or Minerva hallmark.</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <RefreshCw className="w-5 h-5 text-[#9b7e46] shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <span className="font-serif font-medium text-[#141210] block">Complimentary Resizing</span>
            <p className="text-[#73685a]">Lifetime complimentary annual prong checks, ultrasonic cleaning, and resizing.</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Compass className="w-5 h-5 text-[#9b7e46] shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <span className="font-serif font-medium text-[#141210] block">Armored Courier Handover</span>
            <p className="text-[#73685a]">Worldwide insured transit in our lacquered wooden presentation chest.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
