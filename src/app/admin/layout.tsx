'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import AppLogo from '@/components/ui/AppLogo';

const navItems = [
  { label: 'Overview', href: '/admin', icon: 'ChartBarIcon' },
  { label: 'Products', href: '/admin/products', icon: 'ShoppingBagIcon' },
  { label: 'Orders', href: '/admin/orders', icon: 'ClipboardDocumentListIcon' },
  { label: 'Customers', href: '/admin/customers', icon: 'UsersIcon' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F4F2] flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0A0A0A] text-white flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <AppLogo size={28} />
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] uppercase text-white">Shop With Naima</p>
            <p className="text-[10px] text-white/40 tracking-wide uppercase mt-0.5">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium tracking-wide transition-colors rounded-sm ${
                  isActive
                    ? 'bg-white/10 text-white' :'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon name={item.icon as any} size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Back to store */}
        <div className="px-3 py-4 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white/40 hover:text-white transition-colors"
          >
            <Icon name="ArrowLeftIcon" size={16} />
            Back to Store
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-[#E8E4DF] px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center text-[#7A7570] hover:text-[#0A0A0A] transition-colors"
          >
            <Icon name="Bars3Icon" size={20} />
          </button>
          <div className="hidden lg:block">
            <h1 className="text-sm font-semibold tracking-[0.08em] uppercase text-[#7A7570]">
              {navItems.find(n => n.href === pathname)?.label ?? 'Admin'}
            </h1>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="w-8 h-8 rounded-full bg-[#C8965A] flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
