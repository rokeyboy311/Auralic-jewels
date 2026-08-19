import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { User } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email = 'patron@domain.com', name = 'Patron Client', googleId } = body;

    // Check if user already exists
    let user = dbStore.getUserByEmail(email);

    if (!user) {
      // Create new user profile
      const newUser: User = {
        id: `usr-google-${Date.now()}`,
        name: name || 'Valued Patron',
        email: email.toLowerCase(),
        role: 'customer',
        phone: '+1 (212) 555-0199',
        country: 'United States',
        addresses: [
          {
            firstName: name.split(' ')[0] || 'Valued',
            lastName: name.split(' ')[1] || 'Patron',
            email: email.toLowerCase(),
            phone: '+1 (212) 555-0199',
            addressLine1: '740 Park Avenue, Apt 14B',
            city: 'New York',
            stateOrProvince: 'NY',
            postalCode: '10021',
            country: 'United States',
            countryCode: 'US',
            isBillingSameAsShipping: true,
          },
        ],
        createdAt: new Date().toISOString(),
      };

      dbStore.createUser(newUser);
      user = newUser;
    }

    // Generate secure token
    const token = `aur_tok_google_${user.id}_${Date.now()}`;

    return NextResponse.json({
      success: true,
      data: {
        user,
        token,
      },
      message: 'Google authentication successful',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Google authentication failed',
      },
      { status: 500 }
    );
  }
}
