'use client';

import React, { useState } from 'react';
import { PRODUCTS, Product } from '@/lib/mockData';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

type ProductForm = {
  name: string;
  category: string;
  subcategory: string;
  price: string;
  discountPrice: string;
  stock: string;
  description: string;
  brand: string;
  featured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
};

const EMPTY_FORM: ProductForm = {
  name: '',
  category: 'bags',
  subcategory: '',
  price: '',
  discountPrice: '',
  stock: '',
  description: '',
  brand: 'NAIMA',
  featured: false,
  isNew: false,
  isBestSeller: false,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([...PRODUCTS]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      category: product.category,
      subcategory: product.subcategory,
      price: product.price.toString(),
      discountPrice: product.discountPrice?.toString() ?? '',
      stock: product.stock.toString(),
      description: product.description,
      brand: product.brand,
      featured: product.featured,
      isNew: product.isNew,
      isBestSeller: product.isBestSeller,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.price.trim()) return;

    if (editingProduct) {
      setProducts(prev =>
        prev.map(p =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: form.name,
                category: form.category as Product['category'],
                subcategory: form.subcategory,
                price: parseFloat(form.price) || p.price,
                discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : undefined,
                stock: parseInt(form.stock) || p.stock,
                description: form.description,
                brand: form.brand,
                featured: form.featured,
                isNew: form.isNew,
                isBestSeller: form.isBestSeller,
              }
            : p
        )
      );
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name: form.name,
        category: form.category as Product['category'],
        subcategory: form.subcategory,
        price: parseFloat(form.price) || 0,
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : undefined,
        images: ['/assets/images/no_image.png'],
        sizes: ['One Size'],
        colors: [{ name: 'Black', hex: '#0A0A0A' }],
        stock: parseInt(form.stock) || 0,
        featured: form.featured,
        isNew: form.isNew,
        isBestSeller: form.isBestSeller,
        rating: 0,
        reviewCount: 0,
        description: form.description,
        brand: form.brand,
        tags: [],
      };
      setProducts(prev => [newProduct, ...prev]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-semibold text-[#0A0A0A]">Products</h2>
          <p className="text-sm text-[#7A7570] mt-1">{products.length} products in your store</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-xs">
          <Icon name="PlusIcon" size={16} />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A7570]" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full border border-[#E8E4DF] bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#0A0A0A] transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E8E4DF] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E4DF] bg-[#F5F4F2]">
                {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold tracking-[0.1em] uppercase text-[#7A7570]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => (
                <tr key={product.id} className="border-b border-[#E8E4DF]/50 hover:bg-[#F5F4F2] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#F5F4F2] flex-shrink-0 overflow-hidden">
                        <AppImage
                          src={product.images[0]}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#0A0A0A]">{product.name}</p>
                        <p className="text-xs text-[#7A7570]">{product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-medium capitalize text-[#7A7570] bg-[#F5F4F2] px-2.5 py-1">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-[#0A0A0A]">KES {product.price.toLocaleString()}</p>
                    {product.discountPrice && (
                      <p className="text-xs text-[#C8965A]">Sale: KES {product.discountPrice.toLocaleString()}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-500'}`}>
                      {product.stock} units
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {product.featured && (
                        <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 bg-[#C8965A]/10 text-[#C8965A]">
                          Featured
                        </span>
                      )}
                      {product.isNew && (
                        <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 bg-blue-50 text-blue-600">
                          New
                        </span>
                      )}
                      {product.isBestSeller && (
                        <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 bg-green-50 text-green-600">
                          Best Seller
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="w-8 h-8 flex items-center justify-center text-[#7A7570] hover:text-[#0A0A0A] hover:bg-[#F5F4F2] transition-colors"
                        title="Edit"
                      >
                        <Icon name="PencilIcon" size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(product.id)}
                        className="w-8 h-8 flex items-center justify-center text-[#7A7570] hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Icon name="TrashIcon" size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-sm text-[#7A7570]">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E4DF]">
              <h3 className="text-sm font-semibold tracking-[0.08em] uppercase">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#7A7570] hover:text-[#0A0A0A]">
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-[#7A7570] mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-[#E8E4DF] px-4 py-2.5 text-sm outline-none focus:border-[#0A0A0A] transition-colors"
                  placeholder="e.g. Mini Shoulder Bag"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-[#7A7570] mb-2">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full border border-[#E8E4DF] px-4 py-2.5 text-sm outline-none focus:border-[#0A0A0A] transition-colors bg-white"
                  >
                    <option value="bags">Bags</option>
                    <option value="shoes">Shoes</option>
                    <option value="clothing">Clothing</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-[#7A7570] mb-2">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    value={form.subcategory}
                    onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))}
                    className="w-full border border-[#E8E4DF] px-4 py-2.5 text-sm outline-none focus:border-[#0A0A0A] transition-colors"
                    placeholder="e.g. handbags"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-[#7A7570] mb-2">
                    Price (KES) *
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    className="w-full border border-[#E8E4DF] px-4 py-2.5 text-sm outline-none focus:border-[#0A0A0A] transition-colors"
                    placeholder="2500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-[#7A7570] mb-2">
                    Sale Price (KES)
                  </label>
                  <input
                    type="number"
                    value={form.discountPrice}
                    onChange={e => setForm(f => ({ ...f, discountPrice: e.target.value }))}
                    className="w-full border border-[#E8E4DF] px-4 py-2.5 text-sm outline-none focus:border-[#0A0A0A] transition-colors"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-[#7A7570] mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                    className="w-full border border-[#E8E4DF] px-4 py-2.5 text-sm outline-none focus:border-[#0A0A0A] transition-colors"
                    placeholder="20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-[#7A7570] mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                    className="w-full border border-[#E8E4DF] px-4 py-2.5 text-sm outline-none focus:border-[#0A0A0A] transition-colors"
                    placeholder="NAIMA"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-[#7A7570] mb-2">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-[#E8E4DF] px-4 py-2.5 text-sm outline-none focus:border-[#0A0A0A] transition-colors resize-none"
                  placeholder="Product description..."
                />
              </div>
              <div className="flex flex-wrap gap-4">
                {(['featured', 'isNew', 'isBestSeller'] as const).map(key => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                      className="w-4 h-4 accent-[#0A0A0A]"
                    />
                    <span className="text-xs font-medium text-[#0A0A0A] capitalize">
                      {key === 'isNew' ? 'New Arrival' : key === 'isBestSeller' ? 'Best Seller' : 'Featured'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-[#E8E4DF]">
              <button onClick={handleSave} className="btn-primary flex-1 text-xs">
                {editingProduct ? 'Save Changes' : 'Add Product'}
              </button>
              <button onClick={() => setShowModal(false)} className="btn-ghost flex-1 text-xs">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white p-6 max-w-sm w-full">
            <h3 className="text-sm font-semibold text-[#0A0A0A] mb-2">Delete Product?</h3>
            <p className="text-sm text-[#7A7570] mb-6">
              This action cannot be undone. The product will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-500 text-white text-xs font-semibold tracking-[0.08em] uppercase py-3 hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
              <button onClick={() => setDeleteConfirm(null)} className="btn-ghost flex-1 text-xs">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
