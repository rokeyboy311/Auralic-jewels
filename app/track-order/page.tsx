'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, ShieldCheck, Truck, CheckCircle2, Clock, PackageCheck, AlertCircle } from 'lucide-react';
import { trackOrder } from '@/lib/api';
import { useCurrency } from '@/context/CurrencyContext';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialNumber = searchParams.get('orderNumber') || '';
  const initialEmail = searchParams.get('email') || '';
  const [orderNumber, setOrderNumber] = useState(initialNumber);
  const [email, setEmail] = useState(initialEmail);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { formatPrice } = useCurrency();

  const handleSearch = useCallback(async (numToSearch: string, emailToSearch: string) => {
    if (!numToSearch.trim() || !emailToSearch.trim()) {
      setErrorMsg('Please enter both your order reference number and recipient email address.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    setHasSearched(true);
    try {
      const res = await trackOrder(numToSearch.trim(), emailToSearch.trim());
      if (res.success && res.data) {
        setTrackingData(res.data);
      } else {
        setTrackingData(null);
        setErrorMsg(res.error || 'No consignment records matched this reference number and email combination.');
      }
    } catch {
      setTrackingData(null);
      setErrorMsg('Failed to connect to the Maison logistics registry.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialNumber && initialEmail) {
      handleSearch(initialNumber, initialEmail);
    }
  }, [initialNumber, initialEmail, handleSearch]);

  const steps = [
    { key: 'pending', label: 'Acquisition Received', desc: 'Recorded & Entrusted to Atelier' },
    { key: 'confirmed', label: 'Order Confirmed', desc: 'Payment verified & diamond allocated' },
    { key: 'processing', label: 'Hallmarking & Gemology', desc: 'Microscopic inspection & GIA sealing' },
    { key: 'shipped', label: 'Armored Vault Transit', desc: 'Ferrari Group / FedEx Valuables courier dispatch' },
    { key: 'delivered', label: 'Customer Handover', desc: 'Physical signature verified delivery' },
  ];

  const getStepIndex = (status: string) => {
    if (status === 'delivered') return 4;
    if (status === 'shipped') return 3;
    if (status === 'processing') return 2;
    if (status === 'confirmed') return 1;
    return 0;
  };

  const currentStep = trackingData ? getStepIndex(trackingData.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-12 py-12 space-y-12 bg-[#FDFCF8]">
      <div className="text-center space-y-2">
        <span className="text-[10px] uppercase tracking-[0.4em] text-[#C5A059] font-semibold">
          Maison Logistics Registry
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] uppercase font-light">
          Track Your Fine Jewellery Consignment
        </h1>
        <p className="text-xs sm:text-sm text-[#1A1A1A]/70 max-w-lg mx-auto font-light">
          Enter your acquisition reference number (e.g. <code>AUR-2026-00892</code>) and email address to view live atelier inspection and armored courier transit status.
        </p>
      </div>

      {/* Search Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(orderNumber, email);
        }}
        className="max-w-xl mx-auto bg-white p-4 border border-black/10 shadow-xs space-y-3"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label htmlFor="track-order-number-input" className="sr-only">
              Order Reference Number
            </label>
            <input
              id="track-order-number-input"
              name="orderNumber"
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Order Reference (e.g. AUR-2026-00892)"
              className="w-full px-3 py-2 text-xs font-mono text-[#1A1A1A] uppercase tracking-wider border border-[#c5b49e]/60 focus:outline-none focus:border-[#9b7e46]"
            />
          </div>
          <div>
            <label htmlFor="track-order-email-input" className="sr-only">
              Customer Email Address
            </label>
            <input
              id="track-order-email-input"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Customer Email"
              className="w-full px-3 py-2 text-xs text-[#1A1A1A] border border-[#c5b49e]/60 focus:outline-none focus:border-[#9b7e46]"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-[#1A1A1A] hover:bg-[#C5A059] text-white text-[11px] uppercase tracking-widest font-semibold transition-colors cursor-pointer disabled:opacity-60"
        >
          {isLoading ? 'Locating Consignment...' : 'Track Consignment'}
        </button>
      </form>

      {/* Error Notice */}
      {errorMsg && (
        <div className="max-w-xl mx-auto p-4 bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Order Display Box */}
      {trackingData && (
        <div className="bg-[#F5F2ED] border border-black/5 p-6 sm:p-8 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-black/5 pb-4">
            <div>
              <span className="text-[10px] text-[#1A1A1A]/60 uppercase tracking-wider">Consignment Number</span>
              <h2 className="font-mono text-xl font-bold text-[#1A1A1A]">{trackingData.orderNumber}</h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#1A1A1A]/60 uppercase tracking-wider">Current Status</span>
              <p className="text-xs font-semibold text-[#C5A059] uppercase tracking-wider font-mono">
                {trackingData.status}
              </p>
            </div>
          </div>

          {/* Stepper */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {steps.map((step, idx) => {
              const isPast = idx < currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div key={step.key} className="flex flex-col items-center text-center space-y-2 relative">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                      isPast
                        ? 'bg-[#C5A059] text-white'
                        : isCurrent
                        ? 'bg-[#1A1A1A] text-white ring-4 ring-[#C5A059]/20'
                        : 'bg-black/10 text-[#1A1A1A]/40'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <h3 className="text-xs font-semibold text-[#1A1A1A]">{step.label}</h3>
                  <p className="text-[10px] text-[#1A1A1A]/60 leading-tight">{step.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Carrier & Tracking Info */}
          {trackingData.trackingNumber && (
            <div className="pt-4 border-t border-black/5 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-2">
              <div>
                <span className="text-[#73685a]">Armored Courier:</span>{' '}
                <strong className="text-[#1a1a1a]">{trackingData.carrierName || 'Ferrari Group Valuables'}</strong>
              </div>
              <div>
                <span className="text-[#73685a]">Waybill Ref:</span>{' '}
                <span className="font-mono font-medium text-[#9b7e46]">{trackingData.trackingNumber}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Security Assurance */}
      <div className="border border-black/5 p-6 bg-white flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <div className="w-12 h-12 rounded-full bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">
            Complete Armored Vault Transit Insurance
          </h3>
          <p className="text-[11px] text-[#1A1A1A]/70 leading-relaxed font-light">
            Every Maison Auralic creation travels in high-security tamper-evident vaults under full Lloyd&apos;s of London transit insurance with mandatory physical signature and identity verification upon delivery.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-24 text-center text-xs text-[#73685a]">
          Loading logistics tracker...
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
