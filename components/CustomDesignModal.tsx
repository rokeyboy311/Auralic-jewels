'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import {
  X,
  Sparkles,
  Wand2,
  Gem,
  Palette,
  Check,
  Upload,
  Calendar,
  Layers,
  FileText,
  Sliders,
} from 'lucide-react';
import { brandConfig } from '@/lib/brandConfig';
import { useToast } from '@/context/ToastContext';
import * as api from '@/lib/api';
import { Product } from '@/lib/types';
import ImageUploader from '@/components/ImageUploader';

interface CustomDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: Product | null;
  initialTab?: 'modify' | 'new' | 'consultation';
}

export default function CustomDesignModal({
  isOpen,
  onClose,
  initialProduct,
  initialTab = 'modify',
}: CustomDesignModalProps) {
  const [activeTab, setActiveTab] = useState<'modify' | 'new' | 'consultation'>(initialTab);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(initialProduct || null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.getProducts();
        if (res.success && res.data) {
          setProducts(res.data);
          if (!selectedProduct && res.data.length > 0) {
            setSelectedProduct(res.data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load products', err);
      }
    };
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  // Modification Form State
  const [metalChoice, setMetalChoice] = useState('18K Yellow Gold');
  const [gemstoneChoice, setGemstoneChoice] = useState('Natural GIA Certified Diamond');
  const [settingStyle, setSettingStyle] = useState('Classic 4-Claw Cathedral');
  const [customSize, setCustomSize] = useState('7.0 (US)');
  const [engravingText, setEngravingText] = useState('');
  const [modificationNotes, setModificationNotes] = useState('');

  // New Design from Scratch State
  const [jewelryType, setJewelryType] = useState('Solitaire Engagement Ring');
  const [scratchMetal, setScratchMetal] = useState('18K Yellow Gold');
  const [scratchStone, setScratchStone] = useState('Natural Diamond (Round Brilliant)');
  const [scratchCarats, setScratchCarats] = useState('2.50 Carats');
  const [budgetRange, setBudgetRange] = useState('$5,000 – $15,000');
  const [scratchDescription, setScratchDescription] = useState('');
  const [scratchImages, setScratchImages] = useState<string[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Consultation State
  const [city, setCity] = useState(brandConfig.boutiques[0].city);
  const [consultationType, setConsultationType] = useState('Virtual 1-on-1 Master Gemologist Consultation');
  const [preferredDate, setPreferredDate] = useState('');

  // Patron Contact Info
  const [patronName, setPatronName] = useState('');
  const [patronEmail, setPatronEmail] = useState('');
  const [patronPhone, setPatronPhone] = useState('');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const { success, error } = useToast();

  const [prevInitialProduct, setPrevInitialProduct] = useState(initialProduct);
  if (initialProduct !== prevInitialProduct) {
    setPrevInitialProduct(initialProduct);
    if (initialProduct) {
      setSelectedProduct(initialProduct);
      setActiveTab('modify');
    }
  }

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        category: activeTab,
        customerName: patronName,
        customerEmail: patronEmail,
        customerPhone: patronPhone,
        metalPreference: activeTab === 'modify' ? metalChoice : scratchMetal,
        stonePreference: activeTab === 'modify' ? gemstoneChoice : scratchStone,
        designDescription: activeTab === 'new' ? scratchDescription : modificationNotes,
        referenceImageUrl: scratchImages[0] || (selectedProduct?.images?.[0]?.url || ''),
      };
      
      const res = await api.submitBespokeInquiry(payload as any);
      
      if (res.success && res.data) {
        setReferenceId(res.data.referenceNumber);
        setIsSubmitted(true);
        if (activeTab === 'modify') {
          success(
            'Design Modification Dossier Registered',
            `Reference ${res.data.referenceNumber}: Our Master Jewellers have received your customization request.`
          );
        } else if (activeTab === 'new') {
          success(
            'Bespoke Design Inquiry Entrusted',
            `Reference ${res.data.referenceNumber}: Our Senior Gemologists and CAD designers will review your sketch.`
          );
        } else {
          success(
            'Atelier Consultation Scheduled',
            `Reference ${res.data.referenceNumber}: A Senior Master Jeweller will contact you within 4 hours.`
          );
        }
      } else {
        error('Submission Failed', res.error || 'Please try again.');
      }
    } catch (err: any) {
      error('Error', err.message);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md p-3 sm:p-6 flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="w-full max-w-2xl bg-[#faf8f5] shadow-2xl border border-[#c5b49e]/60 p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#73685a] hover:text-[#141210] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.35em] text-[#9b7e46] uppercase font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Maison Aurelia Bespoke Atelier</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#141210] mt-1 font-light uppercase">
              Custom Jewellery & Design Modifications
            </h2>
            <p className="text-xs text-[#73685a] mt-1 leading-relaxed max-w-md mx-auto">
              Select an existing Maison creation to customize, submit your own sketch from scratch, or consult with our Master Goldsmiths.
            </p>

            {/* Mode Tabs */}
            <div className="grid grid-cols-3 gap-2 mt-5 bg-[#ede5d8]/60 p-1.5 border border-[#c5b49e]/40">
              <button
                type="button"
                onClick={() => setActiveTab('modify')}
                className={`py-2 px-1 text-[11px] uppercase tracking-wider font-medium transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'modify'
                    ? 'bg-[#141210] text-[#d4af37] shadow-sm'
                    : 'text-[#4a4237] hover:text-[#141210]'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="truncate">Modify Existing</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('new')}
                className={`py-2 px-1 text-[11px] uppercase tracking-wider font-medium transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'new'
                    ? 'bg-[#141210] text-[#d4af37] shadow-sm'
                    : 'text-[#4a4237] hover:text-[#141210]'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span className="truncate">Design From Scratch</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('consultation')}
                className={`py-2 px-1 text-[11px] uppercase tracking-wider font-medium transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'consultation'
                    ? 'bg-[#141210] text-[#d4af37] shadow-sm'
                    : 'text-[#4a4237] hover:text-[#141210]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span className="truncate">Master Consultation</span>
              </button>
            </div>
          </div>

          {isSubmitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-[#ede5d8] text-[#9b7e46] rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Check className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="font-mono text-xs uppercase text-[#9b7e46] tracking-widest block font-bold">
                  Dossier Ref: {referenceId}
                </span>
                <h3 className="font-serif text-2xl text-[#141210]">Your Custom Vision Has Been Entrusted</h3>
                <p className="text-xs text-[#73685a] max-w-md mx-auto leading-relaxed pt-2">
                  Our Chief Gemologist and Master Goldsmith at Place Vendôme Atelier are preparing your technical specifications, 3D CAD visualization, and custom metallurgical quotation.
                </p>
              </div>

              <div className="p-4 bg-[#f2ece2] border border-[#c5b49e]/40 max-w-sm mx-auto text-left text-xs space-y-1.5">
                <div className="flex justify-between text-[#73685a]">
                  <span>Request Type:</span>
                  <span className="font-medium text-[#141210]">
                    {activeTab === 'modify' ? 'Design Modification' : activeTab === 'new' ? 'New Bespoke Creation' : 'Master Consultation'}
                  </span>
                </div>
                {activeTab === 'modify' && selectedProduct && (
                  <div className="flex justify-between text-[#73685a]">
                    <span>Base Piece:</span>
                    <span className="font-medium text-[#141210] truncate max-w-[180px]">{selectedProduct?.name}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#73685a]">
                  <span>Patron:</span>
                  <span className="font-medium text-[#141210]">{patronName || 'Privileged Client'}</span>
                </div>
                <div className="flex justify-between text-[#73685a]">
                  <span>Estimated Response:</span>
                  <span className="font-medium text-emerald-800">Within 4–8 Hours</span>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="mt-4 px-8 py-3 bg-[#141210] hover:bg-[#9b7e46] text-[#faf8f5] text-xs uppercase tracking-[0.2em] font-medium transition-colors"
              >
                Return to Maison
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* TAB 1: MODIFY EXISTING DESIGN FROM CATALOG */}
              {activeTab === 'modify' && (
                <div className="space-y-4">
                  {/* Select Base Product from Catalog */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] font-medium mb-1">
                      1. Select Base Creation to Modify
                    </label>
                    <select
                      value={selectedProduct?.id || ''}
                      onChange={(e) => {
                        const found = products.find((p) => p.id === e.target.value);
                        if (found) setSelectedProduct(found);
                      }}
                      className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.category}) — Base: ${p.priceUSD.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Base Product Preview Chip */}
                  {selectedProduct && (
                    <div className="p-3 bg-[#f2ece2] border border-[#c5b49e]/40 flex items-center gap-3">
                      <div className="relative w-12 h-12 bg-white shrink-0 overflow-hidden border border-[#c5b49e]/30">
                        {selectedProduct?.images[0] && (
                          <Image
                            src={selectedProduct?.images[0].url}
                            alt={selectedProduct?.name}
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>
                      <div className="text-xs space-y-0.5 flex-1 min-w-0">
                        <div className="font-serif font-medium text-[#141210] truncate">
                          {selectedProduct?.name}
                        </div>
                        <div className="text-[11px] text-[#73685a] truncate">
                          Original: {selectedProduct.purity} {selectedProduct.metalType} • {selectedProduct.stoneType}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Modification Controls Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1 font-medium">
                        Change Metal & Purity
                      </label>
                      <select
                        value={metalChoice}
                        onChange={(e) => setMetalChoice(e.target.value)}
                        className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                      >
                        <option>18K Solid Yellow Gold</option>
                        <option>18K Pure White Gold</option>
                        <option>18K Warm Rose Gold</option>
                        <option>22K Heritage Solid Gold</option>
                        <option>950 Pure Platinum</option>
                        <option>Two-Tone 18K Yellow + Platinum</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1 font-medium">
                        Change Gemstone / Diamond
                      </label>
                      <select
                        value={gemstoneChoice}
                        onChange={(e) => setGemstoneChoice(e.target.value)}
                        className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                      >
                        <option>Natural GIA Certified Diamond (D-F / VVS)</option>
                        <option>IGI Certified Lab-Grown Diamond (VVS1)</option>
                        <option>Colombian Muzo Emerald (Untreated)</option>
                        <option>Burmese Pigeon Blood Ruby</option>
                        <option>Royal Ceylon Blue Sapphire</option>
                        <option>Provide My Own Gemstone / Family Heirloom</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1 font-medium">
                        Prong & Setting Style
                      </label>
                      <select
                        value={settingStyle}
                        onChange={(e) => setSettingStyle(e.target.value)}
                        className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                      >
                        <option>Classic 4-Claw Cathedral</option>
                        <option>Iconic 6-Claw Aurelia Crown</option>
                        <option>Modern Full Bezel Protective Mount</option>
                        <option>Hidden Diamond Halo Undermount</option>
                        <option>Vintage Hand-Milgrain Pavé</option>
                        <option>Flush Tension Floating Mount</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1 font-medium">
                        Custom Size / Dimensions
                      </label>
                      <input
                        type="text"
                        value={customSize}
                        onChange={(e) => setCustomSize(e.target.value)}
                        placeholder="e.g. Ring Size 6.25 or 17cm Wrist"
                        className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1 font-medium">
                      Custom Laser Engraving (Complimentary)
                    </label>
                    <input
                      type="text"
                      maxLength={30}
                      value={engravingText}
                      onChange={(e) => setEngravingText(e.target.value)}
                      placeholder="e.g. Monogram, Date, Roman Numerals (e.g. C & H • XII.V.MMXXIV)"
                      className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1 font-medium">
                      Specific Modification Requests & Instructions
                    </label>
                    <textarea
                      rows={2}
                      value={modificationNotes}
                      onChange={(e) => setModificationNotes(e.target.value)}
                      placeholder="Describe any adjustments to shank thickness, stone height, surface finish (matte/hammered), or custom accents..."
                      className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: BRAND NEW DESIGN FROM SCRATCH */}
              {activeTab === 'new' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1 font-medium">
                        Jewellery Archetype
                      </label>
                      <select
                        value={jewelryType}
                        onChange={(e) => setJewelryType(e.target.value)}
                        className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                      >
                        <option>Solitaire Engagement Ring</option>
                        <option>Diamond Eternity Band / Wedding Ring</option>
                        <option>High Jewellery Necklace / Choker</option>
                        <option>Diamond Tennis Bracelet / Bangle</option>
                        <option>Pendant / Statement Talisman</option>
                        <option>Drop Earrings / Chandelier</option>
                        <option>Men’s Architectural Signet Ring</option>
                        <option>Full Bridal Parure Suite</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1 font-medium">
                        Target Metal
                      </label>
                      <select
                        value={scratchMetal}
                        onChange={(e) => setScratchMetal(e.target.value)}
                        className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                      >
                        <option>18K Solid Yellow Gold</option>
                        <option>18K Solid White Gold</option>
                        <option>18K Solid Rose Gold</option>
                        <option>22K Solid Gold</option>
                        <option>950 Pure Platinum</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1 font-medium">
                        Center Gemstone & Cut
                      </label>
                      <select
                        value={scratchStone}
                        onChange={(e) => setScratchStone(e.target.value)}
                        className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                      >
                        <option>Natural Diamond (Round Brilliant)</option>
                        <option>Natural Diamond (Oval / Emerald Cut)</option>
                        <option>Natural Diamond (Radiant / Cushion)</option>
                        <option>Natural Diamond (Pear / Marquise)</option>
                        <option>Colombian Muzo Emerald</option>
                        <option>Burmese Ruby</option>
                        <option>Royal Ceylon Blue Sapphire</option>
                        <option>Lab-Grown GIA/IGI Diamond</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1 font-medium">
                        Target Carat Weight & Budget
                      </label>
                      <select
                        value={budgetRange}
                        onChange={(e) => setBudgetRange(e.target.value)}
                        className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                      >
                        <option>$3,000 – $7,500 (1.00 – 1.50 ct)</option>
                        <option>$7,500 – $15,000 (1.50 – 2.50 ct)</option>
                        <option>$15,000 – $35,000 (2.50 – 4.00 ct)</option>
                        <option>$35,000 – $100,000+ (Masterpiece Stones)</option>
                      </select>
                    </div>
                  </div>

                  {/* Upload Design Sketch / Reference Photo */}
                  <ImageUploader
                    label="Upload Sketch, Photo Reference, or CAD Drawing (Optional)"
                    helperText="Upload sketches or reference photos directly from your device (JPG, PNG, WEBP, up to 15MB)"
                    multiple={true}
                    maxFiles={3}
                    value={scratchImages}
                    onMultipleChange={(imgs) => {
                      setScratchImages(imgs);
                      if (imgs.length > 0) setUploadedFileName(`${imgs.length} image(s) attached`);
                      else setUploadedFileName('');
                    }}
                    onChange={(img) => {
                      if (img && !scratchImages.includes(img)) {
                        const updated = [...scratchImages, img];
                        setScratchImages(updated);
                        setUploadedFileName(`${updated.length} image(s) attached`);
                      }
                    }}
                  />

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1 font-medium">
                      Describe Your Dream Piece & Vision
                    </label>
                    <textarea
                      rows={3}
                      value={scratchDescription}
                      onChange={(e) => setScratchDescription(e.target.value)}
                      placeholder="Detail your inspiration, setting preferences, band contours, meaningful symbols, or specific historical aesthetics..."
                      className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: MASTER JEWELLER CONSULTATION */}
              {activeTab === 'consultation' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1 font-medium">
                      Consultation Format
                    </label>
                    <select
                      value={consultationType}
                      onChange={(e) => setConsultationType(e.target.value)}
                      className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                    >
                      <option>Virtual 1-on-1 Master Gemologist Video Consultation</option>
                      <option>In-Atelier Appointment at Place Vendôme, Paris</option>
                      <option>In-Atelier Appointment at Madison Avenue, New York</option>
                      <option>In-Atelier Appointment at New Bond Street, London</option>
                      <option>In-Atelier Appointment at DIFC Atelier, Dubai</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1 font-medium">
                      Preferred Date / Timeline
                    </label>
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                    />
                  </div>
                </div>
              )}

              {/* Contact Information (Common to All Tabs) */}
              <div className="pt-2 border-t border-[#ebdccd] space-y-3">
                <span className="text-[11px] uppercase tracking-wider text-[#4a4237] font-medium block">
                  Patron Contact Information
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      required
                      value={patronName}
                      onChange={(e) => setPatronName(e.target.value)}
                      placeholder="Full Name *"
                      className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      required
                      value={patronEmail}
                      onChange={(e) => setPatronEmail(e.target.value)}
                      placeholder="Email Address *"
                      className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      required
                      value={patronPhone}
                      onChange={(e) => setPatronPhone(e.target.value)}
                      placeholder="Telephone *"
                      className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                    />
                  </div>
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
                    ? 'Submit Customization Request'
                    : activeTab === 'new'
                    ? 'Submit Bespoke Design Brief'
                    : 'Schedule Master Consultation'}
                </span>
              </button>

              <p className="text-[10px] text-[#73685a] text-center">
                All custom creations are handcrafted at our Place Vendôme atelier with GIA conflict-free certification.
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
