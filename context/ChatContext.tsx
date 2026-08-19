'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Conversation, ConversationProductContext, ConversationOrderContext, ConversationType } from '@/lib/types';
import { getConversations, getConversation, createConversation, sendConversationMessage } from '@/lib/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface OpenChatParams {
  subject?: string;
  type?: ConversationType;
  initialMessage?: string;
  productId?: string;
  productContext?: ConversationProductContext;
  orderId?: string;
  orderContext?: ConversationOrderContext;
  conversationId?: string;
}

interface ChatContextType {
  isOpen: boolean;
  activeConversation: Conversation | null;
  conversations: Conversation[];
  isLoading: boolean;
  unreadCount: number;
  openChat: (params?: OpenChatParams) => void;
  closeChat: () => void;
  setActiveConversation: (conv: Conversation | null) => void;
  selectConversation: (id: string) => Promise<void>;
  sendMessage: (content: string, attachments?: any[]) => Promise<boolean>;
  startNewConversation: (params: {
    subject: string;
    type?: ConversationType;
    initialMessage: string;
    productId?: string;
    productContext?: ConversationProductContext;
    orderId?: string;
    orderContext?: ConversationOrderContext;
  }) => Promise<Conversation | null>;
  refreshConversations: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { success, error } = useToast();

  const refreshConversations = useCallback(async () => {
    try {
      const res = await getConversations({
        userId: user ? user.id : 'usr-client-01',
      });
      if (res.success && res.data) {
        setConversations(res.data);
        if (activeConversation) {
          const current = res.data.find((c) => c.id === activeConversation.id);
          if (current) setActiveConversation(current);
        }
      }
    } catch {
      // silent refresh fail
    }
  }, [user, activeConversation]);

  useEffect(() => {
    refreshConversations();
    // Background polling interval for active messages
    const interval = setInterval(refreshConversations, 15000);
    return () => clearInterval(interval);
  }, [refreshConversations]);

  const selectConversation = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await getConversation(id, 'user');
      if (res.success && res.data) {
        setActiveConversation(res.data);
        // update unread count locally
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...res.data!, unreadByUserCount: 0 } : c))
        );
      }
    } catch {
      error('Communication Error', 'Could not retrieve conversation messages');
    } finally {
      setIsLoading(false);
    }
  };

  const openChat = async (params?: OpenChatParams) => {
    setIsOpen(true);
    if (params?.conversationId) {
      await selectConversation(params.conversationId);
      return;
    }

    if (params?.productId || params?.orderId || params?.initialMessage) {
      // Check if active conversation already matches this product or order
      const existing = conversations.find(
        (c) =>
          (params.productId && c.productId === params.productId) ||
          (params.orderId && c.orderId === params.orderId)
      );

      if (existing) {
        await selectConversation(existing.id);
      } else if (params.initialMessage && params.subject) {
        await startNewConversation({
          subject: params.subject,
          type: params.type || 'product_modification',
          initialMessage: params.initialMessage,
          productId: params.productId,
          productContext: params.productContext,
          orderId: params.orderId,
          orderContext: params.orderContext,
        });
      } else {
        // Prepare prefilled draft mode
        setActiveConversation(null);
      }
    } else if (!activeConversation && conversations.length > 0) {
      setActiveConversation(conversations[0]);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const startNewConversation = async (params: {
    subject: string;
    type?: ConversationType;
    initialMessage: string;
    productId?: string;
    productContext?: ConversationProductContext;
    orderId?: string;
    orderContext?: ConversationOrderContext;
  }): Promise<Conversation | null> => {
    setIsLoading(true);
    try {
      const res = await createConversation({
        userId: user?.id || 'usr-client-01',
        userName: user?.name || 'Valued Patron',
        userEmail: user?.email || 'patron@domain.com',
        userPhone: user?.phone,
        subject: params.subject,
        type: params.type || 'general_concierge',
        initialMessage: params.initialMessage,
        productId: params.productId,
        productContext: params.productContext,
        orderId: params.orderId,
        orderContext: params.orderContext,
      });

      if (res.success && res.data) {
        setConversations((prev) => [res.data!, ...prev]);
        setActiveConversation(res.data);
        success('Concierge Connected', 'Your inquiry has reached our Paris Place Vendôme atelier.');
        return res.data;
      } else {
        error('Inquiry Failed', res.error || 'Could not dispatch message to atelier');
        return null;
      }
    } catch (err: any) {
      error('Network Error', err.message || 'Could not connect to atelier');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string, attachments: any[] = []): Promise<boolean> => {
    if (!activeConversation) return false;
    try {
      const res = await sendConversationMessage(activeConversation.id, {
        senderId: user?.id || 'usr-client-01',
        senderName: user?.name || 'Valued Patron',
        senderRole: 'customer',
        content,
        attachments,
      });

      if (res.success && res.data) {
        const updated = res.data.conversation;
        setActiveConversation(updated);
        setConversations((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
        return true;
      }
      return false;
    } catch {
      error('Delivery Failed', 'Unable to transmit message to atelier');
      return false;
    }
  };

  const unreadCount = conversations.reduce((sum, c) => sum + (c.unreadByUserCount || 0), 0);

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        activeConversation,
        conversations,
        isLoading,
        unreadCount,
        openChat,
        closeChat,
        setActiveConversation,
        selectConversation,
        sendMessage,
        startNewConversation,
        refreshConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
