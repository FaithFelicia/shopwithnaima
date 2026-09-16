'use client';

import React from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

export default function PromoBanner() {
  return (
    <section className="bg-background py-0">
      <div className="relative overflow-hidden" style={{ minHeight: '420px' }}>
        {/* Background image */}
        <div className="absolute inset-0">
          <AppImage
            src="https://img.rocket.new/generatedImages/rocket_gen_img_15b781221-1786235316405.png"
            alt="Fashion editorial — light airy studio, clean product flat lay, premium fashion items"
            fill
            sizes="100vw"
            className="object-cover object-center" />
          <div className="absolute inset-0 bg-[#0A0908]/80" />
        </div>

        {/* Bold accent stripe at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#C4782A] z-10" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-8 sm:px-16 py-20 sm:py-28 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10">
          <div className="max-w-xl">
            {/* Vibrant label */}
            <span className="inline-flex items-center gap-2 bg-[#C4782A] px-3 py-1.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-white pulse-dot" />
              <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-white">Limited Time Offer</span>
            </span>
            <h2 className="text-display-lg font-display font-semibold text-white mb-4 leading-[1.0]">
              Up to 20% Off<br />
              <em className="not-italic font-light" style={{ fontSize: '0.65em', letterSpacing: '0.02em', color: 'rgba(255,255,255,0.5)' }}>
                Selected Styles
              </em>
            </h2>
            <p className="text-sm text-white/55 font-light leading-relaxed max-w-sm">
              Use code{' '}
              <span className="font-bold tracking-widest text-[#C4782A] bg-[#C4782A]/15 px-2 py-0.5">
                NAIMA20
              </span>{' '}
              at checkout. Valid on selected items while stocks last.
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-4">
            <Link href="/shop" className="btn-primary">
              Shop the Sale
            </Link>
            <p className="text-[10px] text-white/30 tracking-[0.12em] uppercase">
              Ends soon · T&amp;Cs apply
            </p>
          </div>
        </div>

        {/* Decorative corner rule */}
        <div className="absolute top-8 right-8 w-16 h-16 border-t border-r border-[#C4782A]/30 hidden sm:block" />
        <div className="absolute bottom-8 left-8 w-16 h-16 border-b border-l border-[#C4782A]/30 hidden sm:block" />
      </div>
    </section>
  );
}