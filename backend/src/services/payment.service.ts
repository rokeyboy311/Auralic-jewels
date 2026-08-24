import { StripeService } from './stripe.service';

/**
 * Unified Payment Service Orchestration
 */
export class PaymentService {
  static async createIntent(
    amountUSD: number,
    currency: string = 'USD',
    orderIdOrMeta?: string | { orderId?: string; customerEmail?: string; [key: string]: any }
  ) {
    return await StripeService.createPaymentIntent(amountUSD, currency, orderIdOrMeta);
  }

  static async createPaymentIntent(
    amountUSD: number,
    currency: string = 'USD',
    orderIdOrMeta?: string | { orderId?: string; customerEmail?: string; [key: string]: any }
  ) {
    return await StripeService.createPaymentIntent(amountUSD, currency, orderIdOrMeta);
  }

  static async retrieveIntent(paymentIntentId: string) {
    return await StripeService.retrievePaymentIntent(paymentIntentId);
  }
}
