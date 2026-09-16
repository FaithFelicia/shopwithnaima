'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { Product } from '@/lib/mockData';
import { addToCart, toggleWishlist, isInWishlist } from '@/lib/cartStore';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className = '' }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(() => isInWishlist(product.id));
  const [addedToCart, setAddedToCart] = useState(false);

  const effectivePrice = product.discountPrice ?? product.price;
  const hasDiscount = !!product.discountPrice;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    const result = toggleWishlist({
      productId: product.id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      image: product.images[0],
    });
    setWishlisted(result);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      id: `${product.id}-${product.sizes[0]}-${product.colors[0].name}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      image: product.images[0],
      size: product.sizes[0],
      color: product.colors[0].name,
      quantity: 1,
      category: product.category,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <Link
      href={`/product-detail?id=${product.id}`}
      className={`product-card group block ${className}`}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] image-zoom overflow-hidden bg-muted">
        <AppImage
          src={product.images[0]}
          alt={`${product.name} — ${product.colors[0].name} colorway fashion product by NAIMA`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && <span className="badge badge-new">New</span>}
          {hasDiscount && (
            <span className="badge badge-sale">
              -{Math.round((1 - effectivePrice / product.price) * 100)}%
            </span>
          )}
          {product.stock === 0 && <span className="badge badge-sold-out">Sold Out</span>}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center transition-all ${
            wishlisted ? 'text-accent opacity-100' : 'text-white opacity-0 group-hover:opacity-100'
          }`}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Icon
            name={wishlisted ? 'HeartIcon' : 'HeartIcon'}
            variant={wishlisted ? 'solid' : 'outline'}
            size={18}
          />
        </button>

        {/* Add to Cart */}
        <div className="product-card-actions">
          <button
            onClick={handleAddToCart}
            className="w-full text-primary-foreground text-xs font-semibold tracking-[0.1em] uppercase flex items-center justify-center gap-2"
          >
            {addedToCart ? (
              <>
                <Icon name="CheckIcon" size={14} />
                Added to Cart
              </>
            ) : (
              <>
                <Icon name="ShoppingBagIcon" size={14} />
                Quick Add
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="pt-3 pb-1">
        <p className="text-[10px] font-medium tracking-[0.1em] uppercase text-muted-foreground mb-1">
          {product.subcategory}
        </p>
        <h3 className="text-sm font-medium text-foreground leading-snug mb-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            KES {effectivePrice.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              KES {product.price.toLocaleString()}
            </span>
          )}
        </div>
        {/* Rating */}
        <div className="flex items-center gap-1 mt-1.5">
          <div className="flex star-rating">
            {Array.from({ length: 5 }).map((_, i) => (
              <Icon
                key={i}
                name="StarIcon"
                variant={i < Math.floor(product.rating) ? 'solid' : 'outline'}
                size={10}
              />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">({product.reviewCount})</span>
        </div>
      </div>
    </Link>
  );
}