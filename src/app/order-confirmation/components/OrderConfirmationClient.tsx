'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

interface OrderData {
  orderNumber: string;
  customerName: string;
  email: string;
  county: string;
  address: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
}

function getDeliveryEstimate(county: string): string {
  const nairobiAreas = ['Nairobi', 'Kiambu', 'Machakos', 'Kajiado'];
  const isNairobi = nairobiAreas.some(area =>
    county?.toLowerCase().includes(area.toLowerCase())
  );
  if (isNairobi) {
    const today = new Date();
    const minDate = new Date(today);
    const maxDate = new Date(today);
    minDate.setDate(today.getDate() + 1);
    maxDate.setDate(today.getDate() + 2);
    const fmt = (d: Date) =>
      d.toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric' });
    return `${fmt(minDate)} – ${fmt(maxDate)}`;
  }
  const today = new Date();
  const minDate = new Date(today);
  const maxDate = new Date(today);
  minDate.setDate(today.getDate() + 2);
  maxDate.setDate(today.getDate() + 4);
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric' });
  return `${fmt(minDate)} – ${fmt(maxDate)}`;
}

const NEXT_STEPS = [
  {
    icon: 'EnvelopeIcon',
    title: 'Check your email',
    description: 'A confirmation email with your order details has been sent to your inbox.',
  },
  {
    icon: 'CubeIcon',
    title: 'Order is being prepared',
    description: 'Our team is picking and packing your items with care.',
  },
  {
    icon: 'TruckIcon',
    title: 'Out for delivery',
    description: "You\'ll receive an SMS when your order is on its way to you.",
  },
  {
    icon: 'HomeIcon',
    title: 'Delivered to your door',
    description: 'Enjoy your new items! Contact us if anything needs attention.',
  },
];

export default function OrderConfirmationClient() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [deliveryEstimate, setDeliveryEstimate] = useState('');

  useEffect(() => {
    // Try URL params first (passed from checkout redirect)
    const fromParams = searchParams.get('order');
    if (fromParams) {
      try {
        const parsed = JSON.parse(decodeURIComponent(fromParams)) as OrderData;
        setOrder(parsed);
        setDeliveryEstimate(getDeliveryEstimate(parsed.county));
        return;
      } catch {
        // fall through to sessionStorage
      }
    }

    // Fallback: sessionStorage (set by checkout before redirect)
    try {
      const stored = sessionStorage.getItem('swn_order_confirmation');
      if (stored) {
        const parsed = JSON.parse(stored) as OrderData;
        setOrder(parsed);
        setDeliveryEstimate(getDeliveryEstimate(parsed.county));
        sessionStorage.removeItem('swn_order_confirmation');
      }
    } catch {
      // no order data available
    }
  }, [searchParams]);

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <Icon name="ShoppingBagIcon" size={48} className="mx-auto text-muted mb-4" />
        <h1 className="text-xl font-display font-semibold mb-3">No order found</h1>
        <p className="text-sm text-muted-foreground mb-8">
          This page is only accessible right after placing an order.
        </p>
        <Link href="/shop" className="btn-primary">Browse the Shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      {/* Success header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <Icon name="CheckIcon" size={32} className="text-green-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-semibold text-foreground mb-2">
          Order Confirmed!
        </h1>
        <p className="text-sm text-muted-foreground">
          Thank you, <span className="font-medium text-foreground">{order.customerName.split(' ')[0]}</span>. Your payment was received and your order is confirmed.
        </p>
      </div>

      {/* Order number + delivery estimate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="border border-border p-5">
          <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-1.5">
            Order Number
          </p>
          <p className="text-xl font-display font-bold text-foreground tracking-wide">
            #{order.orderNumber}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Keep this for your records
          </p>
        </div>
        <div className="border border-border p-5 bg-accent/5">
          <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-1.5">
            Estimated Delivery
          </p>
          <p className="text-sm font-semibold text-foreground leading-snug">
            {deliveryEstimate}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Delivering to {order.county}
          </p>
        </div>
      </div>

      {/* Delivery address */}
      <div className="border border-border p-5 mb-8">
        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-3">
          Delivery Address
        </p>
        <div className="flex items-start gap-3">
          <Icon name="MapPinIcon" size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">{order.customerName}</p>
            <p className="text-xs text-muted-foreground">{order.address}</p>
            <p className="text-xs text-muted-foreground">{order.county}, Kenya</p>
          </div>
        </div>
      </div>

      {/* Payment summary */}
      <div className="border border-border p-5 mb-8">
        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-4">
          Payment Summary
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>KES {order.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery</span>
            <span className={order.deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
              {order.deliveryFee === 0 ? 'FREE' : `KES ${order.deliveryFee.toLocaleString()}`}
            </span>
          </div>
          <div className="flex justify-between font-semibold border-t border-border pt-3 mt-1">
            <span>Total Paid</span>
            <span className="text-base">KES {order.total.toLocaleString()}</span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Icon name="ShieldCheckIcon" size={12} />
          <span>
            Paid via{' '}
            <span className="font-semibold text-green-700">
              {order.paymentMethod === 'mpesa' ? 'M-Pesa' : order.paymentMethod === 'card' ? 'Card' : 'Cash on Delivery'}
            </span>
          </span>
        </div>
      </div>

      {/* Next steps */}
      <div className="mb-10">
        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-5">
          What Happens Next
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {NEXT_STEPS.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 p-4 border border-border bg-muted/10">
              <div className="w-8 h-8 bg-foreground/5 flex items-center justify-center flex-shrink-0">
                <Icon name={step.icon as Parameters<typeof Icon>[0]['name']} size={16} className="text-foreground" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground mb-0.5">{step.title}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Email notice */}
      <div className="bg-muted/20 border border-border p-4 mb-8 flex items-start gap-3">
        <Icon name="EnvelopeIcon" size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          A confirmation email has been sent to{' '}
          <span className="font-medium text-foreground">{order.email}</span>. Check your spam folder if you don&apos;t see it within a few minutes.
        </p>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/orders" className="btn-primary flex-1 text-center">
          View My Orders
        </Link>
        <Link href="/shop" className="btn-ghost flex-1 text-center">
          Continue Shopping
        </Link>
      </div>

      {/* Support */}
      <p className="text-xs text-muted-foreground text-center mt-6">
        Need help?{' '}
        <a href="mailto:hello@shopwithnaima.com" className="text-accent hover:underline">
          Contact us
        </a>{' '}
        and quote your order number.
      </p>
    </div>
  );
}
