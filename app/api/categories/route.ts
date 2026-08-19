import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET() {
  const categories = dbStore.getCategories();
  return NextResponse.json({ success: true, data: categories });
}
