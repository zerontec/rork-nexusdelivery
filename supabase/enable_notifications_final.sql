-- FIXED NOTIFICATION TRIGGER - Final Version
-- This version handles all UUID comparisons correctly and includes error handling

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_order_status_change ON public.orders;
DROP FUNCTION IF EXISTS public.notify_order_status_change();

-- Create the corrected trigger function
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_client_id uuid;
  v_business_owner_id uuid;
  v_driver_user_id uuid;
  v_business_name text;
  v_order_number text;
BEGIN
  -- Safely get related information with error handling
  BEGIN
    v_client_id := NEW.client_id;
    v_order_number := substring(NEW.id::text, 1, 8);
    
    -- Get business owner and name
    SELECT owner_id, name INTO v_business_owner_id, v_business_name
    FROM public.businesses
    WHERE id = NEW.business_id;
    
    -- Get driver user_id if assigned
    IF NEW.driver_id IS NOT NULL THEN
      SELECT user_id INTO v_driver_user_id
      FROM public.drivers
      WHERE id = NEW.driver_id;
    END IF;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't fail the transaction
      RAISE WARNING 'Error in notification trigger setup: %', SQLERRM;
      RETURN NEW;
  END;

  -- Handle different status changes
  BEGIN
    IF TG_OP = 'INSERT' THEN
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
      END IF;
      
    ELSIF TG_OP = 'UPDATE' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
      
      -- Order confirmed - notify client
      IF NEW.status = 'confirmed' THEN
        PERFORM public.create_notification(
          v_client_id,
          'order_confirmed',
          'Pedido Confirmado',
          'Tu pedido de ' || COALESCE(v_business_name, 'el negocio') || ' ha sido confirmado',
          NEW.id,
          jsonb_build_object('business_name', COALESCE(v_business_name, ''))
        );
      END IF;
      
      -- Order ready - notify driver if assigned
      IF NEW.status = 'ready' AND v_driver_user_id IS NOT NULL THEN
        PERFORM public.create_notification(
          v_driver_user_id,
          'order_ready',
          'Pedido Listo',
          'Pedido #' || v_order_number || ' listo para recoger',
          NEW.id,
          jsonb_build_object('business_name', COALESCE(v_business_name, ''))
        );
      END IF;
      
      -- Driver assigned - notify client and business
      IF NEW.status = 'assigned' AND (OLD.driver_id IS NULL) AND (NEW.driver_id IS NOT NULL) THEN
        -- Notify client
        PERFORM public.create_notification(
          v_client_id,
          'driver_assigned',
          'Repartidor Asignado',
          'Un repartidor ha sido asignado a tu pedido',
          NEW.id,
          jsonb_build_object('driver_id', NEW.driver_id::text)
        );
        
        -- Notify business owner
        IF v_business_owner_id IS NOT NULL THEN
          PERFORM public.create_notification(
            v_business_owner_id,
            'driver_assigned',
            'Repartidor Asignado',
            'Repartidor asignado al pedido #' || v_order_number,
            NEW.id,
            jsonb_build_object('driver_id', NEW.driver_id::text, 'order_number', v_order_number)
          );
        END IF;
      END IF;
      
      -- Order picking up - notify business
      IF NEW.status = 'picking_up' AND v_business_owner_id IS NOT NULL THEN
        PERFORM public.create_notification(
          v_business_owner_id,
          'order_picking_up',
          'Repartidor en Camino',
          'Repartidor recogiendo el pedido #' || v_order_number,
          NEW.id,
          jsonb_build_object('order_number', v_order_number)
        );
      END IF;
      
      -- Order in transit - notify client
      IF NEW.status = 'in_transit' THEN
        PERFORM public.create_notification(
          v_client_id,
          'order_in_transit',
          'Pedido en Camino',
          'Tu pedido está en camino',
          NEW.id,
          jsonb_build_object('business_name', COALESCE(v_business_name, ''))
        );
      END IF;
      
      -- Order delivered - notify client and business
      IF NEW.status = 'delivered' THEN
        -- Notify client
        PERFORM public.create_notification(
          v_client_id,
          'order_delivered',
          'Pedido Entregado',
          '¡Tu pedido ha sido entregado!',
          NEW.id,
          jsonb_build_object('business_name', COALESCE(v_business_name, ''))
        );
        
        -- Notify business owner
        IF v_business_owner_id IS NOT NULL THEN
          PERFORM public.create_notification(
            v_business_owner_id,
            'order_delivered',
            'Pedido Entregado',
            'Pedido #' || v_order_number || ' entregado exitosamente',
            NEW.id,
            jsonb_build_object('order_number', v_order_number)
          );
        END IF;
      END IF;
      
      -- Order cancelled - notify client and business
      IF NEW.status = 'cancelled' THEN
        -- Notify client
        PERFORM public.create_notification(
          v_client_id,
          'order_cancelled',
          'Pedido Cancelado',
          'Tu pedido ha sido cancelado',
          NEW.id,
          jsonb_build_object('business_name', COALESCE(v_business_name, ''))
        );
        
        -- Notify business owner
        IF v_business_owner_id IS NOT NULL THEN
          PERFORM public.create_notification(
            v_business_owner_id,
            'order_cancelled',
            'Pedido Cancelado',
            'Pedido #' || v_order_number || ' ha sido cancelado',
            NEW.id,
            jsonb_build_object('order_number', v_order_number)
          );
        END IF;
      END IF;
      
    END IF;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't fail the transaction
      RAISE WARNING 'Error creating notification: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_order_status_change
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_status_change();

-- Verify the trigger was created
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_order_status_change';
