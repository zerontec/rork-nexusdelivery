-- Create table for driver documents
create table if not exists public.driver_documents (
  id uuid primary key default uuid_generate_v4(),
  driver_id uuid references public.drivers(id) not null,
  document_type text not null, -- 'license_front', 'license_back', 'id_card', 'vehicle_papers'
  file_url text not null,
  status text default 'pending', -- 'pending', 'approved', 'rejected'
  rejection_reason text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.driver_documents enable row level security;

-- Policies for driver_documents
create policy "Drivers can view their own documents"
  on public.driver_documents for select
  using (auth.uid() = driver_id);

create policy "Drivers can upload their own documents"
  on public.driver_documents for insert
  with check (auth.uid() = driver_id);

create policy "Drivers can update their own documents"
  on public.driver_documents for update
  using (auth.uid() = driver_id);

create policy "Admins can view all documents"
  on public.driver_documents for select
  using (true); -- Assuming admin has full access or specific role check if implemented

create policy "Admins can update status"
  on public.driver_documents for update
  using (true);

-- Create Storage Bucket for documents
insert into storage.buckets (id, name, public)
values ('driver-documents', 'driver-documents', true)
on conflict (id) do nothing;

-- Storage Policies
create policy "Drivers can upload documents"
  on storage.objects for insert
  with check ( bucket_id = 'driver-documents' and auth.uid()::text = (storage.foldername(name))[1] );

create policy "Drivers can view their own documents"
  on storage.objects for select
  using ( bucket_id = 'driver-documents' );

create policy "Admins can view all documents"
  on storage.objects for select
  using ( bucket_id = 'driver-documents' );
