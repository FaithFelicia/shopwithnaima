-- ============================================================
-- SHOP WITH NAIMA — Full Database Schema
-- ============================================================

-- 1. TYPES
DROP TYPE IF EXISTS public.product_category CASCADE;
CREATE TYPE public.product_category AS ENUM ('shoes', 'clothing', 'bags', 'accessories');

DROP TYPE IF EXISTS public.order_status CASCADE;
CREATE TYPE public.order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

DROP TYPE IF EXISTS public.payment_method CASCADE;
CREATE TYPE public.payment_method AS ENUM ('mpesa', 'card', 'cash');

DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM ('admin', 'customer');

-- 2. CORE TABLES

-- user_profiles (intermediary for auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  avatar_url TEXT,
  role public.user_role DEFAULT 'customer'::public.user_role,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category public.product_category NOT NULL,
  subcategory TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL,
  discount_price INTEGER,
  images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  sizes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  colors JSONB NOT NULL DEFAULT '[]'::JSONB,
  stock INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT false,
  is_new BOOLEAN NOT NULL DEFAULT false,
  is_best_seller BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC(3,1) NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  brand TEXT NOT NULL DEFAULT 'NAIMA',
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  county TEXT NOT NULL,
  address TEXT NOT NULL,
  delivery_instructions TEXT,
  subtotal INTEGER NOT NULL DEFAULT 0,
  delivery_fee INTEGER NOT NULL DEFAULT 0,
  discount_amount INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  payment_method public.payment_method NOT NULL DEFAULT 'mpesa'::public.payment_method,
  status public.order_status NOT NULL DEFAULT 'pending'::public.order_status,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- order_items
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL,
  discount_price INTEGER,
  size TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- cart_items
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_image TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL,
  discount_price INTEGER,
  size TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 1,
  category TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- wishlist_items
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_image TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL,
  discount_price INTEGER,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_products_is_new ON public.products(is_new);
CREATE INDEX IF NOT EXISTS idx_products_is_best_seller ON public.products(is_best_seller);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON public.wishlist_items(user_id);

-- Unique: one wishlist entry per user+product
CREATE UNIQUE INDEX IF NOT EXISTS idx_wishlist_unique ON public.wishlist_items(user_id, product_id);

-- 4. FUNCTIONS (must be before RLS policies)

-- Auto-create user_profiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')::public.user_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Admin check function (uses auth.users metadata to avoid recursion)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
  SELECT 1 FROM auth.users au
  WHERE au.id = auth.uid()
  AND (
    au.raw_user_meta_data->>'role' = 'admin'
    OR au.raw_app_meta_data->>'role' = 'admin'
  )
)
$$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- 5. ENABLE RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES

-- user_profiles
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles FOR ALL TO authenticated
USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "admin_full_access_user_profiles" ON public.user_profiles;
CREATE POLICY "admin_full_access_user_profiles"
ON public.user_profiles FOR ALL TO authenticated
USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

-- products: public read, admin write
DROP POLICY IF EXISTS "public_read_products" ON public.products;
CREATE POLICY "public_read_products"
ON public.products FOR SELECT TO public
USING (true);

DROP POLICY IF EXISTS "admin_manage_products" ON public.products;
CREATE POLICY "admin_manage_products"
ON public.products FOR ALL TO authenticated
USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

-- orders: users see own orders, admin sees all
DROP POLICY IF EXISTS "users_view_own_orders" ON public.orders;
CREATE POLICY "users_view_own_orders"
ON public.orders FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS "users_create_own_orders" ON public.orders;
CREATE POLICY "users_create_own_orders"
ON public.orders FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS "admin_update_orders" ON public.orders;
CREATE POLICY "admin_update_orders"
ON public.orders FOR UPDATE TO authenticated
USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS "anon_create_orders" ON public.orders;
CREATE POLICY "anon_create_orders"
ON public.orders FOR INSERT TO anon
WITH CHECK (true);

-- order_items: follow order access
DROP POLICY IF EXISTS "users_view_own_order_items" ON public.order_items;
CREATE POLICY "users_view_own_order_items"
ON public.order_items FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin_user())
  )
);

DROP POLICY IF EXISTS "users_create_order_items" ON public.order_items;
CREATE POLICY "users_create_order_items"
ON public.order_items FOR INSERT TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "anon_create_order_items" ON public.order_items;
CREATE POLICY "anon_create_order_items"
ON public.order_items FOR INSERT TO anon
WITH CHECK (true);

