'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Mail, Phone, ChevronRight } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { formatPrice } = useCurrency();

  useEffect(() => {
    async function loadCustomers() {
      try {
        const res = await fetch('/api/admin/customers');
        const data = await res.json();
        if (data.success) {
          setCustomers(data.data);
        }
      } catch (error) {
        console.error('Failed to load customers', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-[1600px] mx-auto h-[calc(100vh-80px)] overflow-y-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#111111]">Customers</h1>
          <p className="text-sm text-[#6F665B] mt-1">Manage client profiles, lifetime value, and order history.</p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-[#E8E0D5] rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#E8E0D5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F9FAFB]">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F665B]" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
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
          ) : filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-[#6F665B]">
              <p className="text-sm">No customers found.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#F9FAFB] border-b border-[#E8E0D5] text-[#6F665B] font-medium">
                <tr>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3">Orders</th>
                  <th className="px-6 py-3">Total Spent (USD)</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E0D5]">
                {filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-[#F9FAFB] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E8E0D5] flex items-center justify-center text-[#111111] font-medium overflow-hidden shrink-0">
                          {customer.avatar_url ? (
                            <img src={customer.avatar_url} alt={customer.name} className="w-full h-full object-cover" />
                          ) : (
                            customer.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-[#111111]">{customer.name}</div>
                          <div className="text-xs text-[#6F665B] mt-0.5 font-mono">{customer.id.split('-')[0]}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-[#111111]">
                          <Mail className="w-3.5 h-3.5 text-[#6F665B]" />
                          <a href={`mailto:${customer.email}`} className="hover:text-[#C9A45C] transition-colors">{customer.email}</a>
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-1.5 text-[#6F665B]">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-[#111111] bg-gray-100 px-2 py-1 rounded">
                        {customer.total_orders}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-[#111111]">
                      {formatPrice(customer.total_spent)}
                    </td>
                    <td className="px-6 py-4 text-[#6F665B]">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/admin/customers/${customer.id}`} 
                        className="flex items-center gap-1 text-[#6F665B] hover:text-[#C9A45C] font-medium transition-colors"
                      >
                        View Profile
                        <ChevronRight className="w-4 h-4" />
                      </Link>
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
