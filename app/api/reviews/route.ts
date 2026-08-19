import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const reviews = dbStore.getReviews(productId || undefined);
    return NextResponse.json({ success: true, data: reviews });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, userName, userCountry, rating, title, comment } = body;

    if (!productId || !userName || !rating || !comment) {
      return NextResponse.json({ success: false, error: 'Please provide all required review fields.' }, { status: 400 });
    }

    const review = dbStore.addReview({
      productId,
      userName,
      userCountry: userCountry || 'International Patron',
      rating: Number(rating),
      title: title || 'Exceptional piece',
      comment,
      isVerifiedBuyer: true,
    });

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Thank you for sharing your experience with Maison Aurelia.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
