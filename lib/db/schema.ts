// Idempotent schema. Runs automatically the first time the site talks to the
// database (see lib/db/index.ts) and again whenever SCHEMA_VERSION is bumped.
export const SCHEMA_VERSION = 1

export const SCHEMA_SQL = /* sql */ `
create extension if not exists pgcrypto;

create table if not exists settings (
  key text primary key,
  value jsonb not null
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  image_url text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  price numeric(10,2) not null default 0 check (price >= 0),
  compare_at_price numeric(10,2),
  category_id uuid references categories(id) on delete set null,
  collection text not null default '',
  images text[] not null default '{}',
  images_by_color jsonb not null default '{}',
  details text[] not null default '{}',
  is_active boolean not null default true,
  is_featured boolean not null default false,
  is_new boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  size text not null check (size in ('XS','S','M','L','XL')),
  color text not null,
  stock integer not null default 0 check (stock >= 0),
  unique (product_id, size, color)
);

create sequence if not exists order_number_seq start 1001;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  public_token text not null,
  customer_name text not null,
  phone text not null,
  email text not null default '',
  governorate text not null,
  city text not null,
  address text not null,
  postal_code text not null default '',
  notes text not null default '',
  subtotal numeric(10,2) not null default 0,
  shipping numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  payment_method text not null default 'cod' check (payment_method in ('cod')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid','refunded')),
  status text not null default 'pending' check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  variant_id uuid references variants(id) on delete set null,
  product_name text not null,
  size text not null,
  color text not null,
  price numeric(10,2) not null default 0,
  quantity integer not null default 1 check (quantity > 0),
  image_url text not null default ''
);

create index if not exists idx_products_category on products(category_id);
create index if not exists idx_variants_product on variants(product_id);
create index if not exists idx_orders_created on orders(created_at desc);
create index if not exists idx_orders_phone on orders(phone);
create index if not exists idx_order_items_order on order_items(order_id);
`
