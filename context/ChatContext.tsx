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

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  loading: boolean;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
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

  const selectConversation = async (id: string) => {
    setLoading(true);
    try {
      const res = await getConversation(id);
      if (res.success && res.data) {
        setActiveConversation(res.data);
      }
    } catch (err) {
      console.error('[ChatContext] Failed to select conversation', err);
    } finally {
      setLoading(false);
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

  const sendMessage = async (content: string, attachments: any[] = [], isInternalNote: boolean = false) => {
    if (!activeConversation) return false;
    try {
      const res = await sendConversationMessage(activeConversation.id, {
        content,
        attachments,
        isInternalNote,
        senderRole: user?.role || 'customer',
        senderName: user?.name || 'Valued Patron',
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
        isChatOpen,
        setIsChatOpen,
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
