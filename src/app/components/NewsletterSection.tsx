'use client';

import React, { useState } from 'react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#C4782A] py-20 sm:py-28">
      {/* Decorative corner accents */}
      <div className="absolute top-8 left-8 w-20 h-20 border-t border-l border-white/20 hidden sm:block" />
      <div className="absolute bottom-8 right-8 w-20 h-20 border-b border-r border-white/20 hidden sm:block" />

      {/* Large decorative text */}
      <div
        className="absolute inset-0 flex items-center justify-center font-display font-semibold text-white/[0.06] select-none pointer-events-none overflow-hidden"
        style={{ fontSize: 'clamp(5rem, 20vw, 18rem)', lineHeight: 1 }}
        aria-hidden="true"
      >
        NAIMA
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 sm:px-8 text-center">
        {/* Label */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className="block w-8 h-[2px] bg-white/50" />
          <span className="text-[10px] font-bold tracking-[0.28em] uppercase text-white/80">Stay in the Loop</span>
          <span className="block w-8 h-[2px] bg-white/50" />
        </div>

        {/* Headline */}
        <h2 className="text-display-md font-display font-semibold text-white mb-4 leading-[1.05]">
          First to Know.<br />
          <em className="not-italic text-white/60 font-light" style={{ fontSize: '0.75em' }}>
            First to Wear.
          </em>
        </h2>

        <p className="text-sm text-white/70 font-light mb-10 max-w-sm mx-auto leading-relaxed tracking-wide">
          Join 8,000+ style-conscious Kenyans. Early access to new drops, exclusive offers — no noise.
        </p>

        {submitted ? (
          <div className="inline-flex items-center gap-3 bg-white/20 border border-white/30 px-8 py-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span className="text-sm font-bold tracking-[0.12em] uppercase text-white">
              You&apos;re on the list
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto border-2 border-white/30 focus-within:border-white transition-colors duration-300">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-6 py-4 bg-transparent text-white placeholder:text-white/50 text-sm outline-none border-r border-white/30 focus:border-white transition-colors"
            />
            <button
              type="submit"
              className="px-7 py-4 bg-white text-[#C4782A] text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-white/90 transition-colors flex-shrink-0"
            >
              Subscribe
            </button>
          </form>
        )}

        <p className="mt-5 text-[10px] text-white/40 tracking-[0.1em]">
          Unsubscribe anytime · No spam, ever
        </p>
      </div>
    </section>
  );
}