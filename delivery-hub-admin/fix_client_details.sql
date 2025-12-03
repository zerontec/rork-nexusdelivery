-- 1. Add created_at column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS created_at timestamptz;

-- 2. Sync created_at and phone from auth.users
UPDATE public.profiles p
SET 
  created_at = u.created_at,
  phone = COALESCE(u.phone, (u.raw_user_meta_data->>'phone')::text, (u.raw_user_meta_data->>'phone_number')::text)
FROM auth.users u
WHERE p.id = u.id;

-- 3. Update the trigger to include these fields for future users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, email, phone, created_at)
  VALUES (
    new.id,
    'client',
    (new.raw_user_meta_data->>'full_name')::text,
    new.email,
    COALESCE(new.phone, (new.raw_user_meta_data->>'phone')::text, (new.raw_user_meta_data->>'phone_number')::text),
    new.created_at
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
