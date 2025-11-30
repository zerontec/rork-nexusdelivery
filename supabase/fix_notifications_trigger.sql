-- Fix for UUID comparison error in notification triggers
-- Run this to fix the "operator does not exist: uuid = text" error

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_order_status_change ON public.orders;
DROP FUNCTION IF EXISTS public.notify_order_status_change();

-- Recreate the function with proper type handling
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_client_id uuid;
  v_business_owner_id uuid;
  v_driver_user_id uuid;
  v_business_name text;
  v_order_number text;
BEGIN
  -- Get related information
  v_client_id := NEW.client_id;
  v_order_number := substring(NEW.id::text from 1 for 8);
  
  -- Get business owner
  SELECT owner_id, name INTO v_business_owner_id, v_business_name
  FROM public.businesses
  WHERE id = NEW.business_id;
  
  -- Get driver user_id if assigned (with explicit UUID cast)
  IF NEW.driver_id IS NOT NULL THEN
    SELECT user_id INTO v_driver_user_id
    FROM public.drivers
    WHERE id::uuid = NEW.driver_id::uuid;
  END IF;

  -- Handle different status changes
  IF TG_OP = 'INSERT' THEN
    -- New order created - notify business
    IF v_business_owner_id IS NOT NULL THEN
      PERFORM public.create_notification(
        v_business_owner_id,
        'new_order',
        'Nuevo Pedido',
        'Nuevo pedido recibido #' || v_order_number,
        NEW.id,
        jsonb_build_object('order_id', NEW.id, 'total', NEW.total)
      );
    END IF;
    
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    
    -- Order confirmed - notify client
    IF NEW.status = 'confirmed' THEN
      PERFORM public.create_notification(
        v_client_id,
        'order_confirmed',
        'Pedido Confirmado',
        'Tu pedido de ' || COALESCE(v_business_name, 'negocio') || ' ha sido confirmado y está siendo preparado',
        NEW.id,
        jsonb_build_object('business_name', v_business_name)
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
        jsonb_build_object('business_name', v_business_name)
      );
    END IF;
    
    -- Driver assigned - notify client and business
    IF NEW.status = 'assigned' AND OLD.driver_id IS NULL AND NEW.driver_id IS NOT NULL THEN
      -- Notify client
      PERFORM public.create_notification(
        v_client_id,
        'driver_assigned',
        'Repartidor Asignado',
        'Un repartidor ha sido asignado a tu pedido',
        NEW.id,
        jsonb_build_object('driver_id', NEW.driver_id)
      );
      
      -- Notify business
      IF v_business_owner_id IS NOT NULL THEN
        PERFORM public.create_notification(
          v_business_owner_id,
          'driver_assigned',
          'Repartidor Asignado',
          'Repartidor asignado al pedido #' || v_order_number,
          NEW.id,
          jsonb_build_object('driver_id', NEW.driver_id, 'order_number', v_order_number)
        );
      END IF;
    END IF;
    
    -- Order picking up - notify business
    IF NEW.status = 'picking_up' AND v_business_owner_id IS NOT NULL THEN
      PERFORM public.create_notification(
        v_business_owner_id,
        'order_picking_up',
        'Repartidor en Camino',
        'Repartidor está recogiendo el pedido #' || v_order_number,
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
        jsonb_build_object('business_name', v_business_name)
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
        jsonb_build_object('business_name', v_business_name)
      );
      
      -- Notify business
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
        jsonb_build_object('business_name', v_business_name)
      );
      
      -- Notify business
      IF v_business_owner_id IS NOT NULL THEN
        PERFORM public.create_notification(
          v_business_owner_id,
          'order_cancelled',
          'Pedido Cancelado',
          'Pedido #' || v_order_number || ' cancelado',
          NEW.id,
          jsonb_build_object('order_number', v_order_number)
        );
      END IF;
    END IF;
    
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_order_status_change
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_status_change();
