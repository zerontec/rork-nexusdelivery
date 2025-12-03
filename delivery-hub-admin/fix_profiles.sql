-- 1. Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS email text;

-- 2. Backfill data from auth.users
UPDATE public.profiles p
SET 
  full_name = (u.raw_user_meta_data->>'full_name')::text,
  email = u.email
FROM auth.users u
WHERE p.id = u.id;

-- 3. Create a trigger to keep them in sync for new users (Optional but recommended)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, email)
  VALUES (
    new.id,
    'client', -- Default role
    (new.raw_user_meta_data->>'full_name')::text,
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: You might already have a trigger, check before running step 3!
