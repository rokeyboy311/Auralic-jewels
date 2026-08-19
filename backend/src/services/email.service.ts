import { config } from '../config';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  /**
   * Dispatches transactional emails. If RESEND_API_KEY is not configured in dev,
   * it logs the formatted email securely without breaking the order flow.
   */
  static async sendEmail(payload: EmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!config.resend.apiKey) {
      console.log(`[Aurelia Email Service (Dev Fallback)] To: ${payload.to} | Subject: "${payload.subject}"`);
      return { success: true, messageId: `mock-email-${Date.now()}` };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.resend.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: config.resend.emailFrom,
          to: [payload.to],
          subject: payload.subject,
          html: payload.html,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to dispatch email via Resend');
      }

      return { success: true, messageId: data.id };
    } catch (err: any) {
      console.error('[Aurelia Email Service] Delivery error:', err.message);
      return { success: false, error: err.message };
    }
  }

  static async sendOrderConfirmation(order: any): Promise<void> {
    const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a; background: #faf8f5; padding: 40px 24px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="letter-spacing: 3px; font-size: 24px; font-weight: 400; text-transform: uppercase; margin: 0;">AURELIA</h1>
          <p style="font-size: 11px; letter-spacing: 2px; color: #9b7e46; text-transform: uppercase; margin-top: 6px;">Haute Joaillerie Paris</p>
        </div>
        <div style="background: #ffffff; padding: 32px; border: 1px solid #e8e2d9; border-radius: 4px;">
          <h2 style="font-size: 18px; font-weight: 500; margin-top: 0;">Acquisition Confirmation</h2>
          <p>Dear ${order.shippingAddress?.firstName || 'Valued Patron'},</p>
          <p>We are delighted to confirm that your fine jewellery acquisition <strong>${order.orderNumber}</strong> has been secured and entrusted to our master craftsmen for final inspection and hallmarking.</p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 24px 0;" />
          
          <div style="margin-bottom: 20px;">
            <p style="margin: 0 0 6px 0; font-size: 13px; color: #666;">Delivery Address:</p>
            <p style="margin: 0; font-size: 14px;">${order.shippingAddress?.addressLine1}, ${order.shippingAddress?.city}, ${order.shippingAddress?.country}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <p style="margin: 0 0 6px 0; font-size: 13px; color: #666;">Total Value:</p>
            <p style="margin: 0; font-size: 18px; font-weight: 600; color: #9b7e46;">${order.currency} ${order.totalInCurrency?.toLocaleString()}</p>
          </div>

          <p style="font-size: 13px; color: #666; line-height: 1.6;">
            Your piece will travel via armored air courier with full insurance and white-glove signature delivery. You may track your package at any time through our online atelier portal.
          </p>
        </div>
        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #999;">
          <p>12 Place Vendôme, 75001 Paris, France | concierge@aureliajewels.com</p>
        </div>
      </div>
    `;

    await this.sendEmail({
      to: order.customerEmail,
      subject: `Acquisition Confirmation — Order ${order.orderNumber} | Maison Aurelia`,
      html,
    });
  }
}
