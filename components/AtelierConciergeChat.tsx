'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Paperclip,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronLeft,
  Gem,
  Plus,
  Package,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { brandConfig } from '@/lib/brandConfig';
import { ConversationType } from '@/lib/types';
import { uploadImage } from '@/lib/api';

export default function AtelierConciergeChat() {
  const {
    isOpen,
    openChat,
    closeChat,
    conversations,
    activeConversation,
    setActiveConversation,
    selectConversation,
    sendMessage,
    startNewConversation,
    isLoading,
    unreadCount,
  } = useChat();

  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [isComposingNew, setIsComposingNew] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newType, setNewType] = useState<ConversationType>('product_modification');
  const [newInitialMsg, setNewInitialMsg] = useState('');
  const [pendingAttachment, setPendingAttachment] = useState<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [activeConversation?.messages, isOpen]);

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploadingAttachment(true);
      try {
        const res = await uploadImage(file, 'auralic_concierge_chat');
        if (res.success && res.data?.url) {
          setPendingAttachment({
            id: `att-${Date.now()}`,
            name: file.name,
            url: res.data.url,
            type: file.type || 'image/jpeg',
            size: file.size,
          });
        }
      } catch (err) {
        console.error('Chat attachment upload error:', err);
      } finally {
        setIsUploadingAttachment(false);
      }
    }
    if (chatFileInputRef.current) chatFileInputRef.current.value = '';
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !pendingAttachment) || isSending || isUploadingAttachment) return;

    setIsSending(true);
    const attachments = pendingAttachment ? [pendingAttachment] : [];
    const textToSend = inputText.trim() || (pendingAttachment ? 'Attached photograph from client.' : '');
    const sent = await sendMessage(textToSend, attachments);
    if (sent) {
      setInputText('');
      setPendingAttachment(null);
    }
    setIsSending(false);
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newInitialMsg.trim() || isSending) return;

    setIsSending(true);
    const created = await startNewConversation({
      subject: newSubject.trim(),
      type: newType,
      initialMessage: newInitialMsg.trim(),
    });

    if (created) {
      setIsComposingNew(false);
      setNewSubject('');
      setNewInitialMsg('');
    }
    setIsSending(false);
  };

  const quickPrompts = [
    'Can I order this piece in Solid 950 Platinum?',
    'What is the estimated delivery lead time for my ring size?',
    'I would like to request a custom laser engraving inside the band.',
    'Can you provide the GIA certificate details for the center diamond?',
  ];

  return (
    <>
      {/* Floating Concierge Launcher */}
      {!isOpen && (
        <button
          onClick={() => openChat()}
          aria-label="Open Atelier Concierge Chat"
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-3 bg-[#141210] text-[#faf8f5] px-4 py-3 border border-[#9b7e46]/60 shadow-2xl hover:bg-[#9b7e46] transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-[#dfd0b5] group-hover:text-white transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#141210]">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="text-left hidden sm:block">
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium block text-[#dfd0b5] group-hover:text-white">
              Atelier Concierge
            </span>
            <span className="text-[9px] text-[#a39887] group-hover:text-white/80 block">
              Master Jeweller Online
            </span>
          </div>
        </button>
      )}

      {/* Main Concierge Drawer / Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[460px] h-[640px] max-h-[90vh] bg-[#faf8f5] border border-[#c5b49e] shadow-2xl flex flex-col overflow-hidden text-[#141210] animate-in fade-in slide-in-from-bottom-6 duration-300">
          {/* Header */}
          <div className="bg-[#141210] text-[#faf8f5] p-4 border-b border-[#9b7e46]/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {activeConversation && !isComposingNew && conversations.length > 1 && (
                <button
                  onClick={() => setActiveConversation(null)}
                  className="p-1 hover:bg-white/10 text-[#dfd0b5] transition-colors"
                  title="All Conversations"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-base tracking-wide">Maison Aurelia Concierge</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[10px] text-[#dfd0b5] tracking-wider uppercase">
                  Paris Place Vendôme Master Jewellers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsComposingNew(true);
                }}
                className="p-1.5 text-[#dfd0b5] hover:text-white hover:bg-white/10 rounded transition-colors"
                title="New Inquiry"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={closeChat}
                className="p-1.5 text-[#dfd0b5] hover:text-white hover:bg-white/10 rounded transition-colors"
                title="Close Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-header / Status Bar */}
          {activeConversation && !isComposingNew && (
            <div className="bg-[#f2ece4] px-4 py-2 border-b border-[#ebdccd] flex items-center justify-between text-[11px] text-[#594f43]">
              <div className="flex items-center gap-2 truncate">
                <span className="font-mono font-medium text-[#141210]">
                  {activeConversation.ticketNumber}
                </span>
                <span>•</span>
                <span className="truncate">{activeConversation.subject}</span>
              </div>
              <span
                className={`px-2 py-0.5 text-[9px] uppercase font-mono tracking-wider font-semibold shrink-0 ${
                  activeConversation.status === 'OPEN'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : activeConversation.status === 'IN_PROGRESS'
                    ? 'bg-blue-100 text-blue-900 border border-blue-300'
                    : activeConversation.status === 'WAITING_FOR_USER'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                {activeConversation.status.replace(/_/g, ' ')}
              </span>
            </div>
          )}

          {/* View 1: New Inquiry Composer */}
          {isComposingNew ? (
            <div className="flex-1 overflow-y-auto p-5 bg-white space-y-4">
              <div className="flex items-center justify-between border-b border-[#ebdccd] pb-3">
                <h3 className="font-serif text-lg text-[#141210]">Direct Atelier Request</h3>
                <button
                  onClick={() => setIsComposingNew(false)}
                  className="text-xs text-[#9b7e46] hover:underline"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleCreateNew} className="space-y-4">
                <div>
                  <label htmlFor="new-inquiry-type-select" className="text-[10px] uppercase tracking-wider text-[#73685a] font-medium block mb-1">
                    Nature of Inquiry
                  </label>
                  <select
                    id="new-inquiry-type-select"
                    name="inquiryType"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as ConversationType)}
                    className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#ebdccd] text-[#141210] focus:border-[#9b7e46] outline-none"
                  >
                    <option value="product_modification">Product Modification (Alloy / Sizing / Inscription)</option>
                    <option value="customization">Bespoke Custom Jewel Commission</option>
                    <option value="order_inquiry">Existing Order Assistance & Armored Delivery</option>
                    <option value="gemological_advice">Gemological Guidance & GIA Verification</option>
                    <option value="general_concierge">Private VIP Concierge Appointment</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="new-inquiry-subject-input" className="text-[10px] uppercase tracking-wider text-[#73685a] font-medium block mb-1">
                    Subject Line
                  </label>
                  <input
                    id="new-inquiry-subject-input"
                    name="subject"
                    type="text"
                    required
                    placeholder="e.g. Ring resizing request for Solitaire band"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#ebdccd] text-[#141210] focus:border-[#9b7e46] outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="new-inquiry-spec-textarea" className="text-[10px] uppercase tracking-wider text-[#73685a] font-medium block mb-1">
                    Requirement & Specifications
                  </label>
                  <textarea
                    id="new-inquiry-spec-textarea"
                    name="specifications"
                    required
                    rows={5}
                    placeholder="Please specify your desired gold purity (18K/22K), diamond carat preferences, ring size, or custom engraving words..."
                    value={newInitialMsg}
                    onChange={(e) => setNewInitialMsg(e.target.value)}
                    className="w-full text-xs p-3 bg-[#faf8f5] border border-[#ebdccd] text-[#141210] focus:border-[#9b7e46] outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full py-3 bg-[#141210] text-[#faf8f5] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#9b7e46] transition-colors disabled:opacity-50"
                  >
                    {isSending ? 'Connecting with Atelier...' : 'Submit Request to Master Jeweller'}
                  </button>
                </div>
              </form>
            </div>
          ) : !activeConversation ? (
            /* View 2: Conversations List (if no active conversation chosen) */
            <div className="flex-1 overflow-y-auto p-4 bg-white space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#ebdccd]">
                <h3 className="font-serif text-base text-[#141210]">Your Atelier Communications</h3>
                <button
                  onClick={() => setIsComposingNew(true)}
                  className="text-xs text-[#9b7e46] hover:underline font-medium flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Inquiry</span>
                </button>
              </div>

              {conversations.length === 0 ? (
                <div className="text-center py-12 space-y-3">\r
                  <div className="w-12 h-12 rounded-full bg-[#f5ede3] border border-[#ebdccd] flex items-center justify-center mx-auto text-[#9b7e46]">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif text-base text-[#141210]">No Active Conversations</h4>
                  <p className="text-xs text-[#73685a] max-w-xs mx-auto">
                    Need customization, sizing advice, or have a query regarding a piece? Reach our master goldsmiths directly.
                  </p>
                  <button
                    onClick={() => setIsComposingNew(true)}
                    className="px-5 py-2.5 bg-[#141210] text-[#faf8f5] text-xs uppercase tracking-wider hover:bg-[#9b7e46] transition-colors"
                  >
                    Start First Inquiry
                  </button>
                </div>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => selectConversation(c.id)}
                    className="w-full text-left p-3.5 bg-[#faf8f5] hover:bg-[#f3ece2] border border-[#ebdccd] transition-colors flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[#9b7e46] font-semibold">
                        {c.ticketNumber}
                      </span>
                      <span className="text-[10px] text-[#8c7f70]">
                        {new Date(c.updatedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <p className="font-serif text-sm text-[#141210] line-clamp-1 font-medium">
                      {c.subject}
                    </p>

                    {c.productContext && (
                      <div className="flex items-center gap-2 text-[10px] text-[#73685a] bg-white p-1.5 border border-[#ebdccd]/50">
                        <Gem className="w-3 h-3 text-[#9b7e46] shrink-0" />
                        <span className="truncate">{c.productContext.productName}</span>
                      </div>
                    )}

                    {c.messages.length > 0 && (
                      <p className="text-xs text-[#594f43] line-clamp-1">
                        {c.messages[c.messages.length - 1].content}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-[#ebdccd]/40 text-[10px]">
                      <span className="text-[#8c7f70]">
                        {c.assignedStaffName || 'Atelier Director'}
                      </span>
                      {c.unreadByUserCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-rose-600 text-white rounded-full text-[9px] font-bold">
                          {c.unreadByUserCount} new
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : (
            /* View 3: Active Message Thread */
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              {/* Product / Order Context Pill (if attached) */}
              {activeConversation.productContext && (
                <div className="bg-[#faf8f5] p-3 border-b border-[#ebdccd] flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 relative bg-[#f5ede3] border border-[#ebdccd] shrink-0">
                      <Image
                        src={activeConversation.productContext.image}
                        alt={activeConversation.productContext.productName}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-serif text-xs text-[#141210] font-medium truncate">
                        {activeConversation.productContext.productName}
                      </p>
                      <p className="text-[10px] text-[#73685a]">
                        SKU: {activeConversation.productContext.sku} •{' '}
                        {activeConversation.productContext.selectedMetal || '18K Gold'} •{' '}
                        {activeConversation.productContext.selectedSize || 'Standard'}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/product/${activeConversation.productContext.productSlug}`}
                    className="p-1 text-[#9b7e46] hover:text-[#141210] shrink-0"
                    title="View Product"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {activeConversation.orderContext && (
                <div className="bg-[#faf8f5] p-3 border-b border-[#ebdccd] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#9b7e46]" />
                    <span className="font-medium text-[#141210]">
                      Order #{activeConversation.orderContext.orderNumber}
                    </span>
                    <span className="text-[10px] text-[#73685a]">
                      • ${activeConversation.orderContext.orderTotalUSD.toLocaleString()}
                    </span>
                  </div>
                  <Link
                    href="/track-order"
                    className="text-[10px] text-[#9b7e46] uppercase tracking-wider hover:underline"
                  >
                    Track Dispatch
                  </Link>
                </div>
              )}

              {/* Messages Timeline */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#faf8f5]/50">
                <div className="text-center py-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#8c7f70] bg-[#f2ece4] px-3 py-1 border border-[#ebdccd]">
                    Direct Encrypted Atelier Channel
                  </span>
                </div>

                {activeConversation.messages.map((msg) => {
                  const isCustomer = msg.senderRole === 'customer';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[10px] font-medium text-[#594f43]">
                          {msg.senderName}
                        </span>
                        {!isCustomer && (
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 bg-[#ebdccd] text-[#73685a] font-medium">
                            {msg.senderRole === 'master_jeweller'
                              ? 'Master Jeweller'
                              : msg.senderRole === 'gemologist'
                              ? 'Senior Gemologist'
                              : 'Atelier Director'}
                          </span>
                        )}
                        <span className="text-[9px] text-[#a39887]">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div
                        className={`max-w-[85%] p-3.5 text-xs leading-relaxed ${
                          isCustomer
                            ? 'bg-[#141210] text-[#faf8f5] border border-[#141210]'
                            : 'bg-white text-[#2b251f] border border-[#c5b49e]/60 shadow-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>

                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-[#ebdccd]/50 space-y-2">
                            {msg.attachments.map((att) => {
                              const isImg = att.type?.startsWith('image/') || att.url?.startsWith('data:image') || att.url?.match(/\.(jpeg|jpg|png|webp|gif)/i);
                              return (
                                <div key={att.id} className="space-y-1">
                                  {isImg && att.url && (
                                    <div className="relative aspect-4/3 w-full max-w-[220px] rounded-xs overflow-hidden border border-[#ebdccd] bg-[#f0e9df]">
                                      <Image
                                        src={att.url}
                                        alt={att.name || 'Chat attachment'}
                                        fill
                                        className="object-cover cursor-pointer hover:scale-105 transition-transform"
                                        referrerPolicy="no-referrer"
                                        unoptimized={att.url.startsWith('data:')}
                                        onClick={() => window.open(att.url, '_blank')}
                                      />
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1.5 text-[10px] text-[#73685a] font-mono">
                                    <Paperclip className="w-3 h-3 text-[#9b7e46]" />
                                    <span className="truncate max-w-[180px]">{att.name}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts */}
              {activeConversation.messages.length < 3 && (
                <div className="px-3 py-2 bg-white border-t border-[#ebdccd] flex items-center gap-2 overflow-x-auto text-[10px]">
                  <span className="text-[#8c7f70] shrink-0">Suggestions:</span>
                  {quickPrompts.slice(0, 2).map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputText(prompt)}
                      className="px-2.5 py-1 bg-[#faf8f5] hover:bg-[#f3ece2] text-[#594f43] border border-[#ebdccd] whitespace-nowrap shrink-0 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {/* Pending Image Attachment Thumbnail Preview */}
              {pendingAttachment && (
                <div className="px-3 py-2 bg-[#f6f0e6] border-t border-[#ebdccd] flex items-center justify-between animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 relative border border-[#c5b49e] overflow-hidden bg-white shrink-0">
                      <Image
                        src={pendingAttachment.url}
                        alt={pendingAttachment.name}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                        unoptimized={true}
                      />
                    </div>
                    <div className="text-[11px] truncate max-w-[200px]">
                      <p className="font-medium text-[#141210] truncate">{pendingAttachment.name}</p>
                      <p className="text-[9px] text-[#73685a] uppercase font-mono">Ready to dispatch</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPendingAttachment(null)}
                    className="p-1 hover:bg-white text-[#73685a] hover:text-red-700 transition-colors"
                    title="Remove attached photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Message Composer */}
              <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#ebdccd] flex items-center gap-2">
                <label htmlFor="atelier-chat-file-input" className="sr-only">
                  Attach Photo or Design Sketch
                </label>
                <input
                  ref={chatFileInputRef}
                  id="atelier-chat-file-input"
                  name="chatAttachment"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => chatFileInputRef.current?.click()}
                  className="p-2.5 text-[#73685a] hover:text-[#9b7e46] hover:bg-[#faf8f5] transition-colors shrink-0 border border-[#ebdccd]"
                  title="Attach Photo or Design Sketch"
                  aria-label="Attach Photo or Design Sketch"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
                <label htmlFor="atelier-chat-message-input" className="sr-only">
                  Inquire with the Master Jeweller
                </label>
                <input
                  id="atelier-chat-message-input"
                  name="messageContent"
                  type="text"
                  placeholder="Inquire with the Master Jeweller..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 text-xs p-2.5 bg-[#faf8f5] border border-[#ebdccd] text-[#141210] focus:border-[#9b7e46] outline-none"
                />
                <button
                  type="submit"
                  disabled={(!inputText.trim() && !pendingAttachment) || isSending}
                  className="p-2.5 bg-[#141210] text-[#faf8f5] hover:bg-[#9b7e46] transition-colors disabled:opacity-40 cursor-pointer shrink-0"
                  title="Send Message"
                  aria-label="Send Message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Footer Security Assurance */}
          <div className="bg-[#faf8f5] px-4 py-2 border-t border-[#ebdccd] flex items-center justify-between text-[10px] text-[#73685a]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#9b7e46]" />
              <span>Certified Haute Joaillerie Concierge</span>
            </div>
            <span>Place Vendôme • Paris</span>
          </div>
        </div>
      )}
    </>
  );
}
