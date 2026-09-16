'use client';

import { createClient } from '@/lib/supabase/client';

function isSchemaError(error: any): boolean {
  if (!error) return false;
  if (error.code && typeof error.code === 'string') {
    const errorClass = error.code.substring(0, 2);
    if (errorClass === '42') return true;
    if (errorClass === '23') return false;
    if (errorClass === '08') return true;
  }
  if (error.message) {
    const schemaErrorPatterns = [
      /relation.*does not exist/i,
      /column.*does not exist/i,
      /function.*does not exist/i,
      /syntax error/i,
      /invalid.*syntax/i,
      /type.*does not exist/i,
    ];
    return schemaErrorPatterns.some((p) => p.test(error.message));
  }
  return false;
}

export interface DbProduct {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  discountPrice?: number;
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  stock: number;
  featured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  rating: number;
  reviewCount: number;
  description: string;
  brand: string;
  tags: string[];
}

export interface DbCartItem {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  discountPrice?: number;
  size: string;
  color: string;
  quantity: number;
  category: string;
}

export interface DbWishlistItem {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  discountPrice?: number;
}

export interface DbDeliveryAddress {
  id: string;
  userId: string;
  label: string;
  recipientName: string;
  phone: string;
  address: string;
  county: string;
  deliveryInstructions?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbUserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: string;
}

export interface DbOrder {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  county: string;
  address: string;
  deliveryInstructions?: string;
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  total: number;
  paymentMethod: string;
  status: string;
  items?: DbOrderItem[];
  createdAt: string;
}

export interface DbOrderItem {
  id: string;
  orderId: string;
  productId?: string;
  productName: string;
  productImage: string;
  price: number;
  discountPrice?: number;
  size: string;
  color: string;
  quantity: number;
}

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

function mapProduct(row: any): DbProduct {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    subcategory: row.subcategory,
    price: row.price,
    discountPrice: row.discount_price ?? undefined,
    images: row.images ?? [],
    sizes: row.sizes ?? [],
    colors: row.colors ?? [],
    stock: row.stock,
    featured: row.featured,
    isNew: row.is_new,
    isBestSeller: row.is_best_seller,
    rating: row.rating,
    reviewCount: row.review_count,
    description: row.description,
    brand: row.brand,
    tags: row.tags ?? [],
  };
}

