-- Drop existing policies to ensure clean slate and fix bad references
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
    EXISTS ( SELECT 1 FROM public.drivers WHERE id = driver_id AND id = auth.uid() ) -- Fixed: user_id -> id
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
