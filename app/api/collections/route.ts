import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET() {
  const collections = dbStore.getCollections();
  return NextResponse.json({ success: true, data: collections });
}
