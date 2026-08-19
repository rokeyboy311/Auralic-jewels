'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, ShieldCheck, Truck, CheckCircle2, Clock, PackageCheck, AlertCircle } from 'lucide-react';
import { Order } from '@/lib/types';
import { trackOrder } from '@/lib/api';
import { useCurrency } from '@/context/CurrencyContext';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialNumber = searchParams.get('orderNumber') || '';
  const [orderNumber, setOrderNumber] = useState(initialNumber);
  const [order, setOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { formatPrice } = useCurrency();

  const handleSearch = useCallback(async (numToSearch: string) => {
    if (!numToSearch.trim()) return;
    setIsLoading(true);
    setErrorMsg('');
    setHasSearched(true);
    try {
      const res = await trackOrder(numToSearch.trim());
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        setOrder(null);
        setErrorMsg(res.error || 'No consignment records matched this reference number.');
      }
    } catch {
      setOrder(null);
      setErrorMsg('Failed to connect to the Maison logistics registry.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialNumber) return;
    let isMounted = true;
    (async () => {
      setIsLoading(true);
      setErrorMsg('');
      setHasSearched(true);
      try {
        const res = await trackOrder(initialNumber.trim());
        if (isMounted) {
          if (res.success && res.data) {
            setOrder(res.data);
          } else {
            setOrder(null);
            setErrorMsg(res.error || 'No consignment records matched this reference number.');
          }
        }
      } catch {
        if (isMounted) {
          setOrder(null);
          setErrorMsg('Failed to connect to the Maison logistics registry.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [initialNumber]);

  const steps = [
    { key: 'confirmed', label: 'Acquisition Confirmed', desc: 'Recorded & Entrusted to Atelier' },
    { key: 'processing', label: 'Hallmarking & Gemology', desc: 'Microscopic inspection & GIA sealing' },
    { key: 'shipped', label: 'Armored Vault Transit', desc: 'Ferrari Group / FedEx Valuables courier dispatch' },
    { key: 'delivered', label: 'Patron Handover', desc: 'Physical signature verified delivery' },
  ];

  const getStepIndex = (status: string) => {
    if (status === 'delivered') return 3;
    if (status === 'shipped') return 2;
    if (status === 'processing') return 1;
    return 0;
  };

  const currentStep = order ? getStepIndex(order.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-12 py-12 space-y-12 bg-[#FDFCF8]">
      <div className="text-center space-y-2">
        <span className="text-[10px] uppercase tracking-[0.4em] text-[#C5A059] font-semibold">
          Maison Logistics Registry
        </span>
        <h1 className="serif text-3xl sm:text-4xl text-[#1A1A1A] uppercase font-light">
          Track Your Fine Jewellery Consignment
        </h1>
        <p className="text-xs sm:text-sm text-[#1A1A1A]/70 max-w-lg mx-auto font-light">
          Enter your acquisition reference number (e.g. <code>AUR-2026-00892</code>) to view live atelier inspection and armored courier transit status.
        </p>
      </div>

      {/* Search Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(orderNumber);
        }}
        className="flex gap-2 max-w-xl mx-auto bg-white p-2 border border-black/10 shadow-xs"
      >
        <input
          type="text"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="Enter Order Reference Number (e.g. AUR-2026-00892)"
          className="flex-1 px-4 py-2 text-xs font-mono text-[#1A1A1A] uppercase tracking-wider focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-[#C5A059] text-white text-[11px] uppercase tracking-widest font-semibold transition-colors"
        >
          {isLoading ? 'Searching...' : 'Locate'}
        </button>
      </form>

      {/* Order Display Box */}
      {order ? (
        <div className="bg-[#F5F2ED] border border-black/5 p-6 sm:p-8 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-black/5 pb-4">
            <div>
              <span className="text-[10px] text-[#1A1A1A]/60 uppercase tracking-wider">Consignment Number</span>
              <h2 className="font-mono text-xl font-bold text-[#1A1A1A]">{order.orderNumber}</h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#1A1A1A]/60 uppercase tracking-wider">Current Status</span>
              <p className="text-xs font-semibold text-[#C5A059] uppercase tracking-wider font-mono">
                {order.status}
              </p>
            </div>
          </div>

          {/* Timeline Step Indicator */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
            {steps.map((step, idx) => {
              const isCompleted = idx <= currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div
                  key={step.key}
                  className={`p-4 border text-xs space-y-1 transition-all ${
                    isCurrent
                      ? 'bg-white border-[#C5A059] ring-1 ring-[#C5A059] shadow-xs'
                      : isCompleted
                      ? 'bg-white/80 border-[#C5A059]/40 text-[#1A1A1A]'
                      : 'bg-white/40 border-black/5 text-[#1A1A1A]/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-[#1A1A1A]">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
                    ) : (
                      <Clock className="w-4 h-4 text-[#1A1A1A]/40" />
                    )}
                    <span className="serif text-sm">{step.label}</span>
                  </div>
                  <p className="text-[11px] text-[#1A1A1A]/60 leading-tight font-light">{step.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Courier & Tracking Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-white p-4 border border-black/5">
            <div>
              <span className="text-[#C5A059] uppercase tracking-wider font-semibold block">
                Armored Courier
              </span>
              <p className="font-medium text-[#1A1A1A]">{order.carrierName || 'Ferrari Group / FedEx Valuables'}</p>
            </div>
            <div>
              <span className="text-[#C5A059] uppercase tracking-wider font-semibold block">
                Tracking Airbill
              </span>
              <p className="font-mono text-[#1A1A1A]">{order.trackingNumber || 'VAULT-DISPATCH-PENDING'}</p>
            </div>
            <div>
              <span className="text-[#C5A059] uppercase tracking-wider font-semibold block">
                Destination City
              </span>
              <p className="font-medium text-[#1A1A1A]">
                {order.shippingAddress.city}, {order.shippingAddress.country}
              </p>
            </div>
          </div>
        </div>
      ) : hasSearched && !isLoading ? (
        <div className="text-center py-12 bg-white border border-black/5 p-6 space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-700 mx-auto" />
          <h3 className="serif text-lg text-[#1A1A1A]">No Consignment Record Found</h3>
          <p className="text-xs text-[#1A1A1A]/60 max-w-sm mx-auto font-light">
            {errorMsg || 'Please double-check the reference number or contact our concierge.'}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="text-center py-24 serif">Loading tracking portal...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
