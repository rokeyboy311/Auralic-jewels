import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Loader2, Trash2, Edit2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface Address {
  id: string;
  title: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export default function AddressesTab() {
  const { success, error } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: 'Home',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    isDefault: false
  });

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/me/addresses');
      const data = await res.json();
      if (data.success) {
        setAddresses(data.data);
      }
    } catch (err) {
      console.error('Failed to load addresses', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const resetForm = () => {
    setFormData({
      title: 'Home',
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      isDefault: addresses.length === 0
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (addr: Address) => {
    setFormData({
      title: addr.title,
      fullName: addr.full_name,
      phone: addr.phone,
      addressLine1: addr.address_line1,
      addressLine2: addr.address_line2 || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postal_code,
      country: addr.country,
      isDefault: addr.is_default
    });
    setEditingId(addr.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this residence from your vault?')) return;
    
    try {
      const res = await fetch(`/api/auth/me/addresses/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAddresses(prev => prev.filter(a => a.id !== id));
        success('Residence Removed', 'The address has been successfully deleted.');
      } else {
        error('Deletion Failed', data.error);
      }
    } catch (err) {
      error('System Error', 'Could not process deletion.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const url = editingId ? `/api/auth/me/addresses/${editingId}` : '/api/auth/me/addresses';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        success(editingId ? 'Residence Updated' : 'Residence Added', data.message);
        await fetchAddresses();
        resetForm();
      } else {
        error('Action Failed', data.error);
      }
    } catch (err) {
      error('System Error', 'Failed to communicate with secure servers.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-2xl text-[#141210] uppercase">
          Registered Delivery Residences
        </h2>
        {!isFormOpen && (
          <button 
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="px-4 py-2 bg-[#141210] hover:bg-[#9b7e46] text-white text-[10px] uppercase tracking-widest transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Register New Address</span>
          </button>
        )}
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white p-6 border border-[#ebdccd] space-y-4">
          <h3 className="font-serif text-lg text-[#141210] uppercase border-b border-[#ebdccd]/50 pb-2">
            {editingId ? 'Update Registration' : 'New Residence Registration'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#73685a] font-semibold">Address Title</label>
              <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Penthouse, Summer House" className="w-full text-xs p-2.5 border border-[#ebdccd] focus:outline-none focus:border-[#9b7e46]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#73685a] font-semibold">Recipient Full Name</label>
              <input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full text-xs p-2.5 border border-[#ebdccd] focus:outline-none focus:border-[#9b7e46]" />
            </div>
            
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#73685a] font-semibold">Address Line 1</label>
              <input required value={formData.addressLine1} onChange={e => setFormData({...formData, addressLine1: e.target.value})} className="w-full text-xs p-2.5 border border-[#ebdccd] focus:outline-none focus:border-[#9b7e46]" />
            </div>
            
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#73685a] font-semibold">Address Line 2 (Optional)</label>
              <input value={formData.addressLine2} onChange={e => setFormData({...formData, addressLine2: e.target.value})} className="w-full text-xs p-2.5 border border-[#ebdccd] focus:outline-none focus:border-[#9b7e46]" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#73685a] font-semibold">City</label>
              <input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full text-xs p-2.5 border border-[#ebdccd] focus:outline-none focus:border-[#9b7e46]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#73685a] font-semibold">State/Province</label>
              <input required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full text-xs p-2.5 border border-[#ebdccd] focus:outline-none focus:border-[#9b7e46]" />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#73685a] font-semibold">Postal / Zip Code</label>
              <input required value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} className="w-full text-xs p-2.5 border border-[#ebdccd] focus:outline-none focus:border-[#9b7e46]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#73685a] font-semibold">Country</label>
              <input required value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full text-xs p-2.5 border border-[#ebdccd] focus:outline-none focus:border-[#9b7e46]" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#73685a] font-semibold">Contact Phone</label>
              <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full text-xs p-2.5 border border-[#ebdccd] focus:outline-none focus:border-[#9b7e46]" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="isDefault" 
              checked={formData.isDefault} 
              onChange={e => setFormData({...formData, isDefault: e.target.checked})}
              className="accent-[#9b7e46]"
            />
            <label htmlFor="isDefault" className="text-xs text-[#141210]">Set as default secure delivery residence</label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#ebdccd]/50">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#141210] hover:bg-[#9b7e46] text-white text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d4af37]" />}
              Commit Registration
            </button>
            <button 
              type="button"
              onClick={resetForm}
              disabled={isSubmitting}
              className="px-6 py-2.5 border border-[#ebdccd] hover:bg-[#faf8f5] text-[#141210] text-[10px] uppercase tracking-widest transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="py-10 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#9b7e46]" />
        </div>
      ) : addresses.length === 0 ? (
        !isFormOpen && (
          <div className="bg-white p-12 text-center border border-[#ebdccd] space-y-3">
            <MapPin className="w-8 h-8 text-[#c5b49e] mx-auto" />
            <p className="font-serif text-lg text-[#141210]">No Residences Registered</p>
            <p className="text-xs text-[#73685a]">
              Please register a secure delivery address to receive armored transport deliveries.
            </p>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div key={addr.id} className="bg-white p-5 border border-[#ebdccd] space-y-3 text-xs relative group">
              <div className="flex justify-between items-start border-b border-[#ebdccd]/50 pb-2">
                <span className="font-serif text-sm text-[#141210] font-medium uppercase">
                  {addr.title}
                </span>
                {addr.is_default && (
                  <span className="bg-[#ede5d8] text-[#9b7e46] text-[9px] font-semibold px-2 py-0.5 uppercase tracking-wider">
                    Primary
                  </span>
                )}
              </div>
              
              <div className="text-[#4a4237] leading-relaxed">
                <p className="font-semibold text-[#141210]">{addr.full_name}</p>
                <p>{addr.address_line1}</p>
                {addr.address_line2 && <p>{addr.address_line2}</p>}
                <p>{addr.city}, {addr.state} {addr.postal_code}</p>
                <p>{addr.country}</p>
                <p className="pt-1 mt-1 border-t border-[#ebdccd]/30 font-mono text-[10px] text-[#73685a]">Tel: {addr.phone}</p>
              </div>

              <div className="absolute top-4 right-4 hidden group-hover:flex items-center gap-2 bg-white/90 p-1 rounded-sm shadow-sm">
                <button onClick={() => handleEdit(addr)} className="p-1.5 text-[#9b7e46] hover:bg-[#ede5d8] rounded transition-colors" title="Edit">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(addr.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors" title="Remove">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
