'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Image as ImageIcon, Box } from 'lucide-react';
import { saveAdminProduct } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

export default function AdminProductNewPage() {
  const router = useRouter();
  const { success, error } = useToast();
  
  const [isSaving, setIsSaving] = useState(false);
  
  // Basic Info
  const [name, setName] = useState('');
  const [category, setCategory] = useState('cat-rings');
  const [collection, setCollection] = useState('Solitaire Masterpieces');
  const [priceUSD, setPriceUSD] = useState<number>(0);
  const [stock, setStock] = useState<number>(1);
  const [description, setDescription] = useState('');
  
  // Specs
  const [metalType, setMetalType] = useState('Yellow Gold');
  const [purity, setPurity] = useState('18K');
  const [stoneType, setStoneType] = useState('Natural Diamond');
  const [stoneCarats, setStoneCarats] = useState<number>(1.0);
  const [grossWeight, setGrossWeight] = useState<number>(5.0);
  
  // Certification
  const [certIssuer, setCertIssuer] = useState('GIA');
  const [certNumber, setCertNumber] = useState('');
  
  // Media
  const [imageUrl, setImageUrl] = useState('');
  const [model3dUrl, setModel3dUrl] = useState(''); // New 3D Model Support

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newProductPayload: any = {
        name,
        slug,
        sku: `AUR-JW-${Date.now().toString().slice(-4)}`,
        brand: 'Aurelic Jewels',
        category,
        collection,
        gender: 'Women',
        shortDescription: description || 'Handcrafted fine jewellery in solid gold and certified gemstones.',
        description: description || 'Exquisite masterpiece forged in our Paris Place Vendôme workshop.',
        priceUSD: Number(priceUSD),
        currency: 'USD',
        metalType,
        purity,
        goldKarat: `${purity} Solid Gold`,
        grossWeightGrams: Number(grossWeight),
        netGoldWeightGrams: Math.round((Number(grossWeight) * 0.9) * 10) / 10,
        hallmarkAssayOffice: 'Paris Assay Office Eagle Head Hallmark & Aurelic Jewels Workshop Stamp',
        stoneType,
        stoneWeightCarats: Number(stoneCarats),
        totalCaratWeight: Number(stoneCarats),
        certification: {
          issuer: certIssuer,
          certificateNumber: certNumber,
          shape: 'Round Brilliant',
          caratWeight: Number(stoneCarats),
          colorGrade: 'D',
          clarityGrade: 'VVS1',
          cutGrade: 'Ideal',
        },
        stock: Number(stock),
        lowStockThreshold: 2,
        isReadyToShip: true,
        isMadeToOrder: false,
        status: 'active',
        images: [
          {
            url: imageUrl || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85',
            alt: name,
            type: 'main',
            sortOrder: 1,
          }
        ],
        model3dUrl: model3dUrl || undefined,
      };

      const res = await saveAdminProduct(newProductPayload);
      if (res.success && res.data) {
        success('Piece Published', `${res.data.name} is now active in the catalogue.`);
        router.push('/admin/products');
      } else {
        error('Save Failed', res.error || 'Could not save the product.');
      }
    } catch (err: any) {
      error('System Error', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between gap-4 border-b border-[#ebdccd] pb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 border border-[#ebdccd] rounded-full text-[#73685a] hover:bg-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-3xl text-[#141210] font-light">Add New Piece</h1>
            <p className="text-xs text-[#73685a] mt-1">Enlist a new masterpiece into the Atelier catalogue.</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="px-6 py-3 bg-[#141210] hover:bg-[#9b7e46] text-[#faf8f5] text-xs uppercase tracking-wider font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Save className="w-4 h-4 text-[#d4af37]" />
          )}
          <span>Save Piece</span>
        </button>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Basic Info */}
        <section className="bg-white p-6 border border-[#ebdccd] shadow-sm space-y-6">
          <h2 className="text-xs uppercase tracking-widest font-semibold text-[#141210] border-b border-[#ebdccd]/50 pb-2">
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#73685a] font-medium">Piece Name *</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full text-xs p-3 border border-[#ebdccd] bg-[#faf8f5] focus:outline-none focus:border-[#9b7e46]" placeholder="e.g. The Vendôme Solitaire Ring" />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#73685a] font-medium">Retail Price (USD) *</label>
              <input type="number" required min="0" value={priceUSD} onChange={(e) => setPriceUSD(Number(e.target.value))} className="w-full text-xs p-3 border border-[#ebdccd] bg-[#faf8f5] focus:outline-none focus:border-[#9b7e46]" placeholder="8500" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#73685a] font-medium">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full text-xs p-3 border border-[#ebdccd] bg-[#faf8f5] focus:outline-none focus:border-[#9b7e46]">
                <option value="cat-rings">Rings</option>
                <option value="cat-necklaces">Necklaces & Pendants</option>
                <option value="cat-earrings">Earrings</option>
                <option value="cat-bracelets">Bracelets & Bangles</option>
                <option value="cat-high-jewellery">High Jewellery / Haute Joaillerie</option>
                <option value="cat-bridal">Bridal & Engagement</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#73685a] font-medium">Initial Stock</label>
              <input type="number" min="0" value={stock} onChange={(e) => setStock(Number(e.target.value))} className="w-full text-xs p-3 border border-[#ebdccd] bg-[#faf8f5] focus:outline-none focus:border-[#9b7e46]" />
            </div>
          </div>
        </section>

        {/* Media & 3D */}
        <section className="bg-white p-6 border border-[#ebdccd] shadow-sm space-y-6">
          <h2 className="text-xs uppercase tracking-widest font-semibold text-[#141210] border-b border-[#ebdccd]/50 pb-2">
            Media & 3D Visualization
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#73685a] font-medium flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" /> Primary Image URL
              </label>
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full text-xs p-3 border border-[#ebdccd] bg-[#faf8f5] focus:outline-none focus:border-[#9b7e46]" placeholder="https://..." />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#73685a] font-medium flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5" /> 3D Model URL (.glb / .gltf)
              </label>
              <input value={model3dUrl} onChange={(e) => setModel3dUrl(e.target.value)} className="w-full text-xs p-3 border border-[#ebdccd] bg-[#faf8f5] focus:outline-none focus:border-[#9b7e46]" placeholder="https://..." />
              <p className="text-[9px] text-[#9ca3af]">Leave blank if 3D model is not available for this piece.</p>
            </div>
          </div>
        </section>

        {/* Specifications */}
        <section className="bg-white p-6 border border-[#ebdccd] shadow-sm space-y-6">
          <h2 className="text-xs uppercase tracking-widest font-semibold text-[#141210] border-b border-[#ebdccd]/50 pb-2">
            Specifications & Materials
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#73685a] font-medium">Metal Type</label>
              <select value={metalType} onChange={(e) => setMetalType(e.target.value)} className="w-full text-xs p-3 border border-[#ebdccd] bg-[#faf8f5] focus:outline-none focus:border-[#9b7e46]">
                <option value="Yellow Gold">Yellow Gold</option>
                <option value="White Gold">White Gold</option>
                <option value="Rose Gold">Rose Gold</option>
                <option value="Platinum">Platinum (Pt 950)</option>
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#73685a] font-medium">Purity</label>
              <select value={purity} onChange={(e) => setPurity(e.target.value)} className="w-full text-xs p-3 border border-[#ebdccd] bg-[#faf8f5] focus:outline-none focus:border-[#9b7e46]">
                <option value="18K">18K (750)</option>
                <option value="22K">22K (916)</option>
                <option value="24K">24K (999)</option>
                <option value="950">950 (Platinum)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#73685a] font-medium">Gross Weight (grams)</label>
              <input type="number" step="0.1" value={grossWeight} onChange={(e) => setGrossWeight(Number(e.target.value))} className="w-full text-xs p-3 border border-[#ebdccd] bg-[#faf8f5] focus:outline-none focus:border-[#9b7e46]" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#73685a] font-medium">Gemstone</label>
              <select value={stoneType} onChange={(e) => setStoneType(e.target.value)} className="w-full text-xs p-3 border border-[#ebdccd] bg-[#faf8f5] focus:outline-none focus:border-[#9b7e46]">
                <option value="Natural Diamond">Natural Diamond</option>
                <option value="Lab-Grown Diamond">Lab-Grown Diamond</option>
                <option value="Sapphire">Ceylon Sapphire</option>
                <option value="Emerald">Colombian Emerald</option>
                <option value="Ruby">Burmese Ruby</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#73685a] font-medium">Total Carat Weight</label>
              <input type="number" step="0.01" value={stoneCarats} onChange={(e) => setStoneCarats(Number(e.target.value))} className="w-full text-xs p-3 border border-[#ebdccd] bg-[#faf8f5] focus:outline-none focus:border-[#9b7e46]" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#73685a] font-medium">Certification</label>
              <div className="flex gap-2">
                <select value={certIssuer} onChange={(e) => setCertIssuer(e.target.value)} className="w-24 text-xs p-3 border border-[#ebdccd] bg-[#faf8f5] focus:outline-none focus:border-[#9b7e46]">
                  <option value="GIA">GIA</option>
                  <option value="IGI">IGI</option>
                  <option value="HRD">HRD</option>
                  <option value="None">None</option>
                </select>
                <input value={certNumber} onChange={(e) => setCertNumber(e.target.value)} className="w-full text-xs p-3 border border-[#ebdccd] bg-[#faf8f5] focus:outline-none focus:border-[#9b7e46]" placeholder="Certificate No." />
              </div>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
