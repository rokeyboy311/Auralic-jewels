import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { Conversation } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || undefined;
    const status = searchParams.get('status') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const search = searchParams.get('search') || undefined;

    const conversations = dbStore.getConversations({
      userId,
      status,
      priority,
      search,
    });

    return NextResponse.json({
      success: true,
      data: conversations,
      total: conversations.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch conversations',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      userName,
      userEmail,
      userPhone,
      subject,
      type,
      initialMessage,
      productId,
      productContext,
      orderId,
      orderContext,
      priority = 'medium',
    } = body;

    if (!subject || !initialMessage) {
      return NextResponse.json(
        {
          success: false,
          error: 'Subject and initial inquiry message are required',
        },
        { status: 400 }
      );
    }

    const newConversation = dbStore.createConversation({
      userId: userId || 'usr-client-01',
      userName: userName || 'Valued Patron',
      userEmail: userEmail || 'patron@domain.com',
      userPhone,
      subject,
      type: type || 'general_concierge',
      priority,
      status: 'OPEN',
      productId,
      productContext,
      orderId,
      orderContext,
      initialMessage,
    });

    return NextResponse.json(
      {
        success: true,
        data: newConversation,
        message: 'Atelier conversation initiated successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to initialize conversation',
      },
      { status: 500 }
    );
  }
}
