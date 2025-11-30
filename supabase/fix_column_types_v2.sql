-- Comprehensive fix for column types and policies
-- This script:
-- 1. Drops conflicting policies
-- 2. Converts columns to UUID
-- 3. Re-adds foreign keys
-- 4. Re-creates policies with correct types

-- 1. DROP ALL POLICIES ON ORDERS DYNAMICALLY
-- This ensures we don't miss any policies that depend on the columns
-- 1. DROP ALL POLICIES ON ORDERS AND DEPENDENT TABLES DYNAMICALLY
DO $$
DECLARE
    pol record;
BEGIN
    -- Drop policies on orders
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'orders' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.orders', pol.policyname);
    END LOOP;

    -- Drop policies on order_items (which depend on orders)
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'order_items' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.order_items', pol.policyname);
    END LOOP;
END $$;

-- 2. ALTER COLUMNS TO UUID
ALTER TABLE public.orders
  ALTER COLUMN business_id TYPE uuid USING business_id::uuid,
  ALTER COLUMN driver_id TYPE uuid USING driver_id::uuid,
  ALTER COLUMN client_id TYPE uuid USING client_id::uuid;

-- 3. RE-ADD FOREIGN KEYS
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_business_id_fkey;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_business_id_fkey
  FOREIGN KEY (business_id)
  REFERENCES public.businesses(id);

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_driver_id_fkey;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_driver_id_fkey
  FOREIGN KEY (driver_id)
  REFERENCES public.drivers(id);

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_client_id_fkey;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_client_id_fkey
  FOREIGN KEY (client_id)
  REFERENCES auth.users(id);

-- 4. RE-CREATE POLICIES
-- Now we can use direct UUID comparisons without casting!

-- Policy: Users can view their own orders (Clients, Businesses, Drivers)
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = client_id OR
    EXISTS ( SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid() ) OR
    EXISTS ( SELECT 1 FROM public.drivers WHERE id = driver_id AND id = auth.uid() ) OR
    (
      -- Allow drivers to see unassigned ready orders
      status = 'ready' AND 
      driver_id IS NULL AND 
      EXISTS ( SELECT 1 FROM public.drivers WHERE id = auth.uid() )
    )
  );

-- Policy: Users can create orders (Clients)
CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK ( auth.uid() = client_id );

-- Policy: Businesses can update their own orders
CREATE POLICY "Businesses can update own orders"
  ON public.orders FOR UPDATE
  USING ( EXISTS ( SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid() ) );

-- Policy: Drivers can update their own orders (e.g. status)
CREATE POLICY "Drivers can update own orders"
  ON public.orders FOR UPDATE
  USING ( 
    EXISTS ( SELECT 1 FROM public.drivers WHERE id = driver_id AND id = auth.uid() ) OR
    (
       -- Allow drivers to claim unassigned ready orders
       status = 'ready' AND driver_id IS NULL AND EXISTS ( SELECT 1 FROM public.drivers WHERE id = auth.uid() )
    )
  );

-- Policy: Users can see order items (dependent on orders)
CREATE POLICY "Users can see order items"
  ON public.order_items FOR SELECT
  USING ( 
    EXISTS ( 
      SELECT 1 FROM public.orders 
      WHERE id = order_id AND (
        client_id = auth.uid() OR 
        EXISTS ( SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid() ) OR
        EXISTS ( SELECT 1 FROM public.drivers WHERE id = driver_id AND id = auth.uid() )
      )
    )
  );

-- Policy: Users can insert order items (Clients)
CREATE POLICY "Users can insert order items"
  ON public.order_items FOR INSERT
  WITH CHECK ( 
    EXISTS ( 
      SELECT 1 FROM public.orders 
      WHERE id = order_id AND client_id = auth.uid() 
    )
  );

-- Reload schema cache
NOTIFY pgrst, 'reload config';
