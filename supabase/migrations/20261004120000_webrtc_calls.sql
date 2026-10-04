-- Realtime-backed WebRTC call invitations and authorization.
-- The ASP.NET API must mint Supabase JWTs with `sub` as auth.uid() and a
-- server-derived `call_targets` JSON array of authorized contact user UUIDs.

create table if not exists public.call_invites (
  id uuid primary key,
  caller_user_id uuid not null,
  target_user_id uuid not null,
  caller_name text not null default '',
  mode text not null check (mode in ('voice', 'video')),
  room_topic text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint call_invites_no_self_call check (caller_user_id <> target_user_id),
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

-- Channel topic `call-inbox:<user-id>` is readable only by that user.
-- Do not add broad/public policies that would expose call signaling payloads.
alter table realtime.messages enable row level security;

drop policy if exists "webrtc users receive own call inbox" on realtime.messages;
create policy "webrtc users receive own call inbox"
  on realtime.messages for select to authenticated
  using (
    split_part(realtime.topic(), ':', 1) = 'call-inbox'
    and split_part(realtime.topic(), ':', 2) = auth.uid()::text
  );

drop policy if exists "webrtc linked participants read call room" on realtime.messages;
create policy "webrtc linked participants read call room"
  on realtime.messages for select to authenticated
  using (
    split_part(realtime.topic(), ':', 1) = 'call-room'
    and split_part(realtime.topic(), ':', 4) <> ''
    and auth.uid()::text in (
      split_part(realtime.topic(), ':', 2),
      split_part(realtime.topic(), ':', 3)
    )
    and (auth.jwt() -> 'call_targets') ? (
      case
        when auth.uid()::text = split_part(realtime.topic(), ':', 2)
          then split_part(realtime.topic(), ':', 3)
        else split_part(realtime.topic(), ':', 2)
      end
    )
  );

drop policy if exists "webrtc linked participants send call room signals" on realtime.messages;
create policy "webrtc linked participants send call room signals"
  on realtime.messages for insert to authenticated
  with check (
    split_part(realtime.topic(), ':', 1) = 'call-room'
    and split_part(realtime.topic(), ':', 4) <> ''
    and auth.uid()::text in (
      split_part(realtime.topic(), ':', 2),
      split_part(realtime.topic(), ':', 3)
    )
    and (auth.jwt() -> 'call_targets') ? (
      case
        when auth.uid()::text = split_part(realtime.topic(), ':', 2)
          then split_part(realtime.topic(), ':', 3)
        else split_part(realtime.topic(), ':', 2)
      end
    )
  );

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
