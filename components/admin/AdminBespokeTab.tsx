'use client';

import React from 'react';
import { BespokeInquiry } from '@/lib/types';

interface AdminBespokeTabProps {
  bespokeInquiries: BespokeInquiry[];
}

export default function AdminBespokeTab({ bespokeInquiries }: AdminBespokeTabProps) {
  return (
    <div className="bg-white border border-[#ebdccd] overflow-hidden">
      <div className="p-4 border-b border-[#ebdccd] flex justify-between items-center bg-[#faf8f5]">
        <h3 className="font-serif text-lg text-[#141210]">Private Bespoke Commission Requests</h3>
        <span className="text-xs text-[#73685a]">{bespokeInquiries.length} Dossiers</span>
      </div>

      <div className="divide-y divide-[#ebdccd]">
        {bespokeInquiries.map((inq) => (
          <div key={inq.id} className="p-6 space-y-4 hover:bg-[#faf8f5]/50 transition-colors">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="text-[10px] tracking-widest text-[#9b7e46] uppercase font-mono">
                  {inq.referenceNumber}
                </span>
                <h4 className="font-serif text-xl text-[#141210] mt-0.5">
                  {inq.customerName} ({inq.customerCountry})
                </h4>
                <p className="text-xs text-[#73685a] font-mono">
                  {inq.customerEmail} • {inq.customerPhone || 'Direct Private Line'}
                </p>
              </div>
              <span className="px-3 py-1 bg-[#ede5d8] text-[#9b7e46] text-xs uppercase tracking-wider font-semibold">
                {inq.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#faf8f5] border border-[#c5b49e]/40 text-xs">
              <div>
                <span className="text-[#73685a] block uppercase text-[10px]">Category</span>
                <span className="font-medium text-[#141210]">{inq.category}</span>
              </div>
              <div>
                <span className="text-[#73685a] block uppercase text-[10px]">Metal Preference</span>
                <span className="font-medium text-[#141210]">{inq.metalPreference} ({inq.purityPreference})</span>
              </div>
              <div>
                <span className="text-[#73685a] block uppercase text-[10px]">Target Gemstone</span>
                <span className="font-medium text-[#141210]">{inq.stonePreference} {inq.targetCarat ? `(${inq.targetCarat}ct)` : ''}</span>
              </div>
              <div>
                <span className="text-[#73685a] block uppercase text-[10px]">Target Budget</span>
                <span className="font-medium text-[#9b7e46]">{inq.targetBudgetUSD}</span>
              </div>
            </div>

            <div className="text-xs text-[#4a4237] leading-relaxed bg-white p-4 border border-[#ebdccd]">
              <span className="text-[10px] uppercase tracking-wider text-[#73685a] block mb-1">
                Design Vision & Specifications
              </span>
              <p>{inq.designDescription}</p>
              {inq.engravingMessage && (
                <p className="mt-2 text-[#9b7e46] font-mono">
                  Custom Inscription: &ldquo;{inq.engravingMessage}&rdquo;
                </p>
              )}
              {inq.timelineRequirement && (
                <p className="mt-1 text-[11px] text-[#73685a]">
                  Timeline: {inq.timelineRequirement}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
