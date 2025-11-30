-- Fix column types in orders table to match referenced tables (UUID)
-- This resolves the "operator does not exist: uuid = text" and foreign key errors

-- 1. Convert business_id to UUID
-- We use USING to cast existing text values to uuid
ALTER TABLE public.orders
  ALTER COLUMN business_id TYPE uuid USING business_id::uuid;

-- 2. Convert driver_id to UUID
ALTER TABLE public.orders
  ALTER COLUMN driver_id TYPE uuid USING driver_id::uuid;

-- 3. Convert client_id to UUID
ALTER TABLE public.orders
  ALTER COLUMN client_id TYPE uuid USING client_id::uuid;

-- 4. Re-add the foreign key constraints now that types match

-- Business Foreign Key
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_business_id_fkey;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_business_id_fkey
  FOREIGN KEY (business_id)
  REFERENCES public.businesses(id);

-- Driver Foreign Key
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_driver_id_fkey;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_driver_id_fkey
  FOREIGN KEY (driver_id)
  REFERENCES public.drivers(id);

-- Client Foreign Key (referencing auth.users)
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_client_id_fkey;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_client_id_fkey
  FOREIGN KEY (client_id)
  REFERENCES auth.users(id);

-- 5. Reload schema cache
NOTIFY pgrst, 'reload config';
