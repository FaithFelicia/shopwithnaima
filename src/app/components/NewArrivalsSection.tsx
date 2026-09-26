'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useStoreProducts } from '@/lib/useStoreProducts';
import ProductCard from '@/components/ProductCard';

export default function NewArrivalsSection() {
  const { products, loading } = useStoreProducts();
  const sectionRef = useRef<HTMLElement>(null);
  const newProducts = products.slice(0, 4);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.reveal-on-scroll').forEach((el, i) => {
            setTimeout(() => el.classList.add('is-visible'), i * 90);
          });
        }
      });
    }, { threshold: 0.05 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 sm:py-28 bg-[#0A0908] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#C4782A]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex items-end justify-between mb-12 reveal-on-scroll">
          <div>
            <span className="block w-10 h-[2px] bg-[#C4782A] mb-3" />
            <span className="text-[10px] font-bold tracking-[0.28em] uppercase text-[#C4782A]">Just Dropped</span>
            <h2 className="text-display-md font-display font-semibold text-white">New <span className="text-[#C4782A]">Arrivals</span></h2>
          </div>
          <Link href="/shop" className="hidden sm:inline-flex text-[11px] font-bold tracking-[0.18em] uppercase text-white/50 hover:text-white">View All New →</Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {newProducts.map((product, i) => (
            <div key={product.id} className="reveal-on-scroll" style={{ transitionDelay: `${i * 80}ms` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        {!loading && newProducts.length === 0 && <p className="text-sm text-white/60">New arrivals will appear here soon.</p>}
      </div>
    </section>
  );
}
