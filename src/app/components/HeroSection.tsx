'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

export default function HeroSection() {
  const colRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = colRef.current?.querySelectorAll('.hero-reveal');
    els?.forEach((el, i) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.animationDelay = `${0.1 + i * 0.14}s`;
      htmlEl.classList.add('fade-in-up');
    });
  }, []);

  const marqueeItems = [
    'New Season SS 2026',
    'Free Delivery Nairobi',
    'Premium Curated Fashion',
    'Delivered Across Kenya',
    'New Season SS 2026',
    'Free Delivery Nairobi',
    'Premium Curated Fashion',
    'Delivered Across Kenya',
  ];

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-[#0A0908]">
      {/* Split layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-screen">

        {/* Left — Editorial text column */}
        <div
          ref={colRef}
          className="relative z-10 flex flex-col justify-end lg:justify-center px-8 sm:px-12 lg:px-16 xl:px-20 pt-32 pb-16 lg:py-24"
        >
          {/* Live drop badge */}
          <div className="hero-reveal opacity-0 flex items-center gap-3 mb-8">
            <span className="flex items-center gap-2 bg-[#C4782A]/15 border border-[#C4782A]/40 px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C4782A] pulse-dot" />
              <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#C4782A]">SS 2026 — Live Now</span>
            </span>
          </div>

          {/* Headline */}
          <h1 className="hero-reveal opacity-0 text-hero font-display font-semibold text-white mb-8 leading-[0.9]">
            Dress<br />
            <em className="not-italic relative inline-block">
              <span className="relative z-10" style={{ color: '#C4782A' }}>Your</span>
              <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-[#C4782A]" />
            </em><br />
            Story.
          </h1>

          {/* Descriptor */}
          <p className="hero-reveal opacity-0 text-sm sm:text-base text-white/65 font-light leading-relaxed max-w-sm mb-10 tracking-wide">
            Shoes, clothing, bags and accessories — each piece chosen to speak before you do.
          </p>

          {/* CTAs */}
          <div className="hero-reveal opacity-0 flex flex-col sm:flex-row items-start gap-4 mb-14">
            <Link href="/shop" className="btn-primary accent-glow">
              Explore Collection
            </Link>
            <Link
              href="/shop?filter=new"
              className="inline-flex items-center gap-2.5 text-[11px] font-bold tracking-[0.18em] uppercase text-white/70 hover:text-white transition-colors duration-300 self-center border-b border-white/20 hover:border-white pb-0.5"
            >
              New Arrivals
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Stats row */}
          <div className="hero-reveal opacity-0 flex gap-8 border-t border-white/15 pt-8">
            {[
              { value: '2,400+', label: 'Happy Customers' },
              { value: '500+', label: 'Curated Styles' },
              { value: '47', label: 'Counties' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-lg font-display font-semibold text-white tracking-tight">{stat.value}</p>
                <p className="text-[10px] text-white/40 tracking-[0.15em] uppercase mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Full-bleed image */}
        <div className="relative lg:block h-[55vw] lg:h-auto overflow-hidden">
          <AppImage
            src="/assets/images/2450-1789558835761.jpeg"
            alt="Premium fashion bag from Shop With Naima — editorial product photography, dark moody studio lighting"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center"
          />
          {/* Subtle left vignette */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0908] via-transparent to-transparent lg:block hidden" style={{ width: '30%' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0908] via-transparent to-transparent lg:hidden" />

          {/* Floating product badge — more vibrant */}
          <div className="absolute bottom-8 left-8 bg-[#C4782A] px-5 py-4 hidden lg:block accent-glow">
            <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-white/70 mb-1">Featured Drop</p>
            <p className="text-sm font-display font-semibold text-white">Signature Bag</p>
            <p className="text-xs text-white/80 mt-0.5 font-semibold">KES 4,500</p>
          </div>

          {/* Top-right accent tag */}
          <div className="absolute top-8 right-8 hidden lg:flex flex-col items-end gap-1">
            <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-white/40">Shop With</span>
            <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-[#C4782A]">Naima</span>
          </div>
        </div>
      </div>

      {/* Marquee ticker — more vibrant */}
      <div className="relative z-10 border-t border-[#C4782A]/30 bg-[#C4782A]/10 overflow-hidden py-3.5">
        <div className="marquee-track">
          {marqueeItems.map((item, i) => (
            <span key={i} className="flex items-center gap-6 px-6">
              <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-white/50 whitespace-nowrap">
                {item}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C4782A] flex-shrink-0" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
