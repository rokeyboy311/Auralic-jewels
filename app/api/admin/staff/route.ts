import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET() {
  try {
    const staff = dbStore.getStaff();
    return NextResponse.json({
      success: true,
      data: staff,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to retrieve staff directory',
      },
      { status: 500 }
    );
  }
}
