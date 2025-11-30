-- Re-create the foreign key relationship between orders and businesses explicitly
-- This ensures PostgREST can detect it

-- 1. Drop existing constraint if it exists (to be safe)
alter table public.orders drop constraint if exists orders_business_id_fkey;

-- 2. Add the constraint explicitly
alter table public.orders
  add constraint orders_business_id_fkey
  foreign key (business_id)
  references public.businesses(id);

-- 3. Reload the schema cache to ensure PostgREST picks up the change
notify pgrst, 'reload config';
