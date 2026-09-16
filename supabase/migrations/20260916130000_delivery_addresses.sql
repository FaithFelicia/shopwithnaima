-- Delivery addresses table for user saved addresses
CREATE TABLE IF NOT EXISTS public.delivery_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Home',
  recipient_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  county TEXT NOT NULL DEFAULT '',
  delivery_instructions TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_delivery_addresses_user_id ON public.delivery_addresses(user_id);

ALTER TABLE public.delivery_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_delivery_addresses" ON public.delivery_addresses;
CREATE POLICY "users_manage_own_delivery_addresses"
ON public.delivery_addresses
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
