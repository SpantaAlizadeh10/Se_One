# Backend Teacher API Summary

This document summarizes all teacher-related endpoints and data models that need to be implemented in the C# backend.

## Data Models

### TeacherProfile (Shared across all APIs)

```csharp
public class TeacherProfile
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Avatar { get; set; }
    public string TeachingLanguage { get; set; } // "english" or "german"
    public string Subject { get; set; }
    public string Level { get; set; }
    public double Rating { get; set; }
    public string Bio { get; set; }
    public string? VideoUrl { get; set; } // Optional
    public List<AvailabilitySlot> Slots { get; set; }
}

public class AvailabilitySlot
{
    public string Id { get; set; }
    public string Day { get; set; }
    public string Time { get; set; }
    public bool Booked { get; set; }
}
```

### AdminTeacher (Admin-specific)

```csharp
public class AdminTeacher
{
    public string Id { get; set; }
    public string UserId { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string AvatarUrl { get; set; }
    public string TeachingLanguage { get; set; } // "english" or "german"
    public string Subject { get; set; }
    public string Level { get; set; }
    public double Rating { get; set; }
    public string Bio { get; set; }
    public string? VideoUrl { get; set; } // Optional
    public string Status { get; set; } // "pending", "active", "suspended"
}
```

### TeacherProfileData (For profile completion/update)

```csharp
public class TeacherProfileData
{
    public string Subject { get; set; }
    public string Level { get; set; }
    public string TeachingLanguage { get; set; } // "english" or "german"
    public string Bio { get; set; }
    public string? AvatarUrl { get; set; } // Optional
    public string? VideoUrl { get; set; } // Optional
}
```

## Endpoints

### 1. Authentication (already implemented)

- `POST /api/auth/register` - Register new user (student or teacher)
  - Request: `{ fullName, email, password, role }`
  - Response: `{ token, user }`
  - **Note:** For teachers, this only creates the user account. Profile completion happens separately.

### 2. Public Teachers API

- `GET /api/teachers` - Get all teachers with availability
  - Response: `TeacherProfile[]`

### 3. Admin Teachers API

- `GET /api/admin/teachers` - List all teachers (with filters)
  - Query: `search`, `status`, pagination
  - Response: `AdminTeacher[]`

- `POST /api/admin/teachers` - Create teacher (admin only)
  - Request: `{ fullName, email, subject, level, teachingLanguage, bio, avatarUrl?, videoUrl? }`
  - Response: `AdminTeacher`
  - **Note:** Default status should be "pending"

- `GET /api/admin/teachers/{teacherId}` - Get teacher details
  - Response: `AdminTeacher`

- `PATCH /api/admin/teachers/{teacherId}` - Update teacher profile
  - Request: Partial update of any fields
  - Response: `AdminTeacher`

- `PATCH /api/admin/teachers/{teacherId}/status` - Update teacher status
  - Request: `{ status: "pending" | "active" | "suspended" }`
  - Response: `AdminTeacher`

- `DELETE /api/admin/teachers/{teacherId}` - Delete teacher

### 4. Teacher Profile API (for teachers themselves)

- `GET /api/teacher/profile` - Get current teacher's profile
  - Response: `TeacherProfileResponse` (same as AdminTeacher)

- `POST /api/teacher/profile/complete` - Complete profile after registration
  - Request: `{ subject, level, teachingLanguage, bio, avatarUrl? }`
  - Response: `TeacherProfileResponse`
  - **Note:** Called when new teacher completes their profile

- `PATCH /api/teacher/profile` - Update teacher profile
  - Request: Partial update of any fields
  - Response: `TeacherProfileResponse`

- `POST /api/teacher/profile/avatar` - Upload avatar image
  - Request: FormData with `file` field
  - Response: `{ avatarUrl: string }`

- `POST /api/teacher/profile/video` - Upload introduction video
  - Request: FormData with `file` field
  - Response: `{ videoUrl: string }`

