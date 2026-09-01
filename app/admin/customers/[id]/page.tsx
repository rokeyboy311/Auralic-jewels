'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Calendar, ShoppingBag, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';

export default function AdminCustomerDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    async function loadCustomer() {
      try {
        const res = await fetch(`/api/admin/customers/${id}`);
        const data = await res.json();
        if (data.success) {
          setCustomer(data.data);
        } else {
          router.push('/admin/customers');
        }
      } catch (error) {
        console.error('Failed to load customer', error);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) loadCustomer();
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-[#C9A45C]">
        <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!customer) return null;

  const totalSpent = customer.orders?.reduce((acc: number, order: any) => acc + (order.payment_status === 'paid' ? Number(order.total_usd) : 0), 0) || 0;

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-5xl mx-auto h-[calc(100vh-80px)] overflow-y-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/customers" className="p-2 border border-[#E8E0D5] rounded-md text-[#6F665B] hover:text-[#111111] hover:bg-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-[#111111]">Customer Profile</h1>
          <p className="text-sm text-[#6F665B] mt-1">ID: {customer.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col - Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-[#E8E0D5] rounded-xl p-6 shadow-sm">
            <div className="flex flex-col items-center text-center pb-6 border-b border-[#E8E0D5]">
              <div className="w-20 h-20 rounded-full bg-[#F9FAFB] border border-[#E8E0D5] overflow-hidden flex items-center justify-center text-2xl font-medium text-[#111111] mb-4">
                {customer.avatar_url ? (
                  <img src={customer.avatar_url} alt={customer.name} className="w-full h-full object-cover" />
                ) : (
                  customer.name.charAt(0).toUpperCase()
                )}
              </div>
              <h2 className="text-xl font-semibold text-[#111111]">{customer.name}</h2>
              <div className="flex items-center justify-center gap-2 mt-2 text-[#6F665B] text-sm">
                <Calendar className="w-4 h-4" />
                Joined {new Date(customer.created_at).toLocaleDateString()}
              </div>
            </div>
            
            <div className="pt-6 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-[#F9FAFB] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-[#6F665B]" />
                </div>
                <div>
                  <p className="text-[#6F665B] text-xs font-medium uppercase tracking-wider">Email</p>
                  <a href={`mailto:${customer.email}`} className="text-[#111111] hover:text-[#C9A45C] font-medium transition-colors">
                    {customer.email}
                  </a>
                </div>
              </div>

              {customer.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-[#F9FAFB] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-[#6F665B]" />
                  </div>
                  <div>
                    <p className="text-[#6F665B] text-xs font-medium uppercase tracking-wider">Phone</p>
                    <p className="text-[#111111] font-medium">{customer.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-[#E8E0D5] rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-[#111111] mb-4 uppercase tracking-wider">Lifetime Value</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[#6F665B] text-sm">Total Orders</span>
                <span className="font-medium text-[#111111]">{customer.orders?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6F665B] text-sm">Total Spent</span>
                <span className="font-semibold text-[#C9A45C] text-lg">{formatPrice(totalSpent)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col - History */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white border border-[#E8E0D5] rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#E8E0D5] bg-[#F9FAFB] flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#C9A45C]" />
              <h2 className="font-semibold text-[#111111]">Order History</h2>
            </div>
            
            <div className="p-0">
              {(!customer.orders || customer.orders.length === 0) ? (
                <div className="p-8 text-center text-[#6F665B] text-sm">
                  No orders placed yet.
                </div>
              ) : (
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#F9FAFB] border-b border-[#E8E0D5] text-[#6F665B] font-medium">
                    <tr>
                      <th className="px-6 py-3">Order #</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E0D5]">
                    {customer.orders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-[#F9FAFB]">
                        <td className="px-6 py-4 font-mono text-[#111111]">
                          <Link href={`/admin/orders/${order.id}`} className="hover:text-[#C9A45C] transition-colors">
                            {order.order_number}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-[#6F665B]">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize
                            ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              order.status === 'processing' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              'bg-gray-100 text-gray-700 border border-gray-200'}
                          `}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-[#111111]">
                          {formatPrice(order.total_usd)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="bg-white border border-[#E8E0D5] rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#E8E0D5] bg-[#F9FAFB] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#C9A45C]" />
              <h2 className="font-semibold text-[#111111]">Atelier Inquiries</h2>
            </div>
            
            <div className="p-0">
              {(!customer.inquiries || customer.inquiries.length === 0) ? (
                <div className="p-8 text-center text-[#6F665B] text-sm">
                  No bespoke inquiries submitted.
                </div>
              ) : (
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#F9FAFB] border-b border-[#E8E0D5] text-[#6F665B] font-medium">
                    <tr>
                      <th className="px-6 py-3">Ref #</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E0D5]">
                    {customer.inquiries.map((inq: any) => (
                      <tr key={inq.id} className="hover:bg-[#F9FAFB]">
                        <td className="px-6 py-4 font-mono text-[#111111]">
                          <Link href={`/admin/atelier/${inq.id}`} className="hover:text-[#C9A45C] transition-colors">
                            {inq.reference_number}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-[#6F665B]">
                          {new Date(inq.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 capitalize text-[#111111]">
                          {inq.inquiry_type}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize
                            ${inq.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              inq.status === 'new' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              'bg-blue-50 text-blue-700 border border-blue-200'}
                          `}>
                            {inq.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
