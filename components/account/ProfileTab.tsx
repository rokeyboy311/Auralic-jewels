import React, { useState } from 'react';
import { User, Loader2, Save } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface ProfileTabProps {
  user: any;
  updateUser: (data: any) => void;
}

export default function ProfileTab({ user, updateUser }: ProfileTabProps) {
  const { success, error } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (data.success) {
        success('Profile Updated', 'Your identity details have been secured.');
        updateUser(data.data);
        setIsEditing(false);
      } else {
        error('Update Failed', data.error || 'Could not update profile.');
      }
    } catch (err: any) {
      error('System Error', 'Failed to communicate with vault servers.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-2xl text-[#141210] uppercase">Customer Identity</h2>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="text-xs text-[#9b7e46] hover:underline uppercase tracking-wider font-semibold"
          >
            Update Details →
          </button>
        )}
      </div>

      <div className="space-y-4 text-xs bg-white p-6 border border-[#ebdccd]">
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[#73685a] uppercase tracking-wider block text-[10px] font-semibold">Full Name</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 border border-[#ebdccd] focus:outline-none focus:border-[#9b7e46]"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[#73685a] uppercase tracking-wider block text-[10px] font-semibold">Private Phone</label>
              <input 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 border border-[#ebdccd] focus:outline-none focus:border-[#9b7e46]"
                placeholder="+1 (212) 555-0199"
              />
            </div>
            
            <div>
              <span className="text-[#73685a] uppercase tracking-wider block text-[10px] font-semibold">Registered Email (Immutable)</span>
              <p className="font-mono text-sm text-[#9ca3af] mt-1">{user?.email}</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 bg-[#141210] hover:bg-[#9b7e46] text-white uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-[#d4af37]" /> : <Save className="w-4 h-4 text-[#d4af37]" />}
                Commit Changes
              </button>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setName(user?.name || '');
                  setPhone(user?.phone || '');
                }}
                disabled={isSaving}
                className="px-6 py-2.5 border border-[#ebdccd] hover:bg-[#faf8f5] text-[#141210] uppercase tracking-wider transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <span className="text-[#73685a] uppercase tracking-wider block text-[10px]">Full Name</span>
              <p className="font-serif text-base text-[#141210] mt-1">{user?.name}</p>
            </div>
            <div>
              <span className="text-[#73685a] uppercase tracking-wider block text-[10px]">Registered Email</span>
              <p className="font-mono text-sm text-[#141210] mt-1">{user?.email}</p>
            </div>
            <div>
              <span className="text-[#73685a] uppercase tracking-wider block text-[10px]">Private Phone</span>
              <p className="font-mono text-sm text-[#141210] mt-1">{user?.phone || 'Not Provided'}</p>
            </div>
            <div>
              <span className="text-[#73685a] uppercase tracking-wider block text-[10px]">Aurelic Jewels Membership</span>
              <p className="text-[#9b7e46] uppercase tracking-wider font-semibold mt-1">
                {user?.role === 'admin' ? 'Workshop Administrator' : 'Haute Joaillerie Customer'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
