create extension if not exists pgcrypto;

create table if not exists public.loja_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  last_access_password text,
  created_at timestamptz not null default now()
);

create table if not exists public.loja_products (
  id text primary key,
  name text not null,
  tag text not null,
  price_cents integer not null,
  price_label text not null,
  description text not null,
  meta jsonb not null default '[]'::jsonb,
  benefits jsonb not null default '[]'::jsonb,
  bonuses jsonb not null default '[]'::jsonb,
  position integer not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.loja_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.loja_users(id) on delete cascade,
  status text not null default 'paid',
  total_cents integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.loja_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.loja_orders(id) on delete cascade,
  user_id uuid not null references public.loja_users(id) on delete cascade,
  product_id text not null references public.loja_products(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists loja_products_position_idx
  on public.loja_products (position, active);

create index if not exists loja_orders_user_id_created_at_idx
  on public.loja_orders (user_id, created_at desc);

create index if not exists loja_order_items_user_id_product_id_idx
  on public.loja_order_items (user_id, product_id);

insert into public.loja_products (
  id,
  name,
  tag,
  price_cents,
  price_label,
  description,
  meta,
  benefits,
  bonuses,
  position,
  active
) values
  (
    'guia-destrave',
    'Guia Destrave',
    'Produto principal',
    3700,
    'R$ 37',
    'Guia prático para destravar ideias de renda extra com estratégias de venda orgânica, exercícios e exemplos reais para aplicar com mais clareza.',
    '["De R$ 97 por R$ 37","Garantia de 7 dias","Acesso vitalício"]'::jsonb,
    '["+20 estratégias de venda orgânica","Exercícios e exemplos práticos com imagens","Estratégias que funcionam mesmo sem seguidores ou audiência","Métodos testados em negócios reais que funcionam tanto online quanto offline"]'::jsonb,
    '["Bônus: Calendário Sazonal 2026 Imprimível","Bônus: Comunidade com conteúdos exclusivos"]'::jsonb,
    1,
    true
  ),
  (
    'produto-02',
    'Calculadora de Precificação',
    'Produto complementar',
    2990,
    'R$ 29,90',
    '',
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    2,
    true
  ),
  (
    'produto-03',
    'Calendário Sazonal',
    'Produto adicional',
    990,
    'R$ 9,90',
    '',
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    3,
    true
  ),
  (
    'produto-04',
    'Pack de Quadros',
    'Produto adicional',
    2990,
    'R$ 29,90',
    '',
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    4,
    true
  )
on conflict (id) do update set
  name = excluded.name,
  tag = excluded.tag,
  price_cents = excluded.price_cents,
  price_label = excluded.price_label,
  description = excluded.description,
  meta = excluded.meta,
  benefits = excluded.benefits,
  bonuses = excluded.bonuses,
  position = excluded.position,
  active = excluded.active;
