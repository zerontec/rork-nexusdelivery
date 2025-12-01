-- MASTER FIX for "column user_id does not exist" error
-- This script fixes:
-- 1. The notification trigger function (which was querying user_id)
-- 2. The drivers table RLS policy (which was using user_id)
-- 3. The orders table RLS policies (ensuring they use id)

-- 1. Fix Notification Trigger Function
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
  -- FIX: Directly use driver_id as user_id since drivers.id is the auth.uid
  IF NEW.driver_id IS NOT NULL THEN
    v_driver_user_id := NEW.driver_id;
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

-- 2. Fix Drivers Table RLS
DROP POLICY IF EXISTS "Drivers can view their own profile" ON public.drivers;
CREATE POLICY "Drivers can view their own profile"
  ON public.drivers FOR SELECT
  USING ( id = auth.uid() ); -- Fixed: user_id -> id

-- 3. Fix Orders Table RLS (Ensure these are correct)
DROP POLICY IF EXISTS "Users can see their own orders" ON public.orders;
DROP POLICY IF EXISTS "Business owners can update their orders" ON public.orders;
DROP POLICY IF EXISTS "Drivers can update assigned orders" ON public.orders;
DROP POLICY IF EXISTS "Drivers can accept ready orders" ON public.orders;

-- Re-create SELECT policy with correct column (id instead of user_id)
CREATE POLICY "Users can see their own orders"
  ON public.orders FOR SELECT
  USING ( 
    auth.uid() = client_id OR 
    EXISTS ( SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid() ) OR
    EXISTS ( SELECT 1 FROM public.drivers WHERE id = driver_id AND id = auth.uid() )
  );

-- Allow businesses to update their orders
CREATE POLICY "Business owners can update their orders"
  ON public.orders FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = orders.business_id AND owner_id = auth.uid()
  ));

-- Allow drivers to update orders assigned to them
CREATE POLICY "Drivers can update assigned orders"
  ON public.orders FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.drivers 
    WHERE id = auth.uid() AND id = orders.driver_id
  ));

-- Allow drivers to accept unassigned ready orders
CREATE POLICY "Drivers can accept ready orders"
  ON public.orders FOR UPDATE
  USING (
    status = 'ready' AND 
    driver_id IS NULL AND
    EXISTS (SELECT 1 FROM public.drivers WHERE id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.drivers WHERE id = auth.uid())
  );
