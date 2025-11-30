-- Function to notify ALL drivers when a new order is ready (and unassigned)
create or replace function public.notify_drivers_new_order()
returns trigger as $$
declare
  driver_record record;
begin
  -- Trigger when status becomes 'ready' and no driver is assigned
  if NEW.status = 'ready' and NEW.driver_id is null then
    -- Loop through all available drivers
    for driver_record in select id from public.drivers
    loop
      perform public.create_notification(
        driver_record.id::uuid,
        'order_ready',
        'Nuevo Pedido Disponible',
        'Hay un pedido listo para recoger en ' || (select name from public.businesses where id = NEW.business_id::uuid),
        NEW.id::uuid,
        jsonb_build_object('order_id', NEW.id)
      );
    end loop;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

-- Create trigger for broadcast
drop trigger if exists on_order_ready_broadcast on public.orders;
create trigger on_order_ready_broadcast
  after insert or update on public.orders
  for each row
  execute function public.notify_drivers_new_order();

-- Ensure RLS allows users to read their own notifications (re-applying to be safe)
drop policy if exists "Users can view their own notifications" on public.notifications;
create policy "Users can view their own notifications"
  on public.notifications for select
  using ( auth.uid() = user_id );
