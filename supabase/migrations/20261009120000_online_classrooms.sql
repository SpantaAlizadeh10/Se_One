-- Provider-neutral online classroom sessions and persistent course files.
-- User/course IDs are issued and validated by the ASP.NET Core application.
-- Supabase JWTs must carry sub (identity UUID) and role (student/teacher/admin).

create table if not exists public.classroom_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id text not null,
  teacher_id uuid not null,
  scheduled_at timestamptz not null,
  duration integer not null check (duration between 1 and 1440),
  status text not null default 'scheduled'
    check (status in ('scheduled', 'ongoing', 'completed', 'cancelled')),
  provider text not null default 'adobe_connect',
  meeting_url text,
  recording_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint classroom_meeting_url_https check (
    meeting_url is null or meeting_url ~ '^https://'
  ),
  constraint classroom_recording_url_https check (
    recording_url is null or recording_url ~ '^https://'
  )
);

create index if not exists classroom_sessions_course_schedule_idx
  on public.classroom_sessions (course_id, scheduled_at desc);
create index if not exists classroom_sessions_teacher_schedule_idx
  on public.classroom_sessions (teacher_id, scheduled_at desc);

create table if not exists public.classroom_session_students (
  session_id uuid not null references public.classroom_sessions(id) on delete cascade,
  student_id uuid not null,
  primary key (session_id, student_id)
);
create index if not exists classroom_session_students_student_idx
  on public.classroom_session_students (student_id, session_id);

create table if not exists public.classroom_attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.classroom_sessions(id) on delete cascade,
  student_id uuid not null,
  status text not null default 'present'
    check (status in ('present', 'late', 'absent')),
  joined_at timestamptz,
  left_at timestamptz,
  source text not null default 'se_one'
    check (source in ('se_one', 'adobe_connect')),
  created_at timestamptz not null default now(),
  unique (session_id, student_id)
);

create table if not exists public.classroom_files (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.classroom_sessions(id) on delete cascade,
  uploaded_by uuid not null,
  category text not null check (category in ('course_material', 'homework', 'submission')),
  storage_bucket text not null default 'se-one-course-files',
  storage_path text not null unique,
  file_name text not null,
  content_type text not null default 'application/octet-stream',
  size_bytes bigint not null check (size_bytes >= 0),
  created_at timestamptz not null default now()
);
create index if not exists classroom_files_session_created_idx
  on public.classroom_files (session_id, created_at desc);

-- SECURITY DEFINER avoids recursive RLS evaluation between sessions and roster.
create or replace function public.is_classroom_teacher(
  target_session_id uuid,
  target_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.classroom_sessions cs
    where cs.id = target_session_id and cs.teacher_id = target_user_id
  );
$$;

create or replace function public.is_classroom_student(
  target_session_id uuid,
  target_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.classroom_session_students css
    where css.session_id = target_session_id and css.student_id = target_user_id
  );
$$;

revoke all on function public.is_classroom_teacher(uuid, uuid) from public;
revoke all on function public.is_classroom_student(uuid, uuid) from public;
grant execute on function public.is_classroom_teacher(uuid, uuid) to authenticated;
grant execute on function public.is_classroom_student(uuid, uuid) to authenticated;

-- SECURITY DEFINER avoids recursive RLS evaluation between sessions and roster.
create or replace function public.is_classroom_teacher(
  target_session_id uuid,
  target_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.classroom_sessions cs
    where cs.id = target_session_id and cs.teacher_id = target_user_id
  );
$$;

create or replace function public.is_classroom_student(
  target_session_id uuid,
  target_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.classroom_session_students css
    where css.session_id = target_session_id and css.student_id = target_user_id
  );
$$;

revoke all on function public.is_classroom_teacher(uuid, uuid) from public;
revoke all on function public.is_classroom_student(uuid, uuid) from public;
grant execute on function public.is_classroom_teacher(uuid, uuid) to authenticated;
grant execute on function public.is_classroom_student(uuid, uuid) to authenticated;

alter table public.classroom_sessions enable row level security;
alter table public.classroom_session_students enable row level security;
alter table public.classroom_attendance enable row level security;
alter table public.classroom_files enable row level security;

grant select, insert, update, delete on public.classroom_sessions to authenticated;
grant select, insert, update, delete on public.classroom_session_students to authenticated;
grant select, insert, update on public.classroom_attendance to authenticated;
grant select, insert, delete on public.classroom_files to authenticated;

create policy "classroom sessions readable by class participants"
  on public.classroom_sessions for select to authenticated
  using (
    teacher_id = auth.uid()
    or coalesce(auth.jwt() ->> 'role', '') = 'admin'
      or public.is_classroom_student(id, auth.uid())
  );
create policy "teachers create their sessions"
  on public.classroom_sessions for insert to authenticated
  with check (
    teacher_id = auth.uid()
    and coalesce(auth.jwt() ->> 'role', '') = 'teacher'
  );
create policy "teachers update their sessions"
  on public.classroom_sessions for update to authenticated
  using (
    teacher_id = auth.uid()
    or coalesce(auth.jwt() ->> 'role', '') = 'admin'
  )
  with check (
    teacher_id = auth.uid()
    or coalesce(auth.jwt() ->> 'role', '') = 'admin'
  );
