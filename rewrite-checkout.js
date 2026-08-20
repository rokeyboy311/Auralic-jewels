const fs = require('fs');

let content = fs.readFileSync('app/checkout/page.tsx', 'utf8');

const importsToAdd = `
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent } from '@/lib/api';

// NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY should be set
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_123');

function CheckoutFormContent({ 
  finalTotalUSD, 
  currentCurrency,
  ...props
}: any) {
  const stripe = useStripe();
  const elements = useElements();
  // We'll pass down state/props to handle submission
  return (
    <form onSubmit={(e) => props.onSubmit(e, stripe, elements)} className="lg:col-span-7 space-y-8">
      {props.children}
    </form>
  );
}
`;

content = content.replace("import { brandConfig } from '@/lib/brandConfig';", "import { brandConfig } from '@/lib/brandConfig';\n" + importsToAdd);

// Move the <form> inside an Elements provider, but we need the form to be wrapped correctly.
// It's easier to overwrite the whole checkout page with a properly structured one.
