-- Create Storage Bucket for products
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- Storage Policies

-- Allow public access to view product images
create policy "Public Access to Products"
  on storage.objects for select
  using ( bucket_id = 'products' );

-- Allow authenticated users (businesses) to upload product images
create policy "Businesses can upload product images"
  on storage.objects for insert
  with check ( bucket_id = 'products' and auth.role() = 'authenticated' );

-- Allow businesses to update/delete their own images (optional, simplified for now)
create policy "Businesses can update their own images"
  on storage.objects for update
  using ( bucket_id = 'products' and auth.uid() = owner );

create policy "Businesses can delete their own images"
  on storage.objects for delete
  using ( bucket_id = 'products' and auth.uid() = owner );
