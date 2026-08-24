'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Sparkles, UserCheck, ExternalLink, Paperclip, Send, MessageSquare } from 'lucide-react';
import { Conversation, AtelierStaff, ConversationStatus } from '@/lib/types';
import { useCurrency } from '@/context/CurrencyContext';

interface AdminChatTabProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  staffList: AtelierStaff[];
  onSelectChat: (id: string) => void;
  onSendAdminReply: (content: string, isInternal: boolean) => Promise<void>;
  onUpdateChatStatus: (status: ConversationStatus) => void;
  onAssignStaff: (staffId: string, staffName: string) => void;
  isSendingReply: boolean;
}

export default function AdminChatTab({
  conversations,
  selectedConversation,
  staffList,
  onSelectChat,
  onSendAdminReply,
  onUpdateChatStatus,
  onAssignStaff,
  isSendingReply,
}: AdminChatTabProps) {
  const { formatPrice } = useCurrency();
  const [chatSearch, setChatSearch] = useState('');
  const [chatStatusFilter, setChatStatusFilter] = useState('ALL');
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReplyText.trim()) return;
    await onSendAdminReply(adminReplyText.trim(), isInternalNote);
    setAdminReplyText('');
  };

  const filteredConversations = conversations.filter((c) => {
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
  });

  return (
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
            {filteredConversations.map((conv) => {
              const isSelected = selectedConversation?.id === conv.id;

              return (
                <button
                  key={conv.id}
                  onClick={() => onSelectChat(conv.id)}
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
                      onChange={(e) => onUpdateChatStatus(e.target.value as ConversationStatus)}
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
                        if (staff) onAssignStaff(staff.id, staff.name);
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
              <form onSubmit={handleSubmit} className="p-4 border-t border-[#ebdccd] bg-white space-y-3">
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
                      className="px-2 py-0.5 bg-[#faf8f5] hover:bg-[#ebdccd] border border-[#ebdccd] text-[#73685a] cursor-pointer"
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
  );
}
