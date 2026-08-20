const fs = require('fs');
let content = fs.readFileSync('backend/src/routes/api.routes.ts', 'utf8');

const stripeRoute = `
// ==========================================================
// STRIPE PAYMENT INTENT
// ==========================================================
const Stripe = require('stripe').default || require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_123');

router.post('/stripe/intent', optionalAuth, async (req, res) => {
  try {
    const { amountUSD, currency } = req.body;
    
    // Amount must be in cents
    const amountInCents = Math.round(amountUSD * 100);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: (currency || 'usd').toLowerCase(),
      payment_method_types: ['card'],
    });
    
    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
`;

if (!content.includes('/stripe/intent')) {
  content = content.replace(/\/\/ ==========================================================\n\/\/ ORDERS & CHECKOUT/g, stripeRoute + '\n// ==========================================================\n// ORDERS & CHECKOUT');
  fs.writeFileSync('backend/src/routes/api.routes.ts', content);
}
