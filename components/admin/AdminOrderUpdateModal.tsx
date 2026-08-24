'use client';

import React, { useState } from 'react';
import { Order, OrderStatus } from '@/lib/types';

interface AdminOrderUpdateModalProps {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus, trackingNumber: string, carrierName: string) => Promise<void>;
}

export default function AdminOrderUpdateModal({
  order,
  onClose,
  onUpdateStatus,
}: AdminOrderUpdateModalProps) {
  const [newStatus, setNewStatus] = useState<OrderStatus>(order.status);
  const [carrierInput, setCarrierInput] = useState<string>(order.carrierName || 'Ferrari Group Valuables');
  const [trackingInput, setTrackingInput] = useState<string>(order.trackingNumber || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onUpdateStatus(order.id, newStatus, trackingInput || 'FG-VAL-2026-98104', carrierInput);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full p-6 border border-[#c5b49e] space-y-4 shadow-2xl">
        <h3 className="font-serif text-xl text-[#141210]">Update Consignment Dispatch</h3>

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
            Logistics Status
          </label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
            className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210]"
          >
            <option value="confirmed">Confirmed</option>
            <option value="processing">Atelier In-Production</option>
            <option value="ready_to_ship">Inspected & Sealed</option>
            <option value="shipped">Handed to Armored Carrier</option>
            <option value="in_transit">In Transit (Air Armored)</option>
            <option value="delivered">Delivered & Signed</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
            Security Courier Carrier
          </label>
          <input
            type="text"
            value={carrierInput}
            onChange={(e) => setCarrierInput(e.target.value)}
            placeholder="Ferrari Group Valuables"
            className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210]"
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
            Secure Tracking Docket Number
          </label>
          <input
            type="text"
            value={trackingInput}
            onChange={(e) => setTrackingInput(e.target.value)}
            placeholder="FG-VAL-2026-XXXXX"
            className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210]"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-2.5 bg-[#141210] hover:bg-[#9b7e46] text-white text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Status'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-[#c5b49e]/60 text-xs uppercase tracking-wider cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
