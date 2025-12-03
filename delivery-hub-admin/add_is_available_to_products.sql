-- Add is_available column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- Update existing products to be available by default
UPDATE public.products 
SET is_available = true 
WHERE is_available IS NULL;
