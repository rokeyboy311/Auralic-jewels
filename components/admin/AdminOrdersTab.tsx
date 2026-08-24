'use client';

import React from 'react';
import { Order } from '@/lib/types';
import { useCurrency } from '@/context/CurrencyContext';

interface AdminOrdersTabProps {
  orders: Order[];
  onOpenUpdateModal: (order: Order) => void;
}

export default function AdminOrdersTab({ orders, onOpenUpdateModal }: AdminOrdersTabProps) {
  const { formatPrice } = useCurrency();

  return (
    <div className="bg-white border border-[#ebdccd] overflow-hidden">
      <div className="p-4 border-b border-[#ebdccd] flex justify-between items-center bg-[#faf8f5]">
        <h3 className="font-serif text-lg text-[#141210]">International Consignment Dispatch</h3>
        <span className="text-xs text-[#73685a]">Real-Time Logistics Status</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#141210]">
          <thead className="bg-[#f5ede3] text-[#73685a] uppercase text-[10px] tracking-wider border-b border-[#ebdccd]">
            <tr>
              <th className="py-3 px-4">Order ID & Date</th>
              <th className="py-3 px-4">Patron & Destination</th>
              <th className="py-3 px-4">Pieces</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Logistics Status</th>
              <th className="py-3 px-4">Carrier & Tracking</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ebdccd]/60">
            {orders.map((ord) => (
              <tr key={ord.id} className="hover:bg-[#faf8f5]/80 transition-colors">
                <td className="py-3.5 px-4 font-mono font-medium">
                  <div>{ord.orderNumber}</div>
                  <div className="text-[10px] text-[#73685a]">
                    {new Date(ord.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-medium">
                    {ord.shippingAddress.firstName} {ord.shippingAddress.lastName}
                  </div>
                  <div className="text-[10px] text-[#73685a]">
                    {ord.shippingAddress.city}, {ord.shippingAddress.country}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="max-w-[200px] truncate">{ord.items[0]?.name}</div>
                  {ord.items.length > 1 && (
                    <div className="text-[10px] text-[#9b7e46]">
                      +{ord.items.length - 1} additional piece(s)
                    </div>
                  )}
                </td>
                <td className="py-3.5 px-4 font-serif text-sm">
                  {formatPrice(ord.totalUSD)}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-xs ${
                      ord.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ord.status === 'in_transit' || ord.status === 'shipped'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-stone-100 text-stone-800'
                    }`}
                  >
                    {ord.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-[11px] text-[#73685a]">
                  <div>{ord.carrierName || 'Ferrari Group Valuables'}</div>
                  <div className="text-[10px] text-[#9b7e46]">{ord.trackingNumber || 'Pending'}</div>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => onOpenUpdateModal(ord)}
                    className="px-3 py-1.5 bg-[#f5ede3] hover:bg-[#141210] hover:text-white text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
