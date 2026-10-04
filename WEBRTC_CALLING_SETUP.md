# WebRTC voice and video calls

The browser uses native `RTCPeerConnection` for media and Supabase Realtime for call invitations and SDP/ICE signaling. Supabase transports signaling only; audio/video flows peer-to-peer. There is no Jitsi or managed calling provider in this flow.

## Frontend setup

Set these in local development and Vercel:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<public-anon-key>
```

The anon key is public by design. **Never** put the Supabase service-role key or JWT signing secret in a `NEXT_PUBLIC_*` variable. The frontend also needs the existing `NEXT_PUBLIC_API_BASE_URL` and an authenticated app session.

## Required ASP.NET Core endpoint

Implement `POST /api/calls/realtime-token` on the existing API. It must:

1. Authenticate the current SE ONE session and resolve the ASP.NET identity user ID.
2. Return a short-lived Supabase-compatible access token (around 15 minutes) signed server-side with the Supabase project's configured JWT signing key. Claims must include `sub` = the same UUID as the Supabase `auth.uid()`, `role` = `authenticated`, `aud` = `authenticated`, `exp`, and a top-level `call_targets` JSON array of identity user IDs this user is entitled to call.
3. Compute `call_targets` from actual student/teacher relations (for example shared active enrolment, class or booking), not values supplied by the browser. Do not include arbitrary users.
4. Return optional ICE configuration for deployments using TURN.

Example response:

```json
{
  "accessToken": "<short-lived-supabase-jwt>",
  "expiresAt": "2026-10-04T12:15:00Z",
  "iceServers": [
    { "urls": "stun:stun.l.google.com:19302" },
    {
      "urls": "turn:turn.example.com:3478",
      "username": "<short-lived-user>",
      "credential": "<short-lived-credential>"
    }
  ]
}
```

Mint the JWT only after validating the app session. Keep the Supabase signing key and TURN shared secret on the backend. For broad network compatibility, deploy a self-hosted coturn server or equivalent TURN relay and return temporary credentials. The built-in STUN fallback is suitable for development but will not connect every NAT/firewall combination.

## Supabase schema and access policies

The migration at [20261004120000_webrtc_calls.sql](supabase/migrations/20261004120000_webrtc_calls.sql) creates the expiring invitation table, enables RLS, restricts inbox and peer-room access, and adds the table to the Realtime publication. Apply it to the Supabase project before enabling calls. Adjust UUID types only if the ASP.NET identity IDs use another format.

```sql
create table if not exists public.call_invites (
  id uuid primary key,
  caller_user_id uuid not null,
  target_user_id uuid not null,
  caller_name text not null default '',
  mode text not null check (mode in ('voice', 'video')),
  room_topic text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

alter table public.call_invites enable row level security;
grant select, insert, delete on public.call_invites to authenticated;

create policy "call invite target can receive"
on public.call_invites for select to authenticated
using (
  target_user_id = auth.uid()
  and (auth.jwt() -> 'call_targets') ? caller_user_id::text
);

create policy "linked caller can create call invite"
on public.call_invites for insert to authenticated
with check (
  caller_user_id = auth.uid()
  and target_user_id <> auth.uid()
  and (auth.jwt() -> 'call_targets') ? target_user_id::text
  and expires_at > now()
  and room_topic = 'call-room:' || caller_user_id::text || ':' || target_user_id::text || ':' || id::text
);

create policy "call participants can delete expired or finished invite"
on public.call_invites for delete to authenticated
using (caller_user_id = auth.uid() or target_user_id = auth.uid());
```

Enable `public.call_invites` in the `supabase_realtime` publication from the Supabase dashboard or SQL editor. Add policies to `realtime.messages` so only a user can join their own private inbox and only either endpoint of a pair can join/send on the pair's private call room. The call room topic format is `call-room:<caller-user-id>:<callee-user-id>:<call-uuid>`.

Example policy expressions (adapt/verify with the project's Supabase version and test as both roles):

```sql
create policy "user can receive own call inbox"
on realtime.messages for select to authenticated
using (
  split_part(realtime.topic(), ':', 1) = 'call-inbox'
  and split_part(realtime.topic(), ':', 2) = auth.uid()::text
);

create policy "linked call participants can read room signals"
on realtime.messages for select to authenticated
using (
  split_part(realtime.topic(), ':', 1) = 'call-room'
  and auth.uid()::text in (
    split_part(realtime.topic(), ':', 2),
    split_part(realtime.topic(), ':', 3)
  )
  and (auth.jwt() -> 'call_targets') ? case
    when auth.uid()::text = split_part(realtime.topic(), ':', 2)
      then split_part(realtime.topic(), ':', 3)
    else split_part(realtime.topic(), ':', 2)
  end
);

create policy "linked call participants can send room signals"
on realtime.messages for insert to authenticated
with check (
  split_part(realtime.topic(), ':', 1) = 'call-room'
  and auth.uid()::text in (
    split_part(realtime.topic(), ':', 2),
    split_part(realtime.topic(), ':', 3)
  )
  and (auth.jwt() -> 'call_targets') ? case
    when auth.uid()::text = split_part(realtime.topic(), ':', 2)
      then split_part(realtime.topic(), ':', 3)
    else split_part(realtime.topic(), ':', 2)
  end
);
```

The `call-inbox:<target-user-id>` channel is used for database-change subscription only. RLS on `call_invites` ensures only the target can read an invitation; the caller can insert only for a user in the server-signed `call_targets` claim. Keep invitations short-lived and periodically delete expired rows. Private Broadcast RLS is essential; do not use public channels for calls.

## Existing profile API data

- Public `GET /api/teachers` items must expose `userId` (the ASP.NET identity ID) in addition to the teacher profile `id`; the student dashboard disables call actions if the ID is absent.
- `GET /api/teacher/dashboard/students` already supplies `studentId`; it must be the same identity UUID used in Supabase JWT `sub`.
- `POST /api/calls/realtime-token` should authorize these contact relationships. The call invitation RLS independently checks the signed `call_targets` claim.

## Call lifecycle

1. Caller requests media, opens a private call-room Broadcast channel, and inserts a short-lived `call_invites` row.
2. The receiver listens only to their own invitation rows and is shown Accept/Reject UI.
3. Both endpoints join the private room; Broadcast carries accept/reject/end, SDP offer/answer, and ICE candidates.
4. WebRTC connects the audio/video tracks. Mic, camera, reject, hangup, ring timeout, permissions, and connection failures are handled in the browser. On a network interruption the UI shows Disconnected; the initiating peer tries up to two ICE restarts before ending the call.

Calls require HTTPS (Vercel provides this) or `localhost` for `getUserMedia`. If the API token endpoint, Supabase RLS/publication, and URL/key are not configured, call buttons remain present but signaling cannot start; expose this setup before enabling production calls.
