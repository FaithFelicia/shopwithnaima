-- ============================================================
-- PRODUCT REVIEWS
-- ============================================================

-- product_reviews table
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL DEFAULT '',
  reviewer_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON public.product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_order_id ON public.product_reviews(order_id);

-- One review per user per product per order
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_reviews_unique_user_product_order
  ON public.product_reviews(user_id, product_id, order_id);

-- Enable RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can read reviews
DROP POLICY IF EXISTS "public_read_product_reviews" ON public.product_reviews;
CREATE POLICY "public_read_product_reviews"
ON public.product_reviews FOR SELECT TO public
USING (true);

-- Authenticated users can insert their own reviews
DROP POLICY IF EXISTS "users_insert_own_product_reviews" ON public.product_reviews;
CREATE POLICY "users_insert_own_product_reviews"
ON public.product_reviews FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own reviews
DROP POLICY IF EXISTS "users_update_own_product_reviews" ON public.product_reviews;
CREATE POLICY "users_update_own_product_reviews"
ON public.product_reviews FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can delete their own reviews
DROP POLICY IF EXISTS "users_delete_own_product_reviews" ON public.product_reviews;
CREATE POLICY "users_delete_own_product_reviews"
ON public.product_reviews FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- Admin full access
DROP POLICY IF EXISTS "admin_full_access_product_reviews" ON public.product_reviews;
CREATE POLICY "admin_full_access_product_reviews"
ON public.product_reviews FOR ALL TO authenticated
USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

-- updated_at trigger
DROP TRIGGER IF EXISTS set_product_reviews_updated_at ON public.product_reviews;
CREATE TRIGGER set_product_reviews_updated_at
BEFORE UPDATE ON public.product_reviews
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
