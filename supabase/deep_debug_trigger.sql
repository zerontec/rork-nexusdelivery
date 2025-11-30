-- DEEP DEBUGGING: Trigger Logging
-- This will create a log table to trace exactly what happens inside the trigger

-- 1. Create a logs table
CREATE TABLE IF NOT EXISTS public.trigger_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event text,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Update the trigger function with logging
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_client_id uuid;
  v_business_owner_id uuid;
  v_driver_user_id uuid;
  v_business_name text;
  v_order_number text;
BEGIN
  -- Log start
  INSERT INTO public.trigger_logs (event, details)
  VALUES ('Trigger Start', jsonb_build_object(
    'op', TG_OP, 
    'order_id', NEW.id, 
    'business_id', NEW.business_id,
    'status', NEW.status
  ));

  -- Safely get related information
  BEGIN
    v_client_id := NEW.client_id;
    v_order_number := substring(NEW.id::text, 1, 8);
    
    -- Get business owner and name
    SELECT owner_id, name INTO v_business_owner_id, v_business_name
    FROM public.businesses
    WHERE id = NEW.business_id;
    
    -- Log business lookup result
    INSERT INTO public.trigger_logs (event, details)
    VALUES ('Business Lookup', jsonb_build_object(
      'found_owner_id', v_business_owner_id,
      'found_name', v_business_name
    ));
    
    -- Get driver user_id if assigned
    IF NEW.driver_id IS NOT NULL THEN
      SELECT user_id INTO v_driver_user_id
      FROM public.drivers
      WHERE id = NEW.driver_id;
    END IF;
    
  EXCEPTION
    WHEN OTHERS THEN
      INSERT INTO public.trigger_logs (event, details)
      VALUES ('Error in Setup', jsonb_build_object('error', SQLERRM));
      RETURN NEW;
  END;

  -- Handle different status changes
  BEGIN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO public.trigger_logs (event, details) VALUES ('Processing INSERT', jsonb_build_object('owner_id', v_business_owner_id));
      
      -- New order created - notify business owner
      IF v_business_owner_id IS NOT NULL THEN
        PERFORM public.create_notification(
          v_business_owner_id,
          'new_order',
          'Nuevo Pedido',
          'Nuevo pedido recibido #' || v_order_number,
          NEW.id,
          jsonb_build_object('order_id', NEW.id::text, 'total', NEW.total)
        );
        INSERT INTO public.trigger_logs (event, details) VALUES ('Notification Created', jsonb_build_object('type', 'new_order'));
      ELSE
        INSERT INTO public.trigger_logs (event, details) VALUES ('Skipped Notification', jsonb_build_object('reason', 'owner_id is null'));
      END IF;
      
    ELSIF TG_OP = 'UPDATE' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
      -- ... (rest of logic kept same but omitted for brevity in debug script if not needed, but keeping it safe)
       INSERT INTO public.trigger_logs (event, details) VALUES ('Processing UPDATE', jsonb_build_object('new_status', NEW.status));
       -- (Simplified for debug focus on INSERT, but keeping structure)
       
       IF NEW.status = 'confirmed' THEN
          PERFORM public.create_notification(v_client_id, 'order_confirmed', 'Pedido Confirmado', 'Tu pedido ha sido confirmado', NEW.id, '{}'::jsonb);
       END IF;
       
    END IF;
    
  EXCEPTION
    WHEN OTHERS THEN
      INSERT INTO public.trigger_logs (event, details)
      VALUES ('Error in Logic', jsonb_build_object('error', SQLERRM));
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
