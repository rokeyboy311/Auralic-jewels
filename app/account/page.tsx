'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  ShieldCheck,
  ArrowRight,
  Clock,
  Sparkles,
  FileCheck2,
  Lock,
  MessageSquare,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useChat } from '@/context/ChatContext';
import { Order, BespokeInquiry } from '@/lib/types';
import { getMyOrders, getBespokeInquiries } from '@/lib/api';

export default function AccountPage() {
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();
  const { formatPrice } = useCurrency();
  const { conversations, openChat, unreadCount } = useChat();
  const [activeTab, setActiveTab] = useState<'orders' | 'bespoke' | 'messages' | 'profile' | 'addresses'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [bespokeInquiries, setBespokeInquiries] = useState<BespokeInquiry[]>([]);

  useEffect(() => {
    async function loadUserData() {
      if (!user) return;
      try {
        const [ordersRes, bespokeRes] = await Promise.all([
          getMyOrders(),
          getBespokeInquiries(),
        ]);

        if (ordersRes.success && ordersRes.data) {
          setOrders(ordersRes.data);
        }

        if (bespokeRes.success && bespokeRes.data) {
          setBespokeInquiries(bespokeRes.data);
        }
      } catch (err) {
        console.error('Error loading account data:', err);
      }
    }
    loadUserData();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-14 h-14 bg-[#141210] text-[#d4af37] flex items-center justify-center rounded-full mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-3xl text-[#141210]">Customer Authentication Required</h1>
        <p className="text-xs text-[#73685a] leading-relaxed">
          Please sign in to access your private client portal, certified diamond dossiers, and bespoke commission records.
        </p>
        <div className="space-y-2 pt-2">
          <Link
            href="/login"
            className="block w-full py-3.5 bg-[#141210] hover:bg-[#9b7e46] text-[#faf8f5] text-xs uppercase tracking-[0.2em] font-medium transition-colors"
          >
            Sign In to Customer Profile
          </Link>
          <Link
            href="/"
            className="block text-xs text-[#73685a] hover:text-[#141210] pt-2"
          >
            Return to Atelier Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#ebdccd] pb-6">
        <div>
          <span className="text-[10px] tracking-[0.35em] text-[#9b7e46] uppercase font-semibold">
            Private Client Portal
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#141210] uppercase font-light">
            Welcome, {user.name}
          </h1>
          <p className="text-xs text-[#73685a] font-mono mt-0.5">{user.email}</p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              href="/admin"
              className="px-4 py-2 border border-[#9b7e46] text-[#9b7e46] text-xs uppercase tracking-wider hover:bg-[#9b7e46] hover:text-white transition-colors"
            >
              Atelier Control Center
            </Link>
          )}
          <button
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="px-4 py-2 bg-[#141210] text-[#faf8f5] text-xs uppercase tracking-wider hover:bg-[#9b7e46] transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <aside className="space-y-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-4 py-3 text-xs uppercase tracking-widest transition-colors ${
              activeTab === 'orders'
                ? 'bg-[#141210] text-[#faf8f5] font-semibold'
                : 'bg-white hover:bg-[#ede5d8] text-[#4a4237] border border-[#ebdccd]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#d4af37]" />
              <span>Acquisitions & Orders</span>
            </span>
            <span className="text-[10px] font-mono">({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bespoke')}
            className={`w-full flex items-center justify-between px-4 py-3 text-xs uppercase tracking-widest transition-colors ${
              activeTab === 'bespoke'
                ? 'bg-[#141210] text-[#faf8f5] font-semibold'
                : 'bg-white hover:bg-[#ede5d8] text-[#4a4237] border border-[#ebdccd]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              <span>Bespoke Dossiers</span>
            </span>
            <span className="text-[10px] font-mono">({bespokeInquiries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center justify-between px-4 py-3 text-xs uppercase tracking-widest transition-colors ${
              activeTab === 'messages'
                ? 'bg-[#141210] text-[#faf8f5] font-semibold'
                : 'bg-white hover:bg-[#ede5d8] text-[#4a4237] border border-[#ebdccd]'
            }`}
          >
            <span className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#d4af37]" />
              <span>Atelier Inquiries & Chat</span>
            </span>
            {unreadCount > 0 ? (
              <span className="px-1.5 py-0.5 bg-rose-600 text-white rounded-full text-[9px] font-bold">
                {unreadCount}
              </span>
            ) : (
              <span className="text-[10px] font-mono">({conversations.length})</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center justify-between px-4 py-3 text-xs uppercase tracking-widest transition-colors ${
              activeTab === 'profile'
                ? 'bg-[#141210] text-[#faf8f5] font-semibold'
                : 'bg-white hover:bg-[#ede5d8] text-[#4a4237] border border-[#ebdccd]'
            }`}
          >
            <span className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#d4af37]" />
              <span>Customer Identity</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center justify-between px-4 py-3 text-xs uppercase tracking-widest transition-colors ${
              activeTab === 'addresses'
                ? 'bg-[#141210] text-[#faf8f5] font-semibold'
                : 'bg-white hover:bg-[#ede5d8] text-[#4a4237] border border-[#ebdccd]'
            }`}
          >
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#d4af37]" />
              <span>Vault Residences</span>
            </span>
          </button>
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-3">
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-serif text-2xl text-[#141210] uppercase">
                  Insured Consignments & History
                </h2>
                <Link
                  href="/shop"
                  className="text-xs text-[#9b7e46] hover:underline uppercase tracking-wider font-semibold"
                >
                  Acquire New Piece →
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white p-12 text-center border border-[#ebdccd] space-y-3">
                  <Package className="w-10 h-10 text-[#c5b49e] mx-auto" />
                  <p className="font-serif text-lg text-[#141210]">No acquisitions found in ledger</p>
                  <p className="text-xs text-[#73685a]">
                    Explore our certified Solitaires, Royal Emeralds, and High Jewellery creations.
                  </p>
                  <Link
                    href="/shop"
                    className="inline-block mt-2 px-6 py-2.5 bg-[#141210] text-white text-xs uppercase tracking-widest hover:bg-[#9b7e46] transition-colors"
                  >
                    View Catalogue
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white border border-[#ebdccd] p-6 space-y-4 shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#ebdccd]/60 pb-4">
                        <div>
                          <span className="text-[10px] tracking-widest text-[#9b7e46] uppercase font-mono">
                            {ord.orderNumber}
                          </span>
                          <p className="text-xs text-[#73685a] mt-0.5">
                            Acquired on {new Date(ord.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 text-[11px] uppercase tracking-wider font-semibold rounded-xs ${
                              ord.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-900'
                                : ord.status === 'in_transit' || ord.status === 'shipped'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-stone-100 text-stone-800'
                            }`}
                          >
                            {ord.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-[#ebdccd]/40">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 relative bg-[#f5ede3] border border-[#ebdccd] shrink-0">
                                <Image
                                  src={it.image}
                                  alt={it.name}
                                  fill
                                  className="object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div>
                                <p className="font-serif text-sm text-[#141210] font-medium">{it.name}</p>
                                <p className="text-[10px] text-[#73685a]">
                                  {it.metalType} ({it.purity}) • {it.size || 'Standard'}
                                  {it.engravingText && ` • Inscription: "${it.engravingText}"`}
                                </p>
                                {it.certificateNumber && (
                                  <div className="inline-flex items-center gap-1 text-[10px] text-[#9b7e46] mt-0.5 font-mono">
                                    <FileCheck2 className="w-3 h-3" />
                                    <span>Cert: {it.certificateNumber}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-serif text-sm">{formatPrice(it.unitPriceUSD)}</p>
                              <p className="text-[10px] text-[#73685a]">Qty: {it.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Footer & Tracking */}
                      <div className="pt-4 border-t border-[#ebdccd]/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs bg-[#faf8f5] p-3">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-[#73685a] uppercase tracking-wider block">
                            Security Courier Transit
                          </span>
                          <p className="font-mono text-[#141210]">
                            {ord.carrierName || 'Ferrari Group Valuables'} • Docket: {ord.trackingNumber || 'Pending'}
                          </p>
                        </div>
                        <div className="text-right sm:text-right">
                          <span className="text-[10px] text-[#73685a] uppercase tracking-wider block">
                            Total Investment
                          </span>
                          <span className="font-serif text-base text-[#141210] font-medium">
                            {formatPrice(ord.totalUSD)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BESPOKE DOSSIERS */}
          {activeTab === 'bespoke' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-serif text-2xl text-[#141210] uppercase">
                  Private Bespoke Commissions
                </h2>
                <Link
                  href="/custom-jewellery"
                  className="text-xs text-[#9b7e46] hover:underline uppercase tracking-wider font-semibold"
                >
                  Request New Commission →
                </Link>
              </div>

              {bespokeInquiries.length === 0 ? (
                <div className="bg-white p-12 text-center border border-[#ebdccd] space-y-3">
                  <Sparkles className="w-10 h-10 text-[#c5b49e] mx-auto" />
                  <p className="font-serif text-lg text-[#141210]">No active bespoke dossiers</p>
                  <p className="text-xs text-[#73685a]">
                    Collaborate with our Paris Place Vendôme master jewelers to forge your one-of-a-kind heirloom.
                  </p>
                  <Link
                    href="/custom-jewellery"
                    className="inline-block mt-2 px-6 py-2.5 bg-[#141210] text-white text-xs uppercase tracking-widest hover:bg-[#9b7e46] transition-colors"
                  >
                    Initiate Custom Commission
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bespokeInquiries.map((inq) => (
                    <div key={inq.id} className="bg-white border border-[#ebdccd] p-6 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] text-[#9b7e46] uppercase tracking-widest font-mono">
                            {inq.referenceNumber}
                          </span>
                          <h4 className="font-serif text-lg text-[#141210]">
                            Bespoke {inq.category} Commission
                          </h4>
                          <p className="text-xs text-[#73685a]">
                            Submitted on {new Date(inq.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-[#ede5d8] text-[#9b7e46] text-xs uppercase tracking-wider font-semibold">
                          {inq.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-[#faf8f5] text-xs">
                        <div>
                          <span className="text-[#73685a] block text-[10px] uppercase">Metal</span>
                          <span className="font-medium text-[#141210]">{inq.metalPreference} ({inq.purityPreference})</span>
                        </div>
                        <div>
                          <span className="text-[#73685a] block text-[10px] uppercase">Gemstone</span>
                          <span className="font-medium text-[#141210]">{inq.stonePreference}</span>
                        </div>
                        <div>
                          <span className="text-[#73685a] block text-[10px] uppercase">Target Budget</span>
                          <span className="font-medium text-[#9b7e46]">{inq.targetBudgetUSD}</span>
                        </div>
                      </div>

                      <p className="text-xs text-[#4a4237] leading-relaxed pt-1">
                        {inq.designDescription}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ATELIER CHATS & INQUIRIES */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-serif text-2xl text-[#141210] uppercase">
                    Atelier Inquiries & Direct Messages
                  </h2>
                  <p className="text-xs text-[#73685a]">
                    Communicate directly with Master Jewellers and Gemologists regarding customizations, sizing, and private orders.
                  </p>
                </div>
                <button
                  onClick={() => openChat({ subject: 'Direct Master Jeweller Consultation', initialMessage: 'Greetings, I would like to consult with an Atelier specialist.' })}
                  className="px-4 py-2.5 bg-[#141210] hover:bg-[#9b7e46] text-white text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>New Inquiry</span>
                </button>
              </div>

              {conversations.length === 0 ? (
                <div className="bg-white p-12 text-center border border-[#ebdccd] space-y-3">
                  <MessageSquare className="w-10 h-10 text-[#c5b49e] mx-auto" />
                  <p className="font-serif text-lg text-[#141210]">No Active Atelier Conversations</p>
                  <p className="text-xs text-[#73685a] max-w-md mx-auto">
                    You have no active message threads. You can inquire directly about custom engravings, 950 platinum alloys, or custom diamond weights anytime.
                  </p>
                  <button
                    onClick={() => openChat()}
                    className="inline-block mt-2 px-6 py-2.5 bg-[#141210] text-white text-xs uppercase tracking-widest hover:bg-[#9b7e46] transition-colors"
                  >
                    Open Atelier Concierge
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className="bg-white border border-[#ebdccd] p-6 space-y-4 shadow-xs hover:border-[#9b7e46] transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#ebdccd]/60 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-semibold text-[#9b7e46]">
                            {conv.ticketNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[9px] uppercase font-mono tracking-wider font-semibold ${
                              conv.status === 'OPEN'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : conv.status === 'IN_PROGRESS'
                                ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                : conv.status === 'WAITING_FOR_USER'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {conv.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#73685a]">
                          Updated {new Date(conv.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-serif text-base text-[#141210] font-medium">
                          {conv.subject}
                        </h3>
                        <p className="text-xs text-[#594f43] mt-1 line-clamp-2">
                          {conv.messages[conv.messages.length - 1]?.content}
                        </p>
                      </div>

                      {conv.productContext && (
                        <div className="flex items-center gap-3 p-3 bg-[#faf8f5] border border-[#ebdccd] text-xs">
                          <div className="w-10 h-10 relative bg-[#ebdccd] shrink-0">
                            <Image
                              src={conv.productContext.image}
                              alt={conv.productContext.productName}
                              fill
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <span className="font-medium text-[#141210] block">{conv.productContext.productName}</span>
                            <span className="text-[10px] text-[#73685a]">
                              SKU: {conv.productContext.sku} • {conv.productContext.selectedMetal || '18K Gold'}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs text-[#73685a]">
                          Assigned: <strong className="text-[#141210]">{conv.assignedStaffName || 'Master Jeweller'}</strong>
                        </span>

                        <button
                          onClick={() => openChat({ conversationId: conv.id })}
                          className="px-4 py-2 bg-[#141210] hover:bg-[#9b7e46] text-white text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#d4af37]" />
                          <span>Open Conversation</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-lg">
              <h2 className="font-serif text-2xl text-[#141210] uppercase">Customer Identity</h2>
              <div className="space-y-3 text-xs bg-white p-6 border border-[#ebdccd]">
                <div>
                  <span className="text-[#73685a] uppercase tracking-wider block">Full Name</span>
                  <p className="font-serif text-base text-[#141210]">{user.name}</p>
                </div>
                <div>
                  <span className="text-[#73685a] uppercase tracking-wider block">Registered Email</span>
                  <p className="font-mono text-sm text-[#141210]">{user.email}</p>
                </div>
                <div>
                  <span className="text-[#73685a] uppercase tracking-wider block">Private Phone</span>
                  <p className="font-mono text-sm text-[#141210]">{user.phone || '+1 (212) 555-0199'}</p>
                </div>
                <div>
                  <span className="text-[#73685a] uppercase tracking-wider block">Maison Membership</span>
                  <p className="text-[#9b7e46] uppercase tracking-wider font-semibold">
                    {user.role === 'admin' ? 'Atelier Administrator' : 'Haute Joaillerie Customer'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl text-[#141210] uppercase">
                Registered Delivery Residences
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 border border-[#c5b49e]/40 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-serif text-sm text-[#141210] font-medium">
                      Primary Residence (Default)
                    </span>
                    <span className="bg-[#ede5d8] text-[#9b7e46] text-[10px] px-2 py-0.5 uppercase">
                      Default
                    </span>
                  </div>
                  <p className="text-[#4a4237] leading-relaxed">
                    740 Park Avenue, Penthouse 14B
                    <br />
                    New York, NY 10021
                    <br />
                    United States
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
