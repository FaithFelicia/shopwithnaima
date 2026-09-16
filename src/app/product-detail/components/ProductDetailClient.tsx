'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { PRODUCTS, Product } from '@/lib/mockData';
import { addToCart, toggleWishlist, isInWishlist } from '@/lib/cartStore';
import ProductCard from '@/components/ProductCard';
import ReviewForm from './ReviewForm';
import { reviewService, DbReview } from '@/lib/supabase/services';

export default function ProductDetailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id') || PRODUCTS[0].id;
  const product = PRODUCTS.find(p => p.id === id) || PRODUCTS[0];

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(product.colors[0].name);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(() => isInWishlist(product.id));
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'sizing' | 'reviews'>('details');
  const [sizeError, setSizeError] = useState(false);
  const [reviews, setReviews] = useState<DbReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const effectivePrice = product.discountPrice ?? product.price;
  const hasDiscount = !!product.discountPrice;

  useEffect(() => {
    setSelectedImage(0);
    setSelectedSize('');
    setSelectedColor(product.colors[0].name);
    setQuantity(1);
    setWishlisted(isInWishlist(product.id));
  }, [product.id, product.colors]);

  useEffect(() => {
    if (activeTab === 'reviews') {
      setReviewsLoading(true);
      reviewService.getByProduct(product.id)
        .then(data => setReviews(data))
        .catch(() => setReviews([]))
        .finally(() => setReviewsLoading(false));
    }
  }, [activeTab, product.id]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    addToCart({
      id: `${product.id}-${selectedSize}-${selectedColor}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      image: product.images[0],
      size: selectedSize,
      color: selectedColor,
      quantity,
      category: product.category,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    addToCart({
      id: `${product.id}-${selectedSize}-${selectedColor}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      image: product.images[0],
      size: selectedSize,
      color: selectedColor,
      quantity,
      category: product.category,
    });
    router.push('/checkout');
  };

  const handleWishlist = () => {
    const result = toggleWishlist({
      productId: product.id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      image: product.images[0],
    });
    setWishlisted(result);
  };

  const handleReviewSubmitted = (review: DbReview) => {
    setReviews(prev => [review, ...prev]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <Icon name="ChevronRightIcon" size={12} />
        <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
        <Icon name="ChevronRightIcon" size={12} />
        <Link href={`/shop?category=${product.category}`} className="hover:text-foreground transition-colors capitalize">{product.category}</Link>
        <Icon name="ChevronRightIcon" size={12} />
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-20">
        {/* Images */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
          {/* Thumbnails */}
          <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:max-h-[600px]">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`flex-shrink-0 w-16 h-20 sm:w-20 sm:h-24 overflow-hidden border-2 transition-all ${
                  selectedImage === i ? 'border-foreground' : 'border-transparent hover:border-border'
                }`}
              >
                <AppImage
                  src={img}
                  alt={`${product.name} view ${i + 1}, bright product photography`}
                  width={80}
                  height={96}
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div className="flex-1 relative aspect-[3/4] image-zoom overflow-hidden bg-muted">
            <AppImage
              src={product.images[selectedImage]}
              alt={`${product.name} — ${product.colors[0].name} — main product view, bright airy studio, clean white background, well-lit fashion photography`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            {hasDiscount && (
              <div className="absolute top-4 left-4">
                <span className="badge badge-sale">
                  -{Math.round((1 - effectivePrice / product.price) * 100)}% OFF
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-between">
          <div>
            {/* Category + Brand */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground capitalize">
                {product.subcategory}
              </p>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-accent">{product.brand}</p>
            </div>

            {/* Name */}
            <h1 className="text-display-md font-display font-semibold text-foreground mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex star-rating">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Icon key={i} name="StarIcon" variant={i < Math.floor(product.rating) ? 'solid' : 'outline'} size={14} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{product.rating} ({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-2xl font-semibold text-foreground">
                KES {effectivePrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-lg text-muted-foreground line-through">
                  KES {product.price.toLocaleString()}
                </span>
              )}
              {hasDiscount && (
                <span className="text-sm font-semibold text-accent">
                  Save KES {(product.price - effectivePrice).toLocaleString()}
                </span>
              )}
            </div>

            {/* Color */}
            <div className="mb-6">
              <p className="text-xs font-semibold tracking-[0.1em] uppercase mb-3">
                Color: <span className="font-normal text-muted-foreground">{selectedColor}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(color => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`color-btn ${selectedColor === color.name ? 'selected' : ''}`}
                    style={{ backgroundColor: color.hex, border: color.hex === '#FFFFFF' || color.hex === '#FAFAF8' ? '1px solid #E8E4DF' : 'none' }}
                    aria-label={color.name}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <p className={`text-xs font-semibold tracking-[0.1em] uppercase ${sizeError ? 'text-red-500' : ''}`}>
                  {sizeError ? 'Please select a size' : 'Size'}
                </p>
                <button className="text-xs text-muted-foreground hover:text-foreground underline transition-colors">
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`size-btn ${selectedSize === size ? 'selected' : ''} ${sizeError && !selectedSize ? 'border-red-300' : ''}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-8">
              <p className="text-xs font-semibold tracking-[0.1em] uppercase">Quantity</p>
              <div className="flex items-center">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="qty-btn"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-12 h-8 flex items-center justify-center text-sm font-medium border-y border-border">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="qty-btn"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-muted-foreground">
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 btn-ghost flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {addedToCart ? (
                  <>
                    <Icon name="CheckIcon" size={16} />
                    Added!
                  </>
                ) : (
                  <>
                    <Icon name="ShoppingBagIcon" size={16} />
                    Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={handleWishlist}
                className={`w-12 h-12 flex items-center justify-center border transition-all ${
                  wishlisted
                    ? 'border-accent text-accent bg-accent/5' :'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                }`}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Icon name="HeartIcon" variant={wishlisted ? 'solid' : 'outline'} size={18} />
              </button>
            </div>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border mt-2">
              {[
                { icon: 'TruckIcon', label: 'Free delivery over KES 5,000' },
                { icon: 'ArrowPathIcon', label: '7-day easy returns' },
                { icon: 'ShieldCheckIcon', label: '100% authentic products' },
              ].map(item => (
                <div key={item.label} className="flex flex-col items-center text-center gap-1.5">
                  <Icon name={item.icon as 'TruckIcon'} size={18} className="text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground leading-tight">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-16 border-b border-border">
        <div className="flex gap-8">
          {(['details', 'sizing', 'reviews'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-btn capitalize ${activeTab === tab ? 'active' : ''}`}
            >
              {tab === 'reviews' ? `Reviews (${product.reviewCount})` : tab}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-20 max-w-2xl">
        {activeTab === 'details' && (
          <div>
            <p className="text-sm text-foreground/80 font-light leading-relaxed mb-6">{product.description}</p>
            <ul className="space-y-2">
              {[
                `Category: ${product.category.charAt(0).toUpperCase() + product.category.slice(1)}`,
                `Brand: ${product.brand}`,
                `Available colors: ${product.colors.map(c => c.name).join(', ')}`,
                `Available sizes: ${product.sizes.join(', ')}`,
                `Stock: ${product.stock} units available`,
              ].map(detail => (
                <li key={detail} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Icon name="CheckIcon" size={14} className="mt-0.5 text-accent flex-shrink-0" />
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        )}
        {activeTab === 'sizing' && (
          <div>
            <p className="text-sm text-muted-foreground font-light leading-relaxed mb-6">
              Our items are true to size. We recommend ordering your usual size. If you&apos;re between sizes, size up for a relaxed fit or size down for a fitted look.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 pr-6 text-xs font-semibold tracking-wide uppercase text-muted-foreground">Size</th>
                    <th className="text-left py-3 pr-6 text-xs font-semibold tracking-wide uppercase text-muted-foreground">Chest (cm)</th>
                    <th className="text-left py-3 pr-6 text-xs font-semibold tracking-wide uppercase text-muted-foreground">Waist (cm)</th>
                    <th className="text-left py-3 text-xs font-semibold tracking-wide uppercase text-muted-foreground">Hip (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { size: 'XS', chest: '80–84', waist: '62–66', hip: '88–92' },
                    { size: 'S', chest: '84–88', waist: '66–70', hip: '92–96' },
                    { size: 'M', chest: '88–92', waist: '70–74', hip: '96–100' },
                    { size: 'L', chest: '92–96', waist: '74–78', hip: '100–104' },
                    { size: 'XL', chest: '96–100', waist: '78–82', hip: '104–108' },
                  ].map(row => (
                    <tr key={row.size} className="border-b border-border/50">
                      <td className="py-3 pr-6 font-medium">{row.size}</td>
                      <td className="py-3 pr-6 text-muted-foreground">{row.chest}</td>
                      <td className="py-3 pr-6 text-muted-foreground">{row.waist}</td>
                      <td className="py-3 text-muted-foreground">{row.hip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'reviews' && (
          <div>
            <div className="flex items-center gap-6 mb-8 p-6 bg-muted/30 border border-border">
              <div className="text-center">
                <p className="text-4xl font-display font-semibold text-foreground">{product.rating}</p>
                <div className="flex star-rating justify-center my-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Icon key={i} name="StarIcon" variant={i < Math.floor(product.rating) ? 'solid' : 'outline'} size={12} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{product.reviewCount} reviews</p>
              </div>
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map(star => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-3">{star}</span>
                    <Icon name="StarIcon" variant="solid" size={10} className="text-accent" />
                    <div className="flex-1 h-1.5 bg-border overflow-hidden">
                      <div
                        className="h-full bg-accent"
                        style={{ width: `${star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 7 : 2}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-6">{star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 7 : 2}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Review submission form */}
            <div className="mb-8">
              <ReviewForm productId={product.id} onReviewSubmitted={handleReviewSubmitted} />
            </div>

            {/* Reviews list */}
            {reviewsLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground text-sm">
                <div className="w-4 h-4 border-2 border-border border-t-foreground rounded-full animate-spin" />
                Loading reviews…
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="pb-6 border-b border-border last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{review.reviewerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex star-rating">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Icon key={j} name="StarIcon" variant={j < review.rating ? 'solid' : 'outline'} size={12} className={j < review.rating ? 'text-accent' : 'text-muted-foreground'} />
                        ))}
                      </div>
                    </div>
                    {review.reviewText && (
                      <p className="text-sm text-foreground/80 font-light leading-relaxed">{review.reviewText}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div>
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-display-md font-display font-semibold text-foreground">You May Also Like</h2>
            <Link href={`/shop?category=${product.category}`} className="text-sm text-muted-foreground hover:text-foreground border-b border-border hover:border-foreground pb-0.5 transition-colors capitalize">
              More {product.category} →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {related.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}