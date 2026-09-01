'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CouponFormPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_usd: '',
    expiry_date: '',
    is_active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        router.push('/admin/coupons');
      } else {
        alert(data.error || 'Failed to save code');
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
          <Link href="/admin/coupons" className="p-2 border border-[#E8E0D5] rounded-md text-[#6F665B] hover:text-[#111111] hover:bg-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-[#111111]">New Privilege Code</h1>
            <p className="text-sm text-[#6F665B] mt-1">Create promotional discounts for clients.</p>
          </div>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={isSaving || !formData.code || !formData.discount_value}
          className="flex items-center gap-2 px-6 py-2 bg-[#111111] text-white text-sm font-medium rounded-md hover:bg-[#222222] transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Code'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-[#E8E0D5] rounded-xl p-6 shadow-sm space-y-6">
          <h2 className="text-base font-semibold text-[#111111] border-b border-[#E8E0D5] pb-4">Code Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-1">Code *</label>
              <input 
                type="text" 
                required
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                className="w-full px-4 py-2 bg-[#F9FAFB] border border-[#E8E0D5] rounded-md text-sm font-medium focus:outline-none focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]"
                placeholder="e.g. VIP2026"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-1">Status</label>
              <div className="flex items-center gap-3 mt-2">
                <input 
                  type="checkbox"
                  id="isActive"
                  checked={formData.is_active}
                  onChange={e => setFormData({...formData, is_active: e.target.checked})}
                  className="w-4 h-4 text-[#C9A45C] border-[#E8E0D5] rounded focus:ring-[#C9A45C]"
                />
                <label htmlFor="isActive" className="text-sm text-[#111111]">Active and available for use</label>
              </div>
            </div>
          </div>
            
          <div>
            <label className="block text-sm font-medium text-[#111111] mb-1">Description</label>
            <input 
              type="text" 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 bg-[#F9FAFB] border border-[#E8E0D5] rounded-md text-sm focus:outline-none focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]"
              placeholder="Internal description of this promotion..."
            />
          </div>

          <h2 className="text-base font-semibold text-[#111111] border-b border-[#E8E0D5] pb-4 pt-4">Discount Configuration</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-1">Discount Type *</label>
              <select 
                value={formData.discount_type}
                onChange={e => setFormData({...formData, discount_type: e.target.value})}
                className="w-full px-4 py-2 bg-[#F9FAFB] border border-[#E8E0D5] rounded-md text-sm focus:outline-none focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-1">Discount Value *</label>
              <input 
                type="number" 
                required
                min="0"
                step="0.01"
                value={formData.discount_value}
                onChange={e => setFormData({...formData, discount_value: e.target.value})}
                className="w-full px-4 py-2 bg-[#F9FAFB] border border-[#E8E0D5] rounded-md text-sm focus:outline-none focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]"
                placeholder={formData.discount_type === 'percentage' ? "e.g. 15" : "e.g. 100"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-1">Minimum Order Amount (USD)</label>
              <input 
                type="number" 
                min="0"
                step="0.01"
                value={formData.min_order_usd}
                onChange={e => setFormData({...formData, min_order_usd: e.target.value})}
                className="w-full px-4 py-2 bg-[#F9FAFB] border border-[#E8E0D5] rounded-md text-sm focus:outline-none focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]"
                placeholder="Optional minimum cart value"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-1">Expiry Date</label>
              <input 
                type="datetime-local" 
                value={formData.expiry_date}
                onChange={e => setFormData({...formData, expiry_date: e.target.value})}
                className="w-full px-4 py-2 bg-[#F9FAFB] border border-[#E8E0D5] rounded-md text-sm focus:outline-none focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
