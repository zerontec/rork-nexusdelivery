-- Update notification trigger to add client notification for picking_up status
-- This script only updates the trigger function without recreating policies

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
  
  -- Get driver user_id if assigned
  IF NEW.driver_id IS NOT NULL THEN
    SELECT user_id INTO v_driver_user_id
    FROM public.drivers
    WHERE id = NEW.driver_id;
  END IF;

  -- Handle different status changes
  IF TG_OP = 'INSERT' THEN
    -- New order created - notify business
    PERFORM public.create_notification(
      v_business_owner_id,
      'new_order',
      'Nuevo Pedido',
      'Nuevo pedido recibido #' || v_order_number,
      NEW.id,
      jsonb_build_object('order_id', NEW.id, 'total', NEW.total)
    );
    
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    
    -- Order confirmed - notify client
    IF NEW.status = 'confirmed' THEN
      PERFORM public.create_notification(
        v_client_id,
        'order_confirmed',
        'Pedido Confirmado',
        'Tu pedido de ' || v_business_name || ' ha sido confirmado y está siendo preparado',
        NEW.id,
        jsonb_build_object('business_name', v_business_name)
      );
    END IF;
    
    -- Order ready - notify driver if assigned
    IF NEW.status = 'ready' THEN
      IF v_driver_user_id IS NOT NULL THEN
        PERFORM public.create_notification(
          v_driver_user_id,
          'order_ready',
          'Pedido Listo',
          'Pedido #' || v_order_number || ' listo para recoger',
          NEW.id,
          jsonb_build_object('business_name', v_business_name)
        );
      END IF;
    END IF;
    
    -- Driver assigned - notify client and business
    IF NEW.status = 'assigned' AND OLD.driver_id IS NULL AND NEW.driver_id IS NOT NULL THEN
      PERFORM public.create_notification(
        v_client_id,
        'driver_assigned',
        'Repartidor Asignado',
        'Un repartidor ha sido asignado a tu pedido',
        NEW.id,
        jsonb_build_object('driver_id', NEW.driver_id)
      );
      
      PERFORM public.create_notification(
        v_business_owner_id,
        'driver_assigned',
        'Repartidor Asignado',
        'Repartidor asignado al pedido #' || v_order_number,
        NEW.id,
        jsonb_build_object('driver_id', NEW.driver_id)
      );
    END IF;
    
    -- Order picking up - notify business and client
    IF NEW.status = 'picking_up' THEN
      -- Notify business
      PERFORM public.create_notification(
        v_business_owner_id,
        'order_picking_up',
        'Repartidor en Camino',
        'Repartidor está recogiendo el pedido #' || v_order_number,
        NEW.id,
        jsonb_build_object('order_number', v_order_number)
      );
      
      -- Notify client
      PERFORM public.create_notification(
        v_client_id,
        'order_picking_up',
        'Repartidor Recogiendo Pedido',
        'El repartidor está recogiendo tu pedido',
        NEW.id,
        jsonb_build_object('business_name', v_business_name)
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
      PERFORM public.create_notification(
        v_business_owner_id,
        'order_delivered',
        'Pedido Entregado',
        'Pedido #' || v_order_number || ' entregado exitosamente',
        NEW.id,
        jsonb_build_object('order_number', v_order_number)
      );
    END IF;
    
    -- Order cancelled
    IF NEW.status = 'cancelled' THEN
      PERFORM public.create_notification(
        v_client_id,
        'order_cancelled',
        'Pedido Cancelado',
        'Tu pedido ha sido cancelado',
        NEW.id,
        jsonb_build_object('business_name', v_business_name)
      );
      
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
