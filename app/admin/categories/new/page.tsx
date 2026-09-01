'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function CategoryFormPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        router.push('/admin/categories');
      } else {
        alert(data.error || 'Failed to save category');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-4xl mx-auto h-[calc(100vh-80px)] overflow-y-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/categories" className="p-2 border border-[#E8E0D5] rounded-md text-[#6F665B] hover:text-[#111111] hover:bg-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-[#111111]">New Category</h1>
            <p className="text-sm text-[#6F665B] mt-1">Create a new product taxonomy.</p>
          </div>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={isSaving || !formData.name}
          className="flex items-center gap-2 px-6 py-2 bg-[#111111] text-white text-sm font-medium rounded-md hover:bg-[#222222] transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Category'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-[#E8E0D5] rounded-xl p-6 shadow-sm space-y-6">
          <h2 className="text-base font-semibold text-[#111111] border-b border-[#E8E0D5] pb-4">General Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-1">Category Name *</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 bg-[#F9FAFB] border border-[#E8E0D5] rounded-md text-sm focus:outline-none focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]"
                placeholder="e.g. Rings, Necklaces"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-1">Description</label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 bg-[#F9FAFB] border border-[#E8E0D5] rounded-md text-sm focus:outline-none focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]"
                placeholder="Describe this category..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111111] mb-1">Image URL</label>
              <div className="flex items-center gap-4">
                <input 
                  type="text" 
                  value={formData.image_url}
                  onChange={e => setFormData({...formData, image_url: e.target.value})}
                  className="flex-1 px-4 py-2 bg-[#F9FAFB] border border-[#E8E0D5] rounded-md text-sm focus:outline-none focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]"
                  placeholder="https://..."
                />
              </div>
              {formData.image_url && (
                <div className="mt-4 w-32 h-32 rounded-lg border border-[#E8E0D5] overflow-hidden bg-[#F9FAFB]">
                  <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