-- cart_items
DROP POLICY IF EXISTS "users_manage_own_cart" ON public.cart_items;
CREATE POLICY "users_manage_own_cart"
ON public.cart_items FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- wishlist_items
DROP POLICY IF EXISTS "users_manage_own_wishlist" ON public.wishlist_items;
CREATE POLICY "users_manage_own_wishlist"
ON public.wishlist_items FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 7. TRIGGERS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS set_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER set_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 8. SEED PRODUCTS
DO $$
BEGIN
  INSERT INTO public.products (id, name, category, subcategory, price, discount_price, images, sizes, colors, stock, featured, is_new, is_best_seller, rating, review_count, description, brand, tags)
  VALUES
    (gen_random_uuid(), 'Mini Shoulder Bag', 'bags'::public.product_category, 'shoulder bags', 9500, 7600, ARRAY['/assets/images/2450-1789558835761.jpeg','/assets/images/2600-1789558835861.jpeg'], ARRAY['One Size'], '[{"name":"Black","hex":"#0A0A0A"},{"name":"Tan","hex":"#C4A882"},{"name":"White","hex":"#FAFAF8"}]'::JSONB, 20, true, true, true, 4.9, 234, 'Compact leather shoulder bag with gold-tone hardware and adjustable strap. The perfect everyday companion.', 'NAIMA', ARRAY['shoulder bag','leather','mini']),
    (gen_random_uuid(), 'Structured Tote', 'bags'::public.product_category, 'handbags', 1000, NULL, ARRAY['/assets/images/2300-1789558835759.jpeg','/assets/images/1000-1789558746670.jpeg'], ARRAY['One Size'], '[{"name":"Camel","hex":"#C9975C"},{"name":"Black","hex":"#0A0A0A"}]'::JSONB, 12, true, false, false, 4.7, 88, 'Structured leather tote with suede interior. Spacious enough for work, stylish enough for weekends.', 'NAIMA', ARRAY['tote','leather','work']),
    (gen_random_uuid(), 'Crossbody Chain Bag', 'bags'::public.product_category, 'crossbody', 6800, NULL, ARRAY['/assets/images/3000-1789558835841.jpeg','/assets/images/2450-1789558835761.jpeg'], ARRAY['One Size'], '[{"name":"Black","hex":"#0A0A0A"},{"name":"Silver","hex":"#C0C0C0"}]'::JSONB, 35, false, true, true, 4.6, 156, 'Quilted crossbody with chain strap and magnetic closure. Compact yet holds all your essentials.', 'NAIMA', ARRAY['crossbody','chain','evening']),
    (gen_random_uuid(), 'Classic Handbag', 'bags'::public.product_category, 'handbags', 2400, NULL, ARRAY['/assets/images/2550-1789559077716.jpeg'], ARRAY['One Size'], '[{"name":"Black","hex":"#0A0A0A"}]'::JSONB, 25, true, true, false, 4.7, 12, 'Stylish everyday handbag with clean lines and durable finish. A must-have for any wardrobe.', 'NAIMA', ARRAY['handbag','everyday','classic']),
    (gen_random_uuid(), 'Chic Shoulder Bag', 'bags'::public.product_category, 'shoulder bags', 2200, NULL, ARRAY['/assets/images/2200-1789559219120.jpeg'], ARRAY['One Size'], '[{"name":"Brown","hex":"#8B6347"}]'::JSONB, 20, false, true, false, 4.6, 8, 'Elegant shoulder bag with adjustable strap and spacious interior. Perfect for day-to-night styling.', 'NAIMA', ARRAY['shoulder bag','chic','everyday']),
    (gen_random_uuid(), 'Compact Tote Bag', 'bags'::public.product_category, 'handbags', 2100, NULL, ARRAY['/assets/images/2100-1789559233986.jpeg'], ARRAY['One Size'], '[{"name":"Beige","hex":"#D4C5A9"}]'::JSONB, 30, false, true, false, 4.5, 6, 'Compact tote with structured base and clean silhouette. Versatile enough for work or weekend.', 'NAIMA', ARRAY['tote','compact','versatile']),
    (gen_random_uuid(), 'Premium Bucket Bag', 'bags'::public.product_category, 'shoulder bags', 2550, NULL, ARRAY['/assets/images/2550-1789559247451.jpeg'], ARRAY['One Size'], '[{"name":"Tan","hex":"#C4A882"}]'::JSONB, 18, true, true, false, 4.8, 10, 'Drawstring bucket bag with premium finish and gold-tone hardware. Effortlessly stylish.', 'NAIMA', ARRAY['bucket bag','premium','drawstring']),
    (gen_random_uuid(), 'Mini Crossbody Bag', 'bags'::public.product_category, 'crossbody', 2000, NULL, ARRAY['/assets/images/2001-1789559258994.jpeg'], ARRAY['One Size'], '[{"name":"Black","hex":"#0A0A0A"}]'::JSONB, 22, false, true, false, 4.5, 5, 'Sleek mini crossbody bag with secure zip closure and detachable strap. Ideal for essentials on the go.', 'NAIMA', ARRAY['crossbody','mini','compact']),
    (gen_random_uuid(), 'Naima Signature Bag', 'bags'::public.product_category, 'handbags', 2500, NULL, ARRAY['/assets/images/2500-1789559822027.jpeg'], ARRAY['One Size'], '[{"name":"Black","hex":"#0A0A0A"}]'::JSONB, 20, true, true, false, 4.8, 4, 'The Naima Signature Bag — a statement piece with clean lines and premium finish. Elevate your everyday look.', 'NAIMA', ARRAY['handbag','signature','premium']),
    (gen_random_uuid(), 'Luxury Statement Bag', 'bags'::public.product_category, 'handbags', 3500, NULL, ARRAY['/assets/images/3500-1789559846475.jpeg'], ARRAY['One Size'], '[{"name":"Brown","hex":"#8B6347"}]'::JSONB, 15, true, true, true, 4.9, 3, 'Our most luxurious bag yet. Crafted with premium materials and exquisite detailing for the fashion-forward woman.', 'NAIMA', ARRAY['handbag','luxury','statement']),
    (gen_random_uuid(), 'Everyday Tote', 'bags'::public.product_category, 'handbags', 2000, NULL, ARRAY['/assets/images/2000-1789559859081.jpeg'], ARRAY['One Size'], '[{"name":"Beige","hex":"#D4C5A9"}]'::JSONB, 25, false, true, false, 4.6, 2, 'A versatile everyday tote with spacious interior and durable construction. Your perfect daily companion.', 'NAIMA', ARRAY['tote','everyday','versatile'])
  ON CONFLICT (id) DO NOTHING;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Product seed skipped: %', SQLERRM;
END $$;
