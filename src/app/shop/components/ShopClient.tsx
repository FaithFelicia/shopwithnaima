'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStoreProducts } from '@/lib/useStoreProducts';
import ProductCard from '@/components/ProductCard';
import Icon from '@/components/ui/AppIcon';

const CATEGORIES = ['All', 'Shoes', 'Clothing', 'Bags', 'Accessories'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', 'One Size', 'S/M', 'L/XL'];
const PRICE_RANGES = [
  { label: 'Under KES 3,000', min: 0, max: 3000 },
  { label: 'KES 3,000 – 6,000', min: 3000, max: 6000 },
  { label: 'KES 6,000 – 10,000', min: 6000, max: 10000 },
  { label: 'Over KES 10,000', min: 10000, max: Infinity },
];

export default function ShopClient() {
  const searchParams = useSearchParams();  const { products } = useStoreProducts();
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState<Record<string, boolean>>({ category: true, price: true, size: false });

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setCategory(cat.charAt(0).toUpperCase() + cat.slice(1));
    }
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    let result = [...products];

    if (category !== 'All') {
      result = result.filter(p => p.category === category.toLowerCase());
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (priceRange) {
      result = result.filter(p => {
        const eff = p.discountPrice ?? p.price;
        return eff >= priceRange.min && eff <= priceRange.max;
      });
    }
    if (selectedSizes.length > 0) {
      result = result.filter(p => p.sizes.some(s => selectedSizes.includes(s)));
    }

    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
        break;
      case 'popular':
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default:
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }

    return result;
  }, [category, sort, selectedSizes, priceRange, searchQuery]);

  const toggleSize = (s: string) => {
    setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const clearFilters = () => {
    setCategory('All');
    setSelectedSizes([]);
    setPriceRange(null);
    setSearchQuery('');
  };

  const activeFilterCount = (category !== 'All' ? 1 : 0) + selectedSizes.length + (priceRange ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-display-lg font-display font-semibold text-foreground mb-2">
          {category === 'All' ? 'All Products' : category}
        </h1>
        <p className="text-sm text-muted-foreground">{filtered.length} products</p>
      </div>

      {/* Search + Controls bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="input-field pl-10 py-2.5 text-sm"
          />
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Filter button (mobile) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center gap-2 text-sm font-medium border border-border px-4 py-2.5 hover:border-foreground transition-colors relative"
          >
            <Icon name="AdjustmentsHorizontalIcon" size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="input-field py-2.5 text-sm min-w-[180px] cursor-pointer"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`filter-chip ${category === cat ? 'active' : ''}`}
          >
            {cat}
          </button>
        ))}
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="filter-chip flex items-center gap-1.5 border-border/50">
            Clear all
            <Icon name="XMarkIcon" size={12} />
          </button>
        )}
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters — Desktop */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <FilterSidebar
            filterOpen={filterOpen}
            setFilterOpen={setFilterOpen}
            category={category}
            setCategory={setCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            selectedSizes={selectedSizes}
            toggleSize={toggleSize}
            clearFilters={clearFilters}
            activeFilterCount={activeFilterCount}
          />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-background overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold tracking-wide uppercase">Filters</h3>
                <button onClick={() => setSidebarOpen(false)}>
                  <Icon name="XMarkIcon" size={20} />
                </button>
              </div>
              <FilterSidebar
                filterOpen={filterOpen}
                setFilterOpen={setFilterOpen}
                category={category}
                setCategory={setCategory}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                selectedSizes={selectedSizes}
                toggleSize={toggleSize}
                clearFilters={clearFilters}
                activeFilterCount={activeFilterCount}
              />
              <button onClick={() => setSidebarOpen(false)} className="btn-primary w-full mt-6">
                View {filtered.length} Results
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="py-24 text-center">
              <Icon name="MagnifyingGlassIcon" size={48} className="mx-auto text-muted mb-4" />
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">No products found</h3>
              <p className="text-sm text-muted-foreground mb-6">Try adjusting your filters or search term</p>
              <button onClick={clearFilters} className="btn-ghost">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface FilterSidebarProps {
  filterOpen: Record<string, boolean>;
  setFilterOpen: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  category: string;
  setCategory: (c: string) => void;
  priceRange: { min: number; max: number } | null;
  setPriceRange: (r: { min: number; max: number } | null) => void;
  selectedSizes: string[];
  toggleSize: (s: string) => void;
  clearFilters: () => void;
  activeFilterCount: number;
}

function FilterSidebar({
  filterOpen, setFilterOpen, category, setCategory,
  priceRange, setPriceRange, selectedSizes, toggleSize,
  clearFilters, activeFilterCount
}: FilterSidebarProps) {
  const toggle = (key: string) => setFilterOpen(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-0">
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between py-3 mb-2">
          <span className="text-xs font-semibold tracking-wide uppercase text-foreground">Active Filters ({activeFilterCount})</span>
          <button onClick={clearFilters} className="text-xs text-accent hover:underline">Clear</button>
        </div>
      )}

      {/* Category */}
      <div className="sidebar-filter-section">
        <button className="sidebar-filter-title w-full" onClick={() => toggle('category')}>
          Category
          <Icon name={filterOpen.category ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={14} />
        </button>
        {filterOpen.category && (
          <div className="space-y-1.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`block w-full text-left text-sm py-1.5 transition-colors ${
                  category === cat ? 'text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="sidebar-filter-section">
        <button className="sidebar-filter-title w-full" onClick={() => toggle('price')}>
          Price Range
          <Icon name={filterOpen.price ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={14} />
        </button>
        {filterOpen.price && (
          <div className="space-y-1.5">
            {PRICE_RANGES.map(range => (
              <button
                key={range.label}
                onClick={() => setPriceRange(
                  priceRange?.min === range.min ? null : { min: range.min, max: range.max }
                )}
                className={`block w-full text-left text-sm py-1.5 transition-colors ${
                  priceRange?.min === range.min ? 'text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sizes */}
      <div className="sidebar-filter-section">
        <button className="sidebar-filter-title w-full" onClick={() => toggle('size')}>
          Size
          <Icon name={filterOpen.size ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={14} />
        </button>
        {filterOpen.size && (
          <div className="flex flex-wrap gap-2">
            {SIZES.slice(0, 10).map(s => (
              <button
                key={s}
                onClick={() => toggleSize(s)}
                className={`size-btn text-xs px-2 min-w-0 h-8 ${selectedSizes.includes(s) ? 'selected' : ''}`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
