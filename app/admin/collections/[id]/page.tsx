'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ImageUploader from '@/components/ImageUploader';

export default function CollectionEditPage() {
  const router = useRouter();
  const params = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    subtitle: '',
    description: '',
    banner_image: '',
    isFeatured: false
  });

  useEffect(() => {
    async function loadCollection() {
      try {
        const res = await fetch('/api/collections');
        const data = await res.json();
        if (data.success) {
          const col = data.data.find((c: any) => c.id === params.id);
          if (col) {
            setFormData({
              id: col.id,
              name: col.name || '',
              subtitle: col.subtitle || '',
              description: col.description || '',
              banner_image: col.bannerImage || '',
              isFeatured: col.isFeatured || false
            });
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    if (params.id) loadCollection();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        router.push('/admin/collections');
      } else {
        alert(data.error || 'Failed to save collection');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="w-6 h-6 border-2 border-[#C9A45C] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-4xl mx-auto h-[calc(100vh-80px)] overflow-y-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/collections" className="p-2 border border-[#E8E0D5] rounded-md text-[#6F665B] hover:text-[#111111] hover:bg-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-[#111111]">Edit Collection</h1>
            <p className="text-sm text-[#6F665B] mt-1">Update curated collection details.</p>
          </div>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={isSaving || !formData.name}
          className="flex items-center gap-2 px-6 py-2 bg-[#111111] text-white text-sm font-medium rounded-md hover:bg-[#222222] transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Collection'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-[#E8E0D5] rounded-xl p-6 shadow-sm space-y-6">
          <h2 className="text-base font-semibold text-[#111111] border-b border-[#E8E0D5] pb-4">Collection Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-1">Collection Name *</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 bg-[#F9FAFB] border border-[#E8E0D5] rounded-md text-sm focus:outline-none focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-1">Subtitle</label>
              <input 
                type="text" 
                value={formData.subtitle}
                onChange={e => setFormData({...formData, subtitle: e.target.value})}
                className="w-full px-4 py-2 bg-[#F9FAFB] border border-[#E8E0D5] rounded-md text-sm focus:outline-none focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]"
              />
            </div>
          </div>
            
          <div>
            <label className="block text-sm font-medium text-[#111111] mb-1">Description</label>
            <textarea 
              rows={4}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 bg-[#F9FAFB] border border-[#E8E0D5] rounded-md text-sm focus:outline-none focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]"
            />
          </div>

          <div>
            <ImageUploader
              label="Banner Image"
              value={formData.banner_image}
              onChange={(url) => setFormData({...formData, banner_image: url})}
              helperText="Upload a high-quality collection banner (JPEG, PNG, WEBP)"
              folder="aurelic_collections"
            />
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="checkbox"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={e => setFormData({...formData, isFeatured: e.target.checked})}
              className="w-4 h-4 text-[#C9A45C] border-[#E8E0D5] rounded focus:ring-[#C9A45C]"
            />
            <label htmlFor="isFeatured" className="text-sm font-medium text-[#111111]">Feature on storefront</label>
          </div>
        </div>
      </form>
    </div>
  );
}
