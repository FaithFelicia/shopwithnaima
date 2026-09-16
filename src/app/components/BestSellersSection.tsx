'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import { PRODUCTS } from '@/lib/mockData';
import ProductCard from '@/components/ProductCard';
import Icon from '@/components/ui/AppIcon';

export default function BestSellersSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const bestSellers = PRODUCTS?.filter((p) => p?.isBestSeller)?.slice(0, 4);
  const featured = bestSellers?.[0];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal-on-scroll').forEach((el, i) => {
              setTimeout(() => el.classList.add('is-visible'), i * 110);
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
    <section ref={sectionRef} className="py-20 sm:py-28 bg-background relative overflow-hidden">
      {/* Vibrant accent stripe at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#C4782A]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section header */}
        <div className="flex items-end justify-between mb-12 reveal-on-scroll">
          <div className="flex items-start gap-5">
            <span className="section-number mt-1">03</span>
            <div>
              <span className="block w-10 h-[2px] bg-[#C4782A] mb-3" />
              <h2 className="text-display-md font-display font-semibold text-foreground">
                Customer<br />
                <em className="not-italic relative inline-block">
                  <span className="relative z-10" style={{ color: '#C4782A' }}>Favourites</span>
                  <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#C4782A]/30" />
                </em>
              </h2>
            </div>
          </div>
          <Link
            href="/shop?filter=bestseller"
            className="hidden sm:inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 border-b border-transparent hover:border-foreground pb-0.5"
          >
            Shop All
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Asymmetric layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          {/* Featured — large */}
          <div className="lg:col-span-5 reveal-on-scroll">
            <Link
              href={`/product-detail?id=${featured?.id}`}
              className="block relative group image-zoom overflow-hidden bg-muted"
            >
              <div className="aspect-[3/4]">
                <AppImage
                  src={featured?.images?.[0]}
                  alt={`${featured?.name} — best seller fashion product, editorial studio photography`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover"
                  priority
                />
              </div>
              {/* Gradient overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              {/* Accent hover overlay */}
              <div className="absolute inset-0 bg-[#C4782A]/0 group-hover:bg-[#C4782A]/10 transition-all duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                {/* Bold accent badge */}
                <span className="inline-flex items-center gap-1.5 bg-[#C4782A] px-3 py-1 mb-3">
                  <span className="text-[9px] font-bold tracking-[0.22em] uppercase text-white">★ Best Seller</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-semibold text-white mb-2 leading-tight">
                  {featured?.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold tracking-wide text-lg">
                    KES {(featured?.discountPrice ?? featured?.price)?.toLocaleString()}
                  </span>
                  <span className="text-xs text-white/60 flex items-center gap-1">
                    <Icon name="StarIcon" variant="solid" size={11} className="text-[#C4782A]" />
                    {featured?.rating} ({featured?.reviewCount})
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Right column */}
          <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {bestSellers?.slice(1, 4)?.map((product, i) => (
                <div
                  key={product?.id}
                  className="reveal-on-scroll"
                  style={{ transitionDelay: `${(i + 1) * 100}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Trust stats bar — bolder */}
            <div className="reveal-on-scroll bg-[#0A0908] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <span className="luxury-label text-[#C4782A] mb-1 block">Trusted by Kenyans</span>
                <p className="text-xl font-display font-semibold text-white">2,400+ Happy Customers</p>
              </div>
              <div className="flex gap-6 sm:gap-8">
                {[
                  { value: '4.8', label: 'Avg Rating' },
                  { value: '47', label: 'Counties' },
                  { value: '1–3', label: 'Days Delivery' },
                ]?.map((stat, i, arr) => (
                  <React.Fragment key={stat?.label}>
                    <div className="text-center">
                      <p className="text-xl font-display font-semibold text-white">{stat?.value}</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-[0.12em] mt-0.5">{stat?.label}</p>
                    </div>
                    {i < arr?.length - 1 && <div className="w-px bg-white/10" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}