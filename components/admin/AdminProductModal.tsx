'use client';

import React, { useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import { Product, ProductCategory, MetalType, GoldPurity, StoneType } from '@/lib/types';

interface AdminProductModalProps {
  onClose: () => void;
  onSaveProduct: (productPayload: Partial<Product>) => Promise<void>;
}

export default function AdminProductModal({ onClose, onSaveProduct }: AdminProductModalProps) {
  const [prodName, setProdName] = useState('');
  const [prodPriceUSD, setProdPriceUSD] = useState<number>(8500);
  const [prodCategory, setProdCategory] = useState<ProductCategory>('Rings');
  const [prodMetal, setProdMetal] = useState<MetalType>('Yellow Gold');
  const [prodPurity, setProdPurity] = useState<GoldPurity>('18K');
  const [prodStone, setProdStone] = useState<StoneType>('Natural Diamond');
  const [prodStoneCarats, setProdStoneCarats] = useState<number>(2.5);
  const [prodCertIssuer, setProdCertIssuer] = useState<'GIA' | 'IGI' | 'HRD' | 'SGL' | 'Maison Hallmark Certificate'>('GIA');
  const [prodCertNumber, setProdCertNumber] = useState('GIA-2184910482');
  const [prodStock, setProdStock] = useState<number>(5);
  const [prodGrossWeight, setProdGrossWeight] = useState<number>(4.8);
  const [prodImage, setProdImage] = useState('');
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [prodDesc, setProdDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const slug = prodName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newProductPayload: Partial<Product> = {
      id: `prod-${Date.now()}`,
      name: prodName,
      slug,
      sku: `AUR-JW-${Date.now().toString().slice(-4)}`,
      brand: 'Maison Auralic',
      category: prodCategory,
      collection: 'Solitaire Masterpieces',
      gender: 'Women',
      shortDescription: prodDesc || 'Handcrafted fine jewellery in solid gold and certified gemstones.',
      description: prodDesc || 'Exquisite masterpiece forged in our Paris Place Vendôme atelier with high-clarity gemstones.',
      priceUSD: Number(prodPriceUSD),
      currency: 'USD',
      metalType: prodMetal,
      purity: prodPurity,
      goldKarat: `${prodPurity} Solid Gold`,
      grossWeightGrams: Number(prodGrossWeight),
      netGoldWeightGrams: Math.round((Number(prodGrossWeight) * 0.9) * 10) / 10,
      hallmarkAssayOffice: 'Paris Assay Office Eagle Head Hallmark & Maison Atelier Stamp',
      stoneType: prodStone,
      stoneWeightCarats: Number(prodStoneCarats),
      totalCaratWeight: Number(prodStoneCarats),
      certification: {
        issuer: prodCertIssuer,
        certificateNumber: prodCertNumber,
        shape: 'Round Brilliant',
        caratWeight: Number(prodStoneCarats),
        colorGrade: 'D',
        clarityGrade: 'VVS1',
        cutGrade: 'Ideal',
      },
      stock: Number(prodStock),
      lowStockThreshold: 2,
      isReadyToShip: true,
      isMadeToOrder: false,
      productionLeadTimeDays: 2,
      estimatedDispatchHours: 24,
      countryOfOrigin: 'France (Paris Place Vendôme Atelier)',
      status: 'active',
      images: (
        prodImages.length > 0
          ? prodImages
          : [prodImage || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85']
      ).map((imgUrl, idx) => ({
        id: `img-${Date.now()}-${idx}`,
        url: imgUrl,
        alt: prodName,
        type: idx === 0 ? 'main' : 'gallery',
        sortOrder: idx + 1,
      })),
      careInstructions: 'Clean gently with lukewarm soapy water and soft-bristled brush.',
      shippingInformation: 'Complimentary insured worldwide armored courier (Ferrari Group / FedEx Priority).',
      returnEligibility: '30-Day Insured Return with security tags intact.',
      exchangeEligibility: 'Lifetime gold and diamond trade-up privilege.',
    };

    await onSaveProduct(newProductPayload);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white max-w-lg w-full p-6 sm:p-8 border border-[#c5b49e] space-y-4 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
      >
        <h3 className="font-serif text-2xl text-[#141210]">Register New High Jewellery Piece</h3>

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
            Piece Title *
          </label>
          <input
            type="text"
            required
            value={prodName}
            onChange={(e) => setProdName(e.target.value)}
            placeholder="e.g. Royal Marquise Diamond Pendant"
            className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
              Price (USD) *
            </label>
            <input
              type="number"
              required
              value={prodPriceUSD}
              onChange={(e) => setProdPriceUSD(Number(e.target.value))}
              className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210]"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
              Stock Units *
            </label>
            <input
              type="number"
              value={prodStock}
              onChange={(e) => setProdStock(Number(e.target.value))}
              className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
              Category
            </label>
            <select
              value={prodCategory}
              onChange={(e) => setProdCategory(e.target.value as ProductCategory)}
              className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210]"
            >
              <option value="Rings">Rings</option>
              <option value="Necklaces">Necklaces</option>
              <option value="Earrings">Earrings</option>
              <option value="Bracelets">Bracelets</option>
              <option value="Bangles">Bangles</option>
              <option value="Men's Jewellery">Men&apos;s Jewellery</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
              Purity & Metal
            </label>
            <select
              value={prodPurity}
              onChange={(e) => {
                const purity = e.target.value as GoldPurity;
                setProdPurity(purity);
                if (purity === '950 Platinum') setProdMetal('Platinum');
                else if (purity === '925 Sterling Silver') setProdMetal('Sterling Silver');
                else setProdMetal('Yellow Gold');
              }}
              className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210]"
            >
              <option value="18K">18K Solid Gold</option>
              <option value="22K">22K Solid Gold</option>
              <option value="950 Platinum">950 Platinum</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
              Gemstone & Carats
            </label>
            <input
              type="text"
              value={prodStone}
              onChange={(e) => setProdStone(e.target.value as StoneType)}
              placeholder="Natural Diamond, Emerald..."
              className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210]"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
              GIA / IGI Cert Number
            </label>
            <input
              type="text"
              value={prodCertNumber}
              onChange={(e) => setProdCertNumber(e.target.value)}
              placeholder="GIA-2184910482"
              className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210]"
            />
          </div>
        </div>

        <ImageUploader
          label="Haute Joaillerie Photographs"
          helperText="Upload primary cover and gallery photos directly from your device (JPG, PNG, WEBP up to 15MB)"
          multiple={true}
          maxFiles={6}
          value={prodImages.length > 0 ? prodImages : (prodImage ? [prodImage] : [])}
          onMultipleChange={(imgs) => {
            setProdImages(imgs);
            if (imgs.length > 0) setProdImage(imgs[0]);
            else setProdImage('');
          }}
          onChange={(img) => {
            setProdImage(img);
            if (img && !prodImages.includes(img)) {
              setProdImages([img, ...prodImages]);
            }
          }}
        />

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
            Atelier Description
          </label>
          <textarea
            rows={2}
            value={prodDesc}
            onChange={(e) => setProdDesc(e.target.value)}
            placeholder="Masterpiece details and craftsmanship specifications..."
            className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210]"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 bg-[#141210] hover:bg-[#9b7e46] text-[#faf8f5] text-xs uppercase tracking-widest font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Publishing...' : 'Publish to International Catalogue'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 border border-[#c5b49e]/60 text-xs uppercase tracking-widest cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
