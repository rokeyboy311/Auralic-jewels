import React from 'react';
import Link from 'next/link';
import { Ruler, ShieldCheck, HelpCircle } from 'lucide-react';

export default function SizeGuidePage() {
  const ringSizeChart = [
    { us: '5', uk: 'J 1/2', eu: '49', mm: '15.7 mm' },
    { us: '5.5', uk: 'L', eu: '50.5', mm: '16.1 mm' },
    { us: '6', uk: 'M', eu: '52', mm: '16.5 mm' },
    { us: '6.5', uk: 'N', eu: '53', mm: '16.9 mm' },
    { us: '7', uk: 'O', eu: '54.5', mm: '17.3 mm' },
    { us: '7.5', uk: 'P', eu: '56', mm: '17.7 mm' },
    { us: '8', uk: 'Q', eu: '57', mm: '18.1 mm' },
    { us: '8.5', uk: 'R', eu: '58.5', mm: '18.5 mm' },
    { us: '9', uk: 'S', eu: '60', mm: '19.0 mm' },
    { us: '10', uk: 'T 1/2', eu: '62', mm: '19.8 mm' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-[10px] tracking-[0.35em] text-[#9b7e46] uppercase font-medium">
          Maison Auralic Fit & Proportion
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#141210] uppercase font-light">
          International Ring & Jewellery Size Guide
        </h1>
        <p className="text-xs sm:text-sm text-[#73685a] max-w-lg mx-auto font-light leading-relaxed">
          Ensure a flawless fit for your fine jewellery acquisition. Maison Auralic provides one complimentary ring resizing within 90 days of order receipt.
        </p>
      </div>

      {/* Conversion Table */}
      <div className="bg-[#faf8f5] border border-[#c5b49e]/40 p-6 sm:p-8 space-y-4">
        <h2 className="font-serif text-xl text-[#141210] uppercase">
          International Ring Size Conversion Table
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#ebdccd] uppercase text-[#73685a] text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">US & Canada</th>
                <th className="py-2.5 px-3">UK & Australia</th>
                <th className="py-2.5 px-3">Europe (ISO)</th>
                <th className="py-2.5 px-3">Inside Diameter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebdccd]">
              {ringSizeChart.map((row) => (
                <tr key={row.us} className="hover:bg-white transition-colors">
                  <td className="py-2.5 px-3 font-bold text-[#141210]">{row.us}</td>
                  <td className="py-2.5 px-3">{row.uk}</td>
                  <td className="py-2.5 px-3">{row.eu}</td>
                  <td className="py-2.5 px-3 font-mono text-[#9b7e46]">{row.mm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* How to Measure at Home */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-[#4a4237]">
        <div className="bg-white p-6 border border-[#c5b49e]/40 space-y-2">
          <h3 className="font-serif text-base text-[#141210] font-medium">
            Method A: Existing Ring Measurement
          </h3>
          <p className="leading-relaxed">
            Place a ring that fits your intended finger onto a millimeter ruler. Measure the inside diameter at the widest center point (excluding metal walls) and cross-reference with our chart above.
          </p>
        </div>

        <div className="bg-white p-6 border border-[#c5b49e]/40 space-y-2">
          <h3 className="font-serif text-base text-[#141210] font-medium">
            Method B: Complimentary Maison Sizer
          </h3>
          <p className="leading-relaxed">
            Unsure of your size? Contact our concierge to receive a complimentary physical plastic ring sizing belt dispatched by express mail prior to your acquisition.
          </p>
        </div>
      </div>
    </div>
  );
}
