'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  customer: string;
  phone: string;
  email: string;
  county: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: OrderStatus;
  date: string;
  paymentMethod: string;
}

const MOCK_ORDERS: Order[] = [
  {
    id: 'SWN-001',
    customer: 'Amina Wanjiru',
    phone: '0712 345 678',
    email: 'amina@email.com',
    county: 'Nairobi',
    items: [{ name: 'Mini Shoulder Bag', qty: 1, price: 9500 }, { name: 'Leather Belt', qty: 1, price: 2800 }],
    total: 12300,
    status: 'delivered',
    date: '2026-09-14',
    paymentMethod: 'M-Pesa',
  },
  {
    id: 'SWN-002',
    customer: 'Fatuma Hassan',
    phone: '0723 456 789',
    email: 'fatuma@email.com',
    county: 'Mombasa',
    items: [{ name: 'Luxury Statement Bag', qty: 1, price: 3500 }],
    total: 3800,
    status: 'processing',
    date: '2026-09-15',
    paymentMethod: 'M-Pesa',
  },
  {
    id: 'SWN-003',
    customer: 'Grace Muthoni',
    phone: '0734 567 890',
    email: 'grace@email.com',
    county: 'Kiambu',
    items: [{ name: 'Classic Handbag', qty: 1, price: 2400 }, { name: 'Chic Shoulder Bag', qty: 1, price: 2200 }, { name: 'Mini Crossbody Bag', qty: 1, price: 2000 }],
    total: 6900,
    status: 'shipped',
    date: '2026-09-15',
    paymentMethod: 'M-Pesa',
  },
  {
    id: 'SWN-004',
    customer: 'Naomi Achieng',
    phone: '0745 678 901',
    email: 'naomi@email.com',
    county: 'Kisumu',
    items: [{ name: 'Naima Signature Bag', qty: 1, price: 2500 }],
    total: 2800,
    status: 'pending',
    date: '2026-09-16',
    paymentMethod: 'M-Pesa',
  },
  {
    id: 'SWN-005',
    customer: 'Wanjiku Kamau',
    phone: '0756 789 012',
    email: 'wanjiku@email.com',
    county: 'Nakuru',
    items: [{ name: 'Premium Bucket Bag', qty: 1, price: 2550 }, { name: 'Everyday Tote', qty: 1, price: 2000 }],
    total: 4850,
    status: 'processing',
    date: '2026-09-16',
    paymentMethod: 'M-Pesa',
  },
  {
    id: 'SWN-006',
    customer: 'Halima Osman',
    phone: '0767 890 123',
    email: 'halima@email.com',
    county: 'Nairobi',
    items: [{ name: 'Crossbody Chain Bag', qty: 1, price: 6800 }],
    total: 7100,
    status: 'delivered',
    date: '2026-09-13',
    paymentMethod: 'M-Pesa',
  },
  {
    id: 'SWN-007',
    customer: 'Mercy Njeri',
    phone: '0778 901 234',
    email: 'mercy@email.com',
    county: 'Nairobi',
    items: [{ name: 'Compact Tote Bag', qty: 2, price: 2100 }],
    total: 4500,
    status: 'cancelled',
    date: '2026-09-12',
    paymentMethod: 'M-Pesa',
  },
];

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  processing: 'bg-blue-50 text-blue-700 border border-blue-200',
  shipped: 'bg-purple-50 text-purple-700 border border-purple-200',
  delivered: 'bg-green-50 text-green-700 border border-green-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
};

const ALL_STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const updateStatus = (id: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, status } : o)));
    if (selectedOrder?.id === id) {
      setSelectedOrder(prev => prev ? { ...prev, status } : null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-semibold text-[#0A0A0A]">Orders</h2>
        <p className="text-sm text-[#7A7570] mt-1">{orders.length} total orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-sm flex-1">
          <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A7570]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order ID or customer..."
            className="w-full border border-[#E8E4DF] bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#0A0A0A] transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`text-xs font-medium px-3 py-2 border transition-colors ${filterStatus === 'all' ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]' : 'bg-white text-[#7A7570] border-[#E8E4DF] hover:border-[#0A0A0A]'}`}
          >
            All
          </button>
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`text-xs font-medium px-3 py-2 border capitalize transition-colors ${filterStatus === s ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]' : 'bg-white text-[#7A7570] border-[#E8E4DF] hover:border-[#0A0A0A]'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E8E4DF] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E4DF] bg-[#F5F4F2]">
                {['Order ID', 'Customer', 'County', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold tracking-[0.1em] uppercase text-[#7A7570] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id} className="border-b border-[#E8E4DF]/50 hover:bg-[#F5F4F2] transition-colors">
                  <td className="px-5 py-4 text-sm font-mono font-medium text-[#0A0A0A] whitespace-nowrap">#{order.id}</td>
                  <td className="px-5 py-4 text-sm text-[#0A0A0A] whitespace-nowrap">{order.customer}</td>
                  <td className="px-5 py-4 text-sm text-[#7A7570]">{order.county}</td>
                  <td className="px-5 py-4 text-sm text-[#7A7570]">{order.items.length}</td>
                  <td className="px-5 py-4 text-sm font-medium text-[#0A0A0A] whitespace-nowrap">KES {order.total.toLocaleString()}</td>
                  <td className="px-5 py-4 text-sm text-[#7A7570]">{order.paymentMethod}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-semibold tracking-[0.08em] uppercase px-2.5 py-1 whitespace-nowrap ${STATUS_STYLES[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#7A7570] whitespace-nowrap">{order.date}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-xs font-medium text-[#C8965A] hover:underline whitespace-nowrap"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center text-sm text-[#7A7570]">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E4DF]">
              <h3 className="text-sm font-semibold tracking-[0.08em] uppercase">Order #{selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-[#7A7570] hover:text-[#0A0A0A]">
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Customer info */}
              <div>
                <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#7A7570] mb-3">Customer</p>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-[#0A0A0A]">{selectedOrder.customer}</p>
                  <p className="text-sm text-[#7A7570]">{selectedOrder.phone}</p>
                  <p className="text-sm text-[#7A7570]">{selectedOrder.email}</p>
                  <p className="text-sm text-[#7A7570]">{selectedOrder.county}</p>
                </div>
              </div>
              {/* Items */}
              <div>
                <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#7A7570] mb-3">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-[#0A0A0A]">{item.name} × {item.qty}</span>
                      <span className="font-medium text-[#0A0A0A]">KES {(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-sm font-semibold border-t border-[#E8E4DF] pt-2 mt-2">
                    <span>Total</span>
                    <span>KES {selectedOrder.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              {/* Update status */}
              <div>
                <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#7A7570] mb-3">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_STATUSES.map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selectedOrder.id, s)}
                      className={`text-xs font-medium px-3 py-2 border capitalize transition-colors ${
                        selectedOrder.status === s
                          ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                          : 'bg-white text-[#7A7570] border-[#E8E4DF] hover:border-[#0A0A0A]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
