import React from 'react';
import Link from 'next/link';
import { RotateCcw, ShieldCheck, Check } from 'lucide-react';

export default function ReturnsRefundsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-[10px] tracking-[0.35em] text-[#9b7e46] uppercase font-medium">
          Customer Satisfaction Privilege
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#141210] uppercase font-light">
          30-Day Privilege Returns & Exchanges
        </h1>
        <p className="text-xs sm:text-sm text-[#73685a] max-w-lg mx-auto font-light leading-relaxed">
          Aurelic Jewels provides 30-day complimentary insured return pickup for all non-custom catalog pieces in their pristine, unworn condition with security tags intact.
        </p>
      </div>

      <div className="space-y-6 text-xs text-[#4a4237]">
        <div className="bg-[#faf8f5] border border-[#c5b49e]/40 p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-lg text-[#141210] uppercase">
            1. Return Eligibility Window
          </h2>
          <p className="leading-relaxed">
            You may request an exchange or full refund within 30 days from the date of confirmed courier delivery. Items must be unworn, undamaged, unaltered, and returned with all original packaging, GIA/IGI gemological certificates, and warranty cards.
          </p>
        </div>

        <div className="bg-[#faf8f5] border border-[#c5b49e]/40 p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-lg text-[#141210] uppercase">
            2. Complimentary Insured Collection
          </h2>
          <p className="leading-relaxed">
            Upon initiating a return with our Private Concierge, we will issue a prepaid armored courier airbill and coordinate pickup from your residence at a time of your convenience. Never return fine jewellery via standard postal services.
          </p>
        </div>

        <div className="bg-[#faf8f5] border border-[#c5b49e]/40 p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-lg text-[#141210] uppercase">
            3. Inspection & Refund Settlement
          </h2>
          <p className="leading-relaxed">
            Once received at our Place Vendôme atelier, our gemological quality team conducts microscopic hallmark and stone verification within 48 business hours. Refunds are credited directly to your original payment method within 3–5 banking business days.
          </p>
        </div>

        <div className="bg-[#faf8f5] border border-[#c5b49e]/40 p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-lg text-[#141210] uppercase">
            4. Bespoke & Engraved Creations
          </h2>
          <p className="leading-relaxed">
            Custom-commissioned jewellery pieces and items with custom laser inscriptions are crafted uniquely to individual customer specifications and are not eligible for standard returns, though they retain full lifetime warranty and resizing privileges.
          </p>
        </div>
      </div>
    </div>
  );
}
