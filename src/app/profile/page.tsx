'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  profileService,
  addressService,
  wishlistService,
  DbDeliveryAddress,
  DbWishlistItem,
} from '@/lib/supabase/services';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

type Tab = 'info' | 'addresses' | 'wishlist';

function formatKES(amount: number) {
  return `KES ${amount.toLocaleString()}`;
}

// ─── Personal Info Tab ────────────────────────────────────────────────────────
function PersonalInfoTab({ user }: { user: any }) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    profileService.getProfile(user.id).then(profile => {
      if (profile) {
        setFullName(profile.fullName ?? '');
        setPhone(profile.phone ?? '');
      }
    });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await profileService.updateProfile(user.id, { fullName, phone });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message ?? 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-5 max-w-md">
      <div>
        <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2">
          Full Name
        </label>
        <input
          type="text"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          placeholder="Your full name"
          className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:border-foreground transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2">
          Email
        </label>
        <input
          type="email"
          value={user?.email ?? ''}
          disabled
          className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-muted text-muted-foreground cursor-not-allowed"
        />
        <p className="text-xs text-muted-foreground mt-1.5">Email cannot be changed</p>
      </div>
      <div>
        <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="+254 7XX XXX XXX"
          className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:border-foreground transition-colors"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <Icon name="CheckCircleIcon" size={16} />
          Profile updated successfully
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="btn-primary px-8 py-2.5 text-sm disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  );
}

