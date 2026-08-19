'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, ShieldCheck, Check } from 'lucide-react';
import { brandConfig } from '@/lib/brandConfig';
import { useToast } from '@/context/ToastContext';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Private Gemstone Inquiry');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);
  const { success } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    success('Message Entrusted', 'Our Private Concierge will respond to your confidential inquiry within 4 hours.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-16">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-[10px] tracking-[0.35em] text-[#9b7e46] uppercase font-medium">
          Maison Aurelia Private Concierge
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#141210] uppercase font-light">
          Contact Our Master Gemologists
        </h1>
        <p className="text-xs sm:text-sm text-[#73685a] font-light leading-relaxed">
          Whether you seek private diamond sourcing, bespoke high jewellery guidance, or assistance with an existing consignment, our Place Vendôme team is at your continuous service.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Atelier Details */}
        <div className="lg:col-span-5 space-y-8 bg-[#faf8f5] border border-[#c5b49e]/40 p-6 sm:p-8">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl text-[#141210] uppercase">
              Global Flagship Ateliers
            </h2>
            <p className="text-xs text-[#73685a] leading-relaxed">
              Private bespoke consultations and master goldsmith viewings by advance appointment.
            </p>
          </div>

          <div className="space-y-6 text-xs text-[#4a4237]">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#9b7e46] shrink-0 mt-0.5" />
              <div>
                <strong className="font-serif text-sm text-[#141210] block">Paris • Place Vendôme (Headquarters)</strong>
                <p>12 Place Vendôme, 75001 Paris, France</p>
                <p className="text-[11px] text-[#73685a]">Mon–Sat: 10:00 – 19:00 CET</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#9b7e46] shrink-0 mt-0.5" />
              <div>
                <strong className="font-serif text-sm text-[#141210] block">New York • Madison Avenue</strong>
                <p>740 Madison Avenue, New York, NY 10065, USA</p>
                <p className="text-[11px] text-[#73685a]">Mon–Sat: 10:00 – 18:00 EST</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#9b7e46] shrink-0 mt-0.5" />
              <div>
                <strong className="font-serif text-sm text-[#141210] block">London • New Bond Street</strong>
                <p>144 New Bond Street, Mayfair, London W1S 2PF, UK</p>
                <p className="text-[11px] text-[#73685a]">Mon–Sat: 10:00 – 18:30 GMT</p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#ebdccd] space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#9b7e46]" />
                <span className="font-mono text-[#141210] font-medium">{brandConfig.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#9b7e46]" />
                <span className="font-mono text-[#141210]">{brandConfig.conciergeEmail}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="lg:col-span-7 bg-[#faf8f5] border border-[#c5b49e]/40 p-6 sm:p-8 space-y-6">
          <h2 className="font-serif text-2xl text-[#141210] uppercase">
            Confidential Client Inquiry
          </h2>

          {isSent ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 bg-[#ede5d8] text-[#9b7e46] rounded-full flex items-center justify-center mx-auto">
                <Check className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl text-[#141210]">Inquiry Entrusted to Atelier</h3>
              <p className="text-xs text-[#73685a] max-w-sm mx-auto">
                Thank you for contacting Maison Aurelia. Our senior gemological team will review your message and reply promptly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Lady Catherine Sterling"
                    className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patron@domain.com"
                    className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                  Inquiry Topic
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none"
                >
                  <option>Private Gemstone Inquiry</option>
                  <option>Bespoke Commission & Design Modification</option>
                  <option>Consignment & Order Tracking</option>
                  <option>Atelier Consultation Request</option>
                  <option>Press & Editorial Inquiries</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                  Your Confidential Message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How may our gemologists assist your curation today..."
                  className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#141210] hover:bg-[#9b7e46] text-[#faf8f5] text-xs uppercase tracking-[0.2em] font-medium transition-colors"
              >
                Transmit Confidential Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
