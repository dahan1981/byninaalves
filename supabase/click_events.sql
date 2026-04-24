create extension if not exists pgcrypto;

create table if not exists public.link_bio_links (
  id text primary key,
  label text not null,
  url text not null,
  position integer not null,
  active boolean not null default true,
  opens_new_tab boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.click_events (
  id uuid primary key default gen_random_uuid(),
  page_key text not null,
  link_id text not null,
  destination_url text not null,
  clicked_at timestamptz not null default now(),
  user_agent text,
  referrer text,
  pathname text,
  utm_source text,
  utm_medium text,
  utm_campaign text
);

create table if not exists public.sorteio_entries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  phone_digits text not null unique,
  raffle_number integer not null unique,
  created_at timestamptz not null default now(),
  check (raffle_number between 1 and 1000)
);

create index if not exists click_events_page_key_clicked_at_idx
  on public.click_events (page_key, clicked_at desc);

create index if not exists click_events_link_id_clicked_at_idx
  on public.click_events (link_id, clicked_at desc);

create index if not exists link_bio_links_position_idx
  on public.link_bio_links (position, active);

create index if not exists sorteio_entries_created_at_idx
  on public.sorteio_entries (created_at desc);

insert into public.link_bio_links (
  id,
  label,
  url,
  position,
  active,
  opens_new_tab
) values
  (
    'bio_pack_estampas_000001',
    'Pack de Estampas — Copo Americano',
    'https://docs.google.com/forms/d/e/1FAIpQLScCgrwWMDRFSJTb3AVYzRZDfrNIgO0eKPfLpVJHn3UsCTRItw/viewform?usp=publish-editor',
    1,
    true,
    true
  ),
  (
    'bio_guia_destrave_000002',
    'Destrave suas vendas — Baixe agora',
    '/guia-destrave',
    2,
    true,
    false
  ),
  (
    'bio_produtos_shopee_000003',
    'Links — Produtos Shopee',
    'https://collshp.com/achadosbyninaalves?view=storefront',
    3,
    true,
    true
  ),
  (
    'bio_comunidade_destrave_whatsapp_000004',
    'Comunidade Destrave - WhatsApp',
    'https://chat.whatsapp.com/IWhvzBHzhjWBt1EI3rWWG4',
    4,
    true,
    true
  )
on conflict (id) do update set
  label = excluded.label,
  url = excluded.url,
  position = excluded.position,
  active = excluded.active,
  opens_new_tab = excluded.opens_new_tab;
