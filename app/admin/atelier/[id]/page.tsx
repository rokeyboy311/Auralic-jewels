'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Calendar, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminAtelierDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [inquiry, setInquiry] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function loadInquiry() {
      try {
        const res = await fetch(`/api/admin/bespoke/${id}`);
        const data = await res.json();
        if (data.success) {
          setInquiry(data.data);
        } else {
          router.push('/admin/atelier');
        }
      } catch (error) {
        console.error('Failed to load bespoke inquiry', error);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) loadInquiry();
  }, [id, router]);

  const updateStatus = async (status: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/bespoke/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setInquiry({ ...inquiry, status });
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-[#C9A45C]">
        <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!inquiry) return null;

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-4xl mx-auto h-[calc(100vh-80px)] overflow-y-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/atelier" className="p-2 border border-[#E8E0D5] rounded-md text-[#6F665B] hover:text-[#111111] hover:bg-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-[#111111]">Inquiry Details</h1>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize
                ${inquiry.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  inquiry.status === 'new' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-blue-50 text-blue-700 border border-blue-200'}
              `}>
                {inquiry.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-[#6F665B] mt-1 font-mono">Ref: {inquiry.reference_number}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={inquiry.status}
            onChange={(e) => updateStatus(e.target.value)}
            disabled={isUpdating}
            className="px-4 py-2 bg-white border border-[#E8E0D5] rounded-md text-sm font-medium focus:outline-none focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C] disabled:opacity-50"
          >
            <option value="new">New Request</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-[#E8E0D5] rounded-xl p-6 sm:p-8 shadow-sm space-y-8">
        
        {/* Client Details */}
        <section>
          <h2 className="text-sm font-semibold text-[#111111] border-b border-[#E8E0D5] pb-2 mb-4 uppercase tracking-wider">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-[#6F665B] text-xs font-medium uppercase tracking-wider mb-1">Name</p>
              <p className="text-[#111111] font-medium">{inquiry.client_name}</p>
            </div>
            <div>
              <p className="text-[#6F665B] text-xs font-medium uppercase tracking-wider mb-1">Contact</p>
              <div className="space-y-1">
                <a href={`mailto:${inquiry.email}`} className="flex items-center gap-2 text-[#111111] hover:text-[#C9A45C] transition-colors">
                  <Mail className="w-4 h-4 text-[#6F665B]" />
                  {inquiry.email}
                </a>
                {inquiry.phone && (
                  <div className="flex items-center gap-2 text-[#111111]">
                    <Phone className="w-4 h-4 text-[#6F665B]" />
                    {inquiry.phone}
                  </div>
                )}
              </div>
            </div>
            {inquiry.user_id && (
              <div>
                <p className="text-[#6F665B] text-xs font-medium uppercase tracking-wider mb-1">Registered Account</p>
                <Link href={`/admin/customers/${inquiry.user_id}`} className="text-[#C9A45C] hover:underline">
                  View Profile
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Inquiry Details */}
        <section>
          <h2 className="text-sm font-semibold text-[#111111] border-b border-[#E8E0D5] pb-2 mb-4 uppercase tracking-wider">Request Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-[#6F665B] text-xs font-medium uppercase tracking-wider mb-1">Type</p>
              <p className="text-[#111111] font-medium capitalize">{inquiry.inquiry_type.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-[#6F665B] text-xs font-medium uppercase tracking-wider mb-1">Budget</p>
              <p className="text-[#111111] font-medium">{inquiry.budget_range || 'Not Specified'}</p>
            </div>
            {inquiry.target_date && (
              <div>
                <p className="text-[#6F665B] text-xs font-medium uppercase tracking-wider mb-1">Target Date</p>
                <div className="flex items-center gap-2 text-[#111111] font-medium">
                  <Calendar className="w-4 h-4 text-[#6F665B]" />
                  {new Date(inquiry.target_date).toLocaleDateString()}
                </div>
              </div>
            )}
            <div>
              <p className="text-[#6F665B] text-xs font-medium uppercase tracking-wider mb-1">Submitted On</p>
              <p className="text-[#111111]">{new Date(inquiry.created_at).toLocaleString()}</p>
            </div>
          </div>
          
          <div className="bg-[#F9FAFB] border border-[#E8E0D5] rounded-lg p-4">
            <p className="text-[#6F665B] text-xs font-medium uppercase tracking-wider mb-2">Message</p>
            <p className="text-[#111111] whitespace-pre-wrap">{inquiry.message}</p>
          </div>
        </section>
        
      </div>
    </div>
  );
}
