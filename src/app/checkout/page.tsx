import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CheckoutClient from '@/app/checkout/components/CheckoutClient';

export default function CheckoutPage() {
  return (
    <>
      <Header />
      <main className="pt-16 sm:pt-20 min-h-screen bg-background">
        <CheckoutClient />
      </main>
      <Footer />
    </>
  );
}