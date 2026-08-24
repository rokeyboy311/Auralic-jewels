/**
 * Payment Service (Direct Consignments & Wire Transfers)
 * Payment gateway integrated flow is removed as requested.
 */
export class PaymentService {
  static async createIntent(
    amountUSD: number,
    currency: string = 'USD',
    orderIdOrMeta?: string | { orderId?: string; customerEmail?: string; [key: string]: any }
  ) {
    return {
      clientSecret: `direct_consignment_${Date.now()}`,
      paymentIntentId: `consign_${Date.now()}`,
      amountUSD,
      currency,
      status: 'direct_consignment_approved',
    };
  }

  static async createPaymentIntent(
    amountUSD: number,
    currency: string = 'USD',
    orderIdOrMeta?: string | { orderId?: string; customerEmail?: string; [key: string]: any }
  ) {
    return this.createIntent(amountUSD, currency, orderIdOrMeta);
  }

  static async retrieveIntent(paymentIntentId: string) {
    return {
      id: paymentIntentId,
      status: 'succeeded',
    };
  }
}
