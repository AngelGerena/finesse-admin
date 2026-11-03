-- Project intake form (finessemedia.pro/start)
-- Run once in the Supabase SQL Editor for the FinesseMediaPro project.

create table if not exists public.intake_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'new',
  lang text not null default 'en',
  full_name text not null,
  business_name text,
  email text not null,
  phone text,
  client_slug text,
  answers jsonb not null default '{}'::jsonb,
  still_needed text[] not null default '{}',
  files jsonb not null default '[]'::jsonb,
  deposit_ack boolean not null default false,
  lead_id uuid,
  notes text,
  deleted_at timestamptz
);
create index if not exists intake_submissions_created_idx on public.intake_submissions (created_at desc);
create index if not exists intake_submissions_email_idx on public.intake_submissions (lower(email), created_at desc);

-- Only the admin can read or change submissions.
-- The public form writes through the intake-submit edge function (service role), so no public policy is needed.
alter table public.intake_submissions enable row level security;
drop policy if exists admin_all_intake on public.intake_submissions;
create policy admin_all_intake on public.intake_submissions
  for all using (public.is_admin()) with check (public.is_admin());

-- Private bucket for client uploads (logos, product photos, videos). 25 MB per file.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('intake-uploads', 'intake-uploads', false, 26214400,
  array['image/png','image/jpeg','image/webp','image/gif','image/svg+xml','image/heic','image/heif',
        'application/pdf','application/postscript','application/illustrator','application/octet-stream',
        'video/mp4','video/quicktime'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists intake_uploads_admin_read on storage.objects;
create policy intake_uploads_admin_read on storage.objects
  for select to authenticated
  using (bucket_id = 'intake-uploads' and public.is_admin());
