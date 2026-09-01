'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Truck, CheckCircle2, Clock, Mail, Phone, Package, Save } from 'lucide-react';
import { getAdminOrders, updateOrderStatus } from '@/lib/api';
import StatusBadge from '@/components/admin/StatusBadge';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/context/ToastContext';

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { success, error } = useToast();
  const { formatPrice } = useCurrency();
  
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Status Update State
  const [newStatus, setNewStatus] = useState<string>('');
  const [carrierInput, setCarrierInput] = useState<string>('');
  const [trackingInput, setTrackingInput] = useState<string>('');

  useEffect(() => {
    async function loadOrder() {
      if (!params.id) return;
      try {
        const res = await getAdminOrders(); // Usually we'd have a getOrderById for admin, but this works for now
        if (res.success && res.data) {
          const found = res.data.find(o => o.id === params.id);
          if (found) {
            setOrder(found);
            setNewStatus(found.status || 'pending');
            const data: any = found;
            setCarrierInput(data.carrierName || data.carrier_name || 'Ferrari Group Valuables');
            setTrackingInput(data.trackingNumber || data.tracking_number || '');
          } else {
            error('Not Found', 'Consignment could not be located.');
            router.push('/admin/orders');
          }
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadOrder();
  }, [params.id, router, error]);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || isUpdating) return;
    setIsUpdating(true);
    
    try {
      const res = await updateOrderStatus(
        order.id, 
        newStatus, 
        trackingInput || undefined, 
        carrierInput || undefined
      );
      
      if (res.success && res.data) {
        setOrder(res.data);
        success('Consignment Updated', `Status changed to ${newStatus}.`);
      } else {
        error('Update Failed', res.error || 'Could not update consignment.');
      }
    } catch {
      error('System Error', 'Failed to communicate with workshop server.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-10 flex justify-center">
        <div className="w-8 h-8 border-2 border-[#9b7e46] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) return null;

  const steps = [
    { id: 'pending', label: 'Order Received', icon: Clock },
    { id: 'processing', label: 'In Production', icon: Package },
    { id: 'shipped', label: 'Dispatched', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle2 }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === order.status?.toLowerCase());

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between gap-4 border-b border-[#ebdccd] pb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="p-2 border border-[#ebdccd] rounded-full text-[#73685a] hover:bg-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-3xl text-[#141210] font-light">Consignment Details</h1>
            <p className="text-xs text-[#73685a] mt-1">{order.orderNumber || order.order_number}</p>
          </div>
        </div>
        <StatusBadge status={order.status} type="order" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Timeline & Update */}
        <div className="lg:col-span-1 space-y-8">
          
          <div className="bg-white border border-[#ebdccd] p-6 shadow-sm space-y-6">
            <h2 className="text-xs uppercase tracking-widest font-semibold text-[#141210] border-b border-[#ebdccd]/50 pb-2">
              Visual Timeline
            </h2>
            <div className="relative border-l border-[#ebdccd] ml-4 space-y-8 pb-4">
              {steps.map((step, idx) => {
                const isCompleted = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;
                return (
                  <div key={step.id} className="relative pl-6">
                    <div className={`absolute -left-3 top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white ${
                      isCompleted ? 'border-emerald-500 text-emerald-500' : 'border-[#ebdccd] text-[#ebdccd]'
                    }`}>
                      <step.icon className="w-3 h-3" />
                    </div>
                    <div>
                      <p className={`text-xs uppercase tracking-wider font-semibold ${isCompleted ? 'text-[#141210]' : 'text-[#9ca3af]'}`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-[10px] text-[#73685a] mt-0.5">Current Status</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleStatusUpdate} className="bg-[#faf8f5] border border-[#ebdccd] p-6 shadow-sm space-y-4">
            <h2 className="text-xs uppercase tracking-widest font-semibold text-[#141210] border-b border-[#ebdccd]/50 pb-2">
              Update Status
            </h2>
            
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#73685a] font-medium">Status</label>
              <select 
                value={newStatus} 
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full text-xs p-2.5 border border-[#ebdccd] bg-white focus:outline-none focus:border-[#9b7e46]"
              >
                <option value="pending">Pending Review</option>
                <option value="processing">In Production (Workshop)</option>
                <option value="shipped">Dispatched (Armored Transport)</option>
                <option value="delivered">Delivered to Client</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#73685a] font-medium">Carrier Service</label>
              <input 
                value={carrierInput} 
                onChange={(e) => setCarrierInput(e.target.value)}
                className="w-full text-xs p-2.5 border border-[#ebdccd] bg-white focus:outline-none focus:border-[#9b7e46]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#73685a] font-medium">Tracking Reference</label>
              <input 
                value={trackingInput} 
                onChange={(e) => setTrackingInput(e.target.value)}
                className="w-full text-xs p-2.5 border border-[#ebdccd] bg-white focus:outline-none focus:border-[#9b7e46]"
                placeholder="FG-VAL-..."
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full py-3 bg-[#141210] hover:bg-[#9b7e46] text-[#faf8f5] text-[10px] uppercase tracking-wider font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-4"
            >
              {isUpdating ? (
                <div className="w-3 h-3 border border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-3 h-3 text-[#d4af37]" />
              )}
              <span>Commit Update</span>
            </button>
          </form>

        </div>

        {/* Right Column: Order Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#ebdccd] p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h2 className="text-xs uppercase tracking-widest font-semibold text-[#141210] border-b border-[#ebdccd]/50 pb-2">
                Client Information
              </h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-[#73685a]">
                  <Mail className="w-3.5 h-3.5 text-[#9ca3af]" />
                  <span>{order.customerEmail || order.customer_email}</span>
                </div>
                {order.customerPhone && (
                  <div className="flex items-center gap-2 text-xs text-[#73685a]">
                    <Phone className="w-3.5 h-3.5 text-[#9ca3af]" />
                    <span>{order.customerPhone || order.customer_phone}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-xs uppercase tracking-widest font-semibold text-[#141210] border-b border-[#ebdccd]/50 pb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Shipping Destination
              </h2>
              <p className="text-xs text-[#73685a] whitespace-pre-line leading-relaxed">
                {order.shippingAddress || order.shipping_address || 'Address pending confirmation.'}
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#ebdccd] p-6 shadow-sm space-y-4">
            <h2 className="text-xs uppercase tracking-widest font-semibold text-[#141210] border-b border-[#ebdccd]/50 pb-2">
              Financial Summary
            </h2>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#73685a]">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotalUSD || order.subtotal_usd || order.totalUSD || order.total_usd)}</span>
              </div>
              <div className="flex justify-between text-[#73685a]">
                <span>Insured Armored Transport</span>
                <span>{(order.shippingUSD || order.shipping_usd) > 0 ? formatPrice(order.shippingUSD || order.shipping_usd) : 'Complimentary'}</span>
              </div>
              <div className="flex justify-between text-[#141210] font-semibold pt-2 border-t border-[#ebdccd]/50 text-sm">
                <span>Total Consignment Value</span>
                <span>{formatPrice(order.totalUSD || order.total_usd)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
