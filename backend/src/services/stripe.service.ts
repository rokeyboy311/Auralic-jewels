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
    orderId?: string
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

    const intent = await stripeClient.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: orderId || 'pending_order',
        source: 'Auralic Haute Joaillerie E-Commerce',
      },
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
  static constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
    if (!stripeClient) {
      throw new Error('Stripe client is not initialized.');
    }
    return stripeClient.webhooks.constructEvent(
      rawBody,
      signature,
      config.stripe.webhookSecret
    );
  }
}
