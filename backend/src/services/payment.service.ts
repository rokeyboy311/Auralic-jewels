import Stripe from 'stripe';
import { config } from '../config';

export class PaymentService {
  private static stripeClient: Stripe | null = null;

  private static getClient(): Stripe | null {
    if (!this.stripeClient && config.stripe.secretKey) {
      this.stripeClient = new Stripe(config.stripe.secretKey, {
        apiVersion: '2025-01-27.acacia' as any,
      });
    }
    return this.stripeClient;
  }

  static async createPaymentIntent(amountUSD: number, currency: string = 'usd', metadata: Record<string, string> = {}) {
    const stripe = this.getClient();
    if (!stripe) {
      // Return simulated client secret for local testing before Stripe keys are plugged in
      return {
        clientSecret: `pi_test_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`,
        isTestFallback: true,
      };
    }

    try {
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(amountUSD * 100), // cents
        currency: currency.toLowerCase(),
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: intent.client_secret,
        id: intent.id,
        isTestFallback: false,
      };
    } catch (err: any) {
      console.error('[Aurelia Stripe] Intent creation error:', err.message);
      throw err;
    }
  }

  static verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event | null {
    const stripe = this.getClient();
    if (!stripe || !config.stripe.webhookSecret) return null;

    try {
      return stripe.webhooks.constructEvent(payload, signature, config.stripe.webhookSecret);
    } catch (err: any) {
      console.error('[Aurelia Stripe] Webhook signature verification failed:', err.message);
      return null;
    }
  }
}
