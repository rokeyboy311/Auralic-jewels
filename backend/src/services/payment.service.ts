import { StripeService } from './stripe.service';

/**
 * Unified Payment Service Orchestration
 */
export class PaymentService {
  static async createIntent(amountUSD: number, currency: string = 'USD', orderId?: string) {
    return await StripeService.createPaymentIntent(amountUSD, currency, orderId);
  }

  static async retrieveIntent(paymentIntentId: string) {
    return await StripeService.retrievePaymentIntent(paymentIntentId);
  }
}
