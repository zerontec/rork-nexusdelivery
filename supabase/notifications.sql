-- Notifications Table and Triggers for NexusDelivery
-- This file contains the complete schema for the real-time notifications system

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================

-- Create notifications table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  type text not null,
  title text not null,
  message text not null,
  order_id uuid references public.orders,
  metadata jsonb default '{}'::jsonb,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for performance
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_is_read on public.notifications(is_read);
create index if not exists idx_notifications_created_at on public.notifications(created_at desc);
create index if not exists idx_notifications_user_unread on public.notifications(user_id, is_read) where is_read = false;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
alter table public.notifications enable row level security;

-- Users can only see their own notifications
create policy "Users can view their own notifications"
  on public.notifications for select
  using ( auth.uid() = user_id );

-- Users can update their own notifications (mark as read)
create policy "Users can update their own notifications"
  on public.notifications for update
  using ( auth.uid() = user_id );

-- Users can delete their own notifications
create policy "Users can delete their own notifications"
  on public.notifications for delete
  using ( auth.uid() = user_id );

-- System can insert notifications for any user (via triggers)
create policy "System can insert notifications"
  on public.notifications for insert
  with check ( true );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to create a notification
create or replace function public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_order_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
) returns uuid as $$
declare
  v_notification_id uuid;
begin
  insert into public.notifications (user_id, type, title, message, order_id, metadata)
  values (p_user_id, p_type, p_title, p_message, p_order_id, p_metadata)
  returning id into v_notification_id;
  
  return v_notification_id;
end;
$$ language plpgsql security definer;

-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

-- Function to notify on order status changes
create or replace function public.notify_order_status_change()
returns trigger as $$
declare
  v_client_id uuid;
  v_business_owner_id uuid;
  v_driver_user_id uuid;
  v_business_name text;
  v_order_number text;
begin
  -- Get related information
  v_client_id := NEW.client_id;
  v_order_number := substring(NEW.id::text from 1 for 8);
  
  -- Get business owner
  select owner_id, name into v_business_owner_id, v_business_name
  from public.businesses
  where id = NEW.business_id;
  
  -- Get driver user_id if assigned
  if NEW.driver_id is not null then
    select user_id into v_driver_user_id
    from public.drivers
    where id = NEW.driver_id;
  end if;

  -- Handle different status changes
  if TG_OP = 'INSERT' then
    -- New order created - notify business
    perform public.create_notification(
      v_business_owner_id,
      'new_order',
      'Nuevo Pedido',
      'Nuevo pedido recibido #' || v_order_number,
      NEW.id,
      jsonb_build_object('order_id', NEW.id, 'total', NEW.total)
    );
    
  elsif TG_OP = 'UPDATE' and OLD.status != NEW.status then
    
    -- Order confirmed - notify client
    if NEW.status = 'confirmed' then
      perform public.create_notification(
        v_client_id,
        'order_confirmed',
        'Pedido Confirmado',
        'Tu pedido de ' || v_business_name || ' ha sido confirmado y está siendo preparado',
        NEW.id,
        jsonb_build_object('business_name', v_business_name)
      );
    end if;
    
    -- Order ready - notify driver if assigned, otherwise available drivers
    if NEW.status = 'ready' then
      if v_driver_user_id is not null then
        -- Notify assigned driver
        perform public.create_notification(
          v_driver_user_id,
          'order_ready',
          'Pedido Listo',
          'Pedido #' || v_order_number || ' listo para recoger',
          NEW.id,
          jsonb_build_object('business_name', v_business_name)
        );
      end if;
    end if;
    
    -- Driver assigned - notify client and business
    if NEW.status = 'assigned' and OLD.driver_id is null and NEW.driver_id is not null then
      -- Notify client
      perform public.create_notification(
        v_client_id,
        'driver_assigned',
        'Repartidor Asignado',
        'Un repartidor ha sido asignado a tu pedido',
        NEW.id,
        jsonb_build_object('driver_id', NEW.driver_id)
      );
      
      -- Notify business
      perform public.create_notification(
        v_business_owner_id,
        'driver_assigned',
        'Repartidor Asignado',
        'Repartidor asignado al pedido #' || v_order_number,
        NEW.id,
        jsonb_build_object('driver_id', NEW.driver_id, 'order_number', v_order_number)
      );
    end if;
    
    -- Order picking up - notify business and client
    if NEW.status = 'picking_up' then
      -- Notify business
      perform public.create_notification(
        v_business_owner_id,
        'order_picking_up',
        'Repartidor en Camino',
        'Repartidor está recogiendo el pedido #' || v_order_number,
        NEW.id,
        jsonb_build_object('order_number', v_order_number)
      );
      
      -- Notify client
      perform public.create_notification(
        v_client_id,
        'order_picking_up',
        'Repartidor Recogiendo Pedido',
        'El repartidor está recogiendo tu pedido',
        NEW.id,
        jsonb_build_object('business_name', v_business_name)
      );
    end if;
    
    -- Order in transit - notify client
    if NEW.status = 'in_transit' then
      perform public.create_notification(
        v_client_id,
        'order_in_transit',
        'Pedido en Camino',
        'Tu pedido está en camino',
        NEW.id,
        jsonb_build_object('business_name', v_business_name)
      );
    end if;
    
    -- Order delivered - notify client and business
    if NEW.status = 'delivered' then
      -- Notify client
      perform public.create_notification(
        v_client_id,
        'order_delivered',
        'Pedido Entregado',
        '¡Tu pedido ha sido entregado!',
        NEW.id,
        jsonb_build_object('business_name', v_business_name)
      );
      
      -- Notify business
      perform public.create_notification(
        v_business_owner_id,
        'order_delivered',
        'Pedido Entregado',
        'Pedido #' || v_order_number || ' entregado exitosamente',
        NEW.id,
        jsonb_build_object('order_number', v_order_number)
      );
    end if;
    
    -- Order cancelled - notify client and business (if not by client)
    if NEW.status = 'cancelled' then
      -- Notify client
      perform public.create_notification(
        v_client_id,
        'order_cancelled',
        'Pedido Cancelado',
        'Tu pedido ha sido cancelado',
        NEW.id,
        jsonb_build_object('business_name', v_business_name)
      );
      
      -- Notify business
      perform public.create_notification(
        v_business_owner_id,
        'order_cancelled',
        'Pedido Cancelado',
        'Pedido #' || v_order_number || ' cancelado',
        NEW.id,
        jsonb_build_object('order_number', v_order_number)
      );
    end if;
    
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger for order status changes
drop trigger if exists on_order_status_change on public.orders;
create trigger on_order_status_change
  after insert or update on public.orders
  for each row
  execute function public.notify_order_status_change();

-- ============================================================================
-- CLEANUP FUNCTION (OPTIONAL)
-- ============================================================================

-- Function to delete old notifications (older than 30 days)
create or replace function public.cleanup_old_notifications()
returns void as $$
begin
  delete from public.notifications
  where created_at < now() - interval '30 days';
end;
$$ language plpgsql security definer;

-- You can schedule this function to run periodically using pg_cron or similar
-- Example (if pg_cron is installed):
-- select cron.schedule('cleanup-notifications', '0 2 * * *', 'select public.cleanup_old_notifications()');
