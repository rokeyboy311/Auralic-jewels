import Stripe from 'stripe';
import { config } from '../config';

const stripeClient = config.stripe.secretKey
  ? new Stripe(config.stripe.secretKey, {
      apiVersion: '2025-02-24.acacia' as any,
    })
  : null;

export class StripeService {
  static getClient(): Stripe | null {
    return stripeClient;
  }

  /**
   * Create cryptographic payment intent for high-value jewellery checkout
   */
  static async createPaymentIntent(
    amountUSD: number,
    currency: string = 'USD',
    orderIdOrMeta?: string | { orderId?: string; customerEmail?: string; [key: string]: any }
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    if (!stripeClient) {
      console.warn('[StripeService] Secret key not configured. Mocking clientSecret for development.');
      return {
        clientSecret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`,
        paymentIntentId: `pi_mock_${Date.now()}`,
      };
    }

    // Amount in cents (USD)
    const amountInCents = Math.round(amountUSD * 100);
    const metadata: Record<string, string> = {
      source: 'Auralic Haute Joaillerie E-Commerce',
    };

    if (typeof orderIdOrMeta === 'string') {
      metadata.orderId = orderIdOrMeta;
    } else if (orderIdOrMeta && typeof orderIdOrMeta === 'object') {
      Object.entries(orderIdOrMeta).forEach(([k, v]) => {
        if (v !== undefined && v !== null) metadata[k] = String(v);
      });
    }

    const intent = await stripeClient.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata,
    });

    return {
      clientSecret: intent.client_secret || '',
      paymentIntentId: intent.id,
    };
  }

  /**
   * Retrieve payment intent status
   */
  static async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent | null> {
    if (!stripeClient) return null;
    return await stripeClient.paymentIntents.retrieve(paymentIntentId);
  }

  /**
   * Construct webhook event with raw buffer signature verification
   */
  static constructWebhookEvent(payload: Buffer | string, signature: string): Stripe.Event | null {
    if (!stripeClient || !config.stripe.webhookSecret) return null;
    return stripeClient.webhooks.constructEvent(payload, signature, config.stripe.webhookSecret);
  }
}
