'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Eye } from 'lucide-react';
import { getAdminOrders } from '@/lib/api';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { useCurrency } from '@/context/CurrencyContext';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { formatPrice } = useCurrency();

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await getAdminOrders();
        if (res.success && res.data) {
          setOrders(res.data);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadOrders();
  }, []);

  const filteredOrders = orders.filter(o => 
    o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#141210] font-light">Consignments Ledger</h1>
          <p className="text-xs text-[#73685a] mt-1">Manage global orders, shipments, and armored transport.</p>
        </div>
      </div>

      <div className="bg-white border border-[#ebdccd] rounded-sm shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#ebdccd] flex items-center justify-between bg-[#faf8f5]">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
            <input 
              type="text" 
              placeholder="Search by order ref or client email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#ebdccd] rounded-sm pl-9 pr-4 py-2 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
            />
          </div>
          <span className="text-[10px] text-[#73685a] uppercase tracking-wider font-medium hidden sm:block">
            {filteredOrders.length} Consignments Found
          </span>
        </div>

        <DataTable 
          data={filteredOrders}
          isLoading={isLoading}
          keyExtractor={(item) => item.id}
          columns={[
            {
              header: 'Ref No.',
              cell: (o) => <span className="font-semibold text-[#141210]">{o.orderNumber || o.order_number}</span>
            },
            {
              header: 'Date',
              cell: (o) => <span className="text-[#73685a]">{new Date(o.createdAt || o.created_at).toLocaleDateString()}</span>
            },
            {
              header: 'Client',
              cell: (o) => <span className="text-[#141210]">{o.customerEmail || o.customer_email}</span>
            },
            {
              header: 'Value',
              cell: (o) => <span className="font-semibold text-[#141210]">{formatPrice(o.totalUSD || o.total_usd)}</span>
            },
            {
              header: 'Status',
              cell: (o) => <StatusBadge status={o.status} type="order" />
            },
            {
              header: 'Action',
              cell: (o) => (
                <Link 
                  href={`/admin/orders/${o.id}`}
                  className="px-3 py-1.5 border border-[#ebdccd] text-[10px] uppercase tracking-wider font-semibold text-[#73685a] hover:bg-[#faf8f5] hover:text-[#141210] transition-colors rounded-sm flex items-center gap-1 w-fit"
                >
                  <Eye className="w-3 h-3" />
                  <span>Inspect</span>
                </Link>
              )
            }
          ]}
        />
      </div>
    </div>
  );
}
