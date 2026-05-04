-- =====================================================
-- AegisAI Database Schema
-- Run this in Supabase SQL Editor (SQL > New query)
-- =====================================================

-- Enable UUID extension (Supabase usually has this on by default)
create extension if not exists "uuid-ossp";

-- =====================================================
-- Table: blocklist
-- Stores domains the user manually blocks
-- =====================================================
create table if not exists public.blocklist (
    id uuid primary key default uuid_generate_v4(),
    domain text not null unique,
    user_id uuid null,                -- optional: for multi-user support later
    created_at timestamptz not null default now()
);

create index if not exists idx_blocklist_domain on public.blocklist (domain);

-- =====================================================
-- Table: url_logs
-- Stores every URL check the extension performs
-- =====================================================
create table if not exists public.url_logs (
    id uuid primary key default uuid_generate_v4(),
    url text not null,
    domain text not null,
    status text not null check (status in ('safe', 'blocked', 'phishing', 'malicious', 'error')),
    reason text,
    confidence numeric(5,4),          -- AI confidence score 0.0000 - 1.0000
    user_id uuid null,
    timestamp timestamptz not null default now()
);

create index if not exists idx_url_logs_domain on public.url_logs (domain);
create index if not exists idx_url_logs_status on public.url_logs (status);
create index if not exists idx_url_logs_timestamp on public.url_logs (timestamp desc);

-- =====================================================
-- Row Level Security (recommended for production)
-- For local dev with the service_role key, RLS is bypassed.
-- Enable later when you add real auth.
-- =====================================================
-- alter table public.blocklist enable row level security;
-- alter table public.url_logs enable row level security;

-- =====================================================
-- Optional: seed a few known-bad domains for demo
-- =====================================================
insert into public.blocklist (domain) values
    ('example-malware.test'),
    ('phishing-demo.test')
on conflict (domain) do nothing;
