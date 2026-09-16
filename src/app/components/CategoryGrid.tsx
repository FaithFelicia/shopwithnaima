'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import { CATEGORIES } from '@/lib/mockData';

export default function CategoryGrid() {
  const sectionRef = useRef<HTMLElement>(null);

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
      { threshold: 0.08 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 sm:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section header */}
        <div className="flex items-end justify-between mb-12 reveal-on-scroll">
          <div className="flex items-start gap-5">
            <span className="section-number mt-1">01</span>
            <div>
              <span className="editorial-rule mb-3 block" />
              <h2 className="text-display-md font-display font-semibold text-foreground">
                Shop the<br />
                <em className="not-italic relative inline-block">
                  <span className="relative z-10" style={{ color: '#C4782A' }}>Collection</span>
                  <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#C4782A]/40" />
                </em>
              </h2>
            </div>
          </div>
          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 border-b border-transparent hover:border-foreground pb-0.5"
          >
            View All
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {/* Shoes — large */}
          <div className="col-span-2 md:col-span-2 reveal-on-scroll">
            <CategoryCard
              name={CATEGORIES[0].name}
              image={CATEGORIES[0].image}
              count={CATEGORIES[0].count}
              href={CATEGORIES[0].href + '?category=shoes'}
              aspectClass="aspect-[4/3] sm:aspect-[16/9]"
            />
          </div>
          {/* Clothing */}
          <div className="reveal-on-scroll">
            <CategoryCard
              name={CATEGORIES[1].name}
              image={CATEGORIES[1].image}
              count={CATEGORIES[1].count}
              href={CATEGORIES[1].href + '?category=clothing'}
              aspectClass="aspect-[3/4] sm:aspect-square"
            />
          </div>
          {/* Bags */}
          <div className="reveal-on-scroll">
            <CategoryCard
              name={CATEGORIES[2].name}
              image={CATEGORIES[2].image}
              count={CATEGORIES[2].count}
              href={CATEGORIES[2].href + '?category=bags'}
              aspectClass="aspect-[3/4] sm:aspect-square"
            />
          </div>
          {/* Accessories — full width */}
          <div className="col-span-2 md:col-span-4 reveal-on-scroll">
            <CategoryCard
              name={CATEGORIES[3].name}
              image={CATEGORIES[3].image}
              count={CATEGORIES[3].count}
              href={CATEGORIES[3].href + '?category=accessories'}
              aspectClass="aspect-[2/1] sm:aspect-[5/1]"
              textAlign="center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryCard({
  name, image, count, href, aspectClass, textAlign = 'left',
}: {
  name: string;
  image: string;
  count: number;
  href: string;
  aspectClass: string;
  textAlign?: 'left' | 'center';
}) {
  return (
    <Link
      href={href}
      className={`block relative ${aspectClass} image-zoom overflow-hidden group bg-muted`}
    >
      <AppImage
        src={image}
        alt={`${name} category — editorial fashion photography, moody studio lighting`}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover"
      />
      {/* Gradient overlay — stronger on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
      {/* Accent color flash on hover */}
      <div className="absolute inset-0 bg-[#C4782A]/0 group-hover:bg-[#C4782A]/12 transition-all duration-500" />

      {/* Text */}
      {textAlign === 'center' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <span className="luxury-label text-[#C4782A] mb-2">{count}+ Styles</span>
          <h3 className="text-2xl sm:text-4xl font-display font-semibold text-white tracking-tight mb-3">{name}</h3>
          <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-white/0 group-hover:text-white transition-all duration-300 bg-[#C4782A]/0 group-hover:bg-[#C4782A] px-4 py-2">
            Explore →
          </span>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-start justify-end p-5 sm:p-6">
          <span className="luxury-label text-[#C4782A] mb-1.5">{count}+ Styles</span>
          <h3 className="text-lg sm:text-2xl font-display font-semibold text-white tracking-tight">{name}</h3>
          <span className="mt-2.5 inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.18em] uppercase text-white/0 group-hover:text-white transition-all duration-400 translate-y-2 group-hover:translate-y-0 border-b border-transparent group-hover:border-white/60 pb-0.5">
            Shop Now →
          </span>
        </div>
      )}
    </Link>
  );
}