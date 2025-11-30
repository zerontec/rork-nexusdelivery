-- TEMPORARY FIX: Disable notification trigger to allow orders to be placed
-- Run this IMMEDIATELY to fix the order creation error

-- Drop the problematic trigger
DROP TRIGGER IF EXISTS on_order_status_change ON public.orders;

-- You can now create orders normally
-- We'll re-enable notifications later after verifying the fix
