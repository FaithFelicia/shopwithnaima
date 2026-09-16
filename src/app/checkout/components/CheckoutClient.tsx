'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { CartItem, getCart, clearCart } from '@/lib/cartStore';
import { KENYAN_COUNTIES } from '@/lib/mockData';

const DELIVERY_FEE = 300;
const FREE_DELIVERY_THRESHOLD = 5000;

// ── M-Pesa receiving number ──────────────────────────────────────────────────
// This is the Shop With Naima M-Pesa number that receives payments.
// In production, register this number as a Safaricom Till/Paybill and set
// MPESA_SHORTCODE in your .env to the registered shortcode.
const MPESA_RECEIVING_NUMBER = '0758733214';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

type PaymentMethod = 'mpesa' | 'card' | 'cash';

interface DeliveryForm {
  fullName: string;
  phone: string;
  email: string;
  county: string;
  address: string;
  instructions: string;
}

type MpesaStatus = 'idle' | 'sending' | 'waiting' | 'success' | 'failed' | 'cancelled';

export default function CheckoutClient() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [step, setStep] = useState<'delivery' | 'payment' | 'confirm'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [mpesaStatus, setMpesaStatus] = useState<MpesaStatus>('idle');
  const [mpesaMessage, setMpesaMessage] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [form, setForm] = useState<DeliveryForm>({
    fullName: '',
    phone: '',
    email: '',
    county: '',
    address: '',
    instructions: '',
  });
  const [errors, setErrors] = useState<Partial<DeliveryForm>>({});

  useEffect(() => {
    setItems(getCart());
  }, []);

  const subtotal = items.reduce((sum, item) => sum + (item.discountPrice ?? item.price) * item.quantity, 0);
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  const updateForm = (field: keyof DeliveryForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateDelivery = (): boolean => {
    const newErrors: Partial<DeliveryForm> = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.phone.trim() || !/^(\+254|0)[17]\d{8}$/.test(form.phone.replace(/\s/g, '')))
      newErrors.phone = 'Enter a valid Kenyan phone number';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = 'Enter a valid email address';
    if (!form.county) newErrors.county = 'Please select your county';
    if (!form.address.trim()) newErrors.address = 'Delivery address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDeliveryNext = () => {
    if (validateDelivery()) {
      // Pre-fill M-Pesa phone from delivery phone
      setMpesaPhone(form.phone);
      setStep('payment');
    }
  };

  /**
   * Send order confirmation email via Supabase Edge Function → Resend.
   * Fires-and-forgets; errors are logged but don't block the UI.
   */
  const sendOrderConfirmationEmail = async (orderId: string) => {
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/send-order-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: orderId,
          customerName: form.fullName,
          customerEmail: form.email,
          items: items.map(item => ({
            name: item.name,
            size: item.size ?? '',
            color: item.color ?? '',
            quantity: item.quantity,
            price: item.discountPrice ?? item.price,
          })),
          subtotal,
          deliveryFee,
          total,
          deliveryAddress: form.address,
          county: form.county,
          paymentMethod,
        }),
      });
    } catch (err) {
      console.error('[CheckoutClient] Failed to send confirmation email:', err);
    }
  };

  /**
   * Redirect to the order confirmation page, passing order data via sessionStorage.
   */
  const redirectToConfirmation = (orderId: string, method: PaymentMethod) => {
    const orderData = {
      orderNumber: orderId,
      customerName: form.fullName,
      email: form.email,
      county: form.county,
      address: form.address,
      subtotal,
      deliveryFee,
      total,
      paymentMethod: method,
    };
    try {
      sessionStorage.setItem('swn_order_confirmation', JSON.stringify(orderData));
    } catch {
      // sessionStorage unavailable — fall back to inline confirmation
    }
    router.push('/order-confirmation');
  };

  /**
   * Poll Daraja to check if the STK Push was approved.
   * Polls every 3 seconds for up to 60 seconds.
   */
  const pollPaymentStatus = async (reqId: string, orderId: string) => {
    const maxAttempts = 20; // 20 × 3s = 60s
    let attempts = 0;

    const poll = async (): Promise<void> => {
      attempts++;
      try {
        const res = await fetch('/api/payments/mpesa/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkoutRequestId: reqId }),
        });
        const data = await res.json();

        if (data.paid) {
          // ── Payment confirmed ──────────────────────────────────────────────
          setMpesaStatus('success');
          setMpesaMessage('Payment confirmed! Placing your order...');
          clearCart();
          setOrderNumber(orderId);
          await sendOrderConfirmationEmail(orderId);
          setOrderPlaced(true);
          redirectToConfirmation(orderId, 'mpesa');
          return;
        }

        // ResultCode 1032 = user cancelled, 1037 = timeout
        if (data.resultCode === '1032' || data.resultCode === 1032) {
          setMpesaStatus('cancelled');
          setMpesaMessage('Payment was cancelled. Please try again.');
          return;
        }

        if (data.resultCode === '1037' || data.resultCode === 1037) {
          setMpesaStatus('failed');
          setMpesaMessage('Payment request timed out. Please try again.');
          return;
        }

        // Still pending — keep polling
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000);
        } else {
          setMpesaStatus('failed');
          setMpesaMessage('Could not confirm payment. If you paid, your order will be processed shortly.');
        }
      } catch {
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000);
        } else {
          setMpesaStatus('failed');
          setMpesaMessage('Network error while checking payment. Please contact support.');
        }
      }
    };

    await poll();
  };

  /**
   * Initiate real M-Pesa STK Push via Daraja API.
   * Calls POST /api/payments/mpesa/stk-push → Daraja → customer phone prompt.
   */
  const handleMpesaPayment = async (orderId: string) => {
    const phoneToUse = mpesaPhone.trim() || form.phone.trim();

    if (!phoneToUse || !/^(\+254|0)[17]\d{8}$/.test(phoneToUse.replace(/\s/g, ''))) {
      setMpesaMessage('Please enter a valid M-Pesa phone number.');
      return;
    }

    setMpesaStatus('sending');
    setMpesaMessage('Sending M-Pesa prompt to your phone...');

    try {
      const res = await fetch('/api/payments/mpesa/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneToUse,
          amount: total,
          orderId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setMpesaStatus('failed');
        setMpesaMessage(
          data.details ||
          data.error ||
          'Failed to send M-Pesa prompt. Please check your number and try again.'
        );
        return;
      }

      // STK Push sent — now poll for confirmation
      setCheckoutRequestId(data.checkoutRequestId);
      setMpesaStatus('waiting');
      setMpesaMessage(
        data.customerMessage ||
        'Check your phone and enter your M-Pesa PIN to complete payment.'
      );

      await pollPaymentStatus(data.checkoutRequestId, orderId);
    } catch {
      setMpesaStatus('failed');
      setMpesaMessage('Network error. Please check your connection and try again.');
    }
  };

  const handlePlaceOrder = async () => {
    const orderId = `SWN-${Date.now().toString().slice(-6)}`;
    setOrderNumber(orderId);

    if (paymentMethod === 'mpesa') {
      await handleMpesaPayment(orderId);
      // Order placement happens inside handleMpesaPayment after confirmation
      return;
    }

    // Non-M-Pesa: place order immediately
    clearCart();
    await sendOrderConfirmationEmail(orderId);
    setOrderPlaced(true);
    redirectToConfirmation(orderId, paymentMethod);
  };

  if (orderPlaced) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="CheckIcon" size={32} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-display font-semibold text-foreground mb-3">Order Confirmed!</h1>
        <p className="text-sm text-muted-foreground mb-2">
          Your order <span className="font-semibold text-foreground">#{orderNumber}</span> has been placed.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          We&apos;ll send a confirmation to <span className="font-medium text-foreground">{form.email}</span>. Delivery to {form.county} in 1–3 business days.
        </p>
        <div className="bg-muted/30 border border-border p-6 mb-8 text-left">
          <p className="text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-3">Order Summary</p>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Subtotal</span>
            <span>KES {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm mb-3">
            <span className="text-muted-foreground">Delivery</span>
            <span>{deliveryFee === 0 ? 'FREE' : `KES ${deliveryFee.toLocaleString()}`}</span>
          </div>
          <div className="flex justify-between font-semibold border-t border-border pt-3">
            <span>Total Paid</span>
            <span>KES {total.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">Back to Home</Link>
          <Link href="/shop" className="btn-ghost">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <Icon name="ShoppingBagIcon" size={48} className="mx-auto text-muted mb-4" />
        <h1 className="text-xl font-display font-semibold mb-4">Your cart is empty</h1>
        <Link href="/shop" className="btn-primary">Shop Now</Link>
      </div>
    );
  }

  const mpesaLoading = mpesaStatus === 'sending' || mpesaStatus === 'waiting';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-display-lg font-display font-semibold text-foreground mb-8">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-3 mb-10">
        {(['delivery', 'payment', 'confirm'] as const).map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 flex items-center justify-center text-xs font-bold transition-colors ${
                step === s ? 'bg-primary text-primary-foreground' :
                (['delivery', 'payment', 'confirm'].indexOf(step) > i) ? 'bg-accent text-white' :
                'bg-muted text-muted-foreground'
              }`}>
                {(['delivery', 'payment', 'confirm'].indexOf(step) > i) ? <Icon name="CheckIcon" size={12} /> : i + 1}
              </div>
              <span className={`text-xs font-semibold tracking-wide uppercase hidden sm:block ${step === s ? 'text-foreground' : 'text-muted-foreground'}`}>
                {s}
              </span>
            </div>
            {i < 2 && <div className="flex-1 h-px bg-border max-w-[60px]" />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Form */}
        <div className="lg:col-span-7">
          {/* Step 1: Delivery */}
          {step === 'delivery' && (
            <div>
              <h2 className="text-sm font-semibold tracking-[0.1em] uppercase mb-6">Delivery Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-muted-foreground mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={e => updateForm('fullName', e.target.value)}
                    placeholder="e.g. Amina Wanjiru"
                    className={`input-field ${errors.fullName ? 'border-red-400' : ''}`}
                  />
                  {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-muted-foreground mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => updateForm('phone', e.target.value)}
                      placeholder="0712 345 678"
                      className={`input-field ${errors.phone ? 'border-red-400' : ''}`}
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-muted-foreground mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => updateForm('email', e.target.value)}
                      placeholder="you@email.com"
                      className={`input-field ${errors.email ? 'border-red-400' : ''}`}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-muted-foreground mb-2">
                    County / City *
                  </label>
                  <select
                    value={form.county}
                    onChange={e => updateForm('county', e.target.value)}
                    className={`input-field cursor-pointer ${errors.county ? 'border-red-400' : ''}`}
                  >
                    <option value="">Select your county</option>
                    {KENYAN_COUNTIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.county && <p className="text-xs text-red-500 mt-1">{errors.county}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-muted-foreground mb-2">
                    Delivery Address *
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={e => updateForm('address', e.target.value)}
                    placeholder="Street, Estate, Building, Apartment No."
                    className={`input-field ${errors.address ? 'border-red-400' : ''}`}
                  />
                  {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-muted-foreground mb-2">
                    Additional Instructions
                  </label>
                  <textarea
                    value={form.instructions}
                    onChange={e => updateForm('instructions', e.target.value)}
                    placeholder="Landmark, gate color, preferred delivery time..."
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>

                <button onClick={handleDeliveryNext} className="btn-primary w-full mt-2">
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 'payment' && (
            <div>
              <button
                onClick={() => setStep('delivery')}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <Icon name="ArrowLeftIcon" size={14} />
                Back to Delivery
              </button>

              <h2 className="text-sm font-semibold tracking-[0.1em] uppercase mb-6">Payment Method</h2>

              {/* Delivery Summary */}
              <div className="bg-muted/30 border border-border p-4 mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold tracking-wide uppercase text-muted-foreground mb-1">Delivering to</p>
                  <p className="text-sm font-medium text-foreground">{form.fullName}</p>
                  <p className="text-xs text-muted-foreground">{form.address}, {form.county}</p>
                  <p className="text-xs text-muted-foreground">{form.phone}</p>
                </div>
                <button onClick={() => setStep('delivery')} className="text-xs text-accent hover:underline flex-shrink-0">Edit</button>
              </div>

              {/* Payment options */}
              <div className="space-y-3 mb-6">
                {/* M-Pesa */}
                <div
                  onClick={() => setPaymentMethod('mpesa')}
                  className={`border p-4 cursor-pointer transition-all ${
                    paymentMethod === 'mpesa' ? 'border-foreground bg-muted/20' : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === 'mpesa' ? 'border-foreground' : 'border-muted-foreground'
                    }`}>
                      {paymentMethod === 'mpesa' && <div className="w-2 h-2 rounded-full bg-foreground" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-green-600">M-PESA</span>
                      <span className="badge bg-green-100 text-green-700 text-[10px]">Recommended</span>
                    </div>
                  </div>

                  {paymentMethod === 'mpesa' && (
                    <div className="mt-3 ml-7">
                      {/* Receiving number info */}
                      <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
                        <p className="text-xs text-green-700 font-semibold tracking-wide uppercase mb-1">Paying to</p>
                        <p className="text-lg font-bold text-green-800">{MPESA_RECEIVING_NUMBER}</p>
                        <p className="text-xs text-green-600 mt-1">Shop With Naima</p>
                      </div>

                      <p className="text-xs text-muted-foreground mb-2">
                        Enter the M-Pesa number to receive the payment prompt (STK Push):
                      </p>
                      <input
                        type="tel"
                        value={mpesaPhone}
                        onChange={e => {
                          setMpesaPhone(e.target.value);
                          // Reset status when user edits phone
                          if (mpesaStatus !== 'idle') {
                            setMpesaStatus('idle');
                            setMpesaMessage('');
                          }
                        }}
                        placeholder="0712 345 678"
                        className="input-field text-sm py-2.5"
                        onClick={e => e.stopPropagation()}
                        disabled={mpesaLoading}
                      />

                      {/* M-Pesa status messages */}
                      {mpesaMessage && (
                        <div className={`mt-3 p-3 rounded text-xs flex items-start gap-2 ${
                          mpesaStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                          mpesaStatus === 'failed'|| mpesaStatus === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {mpesaStatus === 'waiting' && (
                            <svg className="animate-spin h-3.5 w-3.5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                          )}
                          <span>{mpesaMessage}</span>
                        </div>
                      )}

                      {/* Retry button on failure */}
                      {(mpesaStatus === 'failed' || mpesaStatus === 'cancelled') && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setMpesaStatus('idle');
                            setMpesaMessage('');
                          }}
                          className="mt-2 text-xs text-accent hover:underline"
                        >
                          Try again
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Card */}
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`border p-4 cursor-pointer transition-all ${
                    paymentMethod === 'card' ? 'border-foreground bg-muted/20' : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === 'card' ? 'border-foreground' : 'border-muted-foreground'
                    }`}>
                      {paymentMethod === 'card' && <div className="w-2 h-2 rounded-full bg-foreground" />}
                    </div>
                    <span className="text-sm font-medium">Credit / Debit Card</span>
                    <div className="ml-auto flex gap-1.5">
                      <span className="text-xs font-bold text-blue-700 border border-blue-200 px-1.5 py-0.5">VISA</span>
                      <span className="text-xs font-bold text-red-600 border border-red-200 px-1.5 py-0.5">MC</span>
                    </div>
                  </div>
                  {paymentMethod === 'card' && (
                    <div className="mt-3 ml-7 space-y-3">
                      <p className="text-xs text-muted-foreground">Card payments are processed securely.</p>
                      <input type="text" placeholder="Card Number" className="input-field text-sm py-2.5" onClick={e => e.stopPropagation()} />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="MM / YY" className="input-field text-sm py-2.5" onClick={e => e.stopPropagation()} />
                        <input type="text" placeholder="CVV" className="input-field text-sm py-2.5" onClick={e => e.stopPropagation()} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod('cash')}
                  className={`border p-4 cursor-pointer transition-all ${
                    paymentMethod === 'cash' ? 'border-foreground bg-muted/20' : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === 'cash' ? 'border-foreground' : 'border-muted-foreground'
                    }`}>
                      {paymentMethod === 'cash' && <div className="w-2 h-2 rounded-full bg-foreground" />}
                    </div>
                    <span className="text-sm font-medium">Cash on Delivery</span>
                    <span className="ml-auto text-xs text-muted-foreground">Nairobi only</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={mpesaLoading}
                className="btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {mpesaLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    {mpesaStatus === 'sending' ? 'Sending M-Pesa Prompt...' : 'Waiting for Payment...'}
                  </>
                ) : (
                  `Place Order · KES ${total.toLocaleString()}`
                )}
              </button>

              <p className="text-xs text-muted-foreground text-center mt-3 flex items-center justify-center gap-1.5">
                <Icon name="ShieldCheckIcon" size={12} />
                Secured with 256-bit SSL encryption
              </p>
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5">
          <div className="border border-border p-6 sticky top-24">
            <h2 className="text-sm font-semibold tracking-[0.1em] uppercase mb-5">Your Order ({items.length})</h2>

            <div className="space-y-4 mb-6 max-h-72 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-14 h-16 flex-shrink-0 overflow-hidden bg-muted relative">
                    <AppImage
                      src={item.image}
                      alt={`${item.name} order summary item, bright product photo`}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-muted-foreground text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground leading-snug mb-0.5 truncate">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">{item.size} · {item.color}</p>
                  </div>
                  <p className="text-xs font-semibold text-foreground flex-shrink-0">
                    KES {((item.discountPrice ?? item.price) * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-border pt-4 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>KES {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className={deliveryFee === 0 ? 'text-green-600' : ''}>
                  {deliveryFee === 0 ? 'FREE' : `KES ${deliveryFee.toLocaleString()}`}
                </span>
              </div>
            </div>

            <div className="flex justify-between font-semibold border-t border-border pt-4">
              <span>Total</span>
              <span className="text-lg">KES {total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}