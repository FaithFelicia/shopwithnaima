import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartClient from '@/app/cart/components/CartClient';

export default function CartPage() {
  return (
    <>
      <Header />
      <main className="pt-16 sm:pt-20 min-h-screen bg-background">
        <CartClient />
      </main>
      <Footer />
    </>
  );
}