## Important Notes

### Field Naming Consistency

- Use camelCase for JSON properties (e.g., `avatarUrl`, `teachingLanguage`, `videoUrl`)
- The frontend expects these exact field names

### Teaching Language

- Only two values: `"english"` or `"german"`
- Case-insensitive handling in frontend, but backend should store lowercase

### Status Workflow

- `pending` - New teacher awaiting admin approval
- `active` - Approved teacher, visible on site
- `suspended` - Teacher suspended, not visible

### File Uploads

- Avatar and video uploads should return URLs
- Store files in cloud storage (AWS S3, Azure Blob, etc.)
- Return the accessible URL in the response

### Registration Flow

1. User registers via `/api/auth/register` with `role: "Teacher"`
2. Frontend redirects to `/teacher/complete-profile`
3. Teacher fills in `subject`, `level`, `teachingLanguage`, `bio`
4. Frontend calls `POST /api/teacher/profile/complete`
5. Admin approves via `PATCH /api/admin/teachers/{teacherId}/status`
6. Teacher becomes visible on site

### Admin Creation Flow

1. Admin calls `POST /api/admin/teachers` with all fields
2. Teacher created with `status: "pending"`
3. Admin can approve immediately if desired

## Database Schema Recommendations

### Users Table

```sql
- Id (PK)
- FullName
- Email
- PasswordHash
- Role ("Student", "Teacher", "Admin")
- CreatedAt
```

## 5. Teacher growth tiers and class share

The teacher dashboard now has a three-step growth track. The backend must own the authoritative tier calculation and payout percentage because this affects money; frontend fallback requirements are previews only and are not payout rules.

### Endpoints

- `GET /api/teacher/dashboard/progression?lang=fa|en` — authenticated teacher's current level, verified progress metrics, all three configured tier requirements, teacher share percent, and localized unlocked benefits.
- `GET /api/admin/teacher-tiers` — Admin-only tier configuration.
- `PUT /api/admin/teacher-tiers` — Admin-only update of thresholds, teacher share percentages, and Persian/English benefit text.

Each tier should include `level` (`1`, `2`, or `3`), `name`, `minCompletedClasses`, `minAverageRating`, `minClassCompletionRate`, `teacherSharePercent`, and `benefits`. Current progress includes `currentLevel`, `completedClasses`, `averageRating`, and `classCompletionRate`.

**Payout safeguards:** validate all share rates are between 0 and 100 and strictly increase with each higher tier; compute class completion/rating from trusted records, not client input; audit configuration changes; disclose the effective rate before a teacher accepts/teaches a class; and apply promotions only to eligible future settlements. Never recalculate settled or already-earned amounts when a teacher advances.

The UI fallback thresholds (0/25/100 classes, 0/4.6/4.8 rating, 0/90/95% class completion) are illustrative display-only values. Configure actual thresholds and rates with the product owner and return the approved values through the endpoint before treating the progression as a live payout program. Until the endpoint provides approved percentages, the frontend deliberately shows no invented rate.

### TeacherProfiles Table

```sql
- Id (PK)
- UserId (FK to Users)
- Subject
- Level
- TeachingLanguage
- Bio
- AvatarUrl
- VideoUrl
- Rating
- Status ("pending", "active", "suspended")
- CreatedAt
- UpdatedAt
```

### AvailabilitySlots Table

```sql
- Id (PK)
- TeacherProfileId (FK to TeacherProfiles)
- Day
- Time
- Booked
- CreatedAt
```

## Response Format

All endpoints should return:

- Success: 200 OK with JSON response
- Error: 400/401/403/404 with ProblemDetails format

```json
{
  "type": "error-type",
  "title": "Error title",
  "detail": "Detailed error message",
  "status": 400
}
```

## Testing Examples

See `API_TESTING_EXAMPLES.md` for detailed testing patterns.
