'use client';

import React, { useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { REVIEWS } from '@/lib/mockData';

export default function ReviewsSection() {
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
    if (sectionRef?.current) observer?.observe(sectionRef?.current);
    return () => observer?.disconnect();
  }, []);

  const featured = REVIEWS?.[0];
  const rest = REVIEWS?.slice(1, 3);

  return (
    <section ref={sectionRef} className="py-20 sm:py-28 bg-[#0A0908] relative overflow-hidden">
      {/* Accent stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#C4782A]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Section header */}
        <div className="flex items-end justify-between mb-12 reveal-on-scroll">
          <div className="flex items-start gap-5">
            <span className="section-number mt-1 text-white/20">04</span>
            <div>
              <span className="block w-10 h-[2px] bg-[#C4782A] mb-3" />
              <h2 className="text-display-md font-display font-semibold text-white">
                Loved Across<br />
                <em className="not-italic relative inline-block">
                  <span className="relative z-10" style={{ color: '#C4782A' }}>Kenya</span>
                  <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#C4782A]/40" />
                </em>
              </h2>
            </div>
          </div>
          {/* Rating pill — vibrant */}
          <div className="hidden sm:flex items-center gap-3 bg-[#C4782A] px-5 py-3">
            <div className="flex text-white">
              {Array.from({ length: 5 })?.map((_, i) => (
                <Icon key={i} name="StarIcon" variant="solid" size={13} />
              ))}
            </div>
            <span className="text-sm font-bold text-white">4.8</span>
            <span className="text-xs text-white/70">· 1,200+ reviews</span>
          </div>
        </div>

        {/* Asymmetric review layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">

          {/* Featured large review */}
          {featured && (
            <div className="lg:col-span-6 reveal-on-scroll">
              <div className="bg-[#C4782A] p-8 sm:p-12 h-full flex flex-col justify-between min-h-[320px]">
                {/* Large quote mark */}
                <div
                  className="font-display text-[80px] leading-none mb-4 text-white/30"
                  style={{ lineHeight: '0.8' }}
                >
                  &ldquo;
                </div>
                <p className="text-lg sm:text-xl font-display font-light text-white leading-relaxed italic flex-1 mb-8">
                  {featured?.text}
                </p>
                <div>
                  <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/70 mb-3 block">{featured?.product}</span>
                  <div className="flex items-center gap-3 border-t border-white/20 pt-4">
                    <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border-2 border-white/40">
                      <AppImage
                        src={featured?.avatar}
                        alt={`${featured?.name} — verified customer review`}
                        width={36}
                        height={36}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{featured?.name}</p>
                      <p className="text-xs text-white/60">{featured?.location} · {featured?.date}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Two smaller reviews stacked */}
          <div className="lg:col-span-6 flex flex-col gap-4 sm:gap-5">
            {rest?.map((review, i) => (
              <div
                key={review?.id}
                className="bg-[#141210] border border-white/10 p-6 sm:p-8 reveal-on-scroll flex-1 hover:border-[#C4782A]/40 transition-colors duration-300"
                style={{ transitionDelay: `${(i + 1) * 100}ms` }}
              >
                <div className="flex mb-4 text-[#C4782A]">
                  {Array.from({ length: 5 })?.map((_, idx) => (
                    <Icon key={idx} name="StarIcon" variant="solid" size={13} />
                  ))}
                </div>
                <p className="text-sm text-white/75 font-light leading-relaxed italic mb-5">
                  &ldquo;{review?.text}&rdquo;
                </p>
                <span className="luxury-label text-[#C4782A] mb-4 block">{review?.product}</span>
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <AppImage
                      src={review?.avatar}
                      alt={`${review?.name} — verified customer`}
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{review?.name}</p>
                    <p className="text-xs text-white/40">{review?.location} · {review?.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}