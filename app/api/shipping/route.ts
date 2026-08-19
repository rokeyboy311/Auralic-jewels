import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET() {
  const methods = dbStore.getShippingMethods();
  return NextResponse.json({ success: true, data: methods });
}
