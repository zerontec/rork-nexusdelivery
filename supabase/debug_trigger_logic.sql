-- DIAGNOSTIC: Check why trigger might be failing for orders
-- Run this to inspect the data of the most recent order and its business

DO $$
DECLARE
  v_last_order_id uuid;
  v_business_id uuid;
  v_business_owner_id uuid;
  v_business_name text;
BEGIN
  -- 1. Get the most recent order
  SELECT id, business_id INTO v_last_order_id, v_business_id
  FROM public.orders
  ORDER BY created_at DESC
  LIMIT 1;

  RAISE NOTICE 'Last Order ID: %', v_last_order_id;
  RAISE NOTICE 'Business ID from Order: %', v_business_id;

  IF v_business_id IS NOT NULL THEN
    -- 2. Check the business details
    SELECT owner_id, name INTO v_business_owner_id, v_business_name
    FROM public.businesses
    WHERE id = v_business_id;

    RAISE NOTICE 'Business Name: %', v_business_name;
    RAISE NOTICE 'Business Owner ID: %', v_business_owner_id;

    IF v_business_owner_id IS NULL THEN
      RAISE NOTICE 'WARNING: Business has no owner_id! Notification cannot be sent.';
    ELSE
      RAISE NOTICE 'SUCCESS: Data looks correct. Trigger should have fired.';
      
      -- 3. Try to manually trigger the notification logic for this order
      PERFORM public.create_notification(
        v_business_owner_id,
        'new_order',
        'Debug Notification',
        'Debug: Notification logic test for order ' || substring(v_last_order_id::text, 1, 8),
        v_last_order_id,
        jsonb_build_object('debug', true)
      );
      RAISE NOTICE 'Attempted to manually create notification for owner.';
    END IF;
  ELSE
    RAISE NOTICE 'ERROR: Last order has no business_id!';
  END IF;

END $$;

-- Check if the debug notification appeared
SELECT * FROM public.notifications ORDER BY created_at DESC LIMIT 3;
