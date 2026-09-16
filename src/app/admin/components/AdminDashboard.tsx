'use client';

import React from 'react';
import Link from 'next/link';
import { PRODUCTS } from '@/lib/mockData';
import Icon from '@/components/ui/AppIcon';

const MOCK_ORDERS = [
  { id: 'SWN-001', customer: 'Amina Wanjiru', items: 2, total: 4700, status: 'delivered', date: '2026-09-14' },
  { id: 'SWN-002', customer: 'Fatuma Hassan', items: 1, total: 3500, status: 'processing', date: '2026-09-15' },
  { id: 'SWN-003', customer: 'Grace Muthoni', items: 3, total: 6600, status: 'shipped', date: '2026-09-15' },
  { id: 'SWN-004', customer: 'Naomi Achieng', items: 1, total: 2400, status: 'pending', date: '2026-09-16' },
  { id: 'SWN-005', customer: 'Wanjiku Kamau', items: 2, total: 5100, status: 'processing', date: '2026-09-16' },
];

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  processing: 'bg-blue-50 text-blue-700 border border-blue-200',
  shipped: 'bg-purple-50 text-purple-700 border border-purple-200',
  delivered: 'bg-green-50 text-green-700 border border-green-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
};

const totalRevenue = MOCK_ORDERS.reduce((s, o) => s + o.total, 0);
const totalProducts = PRODUCTS.length;
const totalOrders = MOCK_ORDERS.length;
const totalCustomers = 48;

const stats = [
  {
    label: 'Total Revenue',
    value: `KES ${totalRevenue.toLocaleString()}`,
    icon: 'BanknotesIcon',
    change: '+12%',
    positive: true,
    color: 'bg-[#C8965A]/10 text-[#C8965A]',
  },
  {
    label: 'Total Orders',
    value: totalOrders.toString(),
    icon: 'ClipboardDocumentListIcon',
    change: '+8%',
    positive: true,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    label: 'Products',
    value: totalProducts.toString(),
    icon: 'ShoppingBagIcon',
    change: `${totalProducts} active`,
    positive: true,
    color: 'bg-purple-50 text-purple-600',
  },
  {
    label: 'Customers',
    value: totalCustomers.toString(),
    icon: 'UsersIcon',
    change: '+5 this week',
    positive: true,
    color: 'bg-green-50 text-green-600',
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-display font-semibold text-[#0A0A0A]">Good day, Admin 👋</h2>
        <p className="text-sm text-[#7A7570] mt-1">Here&apos;s what&apos;s happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white border border-[#E8E4DF] p-5">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 flex items-center justify-center rounded-sm ${stat.color}`}>
                <Icon name={stat.icon as any} size={20} />
              </div>
            </div>
            <p className="text-2xl font-semibold text-[#0A0A0A] mb-1">{stat.value}</p>
            <p className="text-xs text-[#7A7570] mb-1">{stat.label}</p>
            <p className={`text-xs font-medium ${stat.positive ? 'text-green-600' : 'text-red-500'}`}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/products"
          className="bg-[#0A0A0A] text-white p-5 flex items-center justify-between group hover:bg-[#1a1a1a] transition-colors"
        >
          <div>
            <p className="text-xs font-semibold tracking-[0.1em] uppercase text-white/60 mb-1">Manage</p>
            <p className="text-sm font-semibold">Products</p>
          </div>
          <Icon name="ArrowRightIcon" size={18} className="text-white/40 group-hover:text-white transition-colors" />
        </Link>
        <Link
          href="/admin/orders"
          className="bg-white border border-[#E8E4DF] p-5 flex items-center justify-between group hover:border-[#0A0A0A] transition-colors"
        >
          <div>
            <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[#7A7570] mb-1">View</p>
            <p className="text-sm font-semibold text-[#0A0A0A]">Orders</p>
          </div>
          <Icon name="ArrowRightIcon" size={18} className="text-[#7A7570] group-hover:text-[#0A0A0A] transition-colors" />
        </Link>
        <Link
          href="/admin/customers"
          className="bg-white border border-[#E8E4DF] p-5 flex items-center justify-between group hover:border-[#0A0A0A] transition-colors"
        >
          <div>
            <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[#7A7570] mb-1">View</p>
            <p className="text-sm font-semibold text-[#0A0A0A]">Customers</p>
          </div>
          <Icon name="ArrowRightIcon" size={18} className="text-[#7A7570] group-hover:text-[#0A0A0A] transition-colors" />
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-[#E8E4DF]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4DF]">
          <h3 className="text-sm font-semibold tracking-[0.08em] uppercase text-[#0A0A0A]">Recent Orders</h3>
          <Link href="/admin/orders" className="text-xs font-medium text-[#C8965A] hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E4DF]">
                {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-[10px] font-semibold tracking-[0.1em] uppercase text-[#7A7570]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_ORDERS.map(order => (
                <tr key={order.id} className="border-b border-[#E8E4DF]/50 hover:bg-[#F5F4F2] transition-colors">
                  <td className="px-6 py-4 text-sm font-mono font-medium text-[#0A0A0A]">#{order.id}</td>
                  <td className="px-6 py-4 text-sm text-[#0A0A0A]">{order.customer}</td>
                  <td className="px-6 py-4 text-sm text-[#7A7570]">{order.items}</td>
                  <td className="px-6 py-4 text-sm font-medium text-[#0A0A0A]">KES {order.total.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-semibold tracking-[0.08em] uppercase px-2.5 py-1 ${STATUS_STYLES[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#7A7570]">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
