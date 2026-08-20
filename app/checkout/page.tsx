'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Truck,
  CreditCard,
  Building,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  Tag,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getShippingMethods, createOrder, validateCoupon, createPaymentIntent } from '@/lib/api';
import { ShippingMethod } from '@/lib/types';
import { brandConfig } from '@/lib/brandConfig';

import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_123');

function CheckoutContent() {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const {
    items,
    subtotalUSD,
    discountUSD,
    couponCode,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCart();
  const { currentCurrency, formatPrice, formatRawAmount, currentCurrencyConfig } = useCurrency();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<string>('ship-insured-priority');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'wire' | 'apple_pay'>('stripe');

  // Patron Contact & Address Form
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [firstName, setFirstName] = useState((user?.name || '').split(' ')[0] || '');
  const [lastName, setLastName] = useState((user?.name || '').split(' ').slice(1).join(' ') || '');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateOrProvince, setStateOrProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [orderNotes, setOrderNotes] = useState('');

  // Card Holder 
  const [cardHolder, setCardHolder] = useState('');

  const [promoInput, setPromoInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function loadShipping() {
      const res = await getShippingMethods();
      if (res.success && res.data) {
        setShippingMethods(res.data);
        if (res.data.length > 0) {
          setSelectedShippingMethodId(res.data[0].id);
        }
      }
    }
    loadShipping();
  }, []);

  const selectedShipping = shippingMethods.find((m) => m.id === selectedShippingMethodId);
  const shippingCostUSD =
    selectedShipping?.isFreeAboveThreshold && subtotalUSD >= brandConfig.freeShippingThresholdUSD
      ? 0
      : selectedShipping?.costUSD || 0;

  // Tax calculation by country
  const taxRate = country === 'United States' ? 0.08 : country === 'United Kingdom' ? 0.2 : country === 'France' ? 0.2 : 0.05;
  const taxCostUSD = parseFloat(((subtotalUSD - discountUSD) * taxRate).toFixed(2));
  const finalTotalUSD = Math.max(0, subtotalUSD - discountUSD + shippingCostUSD + taxCostUSD);

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-6">
        <h1 className="font-serif text-3xl text-[#141210]">Your Acquisition Bag is Empty</h1>
        <p className="text-xs sm:text-sm text-[#73685a] max-w-md mx-auto">
          Please select fine jewellery pieces from our collections prior to proceeding with secure checkout.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#141210] text-[#faf8f5] text-xs uppercase tracking-[0.2em] hover:bg-[#9b7e46] transition-colors"
        >
          <span>Explore Haute Joaillerie</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const ok = await applyCoupon(promoInput.trim());
    if (ok) setPromoInput('');
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !phone || !firstName || !lastName || !addressLine1 || !city || !postalCode) {
      error('Missing Information', 'Please complete all required patron contact and delivery fields.');
      return;
    }

    setIsProcessing(true);

    try {
      if (paymentMethod === 'stripe') {
        if (!stripe || !elements) {
          error('Checkout Error', 'Stripe has not loaded yet.');
          setIsProcessing(false);
          return;
        }

        const intentRes = await createPaymentIntent(finalTotalUSD, currentCurrency);
        if (!intentRes.success || !intentRes.data?.clientSecret) {
          throw new Error('Failed to initialize secure payment session.');
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) throw new Error('Card element missing');

        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(intentRes.data.clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: cardHolder || `${firstName} ${lastName}`,
              email,
            },
          },
        });

        if (stripeError) {
          throw new Error(stripeError.message);
        }

        if (paymentIntent.status !== 'succeeded') {
          throw new Error('Payment was not successful.');
        }
      }

      const orderPayload = {
        userId: user?.id,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: {
          firstName,
          lastName,
          email,
          phone,
          addressLine1,
          addressLine2,
          city,
          stateOrProvince,
          postalCode,
          country,
        },
        items: items as any,
        couponCode: couponCode || undefined,
        shippingMethodId: selectedShippingMethodId,
        currency: currentCurrency,
        paymentMethod: (paymentMethod === 'stripe' ? 'stripe' : paymentMethod === 'wire' ? 'wire_transfer' : 'apple_pay') as any,
        notes: orderNotes,
      };

      const res = await createOrder(orderPayload);

      if (res.success && res.data) {
        clearCart();
        success('Order Confirmed', `Consignment #${res.data.orderNumber} has been secured.`);
        router.push(`/order-success?orderNumber=${res.data.orderNumber}`);
      } else {
        error('Acquisition Error', res.error || 'Could not place your order with the atelier.');
      }
    } catch (err: any) {
      error('Checkout Error', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Header & Assurance */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#ebdccd] pb-6">
        <div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-xs text-[#73685a] hover:text-[#141210] uppercase tracking-wider mb-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Return to Gallery</span>
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#141210] uppercase font-light">
            Maison Secure Acquisition
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#9b7e46] bg-[#f2ece2] px-3.5 py-2 border border-[#ebdccd]">
          <Lock className="w-4 h-4" />
          <span>256-Bit SSL Encrypted Vault Checkout</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* LEFT COLUMN: CHECKOUT FORMS */}
        <form onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-8">
          {/* STEP 1: PATRON CONTACT */}
          <div className="bg-[#faf8f5] p-6 border border-[#c5b49e]/40 space-y-4">
            <h2 className="font-serif text-xl text-[#141210] uppercase tracking-wide flex items-center gap-2">
              <span className="w-6 h-6 bg-[#141210] text-[#d4af37] text-xs flex items-center justify-center font-mono">
                1
              </span>
              <span>Patron Identity & Communication</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                  Confidential Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patron@domain.com"
                  className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                  Private Telephone (for courier) *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (212) 555-0188"
                  className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: DELIVERY DESTINATION */}
          <div className="bg-[#faf8f5] p-6 border border-[#c5b49e]/40 space-y-4">
            <h2 className="font-serif text-xl text-[#141210] uppercase tracking-wide flex items-center gap-2">
              <span className="w-6 h-6 bg-[#141210] text-[#d4af37] text-xs flex items-center justify-center font-mono">
                2
              </span>
              <span>Armored Delivery Destination</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Catherine"
                  className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Sterling"
                  className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                Street Address *
              </label>
              <input
                type="text"
                required
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="740 Park Avenue"
                className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                Apartment, Suite, Penthouse (Optional)
              </label>
              <input
                type="text"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="Suite 14B"
                className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="New York"
                  className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                  State / Region
                </label>
                <input
                  type="text"
                  value={stateOrProvince}
                  onChange={(e) => setStateOrProvince(e.target.value)}
                  placeholder="NY"
                  className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="10021"
                  className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                Country / Sovereign Territory *
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none"
              >
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="France">France</option>
                <option value="Switzerland">Switzerland</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="Monaco">Monaco</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="Italy">Italy</option>
                <option value="Singapore">Singapore</option>
                <option value="Japan">Japan</option>
                <option value="Hong Kong">Hong Kong</option>
                <option value="India">India</option>
              </select>
            </div>
          </div>

          {/* STEP 3: COURIER & TRANSIT LOGISTICS */}
          <div className="bg-[#faf8f5] p-6 border border-[#c5b49e]/40 space-y-4">
            <h2 className="font-serif text-xl text-[#141210] uppercase tracking-wide flex items-center gap-2">
              <span className="w-6 h-6 bg-[#141210] text-[#d4af37] text-xs flex items-center justify-center font-mono">
                3
              </span>
              <span>Insured Transit Method</span>
            </h2>

            <div className="space-y-3">
              {shippingMethods.map((method) => {
                const isFree = method.isFreeAboveThreshold && subtotalUSD >= brandConfig.freeShippingThresholdUSD;
                return (
                  <label
                    key={method.id}
                    className={`p-4 border block cursor-pointer transition-all ${
                      selectedShippingMethodId === method.id
                        ? 'bg-white border-[#141210] ring-1 ring-[#141210]'
                        : 'bg-[#f4efe9] border-[#c5b49e]/40 hover:border-[#9b7e46]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shippingMethod"
                          checked={selectedShippingMethodId === method.id}
                          onChange={() => setSelectedShippingMethodId(method.id)}
                          className="accent-[#9b7e46]"
                        />
                        <div>
                          <p className="font-serif text-sm font-medium text-[#141210]">{method.name}</p>
                          <p className="text-xs text-[#73685a] mt-0.5">{method.description}</p>
                          <p className="text-[11px] text-[#9b7e46] mt-1 font-mono">
                            Estimated: {method.estimatedDays}
                          </p>
                        </div>
                      </div>

                      <div className="text-right font-mono text-sm font-medium">
                        {isFree ? (
                          <span className="text-emerald-800 uppercase text-xs font-bold">Complimentary</span>
                        ) : (
                          <span>{formatPrice(method.costUSD)}</span>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* STEP 4: PAYMENT SETTLEMENT */}
          <div className="bg-[#faf8f5] p-6 border border-[#c5b49e]/40 space-y-4">
            <h2 className="font-serif text-xl text-[#141210] uppercase tracking-wide flex items-center gap-2">
              <span className="w-6 h-6 bg-[#141210] text-[#d4af37] text-xs flex items-center justify-center font-mono">
                4
              </span>
              <span>Payment & Settlement</span>
            </h2>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('stripe')}
                className={`py-3 px-2 text-center border text-xs uppercase tracking-wider flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'stripe'
                    ? 'bg-[#141210] text-[#d4af37] border-[#141210] font-medium'
                    : 'bg-white text-[#4a4237] border-[#c5b49e]/60'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Credit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('wire')}
                className={`py-3 px-2 text-center border text-xs uppercase tracking-wider flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'wire'
                    ? 'bg-[#141210] text-[#d4af37] border-[#141210] font-medium'
                    : 'bg-white text-[#4a4237] border-[#c5b49e]/60'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Bank Wire</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('apple_pay')}
                className={`py-3 px-2 text-center border text-xs uppercase tracking-wider flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'apple_pay'
                    ? 'bg-[#141210] text-[#d4af37] border-[#141210] font-medium'
                    : 'bg-white text-[#4a4237] border-[#c5b49e]/60'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Apple Pay / Vault</span>
              </button>
            </div>

            {paymentMethod === 'stripe' && (
              <div className="p-4 bg-white border border-[#c5b49e]/60 space-y-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="Lady Catherine Sterling"
                    className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none mb-3"
                  />
                  
                  <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
                    Card Details
                  </label>
                  <div className="p-3 bg-white border border-[#c5b49e]/60">
                    <CardElement 
                      options={{
                        style: {
                          base: {
                            fontSize: '14px',
                            color: '#141210',
                            fontFamily: 'monospace',
                            '::placeholder': {
                              color: '#aab7c4',
                            },
                          },
                          invalid: {
                            color: '#9e2146',
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'wire' && (
              <div className="p-4 bg-white border border-[#c5b49e]/60 text-xs text-[#4a4237] space-y-2">
                <p className="font-semibold text-[#141210]">Maison Aurelia Private Client Escrow Account:</p>
                <p>Bank: BNP Paribas Paris Place Vendôme</p>
                <p>IBAN: FR76 3000 4001 2345 6789 0123 456</p>
                <p>BIC/SWIFT: BNPAFRPP</p>
                <p className="text-[11px] text-[#73685a] pt-1">
                  Upon placing this order, our Senior Treasury Officer will issue an official pro-forma invoice and lock your pieces for 48 hours.
                </p>
              </div>
            )}

            {paymentMethod === 'apple_pay' && (
              <div className="p-4 bg-white border border-[#c5b49e]/60 text-center text-xs text-[#4a4237] space-y-2">
                <p>Biometric authentication will be initiated upon confirming the acquisition below.</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#4a4237] mb-1">
              Private Concierge Notes / Inscription Request (Optional)
            </label>
            <textarea
              rows={2}
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="e.g. Please include bespoke calligraphy gift note, or custom ring engraving 'Forever 2026'..."
              className="w-full bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 bg-[#141210] hover:bg-[#9b7e46] text-[#faf8f5] text-xs uppercase tracking-[0.22em] font-medium flex items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-50"
          >
            <span>{isProcessing ? 'Securing Acquisition...' : `Authorize Acquisition (${formatPrice(finalTotalUSD)})`}</span>
            <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
          </button>
        </form>

        {/* RIGHT COLUMN: ORDER SUMMARY SIDEBAR */}
        <aside className="lg:col-span-5 bg-[#faf8f5] border border-[#c5b49e]/40 p-6 space-y-6 sticky top-28">
          <div className="border-b border-[#ebdccd] pb-3 flex items-center justify-between">
            <h2 className="font-serif text-xl text-[#141210] uppercase tracking-wider">
              Acquisition Summary
            </h2>
            <span className="text-xs text-[#9b7e46] font-mono">
              {items.length} {items.length === 1 ? 'Piece' : 'Pieces'}
            </span>
          </div>

          {/* Items Preview */}
          <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 text-xs">
                <div className="relative w-16 h-20 bg-[#ede5d8] shrink-0 border border-[#c5b49e]/30">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-sm text-[#141210] truncate">{item.name}</p>
                  <p className="text-[11px] text-[#73685a] mt-0.5">
                    {item.purity} {item.metalType} {item.size ? `• Sz ${item.size}` : ''}
                  </p>
                  <p className="text-[11px] text-[#9b7e46]">Qty: {item.quantity}</p>
                </div>
                <div className="text-right font-mono text-sm text-[#141210]">
                  {formatPrice(item.unitPriceUSD * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Privilege Promo Code */}
          <div className="border-t border-[#ebdccd] pt-4">
            {couponCode ? (
              <div className="flex items-center justify-between bg-[#ebdccd] px-3 py-2 text-xs">
                <div className="flex items-center gap-1.5 text-[#2b2621]">
                  <Tag className="w-3.5 h-3.5 text-[#9b7e46]" />
                  <span>
                    Code <strong>{couponCode}</strong> applied (-{formatPrice(discountUSD)})
                  </span>
                </div>
                <button onClick={removeCoupon} className="text-red-700 text-[11px] underline">
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Privilege Code (e.g. WELCOME10)"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  className="flex-1 bg-white border border-[#c5b49e]/60 px-3 py-2 text-xs text-[#141210] uppercase tracking-wider focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-4 py-2 bg-[#141210] text-[#faf8f5] text-xs uppercase tracking-widest hover:bg-[#9b7e46] transition-colors"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Pricing Totals */}
          <div className="border-t border-[#ebdccd] pt-4 space-y-2 text-xs text-[#4a4237]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono text-[#141210]">{formatPrice(subtotalUSD)}</span>
            </div>
            {discountUSD > 0 && (
              <div className="flex justify-between text-[#9b7e46]">
                <span>Patron Privilege Discount</span>
                <span className="font-mono">-{formatPrice(discountUSD)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Armored Air Courier ({selectedShipping?.name || 'Insured'})</span>
              <span className="font-mono">
                {shippingCostUSD === 0 ? 'Complimentary' : formatPrice(shippingCostUSD)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated VAT / Import Duty ({Math.round(taxRate * 100)}%)</span>
              <span className="font-mono">{formatPrice(taxCostUSD)}</span>
            </div>

            <div className="border-t border-[#ebdccd] pt-3 flex justify-between items-baseline">
              <div>
                <span className="font-serif text-lg text-[#141210] uppercase font-medium block">
                  Grand Total
                </span>
                <span className="text-[10px] text-[#73685a]">Settled in {currentCurrency}</span>
              </div>
              <span className="font-serif text-2xl text-[#9b7e46] font-semibold">
                {formatPrice(finalTotalUSD)}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#ebdccd] space-y-2 text-[11px] text-[#73685a]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#9b7e46]" />
              <span>Full In-Transit Ferrari Group Insurance Included</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#9b7e46]" />
              <span>GIA/IGI Laser-Inscribed Certification Certificate Enclosed</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutContent />
    </Elements>
  );
}
