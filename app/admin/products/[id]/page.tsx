'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Upload,
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Box,
  LayoutGrid,
  Sparkles,
  FileText,
  Trash2
} from 'lucide-react';
import { getProduct, saveAdminProduct } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import ImageUploader from '@/components/ImageUploader';

export default function AdminProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const { success, error } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [productData, setProductData] = useState<any>(null);
  
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
  
  // Missing Exposed Fields
  const [sku, setSku] = useState('');
  const [gender, setGender] = useState('Women');
  const [stockThreshold, setStockThreshold] = useState<number>(2);

  // Certification
  const [certIssuer, setCertIssuer] = useState('GIA');
  const [certNumber, setCertNumber] = useState('');
  const [certShape, setCertShape] = useState('Round Brilliant');
  const [certColor, setCertColor] = useState('D');
  const [certClarity, setCertClarity] = useState('VVS1');
  const [certCut, setCertCut] = useState('Ideal');
  
  // Media
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [model3dUrl, setModel3dUrl] = useState(''); 

  useEffect(() => {
    async function loadProduct() {
      if (!params.id) return;
      try {
        const res = await getProduct(params.id as string);
        if (res.success && res.data) {
          const p = res.data;
          setProductData(p);
          const data: any = p;
          setName(data.name || '');
          setCategory(data.category || 'cat-rings');
          setCollection(data.collection || 'Solitaire Masterpieces');
          setPriceUSD(data.priceUSD || data.price_usd || 0);
          setStock(data.stock || 0);
          setDescription(data.description || '');
          setMetalType(data.metalType || data.metal_type || 'Yellow Gold');
          setPurity(data.purity || '18K');
          setStoneType(data.stoneType || data.stone_type || 'Natural Diamond');
          setStoneCarats(data.stoneWeightCarats || data.stone_weight_carats || 1.0);
          setGrossWeight(data.grossWeightGrams || data.gross_weight_grams || 5.0);
          setStockThreshold(data.lowStockThreshold || data.low_stock_threshold || 2);
          setSku(data.sku || '');
          setGender(data.gender || 'Women');
          
          if (data.certification) {
            setCertIssuer(data.certification.issuer || 'GIA');
            setCertNumber(data.certification.certificateNumber || data.certification.certificate_number || '');
            setCertShape(data.certification.shape || 'Round Brilliant');
            setCertColor(data.certification.colorGrade || 'D');
            setCertClarity(data.certification.clarityGrade || 'VVS1');
            setCertCut(data.certification.cutGrade || 'Ideal');
          }
          
          if (data.images && data.images.length > 0) {
            const urls = data.images.map((img: any) => img.url || (typeof img === 'string' ? img : ''));
            setImageUrls(urls.filter((u: string) => u));
          }

          if (data.model3dUrl || data.model_3d_url) {
            setModel3dUrl(data.model3dUrl || data.model_3d_url);
          }
        } else {
          error('Not Found', 'Could not load product details.');
          router.push('/admin/products');
        }
      } catch {
        error('Error', 'Failed to fetch product.');
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [params.id, router, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !productData) return;
    setIsSaving(true);
    
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const updatePayload = {
        ...productData,
        name,
        slug,
        category,
        collection,
        sku: sku || productData.sku,
        gender: gender,
        shortDescription: description || 'Handcrafted fine jewellery in solid gold and certified gemstones.',
        description: description,
        priceUSD: Number(priceUSD),
        stock: Number(stock),
        lowStockThreshold: Number(stockThreshold),
        metalType,
        purity,
        stoneType,
        stoneWeightCarats: Number(stoneCarats),
        grossWeightGrams: Number(grossWeight),
        certification: {
          issuer: certIssuer,
          certificateNumber: certNumber,
          shape: certShape,
          caratWeight: Number(stoneCarats),
          colorGrade: certColor,
          clarityGrade: certClarity,
          cutGrade: certCut,
        },
        images: imageUrls.length > 0 
          ? imageUrls.map((url, i) => ({ url, alt: name, type: i === 0 ? 'main' : 'gallery', sortOrder: i + 1 }))
          : productData.images,
        model3dUrl: model3dUrl || undefined,
      };

      const res = await saveAdminProduct(updatePayload);
      if (res.success) {
        success('Piece Updated', `${name} has been successfully updated.`);
        router.push('/admin/products');
      } else {
        error('Update Failed', res.error || 'Could not update the product.');
      }
    } catch (err: any) {
      error('System Error', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-10 flex justify-center">
        <div className="w-8 h-8 border-2 border-[#9b7e46] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between gap-4 border-b border-[#ebdccd] pb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 border border-[#ebdccd] rounded-full text-[#73685a] hover:bg-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-3xl text-[#141210] font-light">Edit Piece</h1>
            <p className="text-xs text-[#73685a] mt-1">{productData?.sku || ''}</p>
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
          <span>Update Piece</span>
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

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#73685a] font-medium">Low Stock Alert Threshold</label>
              <input type="number" min="0" value={stockThreshold} onChange={(e) => setStockThreshold(Number(e.target.value))} className="w-full text-xs p-3 border border-[#ebdccd] bg-[#faf8f5] focus:outline-none focus:border-[#9b7e46]" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#73685a] font-medium">Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full text-xs p-3 border border-[#ebdccd] bg-[#faf8f5] focus:outline-none focus:border-[#9b7e46]">
                <option value="Women">Women</option>
                <option value="Men">Men</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#73685a] font-medium">Product SKU (Optional)</label>
              <input value={sku} onChange={(e) => setSku(e.target.value)} className="w-full text-xs p-3 border border-[#ebdccd] bg-[#faf8f5] focus:outline-none focus:border-[#9b7e46]" placeholder="Leave blank to auto-generate" />
            </div>
          </div>
        </section>

        {/* Media & 3D */}
        <section className="bg-white p-6 border border-[#ebdccd] shadow-sm space-y-6">
          <h2 className="text-xs uppercase tracking-widest font-semibold text-[#141210] border-b border-[#ebdccd]/50 pb-2">
            Media & 3D Visualization
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 md:col-span-2">
              <ImageUploader 
                value={imageUrls} 
                onMultipleChange={setImageUrls} 
                multiple={true} 
                maxFiles={5} 
                label="Product Photographs (Up to 5)"
              />
            </div>
            
            <div className="space-y-1.5 md:col-span-2">
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
              <label className="text-[11px] uppercase tracking-wider text-[#73685a] font-medium">Certification details</label>
              <div className="flex gap-2">
                <select value={certIssuer} onChange={(e) => setCertIssuer(e.target.value)} className="w-24 text-xs p-3 border border-[#ebdccd] bg-[#faf8f5] focus:outline-none focus:border-[#9b7e46]">
                  <option value="GIA">GIA</option>
                  <option value="IGI">IGI</option>
                  <option value="HRD">HRD</option>
                  <option value="None">None</option>
                </select>
                <input value={certNumber} onChange={(e) => setCertNumber(e.target.value)} className="w-full text-xs p-3 border border-[#ebdccd] bg-[#faf8f5] focus:outline-none focus:border-[#9b7e46]" placeholder="Certificate No." />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                <input value={certShape} onChange={(e) => setCertShape(e.target.value)} className="w-full text-xs p-3 border border-[#ebdccd] bg-[#faf8f5] focus:outline-none focus:border-[#9b7e46]" placeholder="Shape" />
                <input value={certColor} onChange={(e) => setCertColor(e.target.value)} className="w-full text-xs p-3 border border-[#ebdccd] bg-[#faf8f5] focus:outline-none focus:border-[#9b7e46]" placeholder="Color" />
                <input value={certClarity} onChange={(e) => setCertClarity(e.target.value)} className="w-full text-xs p-3 border border-[#ebdccd] bg-[#faf8f5] focus:outline-none focus:border-[#9b7e46]" placeholder="Clarity" />
                <input value={certCut} onChange={(e) => setCertCut(e.target.value)} className="w-full text-xs p-3 border border-[#ebdccd] bg-[#faf8f5] focus:outline-none focus:border-[#9b7e46]" placeholder="Cut" />
              </div>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
