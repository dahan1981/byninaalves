create extension if not exists pgcrypto;

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

create index if not exists click_events_page_key_clicked_at_idx
  on public.click_events (page_key, clicked_at desc);

create index if not exists click_events_link_id_clicked_at_idx
  on public.click_events (link_id, clicked_at desc);
