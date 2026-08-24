'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, Truck, Package, ArrowRight, Printer } from 'lucide-react';
import { Order } from '@/lib/types';
import { getOrder } from '@/lib/api';
import { useCurrency } from '@/context/CurrencyContext';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    async function loadOrder() {
      if (!orderNumber) {
        setIsLoading(false);
        return;
      }
      const res = await getOrder(orderNumber);
      if (res.success && res.data) {
        setOrder(res.data);
      }
      setIsLoading(false);
    }
    loadOrder();
  }, [orderNumber]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-[#ede5d8] text-[#9b7e46] rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="text-[10px] tracking-[0.35em] text-[#9b7e46] uppercase font-medium">
          Maison Acquisition Secured
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#141210] uppercase font-light">
          Thank You for Your Patronage
        </h1>
        <p className="text-xs sm:text-sm text-[#73685a] max-w-md mx-auto leading-relaxed">
          Your order has been recorded in the Maison Auralic archives. Our master gemologists and hallmarking artisans are preparing your creations.
        </p>
      </div>

      {/* Order Reference Box */}
      <div className="bg-[#faf8f5] border border-[#c5b49e]/40 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ebdccd] pb-4">
          <div>
            <span className="text-[10px] text-[#73685a] uppercase tracking-wider">Consignment Reference</span>
            <p className="font-mono text-lg font-bold text-[#141210]">{orderNumber || 'AUR-2026-CONFIRMED'}</p>
          </div>

          <div>
            <span className="text-[10px] text-[#73685a] uppercase tracking-wider">Acquisition Status</span>
            <p className="text-xs font-semibold text-[#9b7e46] uppercase tracking-wider">
              {order?.status || 'Confirmed & Entrusted to Atelier'}
            </p>
          </div>
        </div>

        {order && (
          <div className="space-y-4 text-xs">
            <div>
              <p className="text-[#73685a] uppercase tracking-wider mb-2">Acquired Masterpieces:</p>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-white p-3 border border-[#ebdccd]">
                    <div>
                      <p className="font-serif text-sm text-[#141210]">{item.name}</p>
                      <p className="text-[11px] text-[#73685a]">
                        {item.purity} {item.metalType} • Qty {item.quantity}
                      </p>
                    </div>
                    <span className="font-mono font-medium text-sm text-[#141210]">
                      {order.currency} {item.unitPriceUSD.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#ebdccd] pt-4 flex justify-between items-baseline text-sm">
              <span className="font-serif text-[#141210]">Total Value Settled:</span>
              <span className="font-serif text-xl font-bold text-[#9b7e46]">
                {order.currency} {order.totalInCurrency.toLocaleString()}
              </span>
            </div>

            <div className="border-t border-[#ebdccd] pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[#4a4237]">
              <div>
                <p className="text-[#9b7e46] uppercase tracking-wider font-medium mb-1">Armored Delivery To:</p>
                <p className="font-medium text-[#141210]">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.addressLine1}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.country}
                </p>
              </div>

              <div>
                <p className="text-[#9b7e46] uppercase tracking-wider font-medium mb-1">Insured Logistics:</p>
                <p>Armored Ferrari Group Air Courier</p>
                <p>Direct Signature Verification Required</p>
                <p className="text-[11px] text-[#73685a] mt-1">GIA/IGI Documentation Enclosed</p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-[#ebdccd] flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/track-order?orderNumber=${orderNumber || ''}`}
            className="px-6 py-3 bg-[#141210] text-[#faf8f5] text-xs uppercase tracking-[0.2em] font-medium text-center hover:bg-[#9b7e46] transition-colors"
          >
            Track Consignment Live
          </Link>

          <Link
            href="/shop"
            className="px-6 py-3 border border-[#c5b49e]/60 text-[#141210] text-xs uppercase tracking-[0.2em] font-medium text-center hover:bg-[#ede5d8] transition-colors"
          >
            Continue Browsing
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-24 font-serif">Retrieving order details...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
