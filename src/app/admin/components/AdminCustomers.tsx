'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  county: string;
  orders: number;
  totalSpent: number;
  joined: string;
  lastOrder: string;
}

const MOCK_CUSTOMERS: Customer[] = [
  { id: 'cust-001', name: 'Amina Wanjiru', email: 'amina@email.com', phone: '0712 345 678', county: 'Nairobi', orders: 3, totalSpent: 28500, joined: '2026-07-10', lastOrder: '2026-09-14' },
  { id: 'cust-002', name: 'Fatuma Hassan', email: 'fatuma@email.com', phone: '0723 456 789', county: 'Mombasa', orders: 1, totalSpent: 3800, joined: '2026-09-01', lastOrder: '2026-09-15' },
  { id: 'cust-003', name: 'Grace Muthoni', email: 'grace@email.com', phone: '0734 567 890', county: 'Kiambu', orders: 2, totalSpent: 13800, joined: '2026-08-15', lastOrder: '2026-09-15' },
  { id: 'cust-004', name: 'Naomi Achieng', email: 'naomi@email.com', phone: '0745 678 901', county: 'Kisumu', orders: 1, totalSpent: 2800, joined: '2026-09-10', lastOrder: '2026-09-16' },
  { id: 'cust-005', name: 'Wanjiku Kamau', email: 'wanjiku@email.com', phone: '0756 789 012', county: 'Nakuru', orders: 2, totalSpent: 9700, joined: '2026-08-20', lastOrder: '2026-09-16' },
  { id: 'cust-006', name: 'Halima Osman', email: 'halima@email.com', phone: '0767 890 123', county: 'Nairobi', orders: 4, totalSpent: 32100, joined: '2026-06-05', lastOrder: '2026-09-13' },
  { id: 'cust-007', name: 'Mercy Njeri', email: 'mercy@email.com', phone: '0778 901 234', county: 'Nairobi', orders: 1, totalSpent: 4500, joined: '2026-09-05', lastOrder: '2026-09-12' },
  { id: 'cust-008', name: 'Aisha Mwangi', email: 'aisha@email.com', phone: '0789 012 345', county: 'Nairobi', orders: 5, totalSpent: 47200, joined: '2026-05-01', lastOrder: '2026-09-10' },
  { id: 'cust-009', name: 'Beatrice Otieno', email: 'beatrice@email.com', phone: '0790 123 456', county: 'Kisumu', orders: 2, totalSpent: 8900, joined: '2026-07-22', lastOrder: '2026-09-08' },
  { id: 'cust-010', name: 'Cynthia Karanja', email: 'cynthia@email.com', phone: '0701 234 567', county: 'Thika', orders: 3, totalSpent: 15600, joined: '2026-07-01', lastOrder: '2026-09-06' },
];

export default function AdminCustomers() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'orders' | 'spent'>('spent');

  const filtered = MOCK_CUSTOMERS
    .filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.county.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'orders') return b.orders - a.orders;
      return b.totalSpent - a.totalSpent;
    });

  const totalRevenue = MOCK_CUSTOMERS.reduce((s, c) => s + c.totalSpent, 0);
  const avgOrderValue = Math.round(totalRevenue / MOCK_CUSTOMERS.reduce((s, c) => s + c.orders, 0));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-semibold text-[#0A0A0A]">Customers</h2>
        <p className="text-sm text-[#7A7570] mt-1">{MOCK_CUSTOMERS.length} registered customers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-[#E8E4DF] p-5">
          <p className="text-2xl font-semibold text-[#0A0A0A]">{MOCK_CUSTOMERS.length}</p>
          <p className="text-xs text-[#7A7570] mt-1">Total Customers</p>
        </div>
        <div className="bg-white border border-[#E8E4DF] p-5">
          <p className="text-2xl font-semibold text-[#0A0A0A]">KES {totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-[#7A7570] mt-1">Total Revenue</p>
        </div>
        <div className="bg-white border border-[#E8E4DF] p-5">
          <p className="text-2xl font-semibold text-[#0A0A0A]">KES {avgOrderValue.toLocaleString()}</p>
          <p className="text-xs text-[#7A7570] mt-1">Avg. Order Value</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-sm flex-1">
          <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A7570]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="w-full border border-[#E8E4DF] bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#0A0A0A] transition-colors"
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'name' | 'orders' | 'spent')}
          className="border border-[#E8E4DF] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#0A0A0A] transition-colors"
        >
          <option value="spent">Sort by: Total Spent</option>
          <option value="orders">Sort by: Orders</option>
          <option value="name">Sort by: Name</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E8E4DF] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E4DF] bg-[#F5F4F2]">
                {['Customer', 'Contact', 'County', 'Orders', 'Total Spent', 'Joined', 'Last Order'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold tracking-[0.1em] uppercase text-[#7A7570] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(customer => (
                <tr key={customer.id} className="border-b border-[#E8E4DF]/50 hover:bg-[#F5F4F2] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#C8965A]/20 flex items-center justify-center text-[#C8965A] text-xs font-bold flex-shrink-0">
                        {customer.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-[#0A0A0A] whitespace-nowrap">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-[#0A0A0A]">{customer.email}</p>
                    <p className="text-xs text-[#7A7570]">{customer.phone}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#7A7570]">{customer.county}</td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-medium text-[#0A0A0A]">{customer.orders}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-medium text-[#0A0A0A]">KES {customer.totalSpent.toLocaleString()}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#7A7570] whitespace-nowrap">{customer.joined}</td>
                  <td className="px-5 py-4 text-sm text-[#7A7570] whitespace-nowrap">{customer.lastOrder}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-sm text-[#7A7570]">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
