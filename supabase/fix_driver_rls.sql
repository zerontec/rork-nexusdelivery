-- Update RLS policy for orders to allow drivers to see unassigned 'ready' orders

drop policy if exists "Users can view their own orders" on public.orders;

create policy "Users can view their own orders"
  on public.orders for select
  using (
    auth.uid()::text = client_id::text or
    exists ( select 1 from public.businesses where id::text = business_id::text and owner_id::text = auth.uid()::text ) or
    exists ( select 1 from public.drivers where id::text = driver_id::text and id::text = auth.uid()::text ) or
    (
      -- Allow drivers to see unassigned ready orders
      status = 'ready' and 
      driver_id is null and 
      exists ( select 1 from public.drivers where id::text = auth.uid()::text )
    )
  );
