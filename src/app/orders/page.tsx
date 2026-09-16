'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { orderService, DbOrder } from '@/lib/supabase/services';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: 'ClockIcon' },
  processing: { label: 'Processing', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: 'ArrowPathIcon' },
  shipped: { label: 'Shipped', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: 'TruckIcon' },
  delivered: { label: 'Delivered', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: 'CheckCircleIcon' },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: 'XCircleIcon' },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatKES(amount: number) {
  return `KES ${amount.toLocaleString()}`;
}

interface OrderQuickViewProps {
  order: DbOrder;
  onClose: () => void;
}

function OrderQuickView({ order, onClose }: OrderQuickViewProps) {
  const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-background rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <p className="text-xs text-muted-foreground tracking-widest uppercase font-medium">Order</p>
            <p className="font-semibold text-foreground text-lg">#{order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Close"
          >
            <Icon name="XMarkIcon" size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status + Date */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusCfg.bg} ${statusCfg.color}`}>
              <Icon name={statusCfg.icon} size={13} />
              {statusCfg.label}
            </span>
            <span className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</span>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Items</p>
            {(order.items ?? []).map(item => (
              <div key={item.id} className="flex gap-3 items-center">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <AppImage
                    src={item.productImage}
                    alt={item.productName}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean).join(' · ')}
                  </p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-foreground flex-shrink-0">
                  {formatKES((item.discountPrice ?? item.price) * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* Delivery */}
          <div className="bg-muted/40 rounded-xl p-4 space-y-1.5">
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2">Delivery</p>
            <p className="text-sm text-foreground">{order.customerName}</p>
            <p className="text-sm text-muted-foreground">{order.address}, {order.county}</p>
            {order.deliveryInstructions && (
              <p className="text-xs text-muted-foreground italic">{order.deliveryInstructions}</p>
            )}
          </div>

          {/* Totals */}
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatKES(order.subtotal)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Delivery</span>
                <span>{formatKES(order.deliveryFee)}</span>
              </div>
            )}
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-{formatKES(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-foreground text-base pt-1 border-t border-border">
              <span>Total</span>
              <span>{formatKES(order.total)}</span>
            </div>
          </div>

          {/* Payment */}
          <p className="text-xs text-muted-foreground capitalize">
            Paid via <span className="font-medium text-foreground">{order.paymentMethod}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quickViewOrder, setQuickViewOrder] = useState<DbOrder | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-up-login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    orderService.getUserOrders(user.id)
      .then(data => {
        setOrders(data);
        setError(null);
      })
      .catch(err => {
        setError(err.message ?? 'Failed to load orders');
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-20 sm:pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Page Title */}
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-1">Account</p>
            <h1 className="text-2xl sm:text-3xl font-display font-semibold text-foreground">Order History</h1>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Loading your orders…</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
              <Icon name="ExclamationCircleIcon" size={40} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <button
                onClick={() => {
                  setLoading(true);
                  orderService.getUserOrders(user!.id)
                    .then(setOrders)
                    .catch(e => setError(e.message))
                    .finally(() => setLoading(false));
                }}
                className="btn-primary text-sm px-5 py-2"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && orders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Icon name="ShoppingBagIcon" size={28} className="text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">No orders yet</p>
                <p className="text-sm text-muted-foreground">Your past orders will appear here once you shop.</p>
              </div>
              <Link href="/shop" className="btn-primary text-sm px-6 py-2.5">
                Start Shopping
              </Link>
            </div>
          )}

          {/* Orders List */}
          {!loading && !error && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map(order => {
                const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
                const itemCount = (order.items ?? []).reduce((s, i) => s + i.quantity, 0);
                const firstImage = order.items?.[0]?.productImage;

                return (
                  <div
                    key={order.id}
                    className="bg-background border border-border rounded-2xl overflow-hidden hover:border-foreground/20 transition-colors"
                  >
                    <div className="p-5 flex items-start gap-4">
                      {/* Thumbnail stack */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        {firstImage ? (
                          <AppImage
                            src={firstImage}
                            alt={order.items?.[0]?.productName ?? 'Order item'}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon name="ShoppingBagIcon" size={22} className="text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <p className="font-semibold text-foreground text-sm">#{order.orderNumber}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDate(order.createdAt)} · {itemCount} {itemCount === 1 ? 'item' : 'items'}
                            </p>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusCfg.bg} ${statusCfg.color}`}>
                            <Icon name={statusCfg.icon} size={12} />
                            {statusCfg.label}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-3 gap-3">
                          <p className="font-semibold text-foreground">{formatKES(order.total)}</p>
                          <button
                            onClick={() => setQuickViewOrder(order)}
                            className="flex items-center gap-1.5 text-xs font-medium text-foreground border border-border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors"
                          >
                            <Icon name="EyeIcon" size={14} />
                            Quick View
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Quick View Modal */}
      {quickViewOrder && (
        <OrderQuickView order={quickViewOrder} onClose={() => setQuickViewOrder(null)} />
      )}
    </>
  );
}
