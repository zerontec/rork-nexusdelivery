-- Fix relationship between orders and profiles for PostgREST
-- This allows queries like: supabase.from('orders').select('*, user:profiles(*)')

-- 1. Drop existing constraint to auth.users if we want to replace it, 
-- OR just add a new one if we want to support both (but PostgREST prefers one clear path).
-- Usually, referencing public.profiles is better for the API.

-- Let's add a specific constraint for profiles
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_client_id_fkey; -- Drop old ref to auth.users if it was named this (default naming might vary)

-- Attempt to add the constraint to public.profiles
-- We use ON DELETE SET NULL or CASCADE depending on requirements. 
-- Here we'll just add the FK.
ALTER TABLE public.orders
ADD CONSTRAINT orders_client_id_profiles_fkey
FOREIGN KEY (client_id)
REFERENCES public.profiles(id);

-- Reload schema cache
NOTIFY pgrst, 'reload config';
