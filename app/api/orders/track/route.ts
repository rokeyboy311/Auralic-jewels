import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function POST(req: NextRequest) {
  try {
    const { orderNumber, email } = await req.json();
    if (!orderNumber || !email) {
      return NextResponse.json({ success: false, error: 'Please provide both the Order Reference and Email address.' }, { status: 400 });
    }

    const order = dbStore.getOrders().find(
      (o) =>
        (o.orderNumber.toUpperCase().trim() === orderNumber.toUpperCase().trim() || o.id === orderNumber) &&
        o.customerEmail.toLowerCase().trim() === email.toLowerCase().trim()
    );

    if (!order) {
      return NextResponse.json({
        success: false,
        error: 'No order matched the provided reference number and email address. Please verify your receipt or contact our private concierge.',
      }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
