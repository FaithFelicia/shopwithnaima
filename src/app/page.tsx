import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/app/components/HeroSection';
import CategoryGrid from '@/app/components/CategoryGrid';
import NewArrivalsSection from '@/app/components/NewArrivalsSection';
import BestSellersSection from '@/app/components/BestSellersSection';
import PromoBanner from '@/app/components/PromoBanner';
import ReviewsSection from '@/app/components/ReviewsSection';
import NewsletterSection from '@/app/components/NewsletterSection';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <CategoryGrid />
        <NewArrivalsSection />
        <BestSellersSection />
        <PromoBanner />
        <ReviewsSection />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}