// ─── Address Form ─────────────────────────────────────────────────────────────
interface AddressFormProps {
  initial?: Partial<DbDeliveryAddress>;
  onSave: (data: Omit<DbDeliveryAddress, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

function AddressForm({ initial, onSave, onCancel }: AddressFormProps) {
  const [label, setLabel] = useState(initial?.label ?? 'Home');
  const [recipientName, setRecipientName] = useState(initial?.recipientName ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [county, setCounty] = useState(initial?.county ?? '');
  const [instructions, setInstructions] = useState(initial?.deliveryInstructions ?? '');
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !address.trim() || !county.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({ label, recipientName, phone, address, county, deliveryInstructions: instructions || undefined, isDefault });
    } catch (err: any) {
      setError(err.message ?? 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const KENYAN_COUNTIES = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi',
    'Kitale', 'Garissa', 'Kakamega', 'Nyeri', 'Meru', 'Machakos', 'Kisii',
    'Kilifi', 'Kericho', 'Embu', 'Migori', 'Homa Bay', 'Bungoma',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-muted/30 border border-border rounded-2xl p-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">Label</label>
          <select
            value={label}
            onChange={e => setLabel(e.target.value)}
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:border-foreground"
          >
            {['Home', 'Work', 'Other'].map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">Recipient Name *</label>
          <input
            type="text"
            value={recipientName}
            onChange={e => setRecipientName(e.target.value)}
            placeholder="Full name"
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:border-foreground"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+254 7XX XXX XXX"
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:border-foreground"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">County *</label>
          <select
            value={county}
            onChange={e => setCounty(e.target.value)}
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:border-foreground"
          >
            <option value="">Select county</option>
            {KENYAN_COUNTIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">Street Address *</label>
        <input
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="Street, building, apartment"
          className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:border-foreground"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">Delivery Instructions</label>
        <input
          type="text"
          value={instructions}
          onChange={e => setInstructions(e.target.value)}
          placeholder="Gate code, landmark, etc."
          className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:border-foreground"
        />
      </div>
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={e => setIsDefault(e.target.checked)}
          className="w-4 h-4 accent-foreground"
        />
        <span className="text-sm text-foreground">Set as default address</span>
      </label>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={saving} className="btn-primary text-sm px-6 py-2.5 disabled:opacity-60">
          {saving ? 'Saving…' : 'Save Address'}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost text-sm px-5 py-2.5">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Addresses Tab ────────────────────────────────────────────────────────────
function AddressesTab({ user }: { user: any }) {
  const [addresses, setAddresses] = useState<DbDeliveryAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await addressService.getAddresses(user.id);
      setAddresses(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (data: Omit<DbDeliveryAddress, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    await addressService.addAddress(user.id, data);
    setShowForm(false);
    load();
  };

  const handleEdit = async (data: Omit<DbDeliveryAddress, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!editingId) return;
    await addressService.updateAddress(editingId, data);
    setEditingId(null);
    load();
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await addressService.deleteAddress(id);
    setDeletingId(null);
    load();
  };

  const handleSetDefault = async (id: string) => {
    await addressService.setDefault(user.id, id);
    load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <Icon name="MapPinIcon" size={24} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">No saved addresses</p>
            <p className="text-sm text-muted-foreground">Add a delivery address for faster checkout.</p>
          </div>
        </div>
      )}

      {addresses.map(addr => (
        editingId === addr.id ? (
          <AddressForm key={addr.id} initial={addr} onSave={handleEdit} onCancel={() => setEditingId(null)} />
        ) : (
          <div key={addr.id} className="border border-border rounded-2xl p-5 flex items-start justify-between gap-4 hover:border-foreground/20 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">{addr.label}</span>
                {addr.isDefault && (
                  <span className="text-[10px] font-bold tracking-wider uppercase bg-foreground text-background px-2 py-0.5 rounded-full">Default</span>
                )}
              </div>
              <p className="text-sm font-medium text-foreground">{addr.recipientName}</p>
              {addr.phone && <p className="text-sm text-muted-foreground">{addr.phone}</p>}
              <p className="text-sm text-muted-foreground">{addr.address}, {addr.county}</p>
              {addr.deliveryInstructions && (
                <p className="text-xs text-muted-foreground italic mt-1">{addr.deliveryInstructions}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5 flex-shrink-0">
              <button
                onClick={() => setEditingId(addr.id)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Edit address"
              >
                <Icon name="PencilIcon" size={15} />
              </button>
              {!addr.isDefault && (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Set as default"
                  title="Set as default"
                >
                  <Icon name="StarIcon" size={15} />
                </button>
              )}
              <button
                onClick={() => handleDelete(addr.id)}
                disabled={deletingId === addr.id}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-600 disabled:opacity-40"
                aria-label="Delete address"
              >
                <Icon name="TrashIcon" size={15} />
              </button>
            </div>
          </div>
        )
      ))}

      {showForm && (
        <AddressForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
      )}

      {!showForm && editingId === null && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full border-2 border-dashed border-border rounded-2xl py-4 text-sm text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors flex items-center justify-center gap-2"
        >
          <Icon name="PlusIcon" size={16} />
          Add New Address
        </button>
      )}
    </div>
  );
}

// ─── Wishlist Tab ─────────────────────────────────────────────────────────────
function WishlistTab({ user }: { user: any }) {
  const [items, setItems] = useState<DbWishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await wishlistService.getWishlist(user.id);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleRemove = async (item: DbWishlistItem) => {
    setRemovingId(item.id);
    await wishlistService.toggle(user.id, {
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,
      price: item.price,
      discountPrice: item.discountPrice,
    });
    setRemovingId(null);
    load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
          <Icon name="HeartIcon" size={24} className="text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium text-foreground mb-1">Your wishlist is empty</p>
          <p className="text-sm text-muted-foreground">Save items you love while browsing the shop.</p>
        </div>
        <Link href="/shop" className="btn-primary text-sm px-6 py-2.5">Browse Shop</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map(item => (
        <div key={item.id} className="border border-border rounded-2xl overflow-hidden flex gap-0 hover:border-foreground/20 transition-colors">
          <Link href={`/product-detail?id=${item.productId}`} className="w-24 h-24 flex-shrink-0 bg-muted overflow-hidden">
            <AppImage
              src={item.productImage}
              alt={item.productName}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </Link>
          <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
            <div>
              <Link href={`/product-detail?id=${item.productId}`} className="text-sm font-medium text-foreground line-clamp-2 hover:underline">
                {item.productName}
              </Link>
              <div className="flex items-center gap-2 mt-1">
                {item.discountPrice ? (
                  <>
                    <span className="text-sm font-semibold text-foreground">{formatKES(item.discountPrice)}</span>
                    <span className="text-xs text-muted-foreground line-through">{formatKES(item.price)}</span>
                  </>
                ) : (
                  <span className="text-sm font-semibold text-foreground">{formatKES(item.price)}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Link
                href={`/product-detail?id=${item.productId}`}
                className="text-xs font-medium text-foreground border border-border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors"
              >
                View
              </Link>
              <button
                onClick={() => handleRemove(item)}
                disabled={removingId === item.id}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-500 disabled:opacity-40"
                aria-label="Remove from wishlist"
              >
                <Icon name="TrashIcon" size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('info');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-up-login');
    }
  }, [user, authLoading, router]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'info', label: 'Personal Info', icon: 'UserIcon' },
    { id: 'addresses', label: 'Addresses', icon: 'MapPinIcon' },
    { id: 'wishlist', label: 'Wishlist', icon: 'HeartIcon' },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-20 sm:pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-1">Account</p>
              <h1 className="text-2xl sm:text-3xl font-display font-semibold text-foreground">My Profile</h1>
              <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Link href="/orders" className="btn-ghost text-sm px-4 py-2 hidden sm:inline-flex items-center gap-1.5">
                <Icon name="ShoppingBagIcon" size={15} />
                Orders
              </Link>
              <button
                onClick={async () => { await signOut(); router.push('/'); }}
                className="btn-ghost text-sm px-4 py-2 text-muted-foreground hover:text-foreground flex items-center gap-1.5"
              >
                <Icon name="ArrowRightOnRectangleIcon" size={15} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-muted/50 rounded-2xl p-1 mb-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab.icon} size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'info' && <PersonalInfoTab user={user} />}
          {activeTab === 'addresses' && <AddressesTab user={user} />}
          {activeTab === 'wishlist' && <WishlistTab user={user} />}
        </div>
      </main>
      <Footer />
    </>
  );
}