export const productService = {
  async getAll(): Promise<DbProduct[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        if (isSchemaError(error)) throw error;
        return [];
      }
      return (data ?? []).map(mapProduct);
    } catch (err: any) {
      console.error('productService.getAll:', err.message);
      throw err;
    }
  },

  async getById(id: string): Promise<DbProduct | null> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) {
        if (isSchemaError(error)) throw error;
        return null;
      }
      return data ? mapProduct(data) : null;
    } catch (err: any) {
      console.error('productService.getById:', err.message);
      throw err;
    }
  },

  async getFeatured(): Promise<DbProduct[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false });
      if (error) {
        if (isSchemaError(error)) throw error;
        return [];
      }
      return (data ?? []).map(mapProduct);
    } catch (err: any) {
      console.error('productService.getFeatured:', err.message);
      throw err;
    }
  },

  async getNew(): Promise<DbProduct[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_new', true)
        .order('created_at', { ascending: false });
      if (error) {
        if (isSchemaError(error)) throw error;
        return [];
      }
      return (data ?? []).map(mapProduct);
    } catch (err: any) {
      console.error('productService.getNew:', err.message);
      throw err;
    }
  },

  async getBestSellers(): Promise<DbProduct[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_best_seller', true)
        .order('created_at', { ascending: false });
      if (error) {
        if (isSchemaError(error)) throw error;
        return [];
      }
      return (data ?? []).map(mapProduct);
    } catch (err: any) {
      console.error('productService.getBestSellers:', err.message);
      throw err;
    }
  },

  async getByCategory(category: string): Promise<DbProduct[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });
      if (error) {
        if (isSchemaError(error)) throw error;
        return [];
      }
      return (data ?? []).map(mapProduct);
    } catch (err: any) {
      console.error('productService.getByCategory:', err.message);
      throw err;
    }
  },

  async create(product: Omit<DbProduct, 'id'>): Promise<DbProduct | null> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          category: product.category,
          subcategory: product.subcategory,
          price: product.price,
          discount_price: product.discountPrice ?? null,
          images: product.images,
          sizes: product.sizes,
          colors: product.colors,
          stock: product.stock,
          featured: product.featured,
          is_new: product.isNew,
          is_best_seller: product.isBestSeller,
          rating: product.rating,
          review_count: product.reviewCount,
          description: product.description,
          brand: product.brand,
          tags: product.tags,
        })
        .select()
        .single();
      if (error) {
        if (isSchemaError(error)) throw error;
        return null;
      }
      return data ? mapProduct(data) : null;
    } catch (err: any) {
      console.error('productService.create:', err.message);
      throw err;
    }
  },

  async update(id: string, updates: Partial<DbProduct>): Promise<DbProduct | null> {
    const supabase = createClient();
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.subcategory !== undefined) dbUpdates.subcategory = updates.subcategory;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.discountPrice !== undefined) dbUpdates.discount_price = updates.discountPrice;
    if (updates.images !== undefined) dbUpdates.images = updates.images;
    if (updates.sizes !== undefined) dbUpdates.sizes = updates.sizes;
    if (updates.colors !== undefined) dbUpdates.colors = updates.colors;
    if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
    if (updates.featured !== undefined) dbUpdates.featured = updates.featured;
    if (updates.isNew !== undefined) dbUpdates.is_new = updates.isNew;
    if (updates.isBestSeller !== undefined) dbUpdates.is_best_seller = updates.isBestSeller;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;

    try {
      const { data, error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
      if (error) {
        if (isSchemaError(error)) throw error;
        return null;
      }
      return data ? mapProduct(data) : null;
    } catch (err: any) {
      console.error('productService.update:', err.message);
      throw err;
    }
  },

  async delete(id: string): Promise<boolean> {
    const supabase = createClient();
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        if (isSchemaError(error)) throw error;
        return false;
      }
      return true;
    } catch (err: any) {
      console.error('productService.delete:', err.message);
      throw err;
    }
  },
};

// ─── CART ─────────────────────────────────────────────────────────────────────

function mapCartItem(row: any): DbCartItem {
  return {
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    productName: row.product_name,
    productImage: row.product_image,
    price: row.price,
    discountPrice: row.discount_price ?? undefined,
    size: row.size,
    color: row.color,
    quantity: row.quantity,
    category: row.category,
  };
}

export const cartService = {
  async getCart(userId: string): Promise<DbCartItem[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      if (error) {
        if (isSchemaError(error)) throw error;
        return [];
      }
      return (data ?? []).map(mapCartItem);
    } catch (err: any) {
      console.error('cartService.getCart:', err.message);
      return [];
    }
  },

  async addItem(userId: string, item: Omit<DbCartItem, 'id' | 'userId'>): Promise<DbCartItem | null> {
    const supabase = createClient();
    try {
      // Check if same product+size+color already in cart
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('product_id', item.productId)
        .eq('size', item.size)
        .eq('color', item.color)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + item.quantity })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) {
          if (isSchemaError(error)) throw error;
          return null;
        }
        return data ? mapCartItem(data) : null;
      }

      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: item.productId,
          product_name: item.productName,
          product_image: item.productImage,
          price: item.price,
          discount_price: item.discountPrice ?? null,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          category: item.category,
        })
        .select()
        .single();
      if (error) {
        if (isSchemaError(error)) throw error;
        return null;
      }
      return data ? mapCartItem(data) : null;
    } catch (err: any) {
      console.error('cartService.addItem:', err.message);
      return null;
    }
  },

  async updateQuantity(itemId: string, quantity: number): Promise<boolean> {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);
      if (error) {
        if (isSchemaError(error)) throw error;
        return false;
      }
      return true;
    } catch (err: any) {
      console.error('cartService.updateQuantity:', err.message);
      return false;
    }
  },

  async removeItem(itemId: string): Promise<boolean> {
    const supabase = createClient();
    try {
      const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
      if (error) {
        if (isSchemaError(error)) throw error;
        return false;
      }
      return true;
    } catch (err: any) {
      console.error('cartService.removeItem:', err.message);
      return false;
    }
  },

  async clearCart(userId: string): Promise<boolean> {
    const supabase = createClient();
    try {
      const { error } = await supabase.from('cart_items').delete().eq('user_id', userId);
      if (error) {
        if (isSchemaError(error)) throw error;
        return false;
      }
      return true;
    } catch (err: any) {
      console.error('cartService.clearCart:', err.message);
      return false;
    }
  },
};

