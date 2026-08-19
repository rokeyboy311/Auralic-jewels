'use client';

import React, { useState } from 'react';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { ChatProvider } from '@/context/ChatContext';
import Header from '@/components/Header';
import CartDrawer from '@/components/CartDrawer';
import SearchModal from '@/components/SearchModal';
import AuthModal from '@/components/AuthModal';
import ConciergeAppointmentModal from '@/components/ConciergeAppointmentModal';
import AtelierConciergeChat from '@/components/AtelierConciergeChat';
import Footer from '@/components/Footer';

export default function LayoutClientWrapper({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);

  return (
    <ToastProvider>
      <AuthProvider>
        <CurrencyProvider>
          <CartProvider>
            <WishlistProvider>
              <ChatProvider>
                <div className="flex flex-col min-h-screen">
                  <Header
                    onOpenSearch={() => setIsSearchOpen(true)}
                    onOpenAuth={() => setIsAuthOpen(true)}
                    onOpenAppointment={() => setIsAppointmentOpen(true)}
                  />
                  <main className="flex-1">{children}</main>
                  <Footer />

                  {/* Overlays & Drawers */}
                  <CartDrawer />
                  <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
                  <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
                  <ConciergeAppointmentModal
                    isOpen={isAppointmentOpen}
                    onClose={() => setIsAppointmentOpen(false)}
                  />
                  <AtelierConciergeChat />
                </div>
              </ChatProvider>
            </WishlistProvider>
          </CartProvider>
        </CurrencyProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
