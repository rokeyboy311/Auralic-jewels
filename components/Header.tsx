'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Heart, ShoppingBag, User, Menu, X, ShieldCheck, ChevronDown, Sparkles } from 'lucide-react';
import { brandConfig } from '@/lib/brandConfig';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { CurrencyCode } from '@/lib/types';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenAuth: () => void;
  onOpenAppointment: () => void;
}

export default function Header({ onOpenSearch, onOpenAuth, onOpenAppointment }: HeaderProps) {
  const pathname = usePathname();
  const { currentCurrency, setCurrency, currencies } = useCurrency();
  const { openCart, itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  const navLinks = [
    { label: '3D Studio', href: '/bespoke-3d' },
    { label: 'Collections', href: '/collections' },
    { label: 'Rings', href: '/categories/rings' },
    { label: 'Necklaces', href: '/categories/necklaces' },
    { label: 'Earrings', href: '/categories/earrings' },
    { label: 'Bracelets', href: '/categories/bracelets' },
    { label: 'Bespoke', href: '/custom-jewellery' },
    { label: 'Heritage', href: '/about' },
    { label: 'Catalogue', href: '/shop' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FDFCF8]/95 backdrop-blur-md border-b border-black/5 transition-all duration-300">
      {/* Top Announcement & Service Bar */}
      <div className="bg-[#1A1A1A] text-[#F5F2ED] text-xs py-2 px-4 sm:px-12 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="hidden sm:inline">Complimentary Armored Courier • 30-Day Insured Privilege Returns</span>
          <span className="sm:hidden">Insured Worldwide Courier</span>
        </div>

        <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest font-medium">
          <button
            onClick={onOpenAppointment}
            className="hidden md:flex items-center gap-1.5 text-[#C5A059] hover:text-white transition-colors"
          >
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            <span>Private Modification</span>
          </button>

          {/* Dynamic Currency Switcher */}
          <div className="relative">
            <button
              onClick={() => setCurrencyDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1 font-sans text-white/90 hover:text-[#C5A059] transition-colors py-0.5"
              aria-label="Change currency"
            >
              <span>{currentCurrency}</span>
              <ChevronDown className="w-3 h-3 text-[#C5A059]" />
            </button>

            {currencyDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-28 bg-[#1A1A1A] border border-[#C5A059]/40 shadow-2xl py-1 z-50">
                {currencies.map((curr) => (
                  <button
                    key={curr.code}
                    onClick={() => {
                      setCurrency(curr.code as CurrencyCode);
                      setCurrencyDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-[11px] flex items-center justify-between hover:bg-white/10 transition-colors ${
                      currentCurrency === curr.code ? 'text-[#C5A059] font-semibold' : 'text-[#F5F2ED]'
                    }`}
                  >
                    <span>{curr.code}</span>
                    <span className="text-[#C5A059]/80 text-[10px]">{curr.symbol}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar — Single Row, 3-Zone Architecture */}
      <div className="max-w-7xl mx-auto px-4 sm:px-12 h-20 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark Brand Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-1.5 text-[#1A1A1A] hover:text-[#C5A059] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link href="/" className="group flex flex-col items-start focus-visible:outline-none">
            <span className="serif text-2xl sm:text-3xl tracking-[0.3em] text-[#1A1A1A] font-light group-hover:text-[#C5A059] transition-colors uppercase">
              {brandConfig.shortName}
            </span>
            <span className="text-[8px] tracking-[0.45em] text-[#C5A059] uppercase font-medium">
              Haute Joaillerie Paris
            </span>
          </Link>
        </div>

        {/* Zone 2: Navigation Links (single-line, desktop) */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[11px] uppercase tracking-widest font-medium transition-colors whitespace-nowrap ${
                  isActive ? 'text-[#C5A059] border-b border-[#C5A059] pb-0.5' : 'text-[#1A1A1A]/80 hover:text-[#C5A059]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions (Search, Wishlist, Account, Bag) */}
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          <button
            onClick={onOpenSearch}
            className="p-2 text-[#1A1A1A] hover:text-[#C5A059] transition-colors"
            aria-label="Search Fine Jewellery"
          >
            <Search className="w-4 h-4" />
          </button>

          <Link
            href="/wishlist"
            className="p-2 text-[#1A1A1A] hover:text-[#C5A059] transition-colors relative"
            aria-label={`View Wishlist (${wishlistCount} items)`}
          >
            <Heart className="w-4 h-4" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#C5A059] text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-serif italic">
                {wishlistCount}
              </span>
            )}
          </Link>

          {user ? (
            <Link
              href="/account"
              className="p-2 text-[#1A1A1A] hover:text-[#C5A059] transition-colors"
              aria-label="View Account"
            >
              <User className="w-4 h-4" />
            </Link>
          ) : (
            <button
              onClick={onOpenAuth}
              className="p-2 text-[#1A1A1A] hover:text-[#C5A059] transition-colors"
              aria-label="Sign in to your account"
            >
              <User className="w-4 h-4" />
            </button>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className="hidden md:inline-flex px-2.5 py-1 text-[9px] uppercase tracking-widest bg-[#1A1A1A] text-[#C5A059] border border-[#C5A059]/40 hover:bg-[#C5A059] hover:text-white transition-colors"
            >
              Workshop Admin
            </Link>
          )}

          <button
            onClick={openCart}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#1A1A1A] text-white hover:bg-[#C5A059] transition-colors relative"
            aria-label={`Open Bag with ${itemCount} items`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-widest font-medium hidden sm:inline">Bag</span>
            {itemCount > 0 && (
              <span className="bg-[#C5A059] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-serif italic ml-0.5">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FDFCF8] border-b border-black/10 px-6 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs uppercase tracking-widest py-1.5 text-[#1A1A1A] hover:text-[#C5A059] font-medium border-b border-black/5"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs uppercase tracking-widest py-1.5 text-[#C5A059] font-semibold border-b border-black/5"
              >
                Salon Admin Console
              </Link>
            )}
          </nav>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAppointment();
              }}
              className="w-full py-2.5 bg-[#1A1A1A] text-white text-xs uppercase tracking-widest hover:bg-[#C5A059] transition-colors"
            >
              Book Private Modification
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
