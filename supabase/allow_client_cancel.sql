-- Allow clients to cancel their own pending orders
CREATE POLICY "Clients can cancel their own pending orders"
  ON public.orders FOR UPDATE
  USING (
    client_id = auth.uid() AND status = 'pending'
  )
  WITH CHECK (
    client_id = auth.uid() AND status = 'cancelled'
  );
