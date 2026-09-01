'use client';

import React, { useEffect, useState } from 'react';
import { Search, Save, AlertCircle } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import Link from 'next/link';

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updates, setUpdates] = useState<{ id: string; stock: number }[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    async function loadInventory() {
      try {
        const res = await fetch('/api/admin/inventory');
        const data = await res.json();
        if (data.success) {
          setInventory(data.data);
        }
      } catch (error) {
        console.error('Failed to load inventory', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadInventory();
  }, []);

  const filteredInventory = inventory.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    i.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const handleStockChange = (id: string, newStock: string) => {
    const stockVal = parseInt(newStock) || 0;
    
    // Update local display immediately
    setInventory(prev => prev.map(item => item.id === id ? { ...item, stock: stockVal } : item));
    
    // Track update for batch save
    setUpdates(prev => {
      const existing = prev.find(u => u.id === id);
      if (existing) {
        return prev.map(u => u.id === id ? { ...u, stock: stockVal } : u);
      }
      return [...prev, { id, stock: stockVal }];
    });
  };

  const handleSave = async () => {
    if (updates.length === 0) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/inventory/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });
      const data = await res.json();
      if (data.success) {
        setUpdates([]);
        alert('Inventory updated successfully');
      } else {
        alert('Failed to update inventory: ' + data.error);
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-[1600px] mx-auto h-[calc(100vh-80px)] overflow-y-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#111111]">Inventory Management</h1>
          <p className="text-sm text-[#6F665B] mt-1">Monitor and adjust stock levels across your catalogue.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={updates.length === 0 || isSaving}
          className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            updates.length > 0 
              ? 'bg-[#C9A45C] text-white hover:bg-[#B38D46]' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : `Save Changes ${updates.length > 0 ? `(${updates.length})` : ''}`}
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-[#E8E0D5] rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#E8E0D5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F9FAFB]">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F665B]" />
            <input 
              type="text" 
              placeholder="Search by SKU or name..." 
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
          ) : filteredInventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-[#6F665B]">
              <p className="text-sm">No products found in inventory.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#F9FAFB] border-b border-[#E8E0D5] text-[#6F665B] font-medium">
                <tr>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Stock Available</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E0D5]">
                {filteredInventory.map(item => {
                  const isLowStock = item.stock <= 2;
                  const hasUnsavedChanges = updates.some(u => u.id === item.id);
                  
                  return (
                    <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-[#F9FAFB] border border-[#E8E0D5] overflow-hidden shrink-0">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#E8E0D5]">Img</div>
                            )}
                          </div>
                          <Link href={`/admin/products/${item.id}`} className="font-medium text-[#111111] hover:text-[#C9A45C] truncate max-w-[200px]">
                            {item.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#6F665B]">{item.sku}</td>
                      <td className="px-6 py-4 font-medium text-[#111111]">{formatPrice(item.price_usd)}</td>
                      <td className="px-6 py-4 text-[#6F665B] capitalize">{item.status.replace('_', ' ')}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <input 
                            type="number"
                            min="0"
                            value={item.stock}
                            onChange={(e) => handleStockChange(item.id, e.target.value)}
                            className={`w-20 px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A45C] ${
                              hasUnsavedChanges ? 'border-[#C9A45C] bg-[#FDF9F1]' : 'border-[#E8E0D5] bg-white'
                            }`}
                          />
                          {isLowStock && (
                            <div className="flex items-center gap-1 text-rose-600 text-[10px] font-medium bg-rose-50 px-2 py-1 rounded border border-rose-100">
                              <AlertCircle className="w-3 h-3" />
                              Low
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
