import { Resend } from 'resend';
import { config } from '../config';

const resendClient = config.resend.apiKey ? new Resend(config.resend.apiKey) : null;

export class EmailService {
  /**
   * General purpose email sender
   */
  static async sendEmail(options: { to: string | string[]; subject: string; html: string; text?: string; from?: string }): Promise<boolean> {
    if (!resendClient) {
      console.log(`[EmailService (Simulated)] Email to ${Array.isArray(options.to) ? options.to.join(', ') : options.to} | Subject: ${options.subject}`);
      return true;
    }

    try {
      await resendClient.emails.send({
        from: options.from || config.resend.emailFrom,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return true;
    } catch (err: any) {
      console.error('[EmailService] sendEmail failed:', err.message);
      return false;
    }
  }

  /**
   * Send Order Confirmation Email with detailed invoice breakdown
   */
  static async sendOrderConfirmation(order: any): Promise<boolean> {
    if (!resendClient) {
      console.log(`[EmailService (Simulated)] Order confirmation dispatched to ${order.customer_email} for order #${order.order_number}`);
      return true;
    }

    try {
      const itemsListHtml = (order.items || [])
        .map(
          (item: any) => `
          <tr style="border-bottom: 1px solid #262626;">
            <td style="padding: 12px 0;">
              <strong style="color: #f7f5f0; font-family: 'Cinzel', serif;">${item.name || item.product_name}</strong>
              <div style="color: #a3a3a3; font-size: 12px; margin-top: 4px;">
                ${item.metal_type ? `Metal: ${item.metal_type} | ` : ''}
                ${item.purity ? `Purity: ${item.purity} | ` : ''}
                ${item.size ? `Size: ${item.size}` : ''}
                ${item.engraving_text ? `<br>Engraving: "${item.engraving_text}"` : ''}
              </div>
            </td>
            <td style="padding: 12px; text-align: center; color: #f7f5f0;">${item.quantity}</td>
            <td style="padding: 12px 0; text-align: right; color: #d4af37; font-weight: 600;">$${parseFloat(item.total_usd || '0').toLocaleString()}</td>
          </tr>
        `
        )
        .join('');

      await resendClient.emails.send({
        from: config.resend.emailFrom,
        to: [order.customer_email],
        subject: `Confirmation of Acquisition: Order #${order.order_number} | Maison Auralic`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="background-color: #0b0b0c; color: #e5e5e5; font-family: 'Montserrat', sans-serif; padding: 40px 20px; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #141416; border: 1px solid #d4af37; padding: 36px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #d4af37; font-family: 'Cinzel', serif; font-size: 26px; letter-spacing: 4px; margin: 0;">MAISON AURALIC</h1>
                <p style="color: #a3a3a3; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-top: 6px;">Haute Joaillerie &bull; Geneve &bull; Paris &bull; London</p>
              </div>

              <p style="font-size: 15px; color: #f7f5f0;">Dear Valued Patron,</p>
              <p style="font-size: 14px; color: #d4d4d4;">We are honored to confirm receipt of your bespoke acquisition. Master artisans in our atelier have commenced preparation of your high jewellery creation.</p>

              <div style="background-color: #0b0b0c; border: 1px solid #262626; padding: 18px; margin: 24px 0;">
                <div style="font-size: 12px; color: #a3a3a3; text-transform: uppercase; letter-spacing: 1px;">Order Identifier</div>
                <div style="font-size: 18px; color: #d4af37; font-family: 'Cinzel', serif; margin-top: 4px;">#${order.order_number}</div>
                <div style="font-size: 12px; color: #737373; margin-top: 4px;">Placed on ${new Date(order.created_at || Date.now()).toLocaleDateString('en-US', { dateStyle: 'long' })}</div>
              </div>

              <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 13px;">
                <thead>
                  <tr style="border-bottom: 1px solid #d4af37; text-align: left; color: #d4af37; font-family: 'Cinzel', serif;">
                    <th style="padding-bottom: 8px;">Creation</th>
                    <th style="padding-bottom: 8px; text-align: center;">Qty</th>
                    <th style="padding-bottom: 8px; text-align: right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsListHtml}
                </tbody>
              </table>

              <div style="border-top: 1px solid #262626; padding-top: 16px; margin-top: 20px;">
                <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px;">
                  <span style="color: #a3a3a3;">Subtotal:</span>
                  <span style="color: #f7f5f0;">$${parseFloat(order.subtotal_usd || '0').toLocaleString()}</span>
                </div>
                ${
                  order.discount_usd > 0
                    ? `<div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px; color: #10b981;">
                        <span>Privilege Courtesy:</span>
                        <span>-$${parseFloat(order.discount_usd).toLocaleString()}</span>
                      </div>`
                    : ''
                }
                <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px;">
                  <span style="color: #a3a3a3;">Armoured Courier & Insurance:</span>
                  <span style="color: #f7f5f0;">${parseFloat(order.shipping_usd || '0') === 0 ? 'Complimentary' : `$${parseFloat(order.shipping_usd).toLocaleString()}`}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 18px; color: #d4af37; font-family: 'Cinzel', serif; margin-top: 12px; padding-top: 12px; border-top: 1px solid #d4af37;">
                  <span>Total Acquisition:</span>
                  <span>$${parseFloat(order.total_usd || '0').toLocaleString()} ${order.currency || 'USD'}</span>
                </div>
              </div>

              <div style="text-align: center; margin-top: 36px; padding-top: 24px; border-top: 1px solid #262626; font-size: 12px; color: #737373;">
                <p>Armoured logistics provided with full replacement value insurance.</p>
                <p>For private concierge assistance: <a href="mailto:${config.resend.adminEmail}" style="color: #d4af37; text-decoration: none;">${config.resend.adminEmail}</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      return true;
    } catch (err: any) {
      console.error('[EmailService] sendOrderConfirmation failed:', err.message);
      return false;
    }
  }

  /**
   * Send Password Reset Email with secure one-time cryptographic token
   */
  static async sendPasswordResetEmail(toEmail: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${config.frontendUrl}/login?resetToken=${resetToken}&email=${encodeURIComponent(toEmail)}`;

    if (!resendClient) {
      console.log(`[EmailService (Simulated)] Password reset URL for ${toEmail}: ${resetUrl}`);
      return true;
    }

    try {
      await resendClient.emails.send({
        from: config.resend.emailFrom,
        to: [toEmail],
        subject: `Security Notice: Patron Account Password Reset | Maison Auralic`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="background-color: #0b0b0c; color: #e5e5e5; font-family: 'Montserrat', sans-serif; padding: 40px 20px;">
            <div style="max-width: 500px; margin: 0 auto; background-color: #141416; border: 1px solid #d4af37; padding: 36px;">
              <h1 style="color: #d4af37; font-family: 'Cinzel', serif; font-size: 22px; letter-spacing: 3px; text-align: center;">MAISON AURALIC</h1>
              <p style="font-size: 14px; margin-top: 24px;">A request has been initiated to reset the authentication password for your patron vault.</p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" style="background-color: #d4af37; color: #0b0b0c; padding: 14px 28px; text-decoration: none; font-family: 'Cinzel', serif; font-weight: 600; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;">Reset Vault Password</a>
              </div>
              <p style="font-size: 12px; color: #737373;">This single-use cryptographic token expires in 60 minutes. If you did not initiate this request, please disregard this transmission.</p>
            </div>
          </body>
          </html>
        `,
      });
      return true;
    } catch (err: any) {
      console.error('[EmailService] sendPasswordResetEmail failed:', err.message);
      return false;
    }
  }
}
