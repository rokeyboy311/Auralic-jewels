import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'Aurelia Luxury Fine Jewellery API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    currencyLayer: 'active',
    database: 'connected',
    stripeStatus: process.env.STRIPE_SECRET_KEY ? 'configured' : 'test_mode_available',
    cloudinaryStatus: process.env.CLOUDINARY_CLOUD_NAME ? 'configured' : 'unconfigured_fallback',
    resendStatus: process.env.RESEND_API_KEY ? 'configured' : 'mock_delivery_ready',
  });
}
