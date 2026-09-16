'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { CartItem, getCart, removeFromCart, updateQty } from '@/lib/cartStore';

const DELIVERY_FEE = 300;
const FREE_DELIVERY_THRESHOLD = 5000;

const DISCOUNT_CODES: Record<string, number> = {
  NAIMA20: 0.20,
  WELCOME10: 0.10,
  STYLE15: 0.15,
};

export default function CartClient() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedCode, setAppliedCode] = useState('');
  const [discountError, setDiscountError] = useState('');
  const [discountRate, setDiscountRate] = useState(0);

  const refreshCart = () => setItems(getCart());

  useEffect(() => {
    refreshCart();
    window.addEventListener('cart-updated', refreshCart);
    return () => window.removeEventListener('cart-updated', refreshCart);
  }, []);

  const subtotal = items.reduce((sum, item) => sum + (item.discountPrice ?? item.price) * item.quantity, 0);
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const discountAmount = Math.round(subtotal * discountRate);
  const total = subtotal + deliveryFee - discountAmount;

  const handleApplyCode = () => {
    const code = discountCode.toUpperCase().trim();
    if (DISCOUNT_CODES[code]) {
      setAppliedCode(code);
      setDiscountRate(DISCOUNT_CODES[code]);
      setDiscountError('');
    } else {
      setDiscountError('Invalid discount code. Try NAIMA20');
      setAppliedCode('');
      setDiscountRate(0);
    }
  };

  const handleRemoveCode = () => {
    setAppliedCode('');
    setDiscountRate(0);
    setDiscountCode('');
    setDiscountError('');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="max-w-sm mx-auto">
          <Icon name="ShoppingBagIcon" size={64} className="mx-auto text-muted mb-6" />
          <h1 className="text-2xl font-display font-semibold text-foreground mb-3">Your cart is empty</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Looks like you haven&apos;t added anything yet. Discover our latest styles.
          </p>
          <Link href="/shop" className="btn-primary">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-display-lg font-display font-semibold text-foreground mb-8">
        Shopping Cart <span className="text-muted-foreground text-2xl font-light">({items.length})</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between pb-4 border-b border-border mb-2">
            <span className="text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground">Product</span>
            <div className="hidden sm:flex items-center gap-12 text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground">
              <span>Qty</span>
              <span>Total</span>
            </div>
          </div>

          {items.map(item => (
            <div key={item.id} className="cart-item-row items-start sm:items-center">
              {/* Image */}
              <Link href={`/product-detail?id=${item.productId}`} className="flex-shrink-0 w-20 h-24 sm:w-24 sm:h-28 overflow-hidden bg-muted image-zoom">
                <AppImage
                  src={item.image}
                  alt={`${item.name} cart item, bright product photography, clean background`}
                  width={96}
                  height={112}
                  className="object-cover w-full h-full"
                />
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link href={`/product-detail?id=${item.productId}`}>
                  <h3 className="text-sm font-medium text-foreground hover:text-accent transition-colors mb-1 leading-snug">
                    {item.name}
                  </h3>
                </Link>
                <p className="text-xs text-muted-foreground mb-1 capitalize">{item.category}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span>Size: <span className="text-foreground font-medium">{item.size}</span></span>
                  <span>·</span>
                  <span>Color: <span className="text-foreground font-medium">{item.color}</span></span>
                </div>

                {/* Price (mobile) */}
                <div className="sm:hidden mb-3">
                  <span className="text-sm font-semibold text-foreground">
                    KES {((item.discountPrice ?? item.price) * item.quantity).toLocaleString()}
                  </span>
                  {item.discountPrice && (
                    <span className="text-xs text-muted-foreground line-through ml-2">
                      KES {(item.price * item.quantity).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    <button
                      onClick={() => {
                        if (item.quantity <= 1) removeFromCart(item.id);
                        else updateQty(item.id, item.quantity - 1);
                      }}
                      className="qty-btn"
                      aria-label="Decrease"
                    >
                      −
                    </button>
                    <span className="w-10 h-8 flex items-center justify-center text-sm font-medium border-y border-border">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="qty-btn"
                      aria-label="Increase"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-xs text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1"
                  >
                    <Icon name="TrashIcon" size={12} />
                    Remove
                  </button>
                </div>
              </div>

              {/* Total (desktop) */}
              <div className="hidden sm:block text-right flex-shrink-0 min-w-[100px]">
                <p className="text-sm font-semibold text-foreground">
                  KES {((item.discountPrice ?? item.price) * item.quantity).toLocaleString()}
                </p>
                {item.discountPrice && (
                  <p className="text-xs text-muted-foreground line-through">
                    KES {(item.price * item.quantity).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Continue shopping */}
          <div className="pt-6">
            <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="ArrowLeftIcon" size={14} />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5">
          <div className="border border-border p-6 sm:p-8 sticky top-24">
            <h2 className="text-sm font-semibold tracking-[0.1em] uppercase mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                <span className="font-medium">KES {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                  {deliveryFee === 0 ? 'FREE' : `KES ${deliveryFee.toLocaleString()}`}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-accent">Discount ({appliedCode})</span>
                  <span className="text-accent font-medium">-KES {discountAmount.toLocaleString()}</span>
                </div>
              )}
              {subtotal < FREE_DELIVERY_THRESHOLD && (
                <p className="text-xs text-muted-foreground bg-muted/50 px-3 py-2">
                  Add KES {(FREE_DELIVERY_THRESHOLD - subtotal).toLocaleString()} more for free delivery
                </p>
              )}
            </div>

            {/* Discount Code */}
            <div className="mb-6 pb-6 border-b border-border">
              <p className="text-xs font-semibold tracking-[0.1em] uppercase mb-3">Discount Code</p>
              {appliedCode ? (
                <div className="flex items-center justify-between bg-accent/10 border border-accent/30 px-4 py-3">
                  <span className="text-sm font-semibold text-accent">{appliedCode} applied</span>
                  <button onClick={handleRemoveCode} className="text-muted-foreground hover:text-foreground">
                    <Icon name="XMarkIcon" size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && handleApplyCode()}
                      placeholder="Enter code"
                      className="input-field flex-1 py-2.5 text-sm uppercase"
                    />
                    <button onClick={handleApplyCode} className="btn-ghost px-4 py-2.5 text-xs">
                      Apply
                    </button>
                  </div>
                  {discountError && (
                    <p className="text-xs text-red-500 mt-1.5">{discountError}</p>
                  )}
                </>
              )}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-base font-semibold tracking-wide uppercase">Total</span>
              <span className="text-xl font-semibold text-foreground">KES {total.toLocaleString()}</span>
            </div>

            <Link href="/checkout" className="btn-primary w-full text-center block mb-3">
              Proceed to Checkout
            </Link>

            {/* Payment icons */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon name="ShieldCheckIcon" size={14} />
                Secure Checkout
              </div>
              <span className="text-border">·</span>
              <span className="text-xs font-bold text-green-600">M-PESA</span>
              <span className="text-border">·</span>
              <span className="text-xs text-muted-foreground font-medium">VISA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}