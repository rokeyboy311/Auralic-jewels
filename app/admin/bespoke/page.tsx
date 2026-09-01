'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Search } from 'lucide-react';
import { getBespokeInquiries } from '@/lib/api';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';

export default function AdminBespokePage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadInquiries() {
      try {
        const res = await getBespokeInquiries();
        if (res.success && res.data) {
          setInquiries(res.data);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadInquiries();
  }, []);

  const filteredInquiries = inquiries.filter(i => 
    i.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#141210] font-light flex items-center gap-3">
            Bespoke Commissions <Sparkles className="w-5 h-5 text-[#d4af37]" />
          </h1>
          <p className="text-xs text-[#73685a] mt-1">Manage custom jewellery requests and high-jewellery commissions.</p>
        </div>
      </div>

      <div className="bg-white border border-[#ebdccd] rounded-sm shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#ebdccd] flex items-center justify-between bg-[#faf8f5]">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
            <input 
              type="text" 
              placeholder="Search by client name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#ebdccd] rounded-sm pl-9 pr-4 py-2 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
            />
          </div>
          <span className="text-[10px] text-[#73685a] uppercase tracking-wider font-medium hidden sm:block">
            {filteredInquiries.length} Inquiries Found
          </span>
        </div>

        <DataTable 
          data={filteredInquiries}
          isLoading={isLoading}
          keyExtractor={(item) => item.id}
          columns={[
            {
              header: 'Client',
              cell: (i) => (
                <div className="flex flex-col">
                  <span className="font-semibold text-[#141210]">{i.firstName || i.first_name} {i.lastName || i.last_name}</span>
                  <span className="text-[10px] text-[#73685a]">{i.email}</span>
                </div>
              )
            },
            {
              header: 'Date',
              cell: (i) => <span className="text-[#73685a]">{new Date(i.createdAt || i.created_at).toLocaleDateString()}</span>
            },
            {
              header: 'Type',
              cell: (i) => <span className="text-[#141210] capitalize">{i.inquiryType || i.inquiry_type || 'General'}</span>
            },
            {
              header: 'Budget',
              cell: (i) => <span className="font-medium text-[#73685a]">{i.budget || 'Not specified'}</span>
            },
            {
              header: 'Status',
              cell: (i) => <StatusBadge status={i.status || 'pending'} type="bespoke" />
            }
          ]}
        />
      </div>
    </div>
  );
}
