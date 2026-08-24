/**
 * Maison Auralic Email Notification Service
 * (Temporarily Paused / Simulated Mode as requested)
 */
export class EmailService {
  /**
   * General purpose email sender (Safe No-Op / Logger)
   */
  static async sendEmail(options: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    from?: string;
  }): Promise<boolean> {
    const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;
    console.log(`[EmailService (Temporarily Paused)] Email suppressed for: ${recipients} | Subject: "${options.subject}"`);
    return true;
  }

  /**
   * Order Confirmation Email (Safe No-Op / Logger)
   */
  static async sendOrderConfirmation(order: any): Promise<boolean> {
    console.log(`[EmailService (Temporarily Paused)] Order confirmation logged for #${order.order_number || order.orderNumber} to ${order.customer_email || order.customerEmail}`);
    return true;
  }

  /**
   * Password Reset Email (Safe No-Op / Logger)
   */
  static async sendPasswordResetEmail(toEmail: string, resetToken: string): Promise<boolean> {
    console.log(`[EmailService (Temporarily Paused)] Password reset token logged for ${toEmail}: ${resetToken}`);
    return true;
  }
}
