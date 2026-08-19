import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function POST(req: NextRequest) {
  try {
    const { code, orderSubtotalUSD } = await req.json();
    if (!code) {
      return NextResponse.json({ success: false, error: 'Please enter a promotional code' }, { status: 400 });
    }

    const coupon = dbStore.getCoupon(code);
    if (!coupon) {
      return NextResponse.json({ success: false, error: 'Invalid or expired promotional code' }, { status: 404 });
    }

    if (coupon.minOrderUSD && (orderSubtotalUSD || 0) < coupon.minOrderUSD) {
      return NextResponse.json({
        success: false,
        error: `This promotional code requires a minimum order of $${coupon.minOrderUSD.toLocaleString()}`,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: coupon,
      message: 'Promotional privilege successfully applied',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
