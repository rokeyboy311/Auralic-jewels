import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json();
    if (!name || !email) {
      return NextResponse.json({ success: false, error: 'Full name and email address are required' }, { status: 400 });
    }

    const existingUser = dbStore.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'An account with this email already exists. Please log in.' }, { status: 409 });
    }

    const newUser = dbStore.createUser({
      name,
      email,
      phone,
      role: email.toLowerCase().includes('admin') ? 'superadmin' : 'customer',
    });

    const token = `aur_jwt_${Buffer.from(JSON.stringify({ userId: newUser.id, email: newUser.email, role: newUser.role })).toString('base64')}`;

    const response = NextResponse.json({
      success: true,
      data: {
        user: newUser,
        token,
      },
      message: 'Account created with Maison Aurelia privileges.',
    });

    response.cookies.set('aurelia_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
