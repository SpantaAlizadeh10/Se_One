# Backend requirements: class groups, filters, and recordings

The frontend now provides a group chat for each booked class and a student resource area. These are backed by the existing class-scheduling and classroom APIs, but require the server behavior and fields below. The frontend repository does not contain the production database or API implementation.

## Booking confirmation and class groups

Create one persistent class group after a student's reservation is confirmed (including payment approval, when payment is required):

- A public/group class has one shared group for its assigned teacher and all active student enrollments.
- A private class has a group for its assigned teacher and the booked student.
- Do not create duplicate groups for the same class assignment.
- Cancelled or unpaid reservations must not grant access. Revoke group access if an enrollment is cancelled.
- Group membership and capacity are determined server-side from the teacher assignment and active enrollments.

Include `classGroupId` in the relevant items returned by `GET /api/student/class-slots` for enrolled students and `GET /api/teacher/class-slots` for assigned teachers. This lets the student and teacher dashboards link to the same group.

## Class group endpoints

These authenticated endpoints are used by both the enrolled student and assigned teacher. Every request must verify group membership; a client-provided group ID is not authorization.

### `GET /api/class-groups/{groupId}`

Return group metadata:

```json
{
  "id": "group-id",
  "title": "B1 Conversation · Fall 2026",
  "teacherName": "Teacher Name",
  "memberCount": 8
}
```

### `GET /api/class-groups/{groupId}/messages?limit=200`

Return the group's messages ordered chronologically, including sender display name, sender role, content, and server timestamp.

### `POST /api/class-groups/{groupId}/messages`

Accept `{ "content": "..." }`. Derive sender identity and role from the authenticated session, validate message length, persist the message, and return the created message. Students and the assigned teacher can send to the entire class group; do not expose private one-to-one delivery through this class chat.

## Course term and language filters

The class-booking filters use term and language metadata from course records, with optional class-slot overrides. Include these optional fields in `GET /api/courses` and/or `GET /api/student/class-slots`:

```json
{
  "term": "Fall 2026",
  "language": "English"
}
```

The frontend also filters by class type, English level, instructor, and available seat count. Continue returning authoritative `capacity`, `enrolledCount`, and `remainingSeats`; enforce capacity again when enrolling.

## Adobe Connect classroom resources

No Adobe Connect recording API integration is required. Teachers or authorized staff add the Adobe Connect recording URL; students open that URL from the resources area.

- Keep `GET /api/classrooms/sessions` scoped to sessions the authenticated user is authorized to see. For students, only return sessions belonging to their active class enrollments; for teachers, only their assigned classes.
- Include `courseId`, `courseTitle`, `teacherName`, session status and time, `recordingUrl`, and materials with secure `downloadUrl` values.
- `PATCH /api/classrooms/sessions/{sessionId}` must allow an authorized teacher or admin to save/clear `recordingUrl`, validate that it is HTTPS, and return the updated session.
- Continue enforcing access through the existing `/join` endpoint for live Adobe Connect meetings. Recording and material URLs must not expose another student's or class's private files.

The student UI displays session recordings, class files, and notes under **Class Resources**. Completed class cards link to the matching course resources.
