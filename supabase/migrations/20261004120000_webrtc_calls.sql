-- Realtime-backed WebRTC call invitations and authorization.
-- The ASP.NET API must mint Supabase JWTs with `sub` as auth.uid() and a
-- server-derived `call_targets` JSON array of authorized contact user UUIDs.

create extension if not exists pgcrypto;

create table if not exists public.call_invites (
  id uuid primary key default gen_random_uuid(),
  caller_user_id uuid not null,
  target_user_id uuid not null,
  caller_name text not null default '',
  mode text not null check (mode in ('voice', 'video')),
  room_topic text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint call_invites_no_self_call check (caller_user_id <> target_user_id),
  constraint call_invites_expiry_after_created check (expires_at > created_at),
  constraint call_invites_room_matches_participants check (
    room_topic = 'call-room:' || caller_user_id::text || ':' || target_user_id::text || ':' || id::text
  )
);

create index if not exists call_invites_target_expiry_idx
  on public.call_invites (target_user_id, expires_at desc);

alter table public.call_invites enable row level security;
grant select, insert, delete on public.call_invites to authenticated;

drop policy if exists "call invite target can receive" on public.call_invites;
create policy "call invite target can receive"
  on public.call_invites for select to authenticated
  using (
    target_user_id = auth.uid()
    and (auth.jwt() -> 'call_targets') ? caller_user_id::text
  );

drop policy if exists "linked caller can create call invite" on public.call_invites;
create policy "linked caller can create call invite"
  on public.call_invites for insert to authenticated
  with check (
    caller_user_id = auth.uid()
    and target_user_id <> auth.uid()
    and (auth.jwt() -> 'call_targets') ? target_user_id::text
    and expires_at > now()
  );

drop policy if exists "call participants can delete expired or finished invite" on public.call_invites;
create policy "call participants can delete expired or finished invite"
  on public.call_invites for delete to authenticated
  using (caller_user_id = auth.uid() or target_user_id = auth.uid());

-- The Realtime internal table is managed by Supabase itself.
-- Project-level SQL runners do not have permission to alter its ownership or
-- Realtime policies, so the app-level migration only creates the invite table
-- and its access rules. The secure channel policy should be configured in the
-- Supabase project-level Realtime settings, not via a normal SQL migration.

-- Add call invitations to Supabase's Realtime publication for Postgres Changes.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'call_invites'
  ) then
    alter publication supabase_realtime add table public.call_invites;
  end if;
end
$$;
