import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET() {
  try {
    const inquiries = dbStore.getBespokeInquiries();
    return NextResponse.json({
      success: true,
      data: inquiries,
      total: inquiries.length,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.customerName || !body.customerEmail || !body.designDescription) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and design description are required for bespoke inquiries.' },
        { status: 400 }
      );
    }

    const inquiry = dbStore.createBespokeInquiry({
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone || '',
      customerCountry: body.customerCountry || 'United States',
      category: body.category || 'Rings',
      metalPreference: body.metalPreference || 'Yellow Gold',
      purityPreference: body.purityPreference || '18K',
      stonePreference: body.stonePreference || 'Natural Diamond',
      targetCarat: body.targetCarat ? parseFloat(body.targetCarat) : undefined,
      targetBudgetUSD: body.targetBudgetUSD || '$5,000 - $10,000',
      sizeSpecification: body.sizeSpecification || '',
      engravingMessage: body.engravingMessage || '',
      designDescription: body.designDescription,
      referenceImageUrl: body.referenceImageUrl || '',
      timelineRequirement: body.timelineRequirement || 'Flexible / 4-6 Weeks',
    });

    return NextResponse.json({
      success: true,
      data: inquiry,
      message: `Your bespoke commission dossier ${inquiry.referenceNumber} has been received. A Master Gemologist will contact you within 24 hours.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
