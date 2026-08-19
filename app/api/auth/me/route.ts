import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('aurelia_auth_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    try {
      const decodedStr = Buffer.from(token.replace('aur_jwt_', ''), 'base64').toString('utf-8');
      const decoded = JSON.parse(decodedStr);
      const user = dbStore.getUserByEmail(decoded.email);
      if (!user) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: user });
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid authentication token' }, { status: 401 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
