'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { getCartCount, getWishlist } from '@/lib/cartStore';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const updateCounts = useCallback(() => {
    setCartCount(getCartCount());
    setWishlistCount(getWishlist().length);
  }, []);

  useEffect(() => {
    updateCounts();
    window.addEventListener('cart-updated', updateCounts);
    window.addEventListener('wishlist-updated', updateCounts);
    return () => {
      window.removeEventListener('cart-updated', updateCounts);
      window.removeEventListener('wishlist-updated', updateCounts);
    };
  }, [updateCounts]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Shoes', href: '/shop?category=shoes' },
    { label: 'Clothing', href: '/shop?category=clothing' },
    { label: 'Bags', href: '/shop?category=bags' },
    { label: 'Accessories', href: '/shop?category=accessories' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm' : 'bg-background/80 backdrop-blur-sm border-b border-border/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <AppLogo size={32} />
            <span className="font-display text-base sm:text-lg font-semibold tracking-wider uppercase text-foreground">
              Shop With Naima
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="nav-link">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Search"
            >
              <Icon name="MagnifyingGlassIcon" size={20} />
            </button>

            {/* Admin */}
            <Link
              href="/admin"
              className="w-10 h-10 hidden sm:flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Admin"
            >
              <Icon name="Cog6ToothIcon" size={20} />
            </Link>

            {/* Account */}
            <Link
              href={user ? '/profile' : '/sign-up-login'}
              className="w-10 h-10 hidden sm:flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Account"
            >
              <Icon name="UserIcon" size={20} />
            </Link>

            {/* Wishlist */}
            <Link
              href="/shop"
              className="w-10 h-10 hidden sm:flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative"
              aria-label="Wishlist"
            >
              <Icon name="HeartIcon" size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative"
              aria-label="Cart"
            >
              <Icon name="ShoppingBagIcon" size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center rounded-full">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-foreground"
              aria-label="Open menu"
            >
              <Icon name="Bars3Icon" size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-md flex flex-col items-center justify-start pt-28 px-6">
          <button
            onClick={() => setSearchOpen(false)}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label="Close search"
          >
            <Icon name="XMarkIcon" size={24} />
          </button>
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-6">
            Search Products
          </p>
          <form onSubmit={handleSearch} className="w-full max-w-xl">
            <div className="relative">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Sneakers, hoodies, bags..."
                className="w-full border-b-2 border-border focus:border-foreground bg-transparent text-xl font-light pb-3 pr-12 outline-none transition-colors text-foreground placeholder:text-muted-foreground"
              />
              <button type="submit" className="absolute right-0 bottom-3 text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="MagnifyingGlassIcon" size={22} />
              </button>
            </div>
          </form>
          <div className="mt-8 flex flex-wrap gap-2">
            {['Sneakers', 'Hoodies', 'Shoulder Bags', 'Sunglasses', 'Cargo'].map(t => (
              <button
                key={t}
                onClick={() => { setSearchQuery(t); }}
                className="filter-chip text-xs"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile Menu Panel */}
      <div className={`mobile-menu-panel ${mobileOpen ? 'open' : ''}`}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <AppLogo size={28} />
            <span className="font-display text-sm font-semibold tracking-wider uppercase">Shop With Naima</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="w-9 h-9 flex items-center justify-center text-muted-foreground"
            aria-label="Close menu"
          >
            <Icon name="XMarkIcon" size={20} />
          </button>
        </div>

        <nav className="p-5 flex flex-col gap-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="py-3.5 px-2 text-sm font-medium tracking-wide border-b border-border/50 text-foreground flex items-center justify-between"
            >
              {link.label}
              <Icon name="ChevronRightIcon" size={16} className="text-muted-foreground" />
            </Link>
          ))}
        </nav>

        <div className="p-5 flex flex-col gap-3">
          <Link href={user ? '/profile' : '/sign-up-login'} className="btn-primary text-center">
            {user ? 'My Account' : 'My Account'}
          </Link>
          <Link href="/admin" className="btn-ghost text-center">
            Admin Dashboard
          </Link>
          <Link href="/cart" className="btn-ghost text-center relative">
            Cart {cartCount > 0 && <span className="ml-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 font-bold">{cartCount}</span>}
          </Link>
        </div>
      </div>
    </>
  );
}