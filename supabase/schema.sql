-- ============================================================
-- Freal Boxser — Supabase schema
-- Run this once in Supabase Studio → SQL Editor (or via `supabase db push`)
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  balance numeric(12,2) not null default 0 check (balance >= 0),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper to check admin role without recursive RLS lookups.
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (select 1 from public.profiles where id = uid and role = 'admin');
$$;

-- ---------- products ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(12,2) not null check (price >= 0),
  stock int not null default 0 check (stock >= 0),
  low_stock int not null default 3,
  featured boolean not null default false,
  image_url text,
  created_at timestamptz not null default now()
);

-- ---------- cart_items ----------
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ---------- orders / order_items ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  total numeric(12,2) not null,
  status text not null default 'completed',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  price numeric(12,2) not null,
  quantity int not null
);

-- ---------- donations ----------
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  message text,
  created_at timestamptz not null default now()
);

-- ---------- topup_requests (PromptPay QR flow) ----------
create table if not exists public.topup_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  slip_url text,
  status text not null default 'pending' check (status in ('pending', 'submitted', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id)
);

-- ============================================================
-- RPC functions (atomic, security definer)
-- ============================================================

-- Approve a pending top-up: credits the user's balance and marks it approved.
-- Only callable by an admin (checked via auth.uid()).
create or replace function public.approve_topup(request_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  req record;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  select * into req from public.topup_requests where id = request_id for update;
  if req is null then
    raise exception 'topup request not found';
  end if;
  if req.status = 'approved' then
    raise exception 'already approved';
  end if;

  update public.profiles set balance = balance + req.amount where id = req.user_id;
  update public.topup_requests
    set status = 'approved', reviewed_at = now(), reviewed_by = auth.uid()
    where id = request_id;
end;
$$;

create or replace function public.reject_topup(request_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  update public.topup_requests
    set status = 'rejected', reviewed_at = now(), reviewed_by = auth.uid()
    where id = request_id and status <> 'approved';
end;
$$;

-- Checkout the caller's cart atomically: validates stock, deducts balance,
-- creates the order + order_items, decrements stock, empties the cart.
create or replace function public.checkout_cart()
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
  cart_total numeric(12,2) := 0;
  user_balance numeric(12,2);
  new_order_id uuid;
  item record;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  select balance into user_balance from public.profiles where id = uid for update;

  select coalesce(sum(p.price * c.quantity), 0) into cart_total
  from public.cart_items c join public.products p on p.id = c.product_id
  where c.user_id = uid;

  if cart_total = 0 then
    raise exception 'cart is empty';
  end if;
  if user_balance < cart_total then
    raise exception 'insufficient balance';
  end if;

  for item in
    select c.product_id, c.quantity, p.stock, p.price, p.name
    from public.cart_items c join public.products p on p.id = c.product_id
    where c.user_id = uid
    for update of p
  loop
    if item.stock < item.quantity then
      raise exception 'ไม่มีสินค้าเพียงพอ: %', item.name;
    end if;
  end loop;

  insert into public.orders (user_id, total, status) values (uid, cart_total, 'completed')
    returning id into new_order_id;

  insert into public.order_items (order_id, product_id, product_name, price, quantity)
  select new_order_id, p.id, p.name, p.price, c.quantity
  from public.cart_items c join public.products p on p.id = c.product_id
  where c.user_id = uid;

  update public.products p set stock = stock - c.quantity
  from public.cart_items c
  where c.user_id = uid and c.product_id = p.id;

  update public.profiles set balance = balance - cart_total where id = uid;
  delete from public.cart_items where user_id = uid;

  return new_order_id;
end;
$$;

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.donations enable row level security;
alter table public.topup_requests enable row level security;

-- profiles
create policy "profiles: self select" on public.profiles for select using (auth.uid() = id or public.is_admin(auth.uid()));
create policy "profiles: self update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- products: public read, admin write
create policy "products: public read" on public.products for select using (true);
create policy "products: admin write" on public.products for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- cart_items: owner only
create policy "cart: owner select" on public.cart_items for select using (auth.uid() = user_id);
create policy "cart: owner insert" on public.cart_items for insert with check (auth.uid() = user_id);
create policy "cart: owner update" on public.cart_items for update using (auth.uid() = user_id);
create policy "cart: owner delete" on public.cart_items for delete using (auth.uid() = user_id);

-- orders / order_items: owner + admin read
create policy "orders: owner or admin select" on public.orders for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "order_items: owner or admin select" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin(auth.uid())))
);

-- donations: public read (for a donation meter), owner insert
create policy "donations: public read" on public.donations for select using (true);
create policy "donations: owner insert" on public.donations for insert with check (auth.uid() = user_id);

-- topup_requests: owner + admin
create policy "topup: owner or admin select" on public.topup_requests for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "topup: owner insert" on public.topup_requests for insert with check (auth.uid() = user_id);
create policy "topup: owner update own pending slip" on public.topup_requests for update
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id and status in ('pending', 'submitted'));

-- ============================================================
-- Storage bucket for payment slips
-- ============================================================
insert into storage.buckets (id, name, public) values ('slips', 'slips', true)
  on conflict (id) do nothing;

create policy "slips: authenticated upload" on storage.objects for insert
  with check (bucket_id = 'slips' and auth.role() = 'authenticated');
create policy "slips: public read" on storage.objects for select
  using (bucket_id = 'slips');

-- ============================================================
-- Seed products (matches the original static catalog)
-- ============================================================
do $$
begin
  if not exists (select 1 from public.products) then
    insert into public.products (name, description, price, stock, low_stock, featured)
    select
      'Night Vision Goggles',
      'อุปกรณ์มองกลางคืน เหมาะสำหรับภารกิจลับหรือดูแลเวลากลางคืน',
      3500, 4, 3, (n = 1)
    from generate_series(1, 10) as n;
  end if;
end;
$$;
