'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Search, Send, Clock, Circle, Filter, Paperclip, Lock, User, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminConversationsPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const res = await fetch('/api/conversations');
      const data = await res.json();
      if (data.success) {
        setConversations(data.data);
        if (data.data.length > 0 && !activeConversationId) {
          setActiveConversationId(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load conversations', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversationId, conversations]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const filteredConversations = conversations.filter(c => 
    c.subject?.toLowerCase().includes(search.toLowerCase()) || 
    c.ticketNumber?.toLowerCase().includes(search.toLowerCase()) ||
    c.userName?.toLowerCase().includes(search.toLowerCase())
  );

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversationId) return;
    
    try {
      const res = await fetch(`/api/conversations/${activeConversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          isInternalNote: isInternal,
          senderRole: 'admin',
          senderName: user?.name || 'Concierge Team'
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewMessage('');
        // Reload conversations to get the new message
        loadConversations();
      }
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const updateStatus = async (status: string) => {
    if (!activeConversationId) return;
    try {
      const res = await fetch(`/api/conversations/${activeConversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) loadConversations();
    } catch (error) {
      console.error(error);
    }
  };

  const updatePriority = async (priority: string) => {
    if (!activeConversationId) return;
    try {
      const res = await fetch(`/api/conversations/${activeConversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority })
      });
      if (res.ok) loadConversations();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden">
      {/* Header */}
      <div className="p-6 sm:px-8 border-b border-[#E8E0D5] shrink-0">
        <h1 className="text-2xl font-semibold text-[#111111]">Workshop Concierge</h1>
        <p className="text-sm text-[#6F665B] mt-1">Manage client communications, support tickets, and bespoke inquiries.</p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar - List */}
        <div className="w-1/3 border-r border-[#E8E0D5] flex flex-col bg-[#F9FAFB]">
          <div className="p-4 border-b border-[#E8E0D5]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F665B]" />
              <input 
                type="text" 
                placeholder="Search tickets..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#E8E0D5] rounded-md text-sm focus:outline-none focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-6 text-center text-[#6F665B] text-sm">Loading...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-[#6F665B] text-sm">No conversations found.</div>
            ) : (
              <ul className="divide-y divide-[#E8E0D5]">
                {filteredConversations.map(conv => (
                  <li key={conv.id}>
                    <button
                      onClick={() => setActiveConversationId(conv.id)}
                      className={`w-full text-left p-4 hover:bg-white transition-colors border-l-2 ${activeConversationId === conv.id ? 'border-[#C9A45C] bg-white' : 'border-transparent'}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-[#111111] truncate">{conv.userName || 'Client'}</span>
                        <span className="text-xs text-[#6F665B] whitespace-nowrap">{new Date(conv.updatedAt || conv.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-sm font-medium text-[#111111] truncate mb-2">{conv.subject}</div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#6F665B] font-mono">{conv.ticketNumber}</span>
                        <div className="flex items-center gap-2">
                          {conv.priority === 'urgent' && <span className="w-2 h-2 rounded-full bg-rose-500" title="Urgent"></span>}
                          <span className={`px-2 py-0.5 rounded capitalize font-medium ${
                            conv.status === 'open' ? 'bg-amber-100 text-amber-800' :
                            conv.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {conv.status}
                          </span>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Content - Chat */}
        <div className="w-2/3 flex flex-col bg-white">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-[#E8E0D5] flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-lg font-semibold text-[#111111]">{activeConversation.subject}</h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-[#6F665B]">
                    <span className="font-mono">{activeConversation.ticketNumber}</span>
                    <span className="flex items-center gap-1"><User className="w-4 h-4" /> {activeConversation.userName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={activeConversation.priority}
                    onChange={(e) => updatePriority(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-[#E8E0D5] rounded-md text-sm font-medium focus:outline-none focus:border-[#C9A45C]"
                  >
                    <option value="low">Low Priority</option>
                    <option value="standard">Standard Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <select
                    value={activeConversation.status}
                    onChange={(e) => updateStatus(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-[#E8E0D5] rounded-md text-sm font-medium focus:outline-none focus:border-[#C9A45C]"
                  >
                    <option value="open">Open</option>
                    <option value="pending">Pending Client</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                {(!activeConversation.messages || activeConversation.messages.length === 0) ? (
                  <div className="text-center text-[#6F665B] text-sm">No messages yet.</div>
                ) : (
                  activeConversation.messages.map((msg: any) => {
                    const isAdmin = msg.senderRole === 'admin';
                    const isSystem = msg.senderRole === 'system';
                    
                    if (isSystem) {
                      return (
                        <div key={msg.id} className="flex justify-center my-4">
                          <span className="text-xs bg-gray-100 text-[#6F665B] px-3 py-1 rounded-full">{msg.content}</span>
                        </div>
                      );
                    }

                    return (
                      <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                          msg.isInternalNote ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-br-sm' :
                          isAdmin ? 'bg-[#111111] text-white rounded-br-sm' : 
                          'bg-white border border-[#E8E0D5] text-[#111111] rounded-bl-sm shadow-sm'
                        }`}>
                          {msg.isInternalNote && (
                            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-amber-600 mb-1 tracking-wider">
                              <Lock className="w-3 h-3" /> Internal Note
                            </div>
                          )}
                          <div className="text-[10px] font-medium opacity-70 mb-1 flex justify-between gap-4">
                            <span>{msg.senderName}</span>
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-[#E8E0D5] bg-white shrink-0">
                <div className="flex items-center gap-4 mb-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer text-[#6F665B] hover:text-[#111111]">
                    <input 
                      type="checkbox" 
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="w-4 h-4 text-[#C9A45C] border-[#E8E0D5] rounded focus:ring-[#C9A45C]"
                    />
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Internal Note (Invisible to client)
                    </span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <div className={`flex-1 flex border rounded-lg focus-within:ring-1 overflow-hidden transition-colors ${
                    isInternal ? 'border-amber-300 focus-within:border-amber-400 focus-within:ring-amber-400 bg-amber-50' : 
                    'border-[#E8E0D5] focus-within:border-[#111111] focus-within:ring-[#111111] bg-white'
                  }`}>
                    <textarea 
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder={isInternal ? "Type an internal note..." : "Type your reply to the client..."}
                      className="flex-1 p-3 bg-transparent resize-none focus:outline-none text-sm min-h-[60px]"
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                  </div>
                  <button 
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className={`px-4 flex items-center justify-center rounded-lg transition-colors disabled:opacity-50 ${
                      isInternal ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-[#111111] hover:bg-[#222222] text-white'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#6F665B]">
              <MessageSquare className="w-12 h-12 mb-4 text-[#E8E0D5]" />
              <p>Select a conversation to view details.</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