create policy "teachers or admins delete sessions"
  on public.classroom_sessions for delete to authenticated
  using (
    teacher_id = auth.uid()
    or coalesce(auth.jwt() ->> 'role', '') = 'admin'
  );

create policy "students read own classroom links"
  on public.classroom_session_students for select to authenticated
  using (
    student_id = auth.uid()
    or exists (
      select 1 from public.classroom_sessions cs
      where cs.id = session_id and cs.teacher_id = auth.uid()
    )
    or coalesce(auth.jwt() ->> 'role', '') = 'admin'
  );
create policy "teachers manage class roster"
  on public.classroom_session_students for all to authenticated
  using (
    exists (
      select 1 from public.classroom_sessions cs
      where cs.id = session_id and cs.teacher_id = auth.uid()
    )
    or coalesce(auth.jwt() ->> 'role', '') = 'admin'
  )
  with check (
    exists (
      select 1 from public.classroom_sessions cs
      where cs.id = session_id and cs.teacher_id = auth.uid()
    )
    or coalesce(auth.jwt() ->> 'role', '') = 'admin'
  );

create policy "attendance visible to student and class teacher"
  on public.classroom_attendance for select to authenticated
  using (
    student_id = auth.uid()
    or exists (
      select 1 from public.classroom_sessions cs
      where cs.id = session_id and cs.teacher_id = auth.uid()
    )
    or coalesce(auth.jwt() ->> 'role', '') = 'admin'
  );
create policy "student marks own attendance"
  on public.classroom_attendance for insert to authenticated
  with check (
    student_id = auth.uid()
    and exists (
      select 1 from public.classroom_session_students css
      where css.session_id = session_id and css.student_id = auth.uid()
    )
  );
create policy "teachers update classroom attendance"
  on public.classroom_attendance for update to authenticated
  using (
    exists (
      select 1 from public.classroom_sessions cs
      where cs.id = session_id and cs.teacher_id = auth.uid()
    )
    or coalesce(auth.jwt() ->> 'role', '') = 'admin'
  )
  with check (
    exists (
      select 1 from public.classroom_sessions cs
      where cs.id = session_id and cs.teacher_id = auth.uid()
    )
    or coalesce(auth.jwt() ->> 'role', '') = 'admin'
  );

create policy "classroom files visible to participants"
  on public.classroom_files for select to authenticated
  using (
    exists (
      select 1 from public.classroom_sessions cs
      where cs.id = session_id
        and (
          cs.teacher_id = auth.uid()
          or exists (
            select 1 from public.classroom_session_students css
            where css.session_id = cs.id and css.student_id = auth.uid()
          )
        )
    )
    or coalesce(auth.jwt() ->> 'role', '') = 'admin'
  );
create policy "teachers add materials and homework"
  on public.classroom_files for insert to authenticated
  with check (
    uploaded_by = auth.uid()
    and category in ('course_material', 'homework')
    and exists (
      select 1 from public.classroom_sessions cs
      where cs.id = session_id and cs.teacher_id = auth.uid()
    )
  );
create policy "students submit class homework"
  on public.classroom_files for insert to authenticated
  with check (
    uploaded_by = auth.uid()
    and category = 'submission'
    and exists (
      select 1 from public.classroom_session_students css
      where css.session_id = session_id and css.student_id = auth.uid()
    )
  );
create policy "teachers or owner delete classroom files"
  on public.classroom_files for delete to authenticated
  using (
    uploaded_by = auth.uid()
    or exists (
      select 1 from public.classroom_sessions cs
      where cs.id = session_id and cs.teacher_id = auth.uid()
    )
    or coalesce(auth.jwt() ->> 'role', '') = 'admin'
  );

insert into storage.buckets (id, name, public, file_size_limit)
values ('se-one-course-files', 'se-one-course-files', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = 52428800;

-- Storage object names use: <course-id>/<session-id>/<category>/<opaque-file-name>.
-- Signed upload grants should be created only after API-side identity and category checks.
create policy "classroom files readable by session participants"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'se-one-course-files'
    and exists (
      select 1 from public.classroom_sessions cs
      where cs.id::text = split_part(name, '/', 2)
        and (
          cs.teacher_id = auth.uid()
          or exists (
            select 1 from public.classroom_session_students css
            where css.session_id = cs.id and css.student_id = auth.uid()
          )
        )
    )
  );
create policy "classroom file uploads limited to authorized sessions"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'se-one-course-files'
    and exists (
      select 1 from public.classroom_sessions cs
      where cs.id::text = split_part(name, '/', 2)
        and (
          cs.teacher_id = auth.uid()
          or exists (
            select 1 from public.classroom_session_students css
            where css.session_id = cs.id and css.student_id = auth.uid()
          )
        )
    )
  );

-- Retire the legacy call signaling relation and its Realtime channel policies.
drop policy if exists "webrtc users receive own call inbox" on realtime.messages;
drop policy if exists "webrtc linked participants read call room" on realtime.messages;
drop policy if exists "webrtc linked participants send call room signals" on realtime.messages;
drop policy if exists "call invite target can receive" on public.call_invites;
drop policy if exists "linked caller can create call invite" on public.call_invites;
drop policy if exists "call participants can delete expired or finished invite" on public.call_invites;

do $$
begin
  if exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'call_invites'
  ) then
    alter publication supabase_realtime drop table public.call_invites;
  end if;
end
$$;

drop table if exists public.call_invites;
