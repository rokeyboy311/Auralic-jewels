import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      senderId = 'usr-client-01',
      senderName = 'Valued Patron',
      senderRole = 'customer',
      content,
      attachments = [],
      isInternalNote = false,
    } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Message content cannot be empty',
        },
        { status: 400 }
      );
    }

    const newMessage = dbStore.addMessageToConversation(id, {
      senderId,
      senderName,
      senderRole,
      content: content.trim(),
      attachments,
      isInternalNote,
    });

    if (!newMessage) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conversation record not found to post message',
        },
        { status: 404 }
      );
    }

    const updatedConv = dbStore.getConversationById(id);

    return NextResponse.json(
      {
        success: true,
        data: {
          message: newMessage,
          conversation: updatedConv,
        },
        message: 'Message delivered to conversation thread',
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to dispatch message',
      },
      { status: 500 }
    );
  }
}
