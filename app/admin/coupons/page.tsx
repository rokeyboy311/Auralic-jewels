'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { formatPrice } = useCurrency();

  useEffect(() => {
    async function loadCoupons() {
      try {
        const res = await fetch('/api/admin/coupons');
        const data = await res.json();
        if (data.success) {
          setCoupons(data.data);
        }
      } catch (error) {
        console.error('Failed to load coupons', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadCoupons();
  }, []);

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(search.toLowerCase()) || 
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (code: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await fetch(`/api/admin/coupons/${code}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCoupons(coupons.filter(c => c.code !== code));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-[1600px] mx-auto h-[calc(100vh-80px)] overflow-y-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#111111]">Privilege Codes</h1>
          <p className="text-sm text-[#6F665B] mt-1">Manage promotional codes and exclusive client privileges.</p>
        </div>
        <Link 
          href="/admin/coupons/new"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#111111] text-white text-sm font-medium rounded-md hover:bg-[#222222] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Code
        </Link>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-[#E8E0D5] rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#E8E0D5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F9FAFB]">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F665B]" />
            <input 
              type="text" 
              placeholder="Search codes..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E8E0D5] rounded-md text-sm focus:outline-none focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto min-h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-6 h-6 border-2 border-[#C9A45C] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-[#6F665B]">
              <p className="text-sm">No promotional codes found.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#F9FAFB] border-b border-[#E8E0D5] text-[#6F665B] font-medium">
                <tr>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Discount</th>
                  <th className="px-6 py-3">Min Order</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Expires</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E0D5]">
                {filteredCoupons.map(coupon => (
                  <tr key={coupon.code} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#111111] bg-gray-100 px-2 py-1 rounded inline-block">
                        {coupon.code}
                      </div>
                      <div className="text-xs text-[#6F665B] mt-1">{coupon.description || '-'}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-[#111111]">
                      {coupon.discount_type === 'percentage' 
                        ? `${coupon.discount_value}%` 
                        : formatPrice(coupon.discount_value)}
                    </td>
                    <td className="px-6 py-4 text-[#6F665B]">
                      {parseFloat(coupon.min_order_usd) > 0 ? formatPrice(coupon.min_order_usd) : 'None'}
                    </td>
                    <td className="px-6 py-4">
                      {coupon.is_active ? (
                        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 w-fit">
                          <CheckCircle className="w-3 h-3" />
                          <span>Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200 w-fit">
                          <XCircle className="w-3 h-3" />
                          <span>Inactive</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[#6F665B]">
                      {coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleDelete(coupon.code)} className="p-1.5 text-[#6F665B] hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors border border-[#E8E0D5]">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
