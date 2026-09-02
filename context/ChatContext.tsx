'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Conversation, ConversationMessage } from '../lib/types';
import { 
  getConversations, 
  getConversation, 
  createConversation, 
  sendConversationMessage, 
  updateConversation 
} from '../lib/api';
import { useAuth } from './AuthContext';

export interface OpenChatOptions {
  conversationId?: string;
  subject?: string;
  initialMessage?: string;
  type?: string;
  priority?: string;
  productId?: string;
  productContext?: any;
  orderId?: string;
  orderContext?: any;
}

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  loading: boolean;
  isLoading: boolean;
  isChatOpen: boolean;
  isOpen: boolean;
  unreadCount: number;
  setIsChatOpen: (open: boolean) => void;
  setIsOpen: (open: boolean) => void;
  openChat: (options?: OpenChatOptions) => void;
  closeChat: () => void;
  setActiveConversation: (conv: Conversation | null) => void;
  refreshConversations: () => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  startNewConversation: (payload: {
    subject: string;
    initialMessage: string;
    type?: string;
    priority?: string;
    productId?: string;
    productContext?: any;
    orderId?: string;
    orderContext?: any;
  }) => Promise<Conversation | null>;
  sendMessage: (content: string, attachments?: any[], isInternalNote?: boolean) => Promise<boolean>;
  updateStatus: (status: string, internalNotes?: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const unreadCount = conversations.reduce((total, conv) => {
    return total + (user?.role === 'admin' ? conv.unreadByAdminCount || 0 : conv.unreadByUserCount || 0);
  }, 0);

  const refreshConversations = useCallback(async () => {
    try {
      const res = await getConversations();
      if (res.success && res.data) {
        setConversations(res.data);
      }
    } catch (err) {
      console.error('[ChatContext] Failed to load conversations', err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      refreshConversations();
    }
  }, [user, refreshConversations]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    // Poll for new messages when chat is open and a conversation is active
    if (isChatOpen && activeConversation) {
      intervalId = setInterval(() => {
        selectConversation(activeConversation.id, false); // pass false to avoid loading spinner
        refreshConversations();
      }, 5000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isChatOpen, activeConversation?.id, refreshConversations]);

  const selectConversation = async (id: string, showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await getConversation(id);
      if (res.success && res.data) {
        setActiveConversation(res.data);
      }
    } catch (err) {
      console.error('[ChatContext] Failed to select conversation', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const startNewConversation = async (payload: {
    subject: string;
    initialMessage: string;
    type?: string;
    priority?: string;
    productId?: string;
    productContext?: any;
    orderId?: string;
    orderContext?: any;
  }) => {
    setLoading(true);
    try {
      const res = await createConversation({
        ...payload,
        userName: user?.name,
        userEmail: user?.email,
        userPhone: user?.phone,
      });

      if (res.success && res.data) {
        setActiveConversation(res.data);
        await refreshConversations();
        setIsChatOpen(true);
        return res.data;
      }
      return null;
    } catch (err) {
      console.error('[ChatContext] Failed to create conversation', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const openChat = async (options?: OpenChatOptions) => {
    setIsChatOpen(true);
    if (!options) return;

    if (options.conversationId) {
      await selectConversation(options.conversationId);
      return;
    }

    if (options.subject || options.initialMessage || options.productId) {
      await startNewConversation({
        subject: options.subject || 'Workshop Concierge Inquiry',
        initialMessage: options.initialMessage || 'Greetings from a valued customer.',
        type: options.type,
        priority: options.priority,
        productId: options.productId,
        productContext: options.productContext,
        orderId: options.orderId,
        orderContext: options.orderContext,
      });
    }
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  const sendMessage = async (content: string, attachments: any[] = [], isInternalNote: boolean = false) => {
    if (!activeConversation) return false;
    try {
      const res = await sendConversationMessage(activeConversation.id, {
        content,
        attachments,
        isInternalNote,
        senderRole: user?.role || 'customer',
        senderName: user?.name || 'Valued Customer',
      });

      if (res.success && res.data?.message) {
        setActiveConversation((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...(prev.messages || []), res.data!.message],
          };
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('[ChatContext] Send message failed', err);
      return false;
    }
  };

  const updateStatus = async (status: string, internalNotes?: string) => {
    if (!activeConversation) return;
    try {
      const res = await updateConversation(activeConversation.id, {
        status,
        internalNotes,
      });
      if (res.success && res.data) {
        setActiveConversation(res.data);
        await refreshConversations();
      }
    } catch (err) {
      console.error('[ChatContext] Update conversation status failed', err);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        loading,
        isLoading: loading,
        isChatOpen,
        isOpen: isChatOpen,
        unreadCount,
        setIsChatOpen,
        setIsOpen: setIsChatOpen,
        openChat,
        closeChat,
        setActiveConversation,
        refreshConversations,
        selectConversation,
        startNewConversation,
        sendMessage,
        updateStatus,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;
