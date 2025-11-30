-- CONSOLIDATED DEBUG SETUP
-- Run this entire script to ensure the debug table exists and the trigger is active

-- 1. Create the logs table (Force recreation to be sure)
DROP TABLE IF EXISTS public.trigger_logs;
CREATE TABLE public.trigger_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event text,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Grant permissions (just in case)
GRANT ALL ON public.trigger_logs TO postgres;
GRANT ALL ON public.trigger_logs TO service_role;
GRANT ALL ON public.trigger_logs TO authenticated;
GRANT ALL ON public.trigger_logs TO anon;

-- 3. Insert a test log to verify table works
INSERT INTO public.trigger_logs (event, details) 
VALUES ('Setup Complete', '{"status": "ready"}'::jsonb);

-- 4. Re-apply the logging trigger function
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
       INSERT INTO public.trigger_logs (event, details) VALUES ('Processing UPDATE', jsonb_build_object('new_status', NEW.status));
       
       -- Order confirmed
       IF NEW.status = 'confirmed' THEN
          PERFORM public.create_notification(v_client_id, 'order_confirmed', 'Pedido Confirmado', 'Tu pedido ha sido confirmado', NEW.id, '{}'::jsonb);
       END IF;
       
       -- Order ready
       IF NEW.status = 'ready' AND v_driver_user_id IS NOT NULL THEN
          PERFORM public.create_notification(v_driver_user_id, 'order_ready', 'Pedido Listo', 'Pedido listo para recoger', NEW.id, '{}'::jsonb);
       END IF;

       -- Driver assigned
       IF NEW.status = 'assigned' AND OLD.driver_id IS NULL AND NEW.driver_id IS NOT NULL THEN
          PERFORM public.create_notification(v_client_id, 'driver_assigned', 'Repartidor Asignado', 'Un repartidor ha sido asignado', NEW.id, '{}'::jsonb);
          IF v_business_owner_id IS NOT NULL THEN
            PERFORM public.create_notification(v_business_owner_id, 'driver_assigned', 'Repartidor Asignado', 'Repartidor asignado al pedido', NEW.id, '{}'::jsonb);
          END IF;
       END IF;

       -- Order picking up
       IF NEW.status = 'picking_up' AND v_business_owner_id IS NOT NULL THEN
          PERFORM public.create_notification(v_business_owner_id, 'order_picking_up', 'Repartidor en Camino', 'Repartidor recogiendo pedido', NEW.id, '{}'::jsonb);
       END IF;

       -- Order in transit
       IF NEW.status = 'in_transit' THEN
          PERFORM public.create_notification(v_client_id, 'order_in_transit', 'Pedido en Camino', 'Tu pedido está en camino', NEW.id, '{}'::jsonb);
       END IF;

       -- Order delivered
       IF NEW.status = 'delivered' THEN
          PERFORM public.create_notification(v_client_id, 'order_delivered', 'Pedido Entregado', 'Pedido entregado', NEW.id, '{}'::jsonb);
          IF v_business_owner_id IS NOT NULL THEN
             PERFORM public.create_notification(v_business_owner_id, 'order_delivered', 'Pedido Entregado', 'Pedido entregado', NEW.id, '{}'::jsonb);
          END IF;
       END IF;

       -- Order cancelled
       IF NEW.status = 'cancelled' THEN
          PERFORM public.create_notification(v_client_id, 'order_cancelled', 'Pedido Cancelado', 'Pedido cancelado', NEW.id, '{}'::jsonb);
          IF v_business_owner_id IS NOT NULL THEN
             PERFORM public.create_notification(v_business_owner_id, 'order_cancelled', 'Pedido Cancelado', 'Pedido cancelado', NEW.id, '{}'::jsonb);
          END IF;
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

-- 5. Recreate the trigger
DROP TRIGGER IF EXISTS on_order_status_change ON public.orders;
CREATE TRIGGER on_order_status_change
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_status_change();

-- 6. Verify everything
SELECT * FROM public.trigger_logs;
