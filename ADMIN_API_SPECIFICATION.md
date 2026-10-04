# Admin API Specification (ASP.NET Core)

This document defines **`/api/admin/*`** endpoints for the C# backend. The admin panel uses them to manage:

1. **Public site** — courses, pricing/discounts, blog, site settings
2. **Student dashboard data** — student accounts, enrollments, progress, account status
3. **Teacher dashboard data** — teacher profiles, approval workflow, availability, assigned students

All admin routes require an authenticated user with role **`Admin`**. Return **403 Forbidden** for other roles.

## Relationship to existing APIs

| Audience           | Base path                                                 | Who calls it      |
| ------------------ | --------------------------------------------------------- | ----------------- |
| Public / marketing | `/api/courses`, `/api/blog`, `/api/teachers`              | Website visitors  |
| Student            | `/api/enrollment/*`, `/api/progress/*`, `/api/learning/*` | Student dashboard |
| Teacher            | `/api/teacher/*` (see below)                              | Teacher dashboard |
| Admin              | `/api/admin/*`                                            | Admin panel       |

Student and teacher dashboards keep using their own endpoints. Admin endpoints **read and override** the same underlying entities (users, courses, enrollments) without replacing student/teacher APIs.

## Authentication

**Recommended:** Admin logs in via existing `POST /api/auth/login` with a user whose `role` is `Admin`. No separate demo password in the frontend.

Optional dedicated route (same response shape as login):

- `POST /api/admin/auth/login` — `{ "email", "password" }` → `AuthResponse` (reject if role ≠ Admin)

Every admin request:

- Cookie auth and/or `Authorization: Bearer {token}` (same as `lib/api/client.ts`)

### ASP.NET Core authorization example

```csharp
[ApiController]
[Route("api/admin/[controller]")]
[Authorize(Roles = "Admin")]
public class StudentsController : ControllerBase { }
```

Register policy if you use claims instead of roles:

```csharp
options.AddPolicy("AdminOnly", p => p.RequireRole("Admin"));
```

## Common conventions

### Pagination (list endpoints)

Query: `page` (default 1), `pageSize` (default 20, max 100), `search`, optional `status`.