// ─── WISHLIST ─────────────────────────────────────────────────────────────────

function mapWishlistItem(row: any): DbWishlistItem {
  return {
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    productName: row.product_name,
    productImage: row.product_image,
    price: row.price,
    discountPrice: row.discount_price ?? undefined,
  };
}

export const wishlistService = {
  async getWishlist(userId: string): Promise<DbWishlistItem[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) {
        if (isSchemaError(error)) throw error;
        return [];
      }
      return (data ?? []).map(mapWishlistItem);
    } catch (err: any) {
      console.error('wishlistService.getWishlist:', err.message);
      return [];
    }
  },

  async toggle(userId: string, item: Omit<DbWishlistItem, 'id' | 'userId'>): Promise<boolean> {
    const supabase = createClient();
    try {
      const { data: existing } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', item.productId)
        .maybeSingle();

      if (existing) {
        await supabase.from('wishlist_items').delete().eq('id', existing.id);
        return false; // removed
      }

      await supabase.from('wishlist_items').insert({
        user_id: userId,
        product_id: item.productId,
        product_name: item.productName,
        product_image: item.productImage,
        price: item.price,
        discount_price: item.discountPrice ?? null,
      });
      return true; // added
    } catch (err: any) {
      console.error('wishlistService.toggle:', err.message);
      return false;
    }
  },

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const supabase = createClient();
    try {
      const { data } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .maybeSingle();
      return !!data;
    } catch {
      return false;
    }
  },
};

// ─── ORDERS ───────────────────────────────────────────────────────────────────

function mapOrder(row: any): DbOrder {
  return {
    id: row.id,
    orderNumber: row.order_number,
    userId: row.user_id ?? undefined,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    county: row.county,
    address: row.address,
    deliveryInstructions: row.delivery_instructions ?? undefined,
    subtotal: row.subtotal,
    deliveryFee: row.delivery_fee,
    discountAmount: row.discount_amount,
    total: row.total,
    paymentMethod: row.payment_method,
    status: row.status,
    items: row.order_items?.map((i: any) => ({
      id: i.id,
      orderId: i.order_id,
      productId: i.product_id ?? undefined,
      productName: i.product_name,
      productImage: i.product_image,
      price: i.price,
      discountPrice: i.discount_price ?? undefined,
      size: i.size,
      color: i.color,
      quantity: i.quantity,
    })),
    createdAt: row.created_at,
  };
}

