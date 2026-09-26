'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useStoreProducts } from '@/lib/useStoreProducts';
import ProductCard from '@/components/ProductCard';

import { useStoreProducts } from '@/lib/useStoreProducts';
  const sectionRef = useRef<HTMLElement>(null);
  import { useStoreProducts } from '@/lib/useStoreProducts';

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal-on-scroll').forEach((el, i) => {
              setTimeout(() => el.classList.add('is-visible'), i * 90);
            });
          }
        });
      },
      { threshold: 0.05 }
    );
    if (sectionRef?.current) observer?.observe(sectionRef?.current);
    return () => observer?.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 sm:py-28 bg-[#0A0908] relative overflow-hidden">
      {/* Vibrant accent stripe at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#C4782A]" />

      {/* Large decorative number */}
      <div
        className="absolute right-8 top-12 font-display font-semibold text-white/[0.03] select-none pointer-events-none"
        style={{ fontSize: 'clamp(6rem, 18vw, 16rem)', lineHeight: 1 }}
        aria-hidden="true"
      >
        02
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Section header */}
        <div className="flex items-end justify-between mb-12 reveal-on-scroll">
          <div className="flex items-start gap-5">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="block w-10 h-[2px] bg-[#C4782A]" />
                <span className="text-[10px] font-bold tracking-[0.28em] uppercase text-[#C4782A]">Just Dropped</span>
              </div>
              <h2 className="text-display-md font-display font-semibold text-white">
                New<br />
                <em className="not-italic relative inline-block">
                  <span className="relative z-10" style={{ color: '#C4782A' }}>Arrivals</span>
                  <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#C4782A]/40" />
                </em>
              </h2>
            </div>
          </div>
          <Link
            href="/shop?filter=new"
            className="hidden sm:inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] uppercase text-white/50 hover:text-white transition-colors duration-300 border-b border-transparent hover:border-white/50 pb-0.5"
          >
            View All New
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {newProducts?.map((product, i) => (
            <div
              key={product?.id}
              className="reveal-on-scroll"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Mobile view all */}
        <div className="mt-10 text-center sm:hidden reveal-on-scroll">
          <Link href="/shop?filter=new" className="btn-primary">
            View All New Arrivals
          </Link>
        </div>
      </div>
    </section>
  );
}
