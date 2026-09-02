'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Truck,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { getShippingMethods } from '@/lib/api';
import { ShippingMethod } from '@/lib/types';

export default function ShippingSettingsPage() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const res = await getShippingMethods();
      if (res.success && res.data) {
        setMethods(res.data);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const handleUpdateField = (id: string, field: keyof ShippingMethod, value: any) => {
    setMethods(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleDelete = (id: string) => {
    setMethods(prev => prev.filter(m => m.id !== id));
  };

  const handleAdd = () => {
    const newMethod: ShippingMethod = {
      id: `ship_${Date.now()}`,
      name: 'New Shipping Method',
      description: 'Standard delivery',
      costUSD: 0,
      estimatedDays: '3-5 business days',
      isFreeAboveThreshold: false,
      carrier: 'FedEx',
      insuranceIncluded: true,
      requiresSignature: true
    };
    setMethods([...methods, newMethod]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Mock save to API
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('Shipping Configuration Saved', 'Global logistics rates have been updated successfully.');
    } catch (err: any) {
      error('Configuration Error', 'Could not save shipping rates.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-1 text-xs text-[#73685a] hover:text-[#141210] uppercase tracking-wider mb-2">
            <ArrowLeft className="w-3 h-3" />
            <span>Return to Dashboard</span>
          </Link>
          <h1 className="font-serif text-3xl text-[#141210] flex items-center gap-3">
            <Truck className="w-8 h-8 text-[#9b7e46]" />
            Global Logistics & Couriers
          </h1>
          <p className="text-sm text-[#73685a] mt-1">Configure armored courier rates, complimentary shipping thresholds, and delivery timeframes.</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="px-6 py-2.5 bg-[#141210] text-[#faf8f5] text-xs uppercase tracking-widest hover:bg-[#9b7e46] transition-colors flex items-center gap-2 shadow-xl disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Updating...' : 'Save Configuration'}</span>
        </button>
      </div>

      <div className="bg-white border border-[#ebdccd] p-6 space-y-6">
        <div className="flex justify-between items-end border-b border-[#ebdccd] pb-4">
          <div>
            <h2 className="font-serif text-xl text-[#141210] uppercase tracking-wider">Active Shipping Methods</h2>
            <p className="text-xs text-[#73685a] mt-1">These logistics options are presented to VIP clients during secure checkout.</p>
          </div>
          <button 
            onClick={handleAdd}
            className="text-xs uppercase tracking-wider flex items-center gap-1 text-[#9b7e46] hover:text-[#141210] font-medium"
          >
            <Plus className="w-4 h-4" /> Add Method
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-10 text-sm text-[#73685a] uppercase tracking-widest font-mono">
            Loading configuration...
          </div>
        ) : (
          <div className="space-y-4">
            {methods.map((method) => (
              <div key={method.id} className="p-5 bg-[#faf8f5] border border-[#c5b49e]/40 relative group">
                <button 
                  onClick={() => handleDelete(method.id)}
                  className="absolute top-4 right-4 text-red-600/50 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove Method"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-5 space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#73685a] mb-1">Courier Method Name</label>
                      <input 
                        type="text" 
                        value={method.name}
                        onChange={(e) => handleUpdateField(method.id, 'name', e.target.value)}
                        className="w-full bg-white border border-[#c5b49e]/40 px-3 py-2 text-sm text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#73685a] mb-1">Client-Facing Description</label>
                      <input 
                        type="text" 
                        value={method.description}
                        onChange={(e) => handleUpdateField(method.id, 'description', e.target.value)}
                        className="w-full bg-white border border-[#c5b49e]/40 px-3 py-2 text-sm text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-7 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#73685a] mb-1">Cost (USD)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={method.costUSD}
                          onChange={(e) => handleUpdateField(method.id, 'costUSD', Number(e.target.value))}
                          className="w-full bg-white border border-[#c5b49e]/40 pl-8 pr-3 py-2 text-sm text-[#141210] font-mono focus:outline-none focus:border-[#9b7e46]"
                        />
                        <DollarSign className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#9b7e46]" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#73685a] mb-1">Estimated Delivery Timeframe</label>
                      <input 
                        type="text" 
                        value={method.estimatedDays}
                        onChange={(e) => handleUpdateField(method.id, 'estimatedDays', e.target.value)}
                        className="w-full bg-white border border-[#c5b49e]/40 px-3 py-2 text-sm text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                        placeholder="e.g. 1-2 Business Days"
                      />
                    </div>
                    <div className="col-span-2 pt-2">
                      <label className="flex items-center gap-3 cursor-pointer group/toggle">
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            className="sr-only"
                            checked={method.isFreeAboveThreshold}
                            onChange={(e) => handleUpdateField(method.id, 'isFreeAboveThreshold', e.target.checked)}
                          />
                          <div className={`block w-10 h-6 rounded-full transition-colors ${method.isFreeAboveThreshold ? 'bg-[#9b7e46]' : 'bg-[#e5d5c5]'}`}></div>
                          <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${method.isFreeAboveThreshold ? 'transform translate-x-4' : ''}`}></div>
                        </div>
                        <span className="text-sm text-[#141210] font-medium group-hover/toggle:text-[#9b7e46] transition-colors">
                          Eligible for Complimentary Shipping (Above Global Threshold)
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {methods.length === 0 && (
              <div className="text-center py-12 text-[#73685a] border border-dashed border-[#c5b49e]">
                No shipping methods configured. Add one to enable checkout.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-[#faf8f5] border border-[#ebdccd] p-6 flex items-start gap-4">
        <div className="w-10 h-10 bg-[#f4efe9] flex items-center justify-center shrink-0 border border-[#e5d5c5]">
          <DollarSign className="w-5 h-5 text-[#9b7e46]" />
        </div>
        <div>
          <h3 className="font-serif text-lg text-[#141210] uppercase mb-1">Global Free Shipping Threshold</h3>
          <p className="text-sm text-[#73685a] mb-4">
            Orders exceeding this amount will automatically qualify for complimentary shipping on eligible courier methods.
          </p>
          <div className="flex items-center gap-2 max-w-xs relative">
            <DollarSign className="w-4 h-4 absolute left-3 top-2.5 text-[#9b7e46]" />
            <input 
              type="text" 
              defaultValue="50000"
              className="w-full bg-white border border-[#c5b49e]/60 pl-8 pr-3 py-2 text-sm text-[#141210] font-mono focus:outline-none focus:border-[#9b7e46]"
            />
            <button className="px-4 py-2 bg-[#f4efe9] hover:bg-[#ebdccd] border border-[#c5b49e]/60 text-xs text-[#141210] uppercase tracking-wider transition-colors">
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
