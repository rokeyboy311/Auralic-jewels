'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  TrendingUp,
  Package,
  Users,
  AlertTriangle,
  Plus,
  Trash2,
  Edit,
  Truck,
  CheckCircle2,
  RefreshCw,
  Search,
  Lock,
  ArrowRight,
  ShieldCheck,
  FileText,
  Sparkles,
  MessageSquare,
  Send,
  UserCheck,
  Paperclip,
  Clock,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Product, Order, BespokeInquiry, Conversation, ConversationMessage, AtelierStaff, ConversationStatus, ConversationPriority } from '@/lib/types';
import {
  getAdminStats,
  getAdminOrders,
  updateOrderStatus,
  getProducts,
  saveAdminProduct,
  deleteAdminProduct,
  getBespokeInquiries,
  getConversations,
  getConversation,
  sendConversationMessage,
  updateConversation,
  getStaffDirectory,
} from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/context/ToastContext';

export default function AdminDashboardPage() {
  const { user, isAdmin, login } = useAuth();
  const { formatPrice } = useCurrency();
  const { success, error } = useToast();

  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [bespokeInquiries, setBespokeInquiries] = useState<BespokeInquiry[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [staffList, setStaffList] = useState<AtelierStaff[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'bespoke' | 'chat' | 'staff'>('orders');
  const [isLoading, setIsLoading] = useState(true);

  // Chat management state
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [chatSearch, setChatSearch] = useState('');
  const [chatStatusFilter, setChatStatusFilter] = useState('ALL');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Status updating state
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<any>('shipped');
  const [carrierInput, setCarrierInput] = useState<string>('Ferrari Group Valuables');
  const [trackingInput, setTrackingInput] = useState<string>('');

  // Product modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodPriceUSD, setProdPriceUSD] = useState<number>(8500);
  const [prodCategory, setProdCategory] = useState('Rings');
  const [prodMetal, setProdMetal] = useState('Yellow Gold');
  const [prodPurity, setProdPurity] = useState('18K');
  const [prodStone, setProdStone] = useState('Natural Diamond');
  const [prodStoneCarats, setProdStoneCarats] = useState<number>(2.5);
  const [prodCertIssuer, setProdCertIssuer] = useState('GIA');
  const [prodCertNumber, setProdCertNumber] = useState('GIA-2184910482');
  const [prodStock, setProdStock] = useState<number>(5);
  const [prodGrossWeight, setProdGrossWeight] = useState<number>(4.8);
  const [prodImage, setProdImage] = useState('');
  const [prodDesc, setProdDesc] = useState('');

  const loadAll = async () => {
    try {
      const [statsRes, ordersRes, prodsRes, bespokeRes, convsRes, staffRes] = await Promise.all([
        getAdminStats(),
        getAdminOrders(),
        getProducts({ limit: 50 }),
        getBespokeInquiries(),
        getConversations(),
        getStaffDirectory(),
      ]);
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (ordersRes.success && ordersRes.data) setOrders(ordersRes.data);
      if (prodsRes.success && prodsRes.data) setProducts(prodsRes.data);
      if (bespokeRes.success && bespokeRes.data) setBespokeInquiries(bespokeRes.data);
      if (convsRes.success && convsRes.data) {
        setConversations(convsRes.data);
        if (convsRes.data.length > 0 && !selectedConversation) {
          setSelectedConversation(convsRes.data[0]);
        }
      }
      if (staffRes.success && staffRes.data) setStaffList(staffRes.data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChat = async (id: string) => {
    const res = await getConversation(id, 'admin');
    if (res.success && res.data) {
      setSelectedConversation(res.data);
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...res.data!, unreadByAdminCount: 0 } : c))
      );
    }
  };

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !adminReplyText.trim() || isSendingReply) return;

    setIsSendingReply(true);
    try {
      const res = await sendConversationMessage(selectedConversation.id, {
        senderId: user?.id || 'usr-admin-01',
        senderName: user?.name || 'Maison Aurelia Atelier Director',
        senderRole: 'master_jeweller',
        content: adminReplyText.trim(),
        isInternalNote,
      });

      if (res.success && res.data) {
        const updated = res.data.conversation;
        setSelectedConversation(updated);
        setConversations((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
        setAdminReplyText('');
        success(
          isInternalNote ? 'Internal Note Saved' : 'Reply Dispatched',
          isInternalNote
            ? 'Private note recorded on conversation ledger.'
            : 'Response transmitted to client.'
        );
      } else {
        error('Dispatch Failed', res.error || 'Could not send message');
      }
    } catch {
      error('System Error', 'Could not record message');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleUpdateChatStatus = async (status: ConversationStatus) => {
    if (!selectedConversation) return;
    try {
      const res = await updateConversation(selectedConversation.id, { status });
      if (res.success && res.data) {
        setSelectedConversation(res.data);
        setConversations((prev) =>
          prev.map((c) => (c.id === res.data!.id ? res.data! : c))
        );
        success('Status Updated', `Conversation status set to ${status}`);
      }
    } catch {
      error('Update Failed', 'Could not update conversation status');
    }
  };

  const handleAssignStaff = async (staffId: string, staffName: string) => {
    if (!selectedConversation) return;
    try {
      const res = await updateConversation(selectedConversation.id, {
        assignedStaffId: staffId,
        assignedStaffName: staffName,
      });
      if (res.success && res.data) {
        setSelectedConversation(res.data);
        setConversations((prev) =>
          prev.map((c) => (c.id === res.data!.id ? res.data! : c))
        );
        success('Staff Assigned', `Inquiry assigned to ${staffName}`);
      }
    } catch {
      error('Assignment Failed', 'Could not assign staff member');
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      await loadAll();
      if (isMounted) setIsLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleStatusUpdate = async (orderId: string) => {
    try {
      const res = await updateOrderStatus(orderId, newStatus, trackingInput || 'FG-VAL-2026-98104', carrierInput);
      if (res.success && res.data) {
        const updated = res.data;
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
        setEditingOrderId(null);
        success('Consignment Status Updated', `Order ${updated.orderNumber} is now marked as ${newStatus}.`);
      } else {
        error('Update Failed', res.error || 'Could not update order status.');
      }
    } catch {
      error('Update Error', 'Could not communicate with the atelier server.');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = prodName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newProductPayload = {
        id: `prod-${Date.now()}`,
        name: prodName,
        slug,
        sku: `AUR-JW-${Date.now().toString().slice(-4)}`,
        brand: 'Maison Aurelia',
        category: prodCategory as any,
        collection: 'Solitaire Masterpieces',
        gender: 'Women' as const,
        shortDescription: prodDesc || 'Handcrafted fine jewellery in solid gold and certified gemstones.',
        description: prodDesc || 'Exquisite masterpiece forged in our Paris Place Vendôme atelier with high-clarity gemstones.',
        priceUSD: Number(prodPriceUSD),
        currency: 'USD',
        metalType: prodMetal as any,
        purity: prodPurity as any,
        goldKarat: `${prodPurity} Solid Gold`,
        grossWeightGrams: Number(prodGrossWeight),
        netGoldWeightGrams: Math.round((Number(prodGrossWeight) * 0.9) * 10) / 10,
        hallmarkAssayOffice: 'Paris Assay Office Eagle Head Hallmark & Maison Atelier Stamp',
        stoneType: prodStone as any,
        stoneWeightCarats: Number(prodStoneCarats),
        totalCaratWeight: Number(prodStoneCarats),
        certification: {
          issuer: prodCertIssuer as any,
          certificateNumber: prodCertNumber,
          shape: 'Round Brilliant' as const,
          caratWeight: Number(prodStoneCarats),
          colorGrade: 'D' as const,
          clarityGrade: 'VVS1' as const,
          cutGrade: 'Ideal' as const,
        },
        stock: Number(prodStock),
        lowStockThreshold: 2,
        isReadyToShip: true,
        isMadeToOrder: false,
        productionLeadTimeDays: 2,
        estimatedDispatchHours: 24,
        countryOfOrigin: 'France (Paris Place Vendôme Atelier)',
        status: 'active' as const,
        images: [
          {
            id: `img-${Date.now()}`,
            url: prodImage || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85',
            alt: prodName,
            type: 'main' as const,
            sortOrder: 1,
          },
        ],
        careInstructions: 'Clean gently with lukewarm soapy water and soft-bristled brush.',
        shippingInformation: 'Complimentary insured worldwide armored courier (Ferrari Group / FedEx Priority).',
        returnEligibility: '30-Day Insured Return with security tags intact.',
        exchangeEligibility: 'Lifetime gold and diamond trade-up privilege.',
      };

      const res = await saveAdminProduct(newProductPayload);
      if (res.success && res.data) {
        setProducts([res.data, ...products]);
        setShowProductModal(false);
        setProdName('');
        setProdImage('');
        setProdDesc('');
        success('Product Published', `${res.data.name} is now active in the international catalogue.`);
      }
    } catch (err: any) {
      error('Creation Error', err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to retire this piece from the Maison active catalogue?')) return;
    const res = await deleteAdminProduct(id);
    if (res.success) {
      setProducts(products.filter((p) => p.id !== id));
      success('Product Retired', 'The piece has been archived.');
    }
  };

  const handleAdminAuth = async () => {
    await login('admin@aureliajewels.com', 'admin123');
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-14 h-14 bg-[#141210] text-[#d4af37] flex items-center justify-center rounded-full mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-3xl text-[#141210]">Atelier Administration Portal</h1>
        <p className="text-xs text-[#73685a] leading-relaxed">
          Access is strictly restricted to Maison Aurelia Gemologists, Directors, and Logistics Coordinators.
        </p>
        <button
          onClick={handleAdminAuth}
          className="w-full py-3.5 bg-[#141210] hover:bg-[#9b7e46] text-[#faf8f5] text-xs uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer"
        >
          Authenticate as Atelier Director
        </button>
        <p className="text-[11px] text-[#73685a]">
          Or sign in via the{' '}
          <Link href="/login" className="text-[#9b7e46] hover:underline font-medium">
            Patron Login Page
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#ebdccd] pb-6">
        <div>
          <span className="text-[10px] tracking-[0.35em] text-[#9b7e46] uppercase font-semibold">
            Maison Atelier Control Center
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#141210] uppercase font-light">
            Executive Operations
          </h1>
          <p className="text-xs text-[#73685a] font-mono mt-0.5">Paris Place Vendôme Atelier Node</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowProductModal(true)}
            className="px-4 py-2.5 bg-[#141210] hover:bg-[#9b7e46] text-[#faf8f5] text-xs uppercase tracking-wider font-medium flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#d4af37]" />
            <span>Create New Piece</span>
          </button>
          <button
            onClick={loadAll}
            className="p-2.5 border border-[#c5b49e]/60 text-[#141210] hover:bg-white transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 border border-[#ebdccd] space-y-2">
          <div className="flex justify-between items-center text-[#73685a]">
            <span className="text-[11px] uppercase tracking-wider">Gross Ledger Volume</span>
            <TrendingUp className="w-4 h-4 text-[#9b7e46]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl text-[#141210]">
            {formatPrice(stats?.totalRevenueUSD || 98450)}
          </p>
          <p className="text-[10px] text-[#73685a]">Worldwide Armored Transactions</p>
        </div>

        <div className="bg-white p-5 border border-[#ebdccd] space-y-2">
          <div className="flex justify-between items-center text-[#73685a]">
            <span className="text-[11px] uppercase tracking-wider">Consignments</span>
            <Package className="w-4 h-4 text-[#9b7e46]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl text-[#141210]">{orders.length}</p>
          <p className="text-[10px] text-[#73685a]">Active Orders in Pipeline</p>
        </div>

        <div className="bg-white p-5 border border-[#ebdccd] space-y-2">
          <div className="flex justify-between items-center text-[#73685a]">
            <span className="text-[11px] uppercase tracking-wider">Bespoke Inquiries</span>
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl text-[#141210]">{bespokeInquiries.length}</p>
          <p className="text-[10px] text-[#73685a]">Custom Atelier Requests</p>
        </div>

        <div className="bg-white p-5 border border-[#ebdccd] space-y-2">
          <div className="flex justify-between items-center text-[#73685a]">
            <span className="text-[11px] uppercase tracking-wider">Catalogue Pieces</span>
            <Users className="w-4 h-4 text-[#9b7e46]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl text-[#141210]">{products.length}</p>
          <p className="text-[10px] text-[#73685a]">Certified Fine Jewellery</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#c5b49e]/40 gap-4 sm:gap-6 text-xs uppercase tracking-widest font-medium overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'orders'
              ? 'border-[#141210] text-[#141210] font-semibold'
              : 'border-transparent text-[#73685a] hover:text-[#141210]'
          }`}
        >
          Orders & Consignments ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'products'
              ? 'border-[#141210] text-[#141210] font-semibold'
              : 'border-transparent text-[#73685a] hover:text-[#141210]'
          }`}
        >
          Catalogue & Gem Dossiers ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`pb-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'chat'
              ? 'border-[#141210] text-[#141210] font-semibold'
              : 'border-transparent text-[#73685a] hover:text-[#141210]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#9b7e46]" />
          <span>Atelier Concierge Desk ({conversations.length})</span>
          {conversations.reduce((sum, c) => sum + (c.unreadByAdminCount || 0), 0) > 0 && (
            <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[9px] font-bold">
              {conversations.reduce((sum, c) => sum + (c.unreadByAdminCount || 0), 0)}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('bespoke')}
          className={`pb-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'bespoke'
              ? 'border-[#141210] text-[#141210] font-semibold'
              : 'border-transparent text-[#73685a] hover:text-[#141210]'
          }`}
        >
          Bespoke Commissions ({bespokeInquiries.length})
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`pb-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'staff'
              ? 'border-[#141210] text-[#141210] font-semibold'
              : 'border-transparent text-[#73685a] hover:text-[#141210]'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-[#9b7e46]" />
          <span>Atelier Staff ({staffList.length})</span>
        </button>
      </div>

      {/* TAB 1: ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-[#ebdccd] overflow-hidden">
          <div className="p-4 border-b border-[#ebdccd] flex justify-between items-center bg-[#faf8f5]">
            <h3 className="font-serif text-lg text-[#141210]">International Consignment Dispatch</h3>
            <span className="text-xs text-[#73685a]">Real-Time Logistics Status</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#141210]">
              <thead className="bg-[#f5ede3] text-[#73685a] uppercase text-[10px] tracking-wider border-b border-[#ebdccd]">
                <tr>
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Patron & Destination</th>
                  <th className="py-3 px-4">Pieces</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Logistics Status</th>
                  <th className="py-3 px-4">Carrier & Tracking</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebdccd]/60">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#faf8f5]/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium">
                      <div>{ord.orderNumber}</div>
                      <div className="text-[10px] text-[#73685a]">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium">
                        {ord.shippingAddress.firstName} {ord.shippingAddress.lastName}
                      </div>
                      <div className="text-[10px] text-[#73685a]">
                        {ord.shippingAddress.city}, {ord.shippingAddress.country}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="max-w-[200px] truncate">{ord.items[0]?.name}</div>
                      {ord.items.length > 1 && (
                        <div className="text-[10px] text-[#9b7e46]">
                          +{ord.items.length - 1} additional piece(s)
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-serif text-sm">
                      {formatPrice(ord.totalUSD)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-xs ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'in_transit' || ord.status === 'shipped'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-stone-100 text-stone-800'
                        }`}
                      >
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#73685a]">
                      <div>{ord.carrierName || 'Ferrari Group Valuables'}</div>
                      <div className="text-[10px] text-[#9b7e46]">{ord.trackingNumber || 'Pending'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setEditingOrderId(ord.id);
                          setNewStatus(ord.status);
                          setTrackingInput(ord.trackingNumber || '');
                          setCarrierInput(ord.carrierName || 'Ferrari Group Valuables');
                        }}
                        className="px-3 py-1.5 bg-[#f5ede3] hover:bg-[#141210] hover:text-white text-xs uppercase tracking-wider transition-colors"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="bg-white border border-[#ebdccd] overflow-hidden">
          <div className="p-4 border-b border-[#ebdccd] flex justify-between items-center bg-[#faf8f5]">
            <h3 className="font-serif text-lg text-[#141210]">Fine Jewellery Inventory & Gemological Dossiers</h3>
            <span className="text-xs text-[#73685a]">{products.length} Active Items</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#141210]">
              <thead className="bg-[#f5ede3] text-[#73685a] uppercase text-[10px] tracking-wider border-b border-[#ebdccd]">
                <tr>
                  <th className="py-3 px-4">Piece</th>
                  <th className="py-3 px-4">Category & SKU</th>
                  <th className="py-3 px-4">Metal & Gold Purity</th>
                  <th className="py-3 px-4">Gemstone / GIA Certificate</th>
                  <th className="py-3 px-4">Gross Wt</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebdccd]/60">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#faf8f5]/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 relative bg-[#f5ede3] shrink-0 border border-[#ebdccd]">
                          <Image
                            src={p.images[0]?.url || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80'}
                            alt={p.name}
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <p className="font-serif text-sm font-medium text-[#141210]">{p.name}</p>
                          <p className="text-[10px] text-[#73685a]">{p.countryOfOrigin}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div>{p.category}</div>
                      <div className="text-[10px] text-[#73685a]">{p.sku}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium">{p.metalType}</div>
                      <div className="text-[10px] text-[#9b7e46]">{p.purity}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium">{p.stoneType} ({p.stoneWeightCarats || 0}ct)</div>
                      <div className="text-[10px] text-[#73685a]">
                        {p.certification?.certificateNumber || 'Atelier Hallmark'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {p.grossWeightGrams}g
                    </td>
                    <td className="py-3.5 px-4 font-serif text-sm font-medium">
                      {formatPrice(p.priceUSD)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-semibold ${
                          p.stock <= 2 ? 'bg-red-100 text-red-800' : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {p.stock} in stock
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 text-[#998b79] hover:text-red-700 transition-colors"
                        title="Retire Piece"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BESPOKE INQUIRIES */}
      {activeTab === 'bespoke' && (
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
      )}

      {/* TAB 4: ATELIER CONCIERGE & CHAT DESK */}
      {activeTab === 'chat' && (
        <div className="bg-white border border-[#ebdccd] overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#ebdccd] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#faf8f5]">
            <div>
              <h3 className="font-serif text-lg text-[#141210]">Haute Joaillerie Concierge & Chat Desk</h3>
              <p className="text-xs text-[#73685a]">
                Manage product modification requests, custom engravings, diamond carat queries, and VIP patron communications.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#73685a]">Status:</span>
              <select
                value={chatStatusFilter}
                onChange={(e) => setChatStatusFilter(e.target.value)}
                className="text-xs p-1.5 bg-white border border-[#ebdccd] text-[#141210] font-medium"
              >
                <option value="ALL">All Inquiries ({conversations.length})</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="WAITING_FOR_USER">Waiting for Patron</option>
                <option value="WAITING_FOR_ADMIN">Requires Staff Action</option>
                <option value="RESOLVED">Resolved / Complete</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
            {/* Conversations Sidebar (5 Cols) */}
            <div className="lg:col-span-5 border-r border-[#ebdccd] flex flex-col bg-[#faf8f5]/40">
              <div className="p-3 border-b border-[#ebdccd] bg-white">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#73685a] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search ticket #, patron name, or piece..."
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 bg-[#faf8f5] border border-[#ebdccd] text-[#141210] focus:border-[#9b7e46] outline-none"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-[#ebdccd]">
                {conversations
                  .filter((c) => {
                    if (chatStatusFilter !== 'ALL' && c.status !== chatStatusFilter) return false;
                    if (chatSearch.trim()) {
                      const q = chatSearch.toLowerCase();
                      return (
                        c.ticketNumber.toLowerCase().includes(q) ||
                        c.userName.toLowerCase().includes(q) ||
                        c.subject.toLowerCase().includes(q) ||
                        c.productContext?.productName.toLowerCase().includes(q)
                      );
                    }
                    return true;
                  })
                  .map((conv) => {
                    const isSelected = selectedConversation?.id === conv.id;

                    return (
                      <button
                        key={conv.id}
                        onClick={() => handleSelectChat(conv.id)}
                        className={`w-full text-left p-4 transition-colors flex flex-col gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-[#f2ece2] border-l-4 border-l-[#9b7e46]'
                            : 'bg-white hover:bg-[#faf8f5]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
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

                        <div className="flex items-center justify-between">
                          <span className="font-serif text-sm text-[#141210] font-medium">
                            {conv.userName}
                          </span>
                          <span className="text-[10px] text-[#8c7f70]">
                            {new Date(conv.updatedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <p className="text-xs text-[#594f43] line-clamp-1 font-medium">
                          {conv.subject}
                        </p>

                        {conv.productContext && (
                          <div className="flex items-center gap-2 p-1.5 bg-[#faf8f5] border border-[#ebdccd]/80 text-[10px] text-[#73685a]">
                            <Sparkles className="w-3 h-3 text-[#9b7e46] shrink-0" />
                            <span className="truncate">{conv.productContext.productName}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 border-t border-[#ebdccd]/50 text-[10px] text-[#73685a]">
                          <span>Assigned: {conv.assignedStaffName?.split(' ')[0] || 'Atelier'}</span>
                          {conv.unreadByAdminCount > 0 && (
                            <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded-full font-bold">
                              {conv.unreadByAdminCount} unread
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Conversation Active Thread (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col bg-white">
              {selectedConversation ? (
                <>
                  {/* Thread Controls Header */}
                  <div className="p-4 border-b border-[#ebdccd] bg-[#faf8f5] space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-[#9b7e46]">
                            {selectedConversation.ticketNumber}
                          </span>
                          <span className="text-xs text-[#73685a]">
                            • {selectedConversation.userName} ({selectedConversation.userEmail})
                          </span>
                        </div>
                        <h4 className="font-serif text-base text-[#141210] font-medium mt-0.5">
                          {selectedConversation.subject}
                        </h4>
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedConversation.status}
                          onChange={(e) => handleUpdateChatStatus(e.target.value as ConversationStatus)}
                          className="text-xs p-1.5 bg-white border border-[#ebdccd] text-[#141210] font-medium"
                        >
                          <option value="OPEN">Status: OPEN</option>
                          <option value="IN_PROGRESS">Status: IN_PROGRESS</option>
                          <option value="WAITING_FOR_USER">Status: WAITING_FOR_USER</option>
                          <option value="WAITING_FOR_ADMIN">Status: WAITING_FOR_ADMIN</option>
                          <option value="RESOLVED">Status: RESOLVED</option>
                          <option value="CLOSED">Status: CLOSED</option>
                        </select>
                      </div>
                    </div>

                    {/* Staff Assignment Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#ebdccd]/70 text-xs">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-[#9b7e46]" />
                        <span className="text-[#73685a]">Assignee:</span>
                        <select
                          value={selectedConversation.assignedStaffId || ''}
                          onChange={(e) => {
                            const staff = staffList.find((s) => s.id === e.target.value);
                            if (staff) handleAssignStaff(staff.id, staff.name);
                          }}
                          className="p-1 bg-white border border-[#ebdccd] text-xs font-medium text-[#141210]"
                        >
                          {staffList.map((stf) => (
                            <option key={stf.id} value={stf.id}>
                              {stf.name} ({stf.role.replace(/_/g, ' ')})
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedConversation.productContext && (
                        <Link
                          href={`/product/${selectedConversation.productContext.productSlug}`}
                          target="_blank"
                          className="text-xs text-[#9b7e46] hover:underline flex items-center gap-1"
                        >
                          <span>Inspect Piece Dossier</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Linked Product Context Card */}
                  {selectedConversation.productContext && (
                    <div className="p-3 bg-[#faf8f5] border-b border-[#ebdccd] flex items-center gap-3 text-xs">
                      <div className="w-12 h-12 relative bg-[#ebdccd] shrink-0 border border-[#ebdccd]">
                        <Image
                          src={selectedConversation.productContext.image}
                          alt={selectedConversation.productContext.productName}
                          fill
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-sm text-[#141210] font-medium truncate">
                          {selectedConversation.productContext.productName}
                        </p>
                        <p className="text-[11px] text-[#73685a]">
                          SKU: {selectedConversation.productContext.sku} • Metal:{' '}
                          {selectedConversation.productContext.selectedMetal || '18K Gold'} • Size:{' '}
                          {selectedConversation.productContext.selectedSize || 'US 7'} • Price:{' '}
                          {formatPrice(selectedConversation.productContext.priceUSD)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Messages Feed */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#faf8f5]/30 max-h-[360px]">
                    {selectedConversation.messages.map((msg) => {
                      const isCustomer = msg.senderRole === 'customer';
                      const isInternal = msg.isInternalNote;

                      return (
                        <div
                          key={msg.id}
                          className={`p-3 text-xs leading-relaxed ${
                            isInternal
                              ? 'bg-amber-50/80 border border-amber-300 text-amber-950 ml-4'
                              : isCustomer
                              ? 'bg-[#f4efe8] border border-[#ebdccd] text-[#141210] mr-4'
                              : 'bg-white border border-[#9b7e46]/40 text-[#141210] ml-4'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-black/5 text-[10px]">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#141210]">{msg.senderName}</span>
                              <span className="px-1 py-0.2 bg-stone-200 text-stone-800 uppercase font-mono">
                                {isInternal ? 'INTERNAL NOTE' : msg.senderRole.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <span className="text-[#8c7f70]">
                              {new Date(msg.createdAt).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          <p className="whitespace-pre-wrap">{msg.content}</p>

                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-black/5 space-y-1">
                              {msg.attachments.map((att) => (
                                <div
                                  key={att.id}
                                  className="flex items-center gap-2 p-1.5 bg-white border border-[#ebdccd] text-[11px]"
                                >
                                  <Paperclip className="w-3 h-3 text-[#9b7e46]" />
                                  <span className="font-mono text-[#141210]">{att.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Admin Reply Form */}
                  <form onSubmit={handleSendAdminReply} className="p-4 border-t border-[#ebdccd] bg-white space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isInternalNote}
                          onChange={(e) => setIsInternalNote(e.target.checked)}
                          className="accent-[#9b7e46]"
                        />
                        <span className={`text-[11px] font-medium ${isInternalNote ? 'text-amber-900 font-bold' : 'text-[#73685a]'}`}>
                          Internal Note (Visible only to Atelier Staff & Admins)
                        </span>
                      </label>

                      <div className="flex gap-1.5 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setAdminReplyText('Thank you for reaching out. We have confirmed with our Master Goldsmith that this custom modification in Solid 950 Platinum is scheduled.')}
                          className="px-2 py-0.5 bg-[#faf8f5] hover:bg-[#ebdccd] border border-[#ebdccd] text-[#73685a]"
                        >
                          + Quick 950 Platinum Confirmation
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <textarea
                        rows={3}
                        required
                        placeholder={
                          isInternalNote
                            ? 'Record private atelier technical notes, CAD file updates, or gold melt calculations...'
                            : 'Compose response to patron regarding jewelry modification or specifications...'
                        }
                        value={adminReplyText}
                        onChange={(e) => setAdminReplyText(e.target.value)}
                        className="flex-1 text-xs p-3 bg-[#faf8f5] border border-[#ebdccd] text-[#141210] focus:border-[#9b7e46] outline-none resize-none"
                      />
                      <button
                        type="submit"
                        disabled={!adminReplyText.trim() || isSendingReply}
                        className={`px-5 text-xs uppercase tracking-wider font-medium flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-50 ${
                          isInternalNote
                            ? 'bg-amber-800 text-white hover:bg-amber-900'
                            : 'bg-[#141210] text-[#faf8f5] hover:bg-[#9b7e46]'
                        }`}
                      >
                        <Send className="w-4 h-4" />
                        <span>{isInternalNote ? 'Save Note' : 'Send'}</span>
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-[#73685a] space-y-2">
                  <MessageSquare className="w-10 h-10 text-[#c5b49e]" />
                  <h4 className="font-serif text-lg text-[#141210]">No Conversation Selected</h4>
                  <p className="text-xs max-w-xs">
                    Select an inquiry from the left panel to review client specifications and dispatch responses.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ATELIER INTERNAL STAFF DIRECTORY */}
      {activeTab === 'staff' && (
        <div className="bg-white border border-[#ebdccd] overflow-hidden">
          <div className="p-4 border-b border-[#ebdccd] flex justify-between items-center bg-[#faf8f5]">
            <div>
              <h3 className="font-serif text-lg text-[#141210]">Atelier Staff & Master Jewellers Directory</h3>
              <p className="text-xs text-[#73685a]">
                Internal staff accounts managed strictly within the admin architecture.
              </p>
            </div>
            <span className="px-3 py-1 bg-[#141210] text-[#faf8f5] text-xs font-mono">
              {staffList.length} Active Staff Members
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#141210]">
              <thead className="bg-[#f5ede3] text-[#73685a] uppercase text-[10px] tracking-wider border-b border-[#ebdccd]">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Internal Role</th>
                  <th className="py-3 px-4">Specialty & Department</th>
                  <th className="py-3 px-4">Active Inquiries Assigned</th>
                  <th className="py-3 px-4">Access Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebdccd]">
                {staffList.map((stf) => (
                  <tr key={stf.id} className="hover:bg-[#faf8f5]">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#141210] text-[#dfd0b5] flex items-center justify-center font-serif text-sm font-bold">
                          {stf.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-serif text-sm text-[#141210] font-medium">{stf.name}</p>
                          <p className="text-[11px] text-[#73685a] font-mono">{stf.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 bg-[#f2ece2] text-[#9b7e46] font-mono text-[10px] uppercase font-bold border border-[#ebdccd]">
                        {stf.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[#594f43]">
                      {stf.specialty || 'Haute Joaillerie Execution'}
                    </td>
                    <td className="py-4 px-4 font-mono font-medium">
                      {stf.activeTicketsCount || 2} active tickets
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active Node</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Update Consignment Status */}
      {editingOrderId && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 border border-[#c5b49e] space-y-4 shadow-2xl">
            <h3 className="font-serif text-xl text-[#141210]">Update Consignment Dispatch</h3>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                Logistics Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210]"
              >
                <option value="confirmed">Confirmed</option>
                <option value="processing">Atelier In-Production</option>
                <option value="ready_to_ship">Inspected & Sealed</option>
                <option value="shipped">Handed to Armored Carrier</option>
                <option value="in_transit">In Transit (Air Armored)</option>
                <option value="delivered">Delivered & Signed</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                Security Courier Carrier
              </label>
              <input
                type="text"
                value={carrierInput}
                onChange={(e) => setCarrierInput(e.target.value)}
                placeholder="Ferrari Group Valuables"
                className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210]"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                Secure Tracking Docket Number
              </label>
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="FG-VAL-2026-XXXXX"
                className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleStatusUpdate(editingOrderId)}
                className="flex-1 py-2.5 bg-[#141210] hover:bg-[#9b7e46] text-white text-xs uppercase tracking-wider transition-colors"
              >
                Save Status
              </button>
              <button
                onClick={() => setEditingOrderId(null)}
                className="px-4 py-2.5 border border-[#c5b49e]/60 text-xs uppercase tracking-wider"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Fine Jewellery Piece */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveProduct}
            className="bg-white max-w-lg w-full p-6 sm:p-8 border border-[#c5b49e] space-y-4 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="font-serif text-2xl text-[#141210]">Register New High Jewellery Piece</h3>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                Piece Title *
              </label>
              <input
                type="text"
                required
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
                placeholder="e.g. Royal Marquise Diamond Pendant"
                className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                  Price (USD) *
                </label>
                <input
                  type="number"
                  required
                  value={prodPriceUSD}
                  onChange={(e) => setProdPriceUSD(Number(e.target.value))}
                  className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                  Stock Units *
                </label>
                <input
                  type="number"
                  value={prodStock}
                  onChange={(e) => setProdStock(Number(e.target.value))}
                  className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                  Category
                </label>
                <select
                  value={prodCategory}
                  onChange={(e) => setProdCategory(e.target.value)}
                  className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210]"
                >
                  <option value="Rings">Rings</option>
                  <option value="Necklaces">Necklaces</option>
                  <option value="Earrings">Earrings</option>
                  <option value="Bracelets">Bracelets</option>
                  <option value="Bangles">Bangles</option>
                  <option value="Men's Jewellery">Men&apos;s Jewellery</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                  Purity & Metal
                </label>
                <select
                  value={prodPurity}
                  onChange={(e) => setProdPurity(e.target.value)}
                  className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210]"
                >
                  <option value="18K">18K Solid Gold</option>
                  <option value="22K">22K Solid Gold</option>
                  <option value="950 Platinum">950 Platinum</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                  Gemstone & Carats
                </label>
                <input
                  type="text"
                  value={prodStone}
                  onChange={(e) => setProdStone(e.target.value)}
                  placeholder="Natural Diamond, Emerald..."
                  className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                  GIA / IGI Cert Number
                </label>
                <input
                  type="text"
                  value={prodCertNumber}
                  onChange={(e) => setProdCertNumber(e.target.value)}
                  placeholder="GIA-2184910482"
                  className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                High-Resolution Image URL
              </label>
              <input
                type="url"
                value={prodImage}
                onChange={(e) => setProdImage(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210]"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                Atelier Description
              </label>
              <textarea
                rows={2}
                value={prodDesc}
                onChange={(e) => setProdDesc(e.target.value)}
                placeholder="Masterpiece details and craftsmanship specifications..."
                className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-[#141210] hover:bg-[#9b7e46] text-[#faf8f5] text-xs uppercase tracking-widest font-medium transition-colors"
              >
                Publish to International Catalogue
              </button>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="px-4 py-3 border border-[#c5b49e]/60 text-xs uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
