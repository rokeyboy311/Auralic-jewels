import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function POST(req: NextRequest) {
  try {
    const productData = await req.json();
    if (!productData.name || !productData.priceUSD) {
      return NextResponse.json({ success: false, error: 'Product name and price in USD are required' }, { status: 400 });
    }

    const savedProduct = dbStore.saveProduct(productData);
    return NextResponse.json({
      success: true,
      data: savedProduct,
      message: 'Product catalog updated successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
