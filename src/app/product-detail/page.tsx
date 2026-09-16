import React, { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductDetailClient from '@/app/product-detail/components/ProductDetailClient';

export default function ProductDetailPage() {
  return (
    <>
      <Header />
      <main className="pt-16 sm:pt-20 min-h-screen bg-background">
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>}>
          <ProductDetailClient />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}