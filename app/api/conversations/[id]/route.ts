import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conversation = dbStore.getConversationById(id);

    if (!conversation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conversation record not found',
        },
        { status: 404 }
      );
    }

    // Check if query param requests to mark as read
    const { searchParams } = new URL(req.url);
    const readBy = searchParams.get('readBy');
    if (readBy === 'user' || readBy === 'admin') {
      dbStore.markConversationRead(id, readBy);
    }

    return NextResponse.json({
      success: true,
      data: conversation,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch conversation record',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, priority, assignedStaffId, assignedStaffName, internalNotes } = body;

    const updated = dbStore.updateConversation(id, {
      status,
      priority,
      assignedStaffId,
      assignedStaffName,
      internalNotes,
    });

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conversation record not found or could not be updated',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Conversation status and staff assignment updated',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update conversation',
      },
      { status: 500 }
    );
  }
}
