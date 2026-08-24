/**
 * Stripe Service Stub (Payment Gateways are bypassed)
 */
export class StripeService {
  static getClient(): null {
    return null;
  }

  static async createPaymentIntent(
    amountUSD: number,
    currency: string = 'USD',
    _orderIdOrMeta?: any
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    return {
      clientSecret: `pi_direct_${Date.now()}`,
      paymentIntentId: `pi_direct_${Date.now()}`,
    };
  }

  static async retrievePaymentIntent(paymentIntentId: string) {
    return {
      id: paymentIntentId,
      status: 'succeeded',
    };
  }

  static constructWebhookEvent(_payload: any, _signature: string) {
    return null;
  }
}
