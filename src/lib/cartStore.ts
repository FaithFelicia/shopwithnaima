'use client';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
  category: string;
}

export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
}

const CART_KEY = 'swn_cart';
const WISHLIST_KEY = 'swn_wishlist';

export const getCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

export const saveCart = (items: CartItem[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('cart-updated'));
};

export const addToCart = (item: CartItem) => {
  const cart = getCart();
  const existing = cart.findIndex(
    c => c.productId === item.productId && c.size === item.size && c.color === item.color
  );
  if (existing >= 0) {
    cart[existing].quantity += item.quantity;
  } else {
    cart.push(item);
  }
  saveCart(cart);
};

export const removeFromCart = (id: string) => {
  const cart = getCart().filter(c => c.id !== id);
  saveCart(cart);
};

export const updateQty = (id: string, qty: number) => {
  const cart = getCart().map(c => c.id === id ? { ...c, quantity: qty } : c);
  saveCart(cart);
};

export const clearCart = () => saveCart([]);

export const getCartCount = (): number =>
  getCart().reduce((sum, item) => sum + item.quantity, 0);

export const getCartTotal = (): number =>
  getCart().reduce((sum, item) => sum + (item.discountPrice ?? item.price) * item.quantity, 0);

// Wishlist
export const getWishlist = (): WishlistItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(WISHLIST_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

export const toggleWishlist = (item: WishlistItem): boolean => {
  const list = getWishlist();
  const idx = list.findIndex(w => w.productId === item.productId);
  if (idx >= 0) {
    list.splice(idx, 1);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('wishlist-updated'));
    return false;
  } else {
    list.push(item);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('wishlist-updated'));
    return true;
  }
};

export const isInWishlist = (productId: string): boolean =>
  getWishlist().some(w => w.productId === productId);