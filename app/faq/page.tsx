'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How are Maison Aurelia diamonds certified?',
      a: 'Every solitaire diamond above 0.50 carats is certified by the Gemological Institute of America (GIA) or the International Gemological Institute (IGI). The unique certificate number is microscopic laser-inscribed onto the diamond girdle and enclosed in your leather gemological dossier.',
    },
    {
      q: 'What is the difference between 18K and 22K solid gold?',
      a: '18K gold contains 75% pure gold alloyed with noble metals for maximum structural durability in everyday fine jewellery. 22K gold contains 91.6% pure gold, exhibiting a deeper, richer royal gold color traditional in heritage bridal pieces.',
    },
    {
      q: 'How is fine jewellery delivered securely to international destinations?',
      a: 'Consignments travel inside unmarked, tamper-evident security containers via armored couriers (Ferrari Group, Malca-Amit, FedEx Valuables). Every shipment is 100% insured by the Maison from our vault until physical adult signature verification at your residence.',
    },
    {
      q: 'What is your returns and exchange policy?',
      a: 'We provide 30-day complimentary insured return pickup for all non-custom catalog pieces in their unworn, pristine condition with security tags intact. Custom commissions and engraved pieces are final sale, but include lifetime warranty and complimentary resizing.',
    },
    {
      q: 'Can I modify an existing design or submit my own custom design?',
      a: 'Yes. Maison Aurelia provides a full Bespoke & Custom Design Studio. You can choose any piece from our catalog and customize the gold karat (18K/22K/Platinum), gemstone type (GIA natural diamonds, lab-grown diamonds, emeralds, sapphires, rubies), prong architecture, and custom laser engraving. You can also upload sketches to commission a brand-new creation from scratch.',
    },
    {
      q: 'What payment methods do you accept for international acquisitions?',
      a: 'We accept all major international credit cards (Visa, MasterCard, American Express) encrypted via 256-bit SSL, Apple Pay, and direct private bank wire transfers in USD, EUR, GBP, AED, and INR.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-[10px] tracking-[0.35em] text-[#9b7e46] uppercase font-medium">
          Patron Assistance & Inquiries
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#141210] uppercase font-light">
          Frequently Answered Questions
        </h1>
        <p className="text-xs sm:text-sm text-[#73685a] max-w-lg mx-auto font-light leading-relaxed">
          Find direct answers regarding gemological grading, precious metallurgy, armored logistics, and bespoke commissions.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-[#faf8f5] border border-[#c5b49e]/40 overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 text-left flex justify-between items-center gap-4 hover:bg-white transition-colors"
              >
                <span className="font-serif text-base text-[#141210] font-medium">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#9b7e46] shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-[#4a4237] leading-relaxed border-t border-[#ebdccd] bg-white">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center p-8 bg-[#faf8f5] border border-[#c5b49e]/40 space-y-3">
        <h3 className="font-serif text-xl text-[#141210]">Require Tailored Concierge Guidance?</h3>
        <p className="text-xs text-[#73685a] max-w-md mx-auto">
          Our senior gemologists and atelier directors are available for private consultations.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#141210] text-[#faf8f5] text-xs uppercase tracking-[0.2em] hover:bg-[#9b7e46] transition-colors"
        >
          <span>Contact Concierge</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
