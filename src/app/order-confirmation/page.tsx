import { Suspense } from 'react';
import OrderConfirmationClient from './components/OrderConfirmationClient';

export const metadata = {
  title: 'Order Confirmed — Shop With Naima',
};

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>}>
      <OrderConfirmationClient />
    </Suspense>
  );
}
