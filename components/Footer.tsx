'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { brandConfig } from '@/lib/brandConfig';
import { ShieldCheck, MapPin, ArrowRight, Check } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { success } = useToast();

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setIsSubscribed(true);
    success('Maison Auralic Gazette', 'You have been enrolled for private collection previews and salon invitations.');
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-[#1A1A1A] text-[#F5F2ED] pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-12 space-y-16">
        {/* Artistic Flair Service Ribbon */}
        <div className="h-auto sm:h-20 py-4 px-6 sm:px-10 border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 bg-[#211E1B]">
          <div className="flex flex-wrap gap-8 sm:gap-16 items-center">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-[0.3em] text-[#C5A059] font-medium mb-0.5">
                Global Shipping
              </span>
              <span className="text-[11px] font-medium tracking-wide text-white/90">Complimentary Express Armored Courier</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-[0.3em] text-[#C5A059] font-medium mb-0.5">
                Certified Quality
              </span>
              <span className="text-[11px] font-medium tracking-wide text-white/90">GIA & IGI Accredited Gemology</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 sm:gap-6 items-center">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-[#C5A059] border border-[#1A1A1A] flex items-center justify-center text-[8px] font-serif text-white">A</div>
              <div className="w-6 h-6 rounded-full bg-[#D4AF37] border border-[#1A1A1A] flex items-center justify-center text-[8px] font-serif text-white">U</div>
              <div className="w-6 h-6 rounded-full bg-[#B89047] border border-[#1A1A1A] flex items-center justify-center text-[8px] font-serif text-white">R</div>
            </div>
            <span className="text-[11px] font-medium italic text-white/80">Join 12k Global Collectors</span>
            <div className="hidden sm:block h-6 w-[1px] bg-white/20 mx-2"></div>
            <Link
              href="/jewellery-guide"
              className="text-[11px] uppercase tracking-widest font-bold text-[#C5A059] border-b border-[#C5A059] hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors pb-0.5"
            >
              The Private Journal
            </Link>
          </div>
        </div>

        {/* Brand Statement & Newsletter Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12 border-b border-white/10">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#C5A059] font-semibold">
              Maison de Haute Joaillerie
            </span>
            <h3 className="serif text-3xl sm:text-4xl text-white tracking-[0.2em] uppercase font-light">
              {brandConfig.name}
            </h3>
            <p className="text-xs sm:text-sm text-white/70 max-w-lg leading-relaxed font-light">
              Founded at Place Vendôme, Maison Auralic curates exceptional certified natural diamonds, rare untreated Colombian emeralds, and bespoke 18K/22K gold heirlooms. Each piece is hallmarked with individual serial certification and lifetime authenticity.
            </p>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-center bg-[#211E1B] p-6 sm:p-8 border border-white/10">
            <h4 className="serif text-xl text-white tracking-wide">
              The Private Client Gazette
            </h4>
            <p className="text-xs text-white/70 mt-1 mb-4 leading-relaxed font-light">
              Receive private invitations to confidential high-jewellery vernissages and private salon appointments.
            </p>

            {isSubscribed ? (
              <div className="flex items-center gap-2 text-xs text-[#C5A059] bg-black/40 p-3 border border-[#C5A059]/40">
                <Check className="w-4 h-4" />
                <span>Your private customerage invitation has been registered.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex gap-2">
                <label htmlFor="newsletter-email-input" className="sr-only">
                  Confidential Email Address for Private Invitations
                </label>
                <input
                  id="newsletter-email-input"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your confidential email..."
                  className="flex-1 bg-[#1A1A1A] border border-white/20 px-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#C5A059]"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#C5A059] hover:bg-[#D4AF37] text-[#1A1A1A] text-[10px] uppercase tracking-[0.2em] font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Multi-Column Luxury Navigation Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 text-xs">
          {/* Col 1: Haute Joaillerie */}
          <div className="space-y-3">
            <p className="serif text-sm uppercase tracking-widest text-[#C5A059]">
              Creations
            </p>
            <ul className="space-y-2 text-white/70">
              <li>
                <Link href="/categories/rings" className="hover:text-white transition-colors">
                  Solitaire Rings
                </Link>
              </li>
              <li>
                <Link href="/categories/necklaces" className="hover:text-white transition-colors">
                  High Diamond Collars
                </Link>
              </li>
              <li>
                <Link href="/categories/earrings" className="hover:text-white transition-colors">
                  Chandelier & Studs
                </Link>
              </li>
              <li>
                <Link href="/categories/bracelets" className="hover:text-white transition-colors">
                  Tennis Bracelets
                </Link>
              </li>
              <li>
                <Link href="/categories/bangles" className="hover:text-white transition-colors">
                  22K Gold Bangles
                </Link>
              </li>
              <li>
                <Link href="/categories/mens-jewellery" className="hover:text-white transition-colors">
                  Men’s High Signets
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Collections & Atelier */}
          <div className="space-y-3">
            <p className="serif text-sm uppercase tracking-widest text-[#C5A059]">
              The Atelier
            </p>
            <ul className="space-y-2 text-white/70">
              <li>
                <Link href="/collections/solitaire-masterpieces" className="hover:text-white transition-colors">
                  Solitaire Masterpieces
                </Link>
              </li>
              <li>
                <Link href="/collections/royal-emerald" className="hover:text-white transition-colors">
                  The Royal Emerald
                </Link>
              </li>
              <li>
                <Link href="/collections/heritage-gold" className="hover:text-white transition-colors">
                  Heritage 22K Solid Gold
                </Link>
              </li>
              <li>
                <Link href="/custom-jewellery" className="hover:text-white transition-colors">
                  Bespoke Commissions
                </Link>
              </li>
              <li>
                <Link href="/our-story" className="hover:text-white transition-colors">
                  Maison Heritage
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Client Care & Education */}
          <div className="space-y-3">
            <p className="serif text-sm uppercase tracking-widest text-[#C5A059]">
              Client Care
            </p>
            <ul className="space-y-2 text-white/70">
              <li>
                <Link href="/jewellery-guide" className="hover:text-white transition-colors">
                  The 4Cs Diamond Guide
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="hover:text-white transition-colors">
                  International Ring Sizing
                </Link>
              </li>
              <li>
                <Link href="/materials-care" className="hover:text-white transition-colors">
                  Care & Maintenance
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-white transition-colors">
                  Track Consignment
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Private Customer FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Policies */}
          <div className="space-y-3">
            <p className="serif text-sm uppercase tracking-widest text-[#C5A059]">
              Maison Policies
            </p>
            <ul className="space-y-2 text-white/70">
              <li>
                <Link href="/shipping-policy" className="hover:text-white transition-colors">
                  Armored Air Courier
                </Link>
              </li>
              <li>
                <Link href="/returns-refunds" className="hover:text-white transition-colors">
                  30-Day Returns & Privilege
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  Client Privacy Charter
                </Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="hover:text-white transition-colors">
                  Terms of Acquisition
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#C5A059] transition-colors">
                  Atelier Staff Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Global Boutiques */}
          <div className="col-span-2 sm:col-span-1 space-y-3">
            <p className="serif text-sm uppercase tracking-widest text-[#C5A059]">
              Ateliers & Flagships
            </p>
            <div className="space-y-2 text-white/70">
              <p>
                <strong className="text-white">Paris:</strong> 12 Place Vendôme
              </p>
              <p>
                <strong className="text-white">New York:</strong> 740 Madison Ave
              </p>
              <p>
                <strong className="text-white">London:</strong> 44 Old Bond St
              </p>
              <p>
                <strong className="text-white">Dubai:</strong> Fashion Avenue
              </p>
              <div className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1 text-[#C5A059] hover:underline"
                >
                  <MapPin className="w-3 h-3" />
                  <span>Salon Appointments</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Kimberley Certification, Socials */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
            <span>
              100% Conflict-Free Kimberley Process Diamonds • GIA Certified • Responsible Jewellery Council Member
            </span>
          </div>

          <div className="flex items-center gap-6">
            <span>© {new Date().getFullYear()} {brandConfig.name}. All Rights Reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
