create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  platform text not null,
  product_id text not null,
  product_name text not null,
  image_url text,
  price numeric(12, 2) default 0,
  created_at timestamptz not null default now(),
  unique (user_id, platform, product_id)
);

create table if not exists public.stock_snapshots (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity >= 0),
  recorded_at timestamptz not null default now()
);

do $$
begin
  create type public.stock_change_type as enum ('spike', 'drop', 'new', 'out_of_stock');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  product_id uuid not null references public.products(id) on delete cascade,
  old_quantity integer,
  new_quantity integer not null check (new_quantity >= 0),
  change_type public.stock_change_type not null,
  change_percent numeric(8, 2) not null default 0,
  created_at timestamptz not null default now(),
  is_read boolean not null default false
);

create table if not exists public.platforms (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  url_pattern text not null,
  is_active boolean not null default true,
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, url_pattern)
);

create table if not exists public.user_settings (
  user_id text primary key,
  drop_percent integer not null default 20,
  spike_percent integer not null default 50,
  notify_in_app boolean not null default true,
  notify_email boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists stock_snapshots_product_recorded_idx
  on public.stock_snapshots (product_id, recorded_at desc);

create index if not exists alerts_user_created_idx
  on public.alerts (user_id, created_at desc);

create or replace view public.product_latest_stock as
with ranked as (
  select
    product_id,
    quantity,
    recorded_at,
    lag(quantity) over (partition by product_id order by recorded_at) as previous_quantity,
    row_number() over (partition by product_id order by recorded_at desc) as rn
  from public.stock_snapshots
)
select
  p.id,
  p.user_id,
  p.platform,
  p.product_id,
  p.product_name,
  p.image_url,
  p.price,
  p.created_at,
  r.quantity as latest_quantity,
  r.previous_quantity,
  coalesce(r.quantity - r.previous_quantity, 0) as last_change,
  case
    when r.previous_quantity is null or r.previous_quantity = 0 then 0
    else round(((r.quantity - r.previous_quantity)::numeric / r.previous_quantity::numeric) * 100, 2)
  end as change_percent,
  r.recorded_at as last_snapshot_at
from public.products p
left join ranked r on r.product_id = p.id and r.rn = 1;

alter table public.products enable row level security;
alter table public.stock_snapshots enable row level security;
alter table public.alerts enable row level security;
alter table public.platforms enable row level security;
alter table public.user_settings enable row level security;

create policy "users manage own products" on public.products
  for all to authenticated
  using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

create policy "users read own snapshots" on public.stock_snapshots
  for select to authenticated
  using (
    exists (
      select 1 from public.products
      where products.id = stock_snapshots.product_id
      and products.user_id = auth.uid()::text
    )
  );

create policy "users manage own alerts" on public.alerts
  for all to authenticated
  using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

create policy "users manage own platforms" on public.platforms
  for all to authenticated
  using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

create policy "users manage own settings" on public.user_settings
  for all to authenticated
  using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

insert into public.platforms (user_id, name, url_pattern, is_active)
values
  ('demo-user', 'Safka', 'safka-eg.com', true),
  ('demo-user', 'Taager', 'taager.com', true),
  ('demo-user', 'Vendor EG', 'vendor-eg.com', true)
on conflict do nothing;
