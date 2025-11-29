-- Create businesses table
create table if not exists public.businesses (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users not null,
  name text not null,
  type text not null,
  description text,
  phone text,
  email text,
  image text,
  rating numeric default 0,
  reviews integer default 0,
  delivery_time text,
  delivery_fee numeric default 0,
  minimum_order numeric default 0,
  is_open boolean default true,
  location jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create products table
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses not null,
  name text not null,
  description text,
  price numeric not null,
  image text,
  category text,
  stock integer default 0,
  available boolean default true,
  discount numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create drivers table
create table if not exists public.drivers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  photo text,
  vehicle_type text,
  vehicle_plate text,
  is_available boolean default false,
  current_location jsonb,
  rating numeric default 0,
  reviews integer default 0,
  earnings jsonb default '{"today": 0, "week": 0, "month": 0}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create orders table
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses not null,
  client_id uuid references auth.users not null,
  driver_id uuid references public.drivers,
  status text not null default 'pending',
  total numeric not null,
  subtotal numeric not null,
  delivery_fee numeric not null,
  delivery_address jsonb not null,
  payment_method text not null,
  estimated_delivery timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create order_items table
create table if not exists public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders not null,
  product_id uuid references public.products not null,
  quantity integer not null,
  price numeric not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.businesses enable row level security;
alter table public.products enable row level security;
alter table public.drivers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Create policies (Basic examples, refine as needed)

-- Businesses: Everyone can read, Owners can insert/update
create policy "Businesses are viewable by everyone"
  on public.businesses for select
  using ( true );

create policy "Users can create businesses"
  on public.businesses for insert
  with check ( auth.uid() = owner_id );

create policy "Owners can update their own business"
  on public.businesses for update
  using ( auth.uid() = owner_id );

-- Products: Everyone can read, Business owners can insert/update
create policy "Products are viewable by everyone"
  on public.products for select
  using ( true );

create policy "Business owners can insert products"
  on public.products for insert
  with check ( exists ( select 1 from public.businesses where id = business_id and owner_id = auth.uid() ) );

create policy "Business owners can update products"
  on public.products for update
  using ( exists ( select 1 from public.businesses where id = business_id and owner_id = auth.uid() ) );

-- Drivers: Everyone can read, Drivers can update their own status
create policy "Drivers are viewable by everyone"
  on public.drivers for select
  using ( true );

create policy "Drivers can update their own profile"
  on public.drivers for update
  using ( auth.uid() = user_id );

create policy "Drivers can insert their own profile"
  on public.drivers for insert
  with check ( auth.uid() = user_id );

-- Orders: Clients can see their own, Businesses can see theirs, Drivers can see assigned
create policy "Users can see their own orders"
  on public.orders for select
  using ( 
    auth.uid() = client_id or 
    exists ( select 1 from public.businesses where id = business_id and owner_id = auth.uid() ) or
    exists ( select 1 from public.drivers where id = driver_id and user_id = auth.uid() )
  );

create policy "Users can create orders"
  on public.orders for insert
  with check ( auth.uid() = client_id );

-- Order Items: Visible if order is visible
create policy "Users can see order items"
  on public.order_items for select
  using ( exists ( select 1 from public.orders where id = order_id and (
    client_id = auth.uid() or 
    exists ( select 1 from public.businesses where id = business_id and owner_id = auth.uid() ) or
    exists ( select 1 from public.drivers where id = driver_id and user_id = auth.uid() )
  )));

create policy "Users can insert order items"
  on public.order_items for insert
  with check ( exists ( select 1 from public.orders where id = order_id and client_id = auth.uid() ) );