Response:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 20,
  "totalCount": 142,
  "totalPages": 8
}
```

Frontend accepts a bare array **or** this shape (see `lib/api/admin.ts`).

### User account status

Used for students (and optionally teachers):

| Value       | Meaning                                  |
| ----------- | ---------------------------------------- |
| `active`    | Full access to dashboard                 |
| `suspended` | Read-only or limited login (your choice) |
| `banned`    | Cannot log in                            |

Teacher-specific workflow status:

| Value       | Meaning                            |
| ----------- | ---------------------------------- |
| `pending`   | Awaiting admin approval            |
| `active`    | Listed on site + teacher dashboard |
| `suspended` | Hidden / no new bookings           |

### Errors

Same as `API_SPECIFICATION.md` (400, 401, 403, 404, ProblemDetails).

---

## 1. Dashboard

### GET /api/admin/dashboard/stats

Overview cards for admin home.

**Response:**

```json
{
  "studentsCount": 120,
  "teachersCount": 18,
  "coursesCount": 12,
  "activeDiscountsCount": 3,
  "publishedBlogPostsCount": 24,
  "activeEnrollmentsCount": 340,
  "pendingTeachersCount": 2
}
```

---

## 2. Site — courses & pricing

Public course list stays `GET /api/courses`. Admin manages **pricing and discounts** persisted in the database (replaces frontend `localStorage`).

### GET /api/admin/courses

All courses with admin pricing fields.

**Response item:**

```json
{
  "id": "course-id",
  "title": "English for Beginners",
  "level": "A1 - A2",
  "basePrice": 990000,
  "currency": "IRR",
  "discountPercent": 15,
  "isPublished": true,
  "studentCount": 150,
  "lessonCount": 12
}
```

### PATCH /api/admin/courses/{courseId}

Update publish flag and/or metadata (not student-facing lesson content if you prefer separate CMS).

**Request (partial):**

```json
{
  "title": "Updated title",
  "isPublished": true
}
```

### PATCH /api/admin/courses/{courseId}/pricing

**Request:**

```json
{
  "basePrice": 990000,
  "discountPercent": 20,
  "currency": "IRR"
}
```

**Response:** Updated course pricing object (same shape as list item).

### Course content (modules & lessons)

Admin can manage content used by **student learning flow**. Reuse the same DTOs as public APIs; require Admin role on write operations.

| Method | Path                                    | Purpose                        |
| ------ | --------------------------------------- | ------------------------------ |
| GET    | `/api/admin/courses/{courseId}/modules` | List modules                   |
| POST   | `/api/admin/courses/{courseId}/modules` | Create module                  |
| PATCH  | `/api/admin/modules/{moduleId}`         | Update module                  |
| DELETE | `/api/admin/modules/{moduleId}`         | Delete module                  |
| GET    | `/api/admin/modules/{moduleId}/lessons` | List lessons                   |
| POST   | `/api/admin/modules/{moduleId}/lessons` | Create lesson                  |
| PATCH  | `/api/admin/lessons/{lessonId}`         | Update lesson body, video URLs |
| DELETE | `/api/admin/lessons/{lessonId}`         | Delete lesson                  |

Alternatively, add `[Authorize(Roles = "Admin")]` to existing module/lesson POST/PATCH/DELETE on `/api/modules` and `/api/lessons` if you prefer one route tree.

---

## 3. Site — blog

Public: `GET /api/blog?lang={lang}` (published only).

### GET /api/admin/blog/posts

Query: `status` (`all` | `published` | `draft`), `search`, pagination.

**Response item:**

```json
{
  "id": "post-id",
  "title": "How to Master English",
  "excerpt": "...",
  "author": "Sarah Johnson",
  "category": "Learning Tips",
  "status": "published",
  "publishedAt": "2026-09-01T00:00:00Z",
  "readTimeMinutes": 8,
  "imageUrl": "/images/Study4.jpeg",
  "views": 1245,
  "lang": "en"
}
```

### POST /api/admin/blog/posts

Create draft or published post.

### GET /api/admin/blog/posts/{postId}

### PATCH /api/admin/blog/posts/{postId}

### DELETE /api/admin/blog/posts/{postId}

### PATCH /api/admin/blog/posts/{postId}/status

**Request:** `{ "status": "published" | "draft" }`

---

## 4. Site — settings

### GET /api/admin/settings

Platform settings (contact email, default language, maintenance mode, etc.).

```json
{
  "siteName": "SE ONE",
  "supportEmail": "support@seone.example",
  "defaultLocale": "fa",
  "maintenanceMode": false,
  "allowRegistration": true
}
```

### PATCH /api/admin/settings

Partial update of the same object.

---

## 5. Students (student dashboard management)

Maps to admin **Students** page and mirrors data shown in the student dashboard (enrollments, progress).

### GET /api/admin/students

Query: `search`, `status` (`active` | `suspended` | `banned`), pagination.

**Response item:**

```json
{
  "id": "user-id",
  "fullName": "Sepanta Rostami",
  "email": "sepanta@example.com",
  "avatarUrl": "https://...",
  "joinedAt": "2026-03-14T00:00:00Z",
  "status": "active",
  "coursesEnrolled": 3
}
```

### POST /api/admin/students

Create student user (ASP.NET Identity + role Student).

**Request:**

```json
{
  "fullName": "New Student",
  "email": "student@example.com",
  "password": "TemporaryPass123!",
  "sendWelcomeEmail": true
}
```

### GET /api/admin/students/{studentId}

Detail including optional summary stats.

### PATCH /api/admin/students/{studentId}

Update profile: `fullName`, `email`, `avatarUrl`.

### PATCH /api/admin/students/{studentId}/status

**Request:** `{ "status": "active" | "suspended" | "banned" }`

### DELETE /api/admin/students/{studentId}

Soft-delete recommended (`IsDeleted` flag); hard delete optional.

### GET /api/admin/students/{studentId}/enrollments

Same enrollment DTO as `GET /api/enrollment/user` but for any student.

### GET /api/admin/students/{studentId}/progress

Same shape as `GET /api/progress/user` for that student.

### POST /api/admin/students/{studentId}/enrollments

Admin enrolls a student in a course (bypass payment or mark as comp).

**Request:** `{ "courseId": "course-id", "waivePayment": true }`

### DELETE /api/admin/students/{studentId}/enrollments/{enrollmentId}

Admin cancels enrollment.

---

## 6. Teachers (teacher dashboard management)

Maps to admin **Teachers** page and teacher dashboard (schedule, classes, students).

### GET /api/admin/teachers

Query: `search`, `status` (`pending` | `active` | `suspended`), pagination.

**Response item:**

```json
{
  "id": "teacher-id",
  "userId": "identity-user-id",
  "fullName": "Ms. Harlow",
  "email": "harlow@example.com",
  "avatarUrl": "https://...",
  "teachingLanguage": "english",
  "subject": "Speaking & Conversation",
  "level": "A2 - C1",
  "rating": 4.9,
  "bio": "...",
  "videoUrl": "https://...",
  "status": "active"
}
```

### POST /api/admin/teachers

Create teacher (user + profile), default `status`: `pending`.

**Request:**

```json
{
  "fullName": "Ms. Harlow",
  "email": "harlow@example.com",
  "subject": "Speaking & Conversation",
  "level": "A2 - C1",
  "teachingLanguage": "english",
  "bio": "Teacher bio...",
  "avatarUrl": "https://...",
  "videoUrl": "https://..."
}
```

### GET /api/admin/teachers/{teacherId}

### PATCH /api/admin/teachers/{teacherId}

Update profile fields and `rating` if manually curated.

**Request (partial):**

```json
{
  "fullName": "Updated Name",
  "avatarUrl": "https://...",
  "teachingLanguage": "english",
  "subject": "Updated Subject",
  "level": "A1 - C1",
  "bio": "Updated bio",
  "videoUrl": "https://..."
}
```

### PATCH /api/admin/teachers/{teacherId}/status

**Request:** `{ "status": "pending" | "active" | "suspended" }`  
Use for **Approve** / **Suspend** in admin UI.

### DELETE /api/admin/teachers/{teacherId}

### GET /api/admin/teachers/{teacherId}/students

Students linked to this teacher (classes, bookings, or assignments — your domain model).

```json
[
  {
    "studentId": "user-id",
    "fullName": "Amara Bello",
    "email": "amara@example.com",
    "courseId": "course-id",
    "courseTitle": "English B1",
    "progress": 42
  }
]
```

### GET /api/admin/teachers/{teacherId}/availability

Teacher dashboard **availability** (same data teacher edits under `/teacher/availability`).

**Response:** Array of slots:

```json
[
  {
    "id": "slot-id",
    "dayOfWeek": "Monday",
    "startTime": "10:00",
    "endTime": "11:00",
    "isBooked": false
  }
]
```

### PUT /api/admin/teachers/{teacherId}/availability

Replace all slots (admin override).

**Request:** `{ "slots": [ ... ] }`

---

## 7. Teacher withdrawals (admin approval)

All endpoints below require the indicated role. Withdrawal amounts are in the teacher's earnings currency.

### GET /api/admin/withdrawals

Admin-only paginated list. Supports `status` (`pending` | `approved` | `rejected`), `page`, and `pageSize`. The admin dashboard initially filters to pending requests.

**Response item:**

```json
{
  "id": "withdrawal-id",
  "teacherId": "teacher-id",
  "teacherName": "Teacher Name",
  "teacherEmail": "teacher@example.com",
  "amount": 1200000,
  "currency": "IRR",
  "iban": "IR000000000000000000000000",
  "status": "pending",
  "requestedAt": "2026-10-04T10:30:00Z"
}
```

### PATCH /api/admin/withdrawals/{withdrawalId}/status

Admin approves or rejects a pending request. Only a `pending` request can transition; return 409 for a request already decided.

**Request:** `{ "status": "approved" | "rejected" }`

On approval, record the payout decision/actor/time and deduct the approved amount from the teacher's withdrawable balance. On rejection, release the pending reservation back to the teacher's available balance. In the same transaction (or via a reliable outbox), create a `payment` notification addressed to the request's teacher, with a localized-safe title/message indicating approved or rejected and an `actionUrl` back to `/teacher`. The notification must appear in `GET /api/notifications` and update `/api/notifications/stats`.

### Teacher withdrawal contract and balance enforcement

- `GET /api/teacher/dashboard/earnings` and the earnings object in `/api/teacher/dashboard/overview` must include `availableBalance`, the server-calculated amount currently eligible to withdraw after subtracting prior payouts and all pending withdrawal reservations.
- `POST /api/teacher/dashboard/withdrawals` — Teacher-only; request body `{ "amount": 1200000, "iban": "IR..." }`; create a `pending` request and reserve its amount.
- The backend MUST validate `amount > 0` and `amount <= availableBalance` against authoritative ledger data in an atomic transaction/row lock. Reject stale or excessive requests with HTTP 400/409 and a ProblemDetails message. Concurrent requests must not reserve more than the current balance. Frontend `min`/`max` checks are usability only and are not a security boundary.
- Rejected requests release their reservation; approved requests become paid/deducted. Do not make the same request payable twice.
- The teacher is notified after the admin decision through the notification record described above.

---

## 8. Teacher-facing API (non-admin, for reference)

Implement these for the **teacher dashboard**; admin uses `/api/admin/teachers/*` to manage the same records.

| Method  | Path                        | Role    |
| ------- | --------------------------- | ------- |
| GET     | `/api/teacher/me`           | Teacher |
| GET     | `/api/teacher/students`     | Teacher |
| GET     | `/api/teacher/classes`      | Teacher |
| GET/PUT | `/api/teacher/availability` | Teacher |
| GET     | `/api/teacher/schedule`     | Teacher |

Admin does **not** call these with a teacher token; admin uses admin routes above.

### PUT /api/teacher/availability

Replace the authenticated teacher's weekly availability. Existing slot IDs are included when editing the schedule so the service can preserve their booking associations; new slots omit `id`. The server must validate ownership, valid day/time ranges, and overlaps, and must reject removal or alteration of a booked slot.

**Request:**

```json
{
  "slots": [
    {
      "id": "existing-slot-id",
      "dayOfWeek": "Monday",
      "startTime": "09:00",
      "endTime": "10:00"
    },
    { "dayOfWeek": "Wednesday", "startTime": "13:30", "endTime": "14:30" }
  ]
}
```

Return the saved array with `id`, `dayOfWeek`, `startTime`, `endTime`, and `isBooked`. `GET /api/teachers` must expose the same teacher slots in its public directory data as `{ id, day, time, booked }` (or the equivalent `dayOfWeek`, `startTime`, `endTime`, `isBooked` fields), so students see the updated open slots and cannot book an already-taken slot.

---

## 9. Enrollments & progress (cross-cutting)

### GET /api/admin/enrollments

Query: `courseId`, `studentId`, `status`, pagination.

### PATCH /api/admin/enrollments/{enrollmentId}

**Request:** `{ "status": "active" | "completed" | "cancelled" }`

---

## 10. Optional — messaging & assignments (later phase)

When SignalR/messaging exists:

- `GET /api/admin/conversations` — moderation list
- `DELETE /api/admin/messages/{messageId}` — remove abuse

Assignments (teacher/student dashboards):

- `GET /api/admin/assignments`
- `PATCH /api/admin/assignments/{id}` — override grade or due date

Keep as Phase 2; frontend can stay on `messages-store` until then.

---

## 11. Suggested C# project structure

```
Controllers/
  Admin/
    AdminDashboardController.cs
    AdminStudentsController.cs
    AdminTeachersController.cs
    AdminWithdrawalsController.cs
    AdminCoursesController.cs
    AdminBlogController.cs
    AdminSettingsController.cs
    AdminEnrollmentsController.cs
  Teacher/
    TeacherProfileController.cs
    TeacherAvailabilityController.cs
Services/
  IAdminStudentService.cs
  IAdminTeacherService.cs
  IAdminWithdrawalService.cs
  ICoursePricingService.cs
```

Use a single `ApplicationUser` with roles; `TeacherProfile` and `StudentProfile` as related tables.

---

## 12. Frontend integration

- Client: `lib/api/admin.ts`
- Admin login: `POST /api/auth/login` → verify `user.role === "admin"`
- Replace mock state in `app/[lang]/(admin)/admin/**` with hooks calling `lib/api/admin.ts`
- Course discounts: remove reliance on `localStorage` once `PATCH /api/admin/courses/{id}/pricing` is live

See `BACKEND_INTEGRATION_PLAN.md` — **Phase Admin**.

---

## 13. Implementation priority for C# team

1. Auth with **Admin** role + authorize all `/api/admin/*`
2. `GET /api/admin/dashboard/stats`
3. Students CRUD + status + enrollments list
4. Teachers CRUD + status + availability
5. Teacher withdrawal ledger + teacher/admin APIs + decision notifications
6. Course pricing PATCH (unblocks marketing site)
7. Blog CRUD
8. Modules/lessons admin writes
9. Settings PATCH
10. Messaging / assignments (Phase 2)
