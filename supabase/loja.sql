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
    'Material principal da loja para destravar ideias de renda extra com mais clareza, direção prática e leitura leve.',
    '["Acesso imediato","Compra avulsa","Biblioteca privada"]'::jsonb,
    '["Ajuda a transformar ideias soltas em caminhos mais claros de renda extra.","Organiza visão, direção e próximos passos de forma simples de aplicar.","Funciona como porta de entrada para a biblioteca e para futuros produtos."]'::jsonb,
    '["Acesso liberado na área de membros.","Espaço para atualizações futuras dentro da mesma conta.","Compra conectada com outros produtos da loja."]'::jsonb,
    1,
    true
  ),
  (
    'produto-02',
    'Produto 02',
    'Produto complementar',
    5700,
    'R$ 57',
    'Produto pensado para continuar a jornada de quem já começou a destravar ideias e quer aprofundar a execução.',
    '["Continuidade","Pode entrar depois","Oferta complementar"]'::jsonb,
    '["Amplia a jornada de compra sem depender de novo cadastro.","Entra como sequência natural do produto principal.","Fica disponível para compra posterior na área de membros."]'::jsonb,
    '["Acesso separado por produto.","Visualização clara dentro da biblioteca.","Integração com o mesmo fluxo de compra."]'::jsonb,
    2,
    true
  ),
  (
    'produto-03',
    'Produto 03',
    'Produto avançado',
    9700,
    'R$ 97',
    'Espaço reservado para um produto mais robusto, com valor percebido maior e papel de continuidade premium dentro da loja.',
    '["Produto premium","Escala futura","Biblioteca privada"]'::jsonb,
    '["Ajuda a loja a comportar tickets diferentes com clareza.","Permite upgrades e novas compras no mesmo ambiente.","Mantém vitrine, conta e acesso funcionando em conjunto."]'::jsonb,
    '["Acesso liberado automaticamente após a compra.","Visão separada entre adquirido e disponível.","Simulação de entrega por e-mail e senha."]'::jsonb,
    3,
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
