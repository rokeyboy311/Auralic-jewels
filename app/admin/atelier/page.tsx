'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Calendar, Clock, CheckCircle } from 'lucide-react';

export default function AdminAtelierPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadInquiries() {
      try {
        const res = await fetch('/api/admin/bespoke');
        const data = await res.json();
        if (data.success) {
          setInquiries(data.data);
        }
      } catch (error) {
        console.error('Failed to load bespoke inquiries', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadInquiries();
  }, []);

  const filteredInquiries = inquiries.filter(i => 
    i.reference_number?.toLowerCase().includes(search.toLowerCase()) || 
    i.client_name?.toLowerCase().includes(search.toLowerCase()) ||
    i.email?.toLowerCase().includes(search.toLowerCase())
  );

  const newInquiries = filteredInquiries.filter(i => i.status === 'new');
  const inProgressInquiries = filteredInquiries.filter(i => i.status === 'in_progress');
  const completedInquiries = filteredInquiries.filter(i => i.status === 'completed');

  const InquiryCard = ({ inquiry }: { inquiry: any }) => (
    <Link 
      href={`/admin/atelier/${inquiry.id}`}
      className="block bg-white border border-[#E8E0D5] p-4 rounded-lg shadow-sm hover:shadow-md hover:border-[#C9A45C] transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-mono font-medium text-[#C9A45C]">{inquiry.reference_number}</span>
        <span className="text-xs text-[#6F665B]">{new Date(inquiry.created_at).toLocaleDateString()}</span>
      </div>
      <h3 className="font-semibold text-[#111111] mb-1 group-hover:text-[#C9A45C] transition-colors">{inquiry.client_name}</h3>
      <p className="text-sm text-[#6F665B] mb-3 truncate capitalize">{inquiry.inquiry_type.replace('_', ' ')}</p>
      
      <div className="flex justify-between items-center text-xs">
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">{inquiry.budget_range || 'Budget TBA'}</span>
      </div>
    </Link>
  );

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-[1600px] mx-auto h-[calc(100vh-80px)] overflow-y-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#111111]">Atelier Inquiries</h1>
          <p className="text-sm text-[#6F665B] mt-1">Manage bespoke commissions and custom design requests.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F665B]" />
          <input 
            type="text" 
            placeholder="Search reference, name or email..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#E8E0D5] rounded-md text-sm focus:outline-none focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]"
          />
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Column: New */}
        <div className="flex flex-col h-[calc(100vh-240px)]">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-amber-400">
            <Plus className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-[#111111]">New Requests</h2>
            <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {newInquiries.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pb-4">
            {isLoading ? (
              <div className="text-sm text-[#6F665B]">Loading...</div>
            ) : newInquiries.length === 0 ? (
              <div className="text-sm text-[#6F665B] p-4 bg-gray-50 border border-dashed border-[#E8E0D5] rounded-lg text-center">
                No new inquiries
              </div>
            ) : (
              newInquiries.map(inq => <InquiryCard key={inq.id} inquiry={inq} />)
            )}
          </div>
        </div>

        {/* Column: In Progress */}
        <div className="flex flex-col h-[calc(100vh-240px)]">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-blue-400">
            <Clock className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-[#111111]">In Progress</h2>
            <span className="ml-auto bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {inProgressInquiries.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pb-4">
            {isLoading ? (
              <div className="text-sm text-[#6F665B]">Loading...</div>
            ) : inProgressInquiries.length === 0 ? (
              <div className="text-sm text-[#6F665B] p-4 bg-gray-50 border border-dashed border-[#E8E0D5] rounded-lg text-center">
                No inquiries in progress
              </div>
            ) : (
              inProgressInquiries.map(inq => <InquiryCard key={inq.id} inquiry={inq} />)
            )}
          </div>
        </div>

        {/* Column: Completed */}
        <div className="flex flex-col h-[calc(100vh-240px)]">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-emerald-400">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <h2 className="font-semibold text-[#111111]">Completed</h2>
            <span className="ml-auto bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {completedInquiries.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pb-4">
            {isLoading ? (
              <div className="text-sm text-[#6F665B]">Loading...</div>
            ) : completedInquiries.length === 0 ? (
              <div className="text-sm text-[#6F665B] p-4 bg-gray-50 border border-dashed border-[#E8E0D5] rounded-lg text-center">
                No completed inquiries
              </div>
            ) : (
              completedInquiries.map(inq => <InquiryCard key={inq.id} inquiry={inq} />)
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