export const orderService = {
  async createOrder(
    order: Omit<DbOrder, 'id' | 'createdAt'>,
    items: Omit<DbOrderItem, 'id' | 'orderId'>[]
  ): Promise<DbOrder | null> {
    const supabase = createClient();
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: order.orderNumber,
          user_id: order.userId ?? null,
          customer_name: order.customerName,
          customer_email: order.customerEmail,
          customer_phone: order.customerPhone,
          county: order.county,
          address: order.address,
          delivery_instructions: order.deliveryInstructions ?? null,
          subtotal: order.subtotal,
          delivery_fee: order.deliveryFee,
          discount_amount: order.discountAmount,
          total: order.total,
          payment_method: order.paymentMethod,
          status: order.status,
        })
        .select()
        .single();

      if (orderError) {
        if (isSchemaError(orderError)) throw orderError;
        return null;
      }

      if (items.length > 0) {
        const { error: itemsError } = await supabase.from('order_items').insert(
          items.map((item) => ({
            order_id: orderData.id,
            product_id: item.productId ?? null,
            product_name: item.productName,
            product_image: item.productImage,
            price: item.price,
            discount_price: item.discountPrice ?? null,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
          }))
        );
        if (itemsError && isSchemaError(itemsError)) throw itemsError;
      }

      return mapOrder(orderData);
    } catch (err: any) {
      console.error('orderService.createOrder:', err.message);
      throw err;
    }
  },

  async getUserOrders(userId: string): Promise<DbOrder[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) {
        if (isSchemaError(error)) throw error;
        return [];
      }
      return (data ?? []).map(mapOrder);
    } catch (err: any) {
      console.error('orderService.getUserOrders:', err.message);
      return [];
    }
  },

  async getAllOrders(): Promise<DbOrder[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      if (error) {
        if (isSchemaError(error)) throw error;
        return [];
      }
      return (data ?? []).map(mapOrder);
    } catch (err: any) {
      console.error('orderService.getAllOrders:', err.message);
      return [];
    }
  },

  async updateStatus(orderId: string, status: string): Promise<boolean> {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      if (error) {
        if (isSchemaError(error)) throw error;
        return false;
      }
      return true;
    } catch (err: any) {
      console.error('orderService.updateStatus:', err.message);
      return false;
    }
  },
};

// ─── PROFILE ──────────────────────────────────────────────────────────────────

export const profileService = {
  async getProfile(userId: string): Promise<DbUserProfile | null> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, phone, avatar_url, role')
        .eq('id', userId)
        .maybeSingle();
      if (error) {
        if (isSchemaError(error)) throw error;
        return null;
      }
      if (!data) return null;
      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name ?? '',
        phone: data.phone ?? undefined,
        avatarUrl: data.avatar_url ?? undefined,
        role: data.role ?? 'customer',
      };
    } catch (err: any) {
      console.error('profileService.getProfile:', err.message);
      return null;
    }
  },

  async updateProfile(userId: string, updates: { fullName?: string; phone?: string }): Promise<boolean> {
    const supabase = createClient();
    try {
      const dbUpdates: any = {};
      if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      const { error } = await supabase
        .from('user_profiles')
        .update(dbUpdates)
        .eq('id', userId);
      if (error) {
        if (isSchemaError(error)) throw error;
        return false;
      }
      return true;
    } catch (err: any) {
      console.error('profileService.updateProfile:', err.message);
      throw err;
    }
  },
};

// ─── DELIVERY ADDRESSES ───────────────────────────────────────────────────────

