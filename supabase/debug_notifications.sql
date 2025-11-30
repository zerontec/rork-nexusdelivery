-- DIAGNOSTIC: Verify notification system setup
-- Run this to check if everything is configured correctly

-- 1. Check if trigger exists
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_order_status_change';

-- 2. Check if function exists
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'notify_order_status_change'
  AND routine_schema = 'public';

-- 3. Check if create_notification function exists
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'create_notification'
  AND routine_schema = 'public';

-- 4. Check notifications table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'notifications'
ORDER BY ordinal_position;

-- 5. Try to manually create a test notification
-- Replace USER_ID_HERE with an actual user ID from auth.users
DO $$
DECLARE
  v_test_user_id uuid;
  v_test_order_id uuid;
BEGIN
  -- Get the first user ID
  SELECT id INTO v_test_user_id FROM auth.users LIMIT 1;
  
  -- Get the most recent order ID
  SELECT id INTO v_test_order_id FROM public.orders ORDER BY created_at DESC LIMIT 1;
  
  IF v_test_user_id IS NOT NULL THEN
    -- Try to create a test notification
    PERFORM public.create_notification(
      v_test_user_id,
      'new_order',
      'Test Notification',
      'This is a test notification',
      v_test_order_id,
      '{}'::jsonb
    );
    
    RAISE NOTICE 'Test notification created for user: %', v_test_user_id;
  ELSE
    RAISE NOTICE 'No users found in database';
  END IF;
END $$;

-- 6. Check if test notification was created
SELECT * FROM public.notifications ORDER BY created_at DESC LIMIT 5;
