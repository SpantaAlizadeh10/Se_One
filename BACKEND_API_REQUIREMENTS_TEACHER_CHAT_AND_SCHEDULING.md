# Backend API requirements: teacher group chat and class scheduling

The frontend is wired to the endpoints and payloads below. The API must persist
these records in the application's existing database and derive the caller's
identity and permissions from the authenticated token/session. Do not trust
teacher IDs, roles, names, enrollment counts, or announcement permissions from
request bodies.

## 1. Teacher group chat

Create one persistent group for the academy's approved teachers. Approved
teachers are members automatically; no teacher-to-teacher invitation or
one-to-one conversation is part of this feature. Admins can read and post to
the same group.

The existing private-conversation API must not allow teachers to create or
continue teacher-to-teacher one-to-one conversations. Keep student/teacher
messaging behavior unchanged where it is already supported.

### `GET /api/teacher-group-chat/messages?limit=200`

- Allowed to approved teachers and admins.
- Return up to the latest 200 messages in chronological (oldest-first) order.
- Response may be an array or `{ "items": [...] }`.

```json
{
  "items": [
    {
      "id": "message-id",
      "senderId": "user-id",
      "senderName": "Teacher Name",
      "senderRole": "teacher",
      "content": "Message text",
      "createdAt": "2026-11-08T12:30:00Z",
      "isAnnouncement": false
    }
  ]
}
```

### `POST /api/teacher-group-chat/messages`

- Allowed to approved teachers and admins.
- Request: `{ "content": "Message text", "isAnnouncement": false }`.
- Trim and validate non-empty content; maximum 5,000 characters.
- Only an authenticated admin may set `isAnnouncement: true`; reject unauthorized
  attempts with 403.
- Derive sender ID/name/role and timestamp on the server. Return the created
  message in the same shape as the GET item.
- Group messages are visible to all approved teachers and admins.
- Add approved teachers to the group automatically when their account is
  approved; pending, rejected, and suspended accounts are not members.

## 2. Availability-matched course assignment

The existing teacher editor uses:

- `GET /api/teacher/availability`
- `PUT /api/teacher/availability` with
  `{ "timeZone": "Asia/Tehran", "slots": [{ "id": "...", "dayOfWeek": "Monday", "startTime": "09:00", "endTime": "10:00" }] }`

Store the time zone and availability against the authenticated teacher. Class
slot creation includes an IANA `timeZone`; match recurring local availability to
the scheduled class by converting both values to a common instant. Admins need
read access to approved teachers' saved availability through the assignment
endpoints below.

### Existing class-slot creation/list endpoints

- `POST /api/admin/class-slots` remains admin-only. Accept
  `courseId`, `title`, `description`, `level`, `classType`, `teacherRole`,
  `capacity` (positive integer), `startsAt`, `endsAt`, and IANA `timeZone`.
- Do not impose a hard-coded class capacity of 10 for public classes or 1–2 for
  private classes; use the admin-selected capacity.
- `GET /api/admin/class-slots` returns the persisted slots, their course/level,
  active enrollment count, remaining seats, and assignment records.
- `GET /api/teacher/class-slots` returns the authenticated teacher's assigned
  slots with confirmed admin assignments only. Do not return open class slots,
  teacher availability, or unassigned courses as teacher classes. The teacher
  Classes page and dashboard upcoming-class card use this persisted data.
- `GET /api/teacher/dashboard/overview` must calculate upcoming classes from
  confirmed assignments and persisted class sessions.

Teachers submit availability only; they do not request or accept class slots.
The admin selects a suitable teacher and creates the confirmed assignment.
The teacher dashboard must not expose a teacher class-request endpoint or
"request to teach" action.

### `GET /api/admin/class-slots/{slotId}/available-teachers`

- Admin-only.
- Return only approved, non-suspended teachers whose submitted recurring
  availability overlaps this slot's day and time and who have no conflicting
  confirmed assignment.
- Include a human-readable `matchedAvailability` value for the admin UI.

```json
{
  "items": [
    {
      "id": "teacher-id",
      "name": "Teacher Name",
      "teachingLanguage": "english",
      "subject": "English",
      "matchedAvailability": "Monday, 09:00–10:00"
    }
  ]
}
```

### `POST /api/admin/class-slot-assignments`

- Admin-only.
- Request: `{ "slotId": "slot-id", "teacherId": "teacher-id" }`.
- In one transaction, confirm the assignment only if the teacher is approved,
  the availability still matches, the slot is assignable, and there is no
  conflicting confirmed class. Re-check all conditions at write time.
- Return `{ "id", "slotId", "teacherId", "teacherName", "status": "confirmed", "selectedAt" }`.
- Prevent duplicate active assignments for the same teacher and slot.
- A confirmed assignment immediately makes the class visible in that teacher's
  Classes view and upcoming schedule; it must not grant access to unassigned
  classes.

## 3. Student enrollment and capacity

Keep the existing `POST /api/student/class-slots/{assignmentId}/enroll`
endpoint. It must atomically:

1. Verify the assignment is confirmed and the class is open.
2. Count active/confirmed enrollments from the database, not the client.
3. Reject enrollment if capacity is reached or the student is already enrolled.
4. Insert the enrollment and make subsequent class/admin/student responses
   return updated `enrolledCount` and `remainingSeats`.

Cancellation must release capacity according to the existing enrollment policy.
The client must never write enrollment totals directly.

## 4. Authorization and persistence

- Teacher routes use the authenticated user ID; never accept a caller-selected
  teacher ID for availability, classes, or group chat.
- Pending/rejected/suspended teachers must receive 403 from teacher teaching
  routes and must not be returned by available-teacher queries.
- Admin routes require the server-side admin role, not the client-side admin UI
  flag.
- Persist group messages, teacher availability, class slots, assignments, and
  enrollments in the existing database. Enforce referential integrity and
  transaction/concurrency safety for assignment and capacity updates.
- Return consistent JSON casing/fields compatible with the examples above;
  the frontend accepts PascalCase or camelCase for normalized records.

## 5. Frontend routes wired to this contract

- Teacher group chat: `/teacher/messages`
- Admin group chat and announcements: `/admin/messages`
- Teacher availability: `/teacher/availability`
- Admin course/class creation and scheduling: `/admin/courses` and
  `/admin/class-scheduling`
- Teacher assigned classes: `/teacher/classes` and the teacher dashboard
- Student class enrollment: existing student class browsing flow