function mapAddress(row: any): DbDeliveryAddress {
  return {
    id: row.id,
    userId: row.user_id,
    label: row.label ?? 'Home',
    recipientName: row.recipient_name ?? '',
    phone: row.phone ?? '',
    address: row.address ?? '',
    county: row.county ?? '',
    deliveryInstructions: row.delivery_instructions ?? undefined,
    isDefault: row.is_default ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const addressService = {
  async getAddresses(userId: string): Promise<DbDeliveryAddress[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('delivery_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) {
        if (isSchemaError(error)) throw error;
        return [];
      }
      return (data ?? []).map(mapAddress);
    } catch (err: any) {
      console.error('addressService.getAddresses:', err.message);
      return [];
    }
  },

  async addAddress(
    userId: string,
    addr: Omit<DbDeliveryAddress, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<DbDeliveryAddress | null> {
    const supabase = createClient();
    try {
      if (addr.isDefault) {
        await supabase
          .from('delivery_addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }
      const { data, error } = await supabase
        .from('delivery_addresses')
        .insert({
          user_id: userId,
          label: addr.label,
          recipient_name: addr.recipientName,
          phone: addr.phone,
          address: addr.address,
          county: addr.county,
          delivery_instructions: addr.deliveryInstructions ?? null,
          is_default: addr.isDefault,
        })
        .select()
        .single();
      if (error) {
        if (isSchemaError(error)) throw error;
        return null;
      }
      return data ? mapAddress(data) : null;
    } catch (err: any) {
      console.error('addressService.addAddress:', err.message);
      throw err;
    }
  },

  async updateAddress(
    addressId: string,
    addr: Omit<DbDeliveryAddress, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<boolean> {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('delivery_addresses')
        .update({
          label: addr.label,
          recipient_name: addr.recipientName,
          phone: addr.phone,
          address: addr.address,
          county: addr.county,
          delivery_instructions: addr.deliveryInstructions ?? null,
          is_default: addr.isDefault,
        })
        .eq('id', addressId);
      if (error) {
        if (isSchemaError(error)) throw error;
        return false;
      }
      return true;
    } catch (err: any) {
      console.error('addressService.updateAddress:', err.message);
      throw err;
    }
  },

  async deleteAddress(addressId: string): Promise<boolean> {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('delivery_addresses')
        .delete()
        .eq('id', addressId);
      if (error) {
        if (isSchemaError(error)) throw error;
        return false;
      }
      return true;
    } catch (err: any) {
      console.error('addressService.deleteAddress:', err.message);
      return false;
    }
  },

  async setDefault(userId: string, addressId: string): Promise<boolean> {
    const supabase = createClient();
    try {
      await supabase
        .from('delivery_addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
      const { error } = await supabase
        .from('delivery_addresses')
        .update({ is_default: true })
        .eq('id', addressId);
      if (error) {
        if (isSchemaError(error)) throw error;
        return false;
      }
      return true;
    } catch (err: any) {
      console.error('addressService.setDefault:', err.message);
      return false;
    }
  },
};

// ─── REVIEWS ──────────────────────────────────────────────────────────────────

export interface DbReview {
  id: string;
  productId: string;
  userId: string;
  orderId?: string;
  rating: number;
  reviewText: string;
  reviewerName: string;
  createdAt: string;
}

function mapReview(row: any): DbReview {
  return {
    id: row.id,
    productId: row.product_id,
    userId: row.user_id,
    orderId: row.order_id ?? undefined,
    rating: row.rating,
    reviewText: row.review_text,
    reviewerName: row.reviewer_name,
    createdAt: row.created_at,
  };
}

export const reviewService = {
  async getByProduct(productId: string): Promise<DbReview[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      if (error) {
        if (isSchemaError(error)) throw error;
        return [];
      }
      return (data ?? []).map(mapReview);
    } catch (err: any) {
      console.error('reviewService.getByProduct:', err.message);
      return [];
    }
  },

  async getUserReviewForProduct(userId: string, productId: string): Promise<DbReview | null> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .maybeSingle();
      if (error) {
        if (isSchemaError(error)) throw error;
        return null;
      }
      return data ? mapReview(data) : null;
    } catch (err: any) {
      console.error('reviewService.getUserReviewForProduct:', err.message);
      return null;
    }
  },

  async getUserOrdersForProduct(userId: string, productId: string): Promise<{ id: string; orderNumber: string }[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('order_id, orders!inner(id, order_number, user_id)')
        .eq('product_id', productId)
        .eq('orders.user_id', userId);
      if (error) {
        if (isSchemaError(error)) throw error;
        return [];
      }
      const seen = new Set<string>();
      const result: { id: string; orderNumber: string }[] = [];
      for (const row of data ?? []) {
        const o = (row as any).orders;
        if (o && !seen.has(o.id)) {
          seen.add(o.id);
          result.push({ id: o.id, orderNumber: o.order_number });
        }
      }
      return result;
    } catch (err: any) {
      console.error('reviewService.getUserOrdersForProduct:', err.message);
      return [];
    }
  },

  async submit(review: {
    productId: string;
    userId: string;
    orderId?: string;
    rating: number;
    reviewText: string;
    reviewerName: string;
  }): Promise<DbReview | null> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: review.productId,
          user_id: review.userId,
          order_id: review.orderId ?? null,
          rating: review.rating,
          review_text: review.reviewText,
          reviewer_name: review.reviewerName,
        })
        .select()
        .single();
      if (error) {
        if (isSchemaError(error)) throw error;
        return null;
      }
      return data ? mapReview(data) : null;
    } catch (err: any) {
      console.error('reviewService.submit:', err.message);
      throw err;
    }
  },
};
