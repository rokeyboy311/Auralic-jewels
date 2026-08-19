import React from 'react';
import Link from 'next/link';
import { Truck, ShieldCheck, Lock, Globe } from 'lucide-react';
import { brandConfig } from '@/lib/brandConfig';

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-[10px] tracking-[0.35em] text-[#9b7e46] uppercase font-medium">
          Maison Logistics Protocol
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#141210] uppercase font-light">
          International Insured Shipping Policy
        </h1>
        <p className="text-xs sm:text-sm text-[#73685a] max-w-lg mx-auto font-light leading-relaxed">
          All Maison Aurelia consignments travel under 100% armored insurance via Ferrari Group, Malca-Amit, or FedEx Valuables with mandatory adult signature verification.
        </p>
      </div>

      <div className="space-y-6 text-xs text-[#4a4237]">
        <div className="bg-[#faf8f5] border border-[#c5b49e]/40 p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-lg text-[#141210] uppercase">
            1. Complimentary Armored Courier Threshold
          </h2>
          <p className="leading-relaxed">
            All orders exceeding $1,000 USD (or local currency equivalent) receive complimentary armored air courier delivery worldwide. Orders below this threshold incur a flat $150 USD secure handling fee.
          </p>
        </div>

        <div className="bg-[#faf8f5] border border-[#c5b49e]/40 p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-lg text-[#141210] uppercase">
            2. Discreet & Tamper-Evident Packaging
          </h2>
          <p className="leading-relaxed">
            To ensure utmost privacy and security, outer shipping cartons bear zero brand logos, mention of jewellery, or gold indications. Inside, your creations reside in our signature lacquered presentation chest, enclosed in a serialized tamper-evident security pouch.
          </p>
        </div>

        <div className="bg-[#faf8f5] border border-[#c5b49e]/40 p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-lg text-[#141210] uppercase">
            3. Customs, Import Duties & VAT
          </h2>
          <p className="leading-relaxed">
            International consignments to the United States, United Kingdom, European Union, Switzerland, and the United Arab Emirates are shipped DDP (Delivered Duty Paid). All applicable taxes and import tariffs are calculated and settled at checkout so you experience zero unexpected clearance fees upon delivery.
          </p>
        </div>

        <div className="bg-[#faf8f5] border border-[#c5b49e]/40 p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-lg text-[#141210] uppercase">
            4. White-Glove Private Residence Delivery
          </h2>
          <p className="leading-relaxed">
            For acquisitions exceeding $50,000 USD, Maison Aurelia offers private courier handover by an armed, uniformed security officer directly to your residence, private bank vault, or hotel suite.
          </p>
        </div>
      </div>
    </div>
  );
}
