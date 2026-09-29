# API Specification for Backend Development

This document provides the complete API specification that the backend should implement to work with the frontend.

## Base Configuration

- **Base URL**: Configured via `NEXT_PUBLIC_API_BASE_URL` environment variable
- **Content-Type**: `application/json`
- **Authentication**: 
  - Cookie-based auth (ASP.NET Identity)
  - JWT Bearer token (Authorization header)
- **CORS**: Must allow requests from the frontend domain

## Authentication Endpoints

### POST /api/auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "fullName": "John Doe",
    "email": "user@example.com",
    "role": "student"
  }
}
```

### POST /api/auth/register
Register a new user.

**Request:**
```json
{
  "fullName": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "role": "Student"
}
```

**Response:** Same as login

### GET /api/auth/me
Get current authenticated user.

**Response:**
```json
{
  "id": "user-id",
  "fullName": "John Doe",
  "email": "user@example.com",
  "role": "student"
}
```

### POST /api/auth/logout
Logout current user.

**Response:** 204 No Content

### POST /api/auth/otp/request
Request OTP for phone login.

**Request:**
```json
{
  "phone": "+1234567890"
}
```

**Response:** 204 No Content

### POST /api/auth/otp/verify
Verify OTP and login.

**Request:**
```json
{
  "phone": "+1234567890",
  "code": "123456"
}
```

**Response:** Same as login

### POST /api/auth/forgot-password
Request password reset.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:** 204 No Content

## Courses Endpoints

### GET /api/courses?lang={lang}
Get all courses for a specific language.

**Response:**
```json
[
  {
    "id": "course-id",
    "title": "English for Beginners",
    "level": "A1 - A2",
    "desc": "Course description",
    "lessons": 12,
    "students": 150,
    "price": "$99",
    "duration": "3 months",
    "image": "https://example.com/image.jpg"
  }
]
```

## Enrollment Endpoints

### POST /api/enrollment/{courseId}
Enroll in a course.

**Response:**
```json
{
  "enrollment": {
    "id": "enrollment-id",
    "courseId": "course-id",
    "userId": "user-id",
    "enrolledAt": "2026-09-15T10:00:00Z",
    "status": "active",
    "progress": 0
  },
  "paymentRequired": true,
  "paymentUrl": "https://payment-gateway.com/..."
}
```

### GET /api/enrollment/user
Get all user enrollments.

**Response:**
```json
[
  {
    "id": "enrollment-id",
    "courseId": "course-id",
    "userId": "user-id",
    "enrolledAt": "2026-09-15T10:00:00Z",
    "status": "active",
    "progress": 65
  }
]
```

### GET /api/enrollment/{enrollmentId}
Get specific enrollment.

**Response:** Same as single enrollment object above

### DELETE /api/enrollment/{enrollmentId}
Cancel enrollment.

**Response:** 204 No Content

### GET /api/enrollment/{enrollmentId}/progress
Get enrollment progress details.

**Response:**
```json
{
  "enrollmentId": "enrollment-id",
  "courseId": "course-id",
  "completedModules": 3,
  "totalModules": 5,
  "completedLessons": 15,
  "totalLessons": 25,
  "overallProgress": 60,
  "lastAccessedAt": "2026-09-15T12:00:00Z"
}
```

## Modules Endpoints

### GET /api/courses/{courseId}/modules
Get all modules for a course.

**Response:**
```json
[
  {
    "id": "module-id",
    "courseId": "course-id",
    "title": "Basic Grammar",
    "description": "Module description",
    "order": 1,
    "lessonCount": 5,
    "completedLessons": 3,
    "isCompleted": false
  }
]
```

### GET /api/modules/{moduleId}
Get specific module.

**Response:** Same as single module object above

## Lessons Endpoints

### GET /api/modules/{moduleId}/lessons
Get all lessons for a module.

**Response:**
```json
[
  {
    "id": "lesson-id",
    "moduleId": "module-id",
    "courseId": "course-id",
    "title": "Introduction to Verbs",
    "description": "Lesson description",
    "content": "HTML content or reference to content file",
    "videoUrl": "https://example.com/video.mp4",
    "audioUrl": "https://example.com/audio.mp3",
    "order": 1,
    "duration": 15,
    "isCompleted": false
  }
]
```

### GET /api/lessons/{lessonId}
Get specific lesson.

**Response:** Same as single lesson object above

### POST /api/lessons/{lessonId}/complete
Mark lesson as completed.

**Response:**
```json
{
  "lessonId": "lesson-id",
  "moduleId": "module-id",
  "isCompleted": true,
  "completedAt": "2026-09-15T14:00:00Z",
  "timeSpent": 900,
  "lastPosition": 0
}
```

### GET /api/lessons/{lessonId}/progress
Get lesson progress.

**Response:** Same as lesson completion object above

### PATCH /api/lessons/{lessonId}/progress
Update lesson progress (time spent, position).

**Request:**
```json
{
  "timeSpent": 600,
  "lastPosition": 45
}
```

**Response:** Same as lesson progress object above

## Progress Endpoints

### GET /api/progress/user
Get user's overall progress.

**Response:**
```json
{
  "userId": "user-id",
  "totalCoursesEnrolled": 3,
  "totalCoursesCompleted": 1,
  "totalLessonsCompleted": 45,
  "totalStudyTime": 3600,
  "currentStreak": 7,
  "longestStreak": 14,
  "weeklyStudyTime": [120, 180, 240, 60, 300, 0, 0],
  "recentlyActiveCourses": [
    {
      "courseId": "course-id",
      "courseTitle": "English for Beginners",
      "enrollmentId": "enrollment-id",
      "progress": 65,
      "lastAccessedAt": "2026-09-15T12:00:00Z",
      "completedLessons": 15,
      "totalLessons": 25
    }
  ]
}
```

### GET /api/progress/course/{courseId}
Get progress for specific course.

**Response:**
```json
{
  "courseId": "course-id",
  "courseTitle": "English for Beginners",
  "enrollmentId": "enrollment-id",
  "progress": 65,
  "lastAccessedAt": "2026-09-15T12:00:00Z",
  "completedLessons": 15,
  "totalLessons": 25
}
```

### GET /api/progress/achievements
Get user achievements.

**Response:**
```json
[
  {
    "id": "achievement-id",
    "title": "First Lesson Completed",
    "description": "Complete your first lesson",
    "icon": "🎉",
    "isUnlocked": true,
    "unlockedAt": "2026-09-15T10:00:00Z",
    "progress": 1,
    "target": 1
  }
]
```

### POST /api/progress/achievements/{id}/claim
Claim an achievement reward.

**Response:** Same as single achievement object above

## Learning Endpoints

### GET /api/learning/current
Get current learning state.

**Response:**
```json
{
  "activeCourseId": "course-id",
  "activeEnrollmentId": "enrollment-id",
  "currentLessonId": "lesson-id",
  "currentModuleId": "module-id",
  "suggestedNextLesson": {
    "id": "lesson-id",
    "moduleId": "module-id",
    "courseId": "course-id",
    "title": "Next Lesson Title",
    "description": "Description",
    "order": 2,
    "isCompleted": false
  },
  "totalStudyTimeToday": 1800,
  "dailyGoal": 3600,
  "dailyGoalProgress": 50
}
```

### POST /api/learning/start/{courseId}
Start a learning session.

**Response:**
```json
{
  "sessionId": "session-id",
  "courseId": "course-id",
  "enrollmentId": "enrollment-id",
  "lessonId": "lesson-id",
  "moduleId": "module-id",
  "startedAt": "2026-09-15T10:00:00Z",
  "lesson": {
    "id": "lesson-id",
    "title": "Current Lesson",
    "description": "Description",
    "content": "Content",
    "order": 1
  },
  "module": {
    "id": "module-id",
    "title": "Current Module",
    "description": "Description",
    "order": 1
  },
  "nextLesson": {
    "id": "next-lesson-id",
    "title": "Next Lesson"
  },
  "previousLesson": null
}
```

### POST /api/learning/continue/{lessonId}
Continue a learning session.

**Response:** Same as start learning session

### POST /api/learning/session/{sessionId}/end
End a learning session.

**Response:**
```json
{
  "sessionId": "session-id",
  "lessonId": "lesson-id",
  "moduleId": "module-id",
  "courseId": "course-id",
  "duration": 1800,
  "completed": true,
  "timeSpent": 1800,
  "progressBefore": 50,
  "progressAfter": 55
}
```

### GET /api/learning/recommendations
Get learning recommendations.

**Response:**
```json
[
  {
    "type": "lesson",
    "priority": "high",
    "title": "Review Past Tense",
    "description": "Practice past tense verbs",
    "courseId": "course-id",
    "lessonId": "lesson-id",
    "estimatedTime": 15,
    "reason": "You struggled with this in recent exercises"
  }
]
```

## Teachers Endpoints

### GET /api/teachers
Get all teachers with availability.

**Response:**
```json
[
  {
    "id": "teacher-id",
    "name": "Ms. Harlow",
    "avatar": "https://example.com/avatar.jpg",
    "teachingLanguage": "english",
    "subject": "Speaking & Conversation",
    "level": "A2 - C1",
    "rating": 4.9,
    "bio": "Teacher bio",
    "videoUrl": "https://example.com/intro-video.mp4",
    "slots": [
      {
        "id": "slot-id",
        "day": "Monday",
        "time": "10:00 AM - 11:00 AM",
        "booked": false
      }
    ]
  }
]
```

## Blog Endpoints

### GET /api/blog?lang={lang}
Get blog posts for a language.

**Response:**
```json
[
  {
    "id": "post-id",
    "title": "Blog Post Title",
    "excerpt": "Post excerpt",
    "author": "Author Name",
    "date": "2026-09-15",
    "readTime": "5 min",
    "category": "Learning Tips",
    "image": "https://example.com/image.jpg",
    "sourceUrl": "https://original-source.com/post"
  }
]
```

## Error Handling

All endpoints should return appropriate HTTP status codes:

- **200 OK**: Successful GET
- **201 Created**: Successful POST
- **204 No Content**: Successful DELETE/PUT with no response body
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Valid auth but insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Server error

### Error Response Format

```json
{
  "message": "Error message",
  "title": "Error title",
  "detail": "Detailed error information"
}
```

## Data Format Notes

- **DateTime**: Use ISO 8601 format (e.g., "2026-09-15T10:00:00Z")
- **Numbers**: Use plain numbers (not strings) for numeric values
- **Booleans**: Use `true`/`false` (not strings)
- **Null vs Undefined**: Use `null` for missing values, not `undefined`
- **Case**: The frontend handles both camelCase and PascalCase, but camelCase is preferred

## CORS Configuration

The backend must allow CORS for the frontend domain:

```csharp
// In ASP.NET Core
services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("https://your-frontend-domain.com")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});
```

## Authentication

The frontend supports both cookie-based auth and JWT tokens:

1. **Cookie Auth**: Set authentication cookies via ASP.NET Identity
2. **JWT Auth**: Return JWT token in login response, frontend stores in localStorage

The frontend will automatically include:
- Cookies via `credentials: "include"`
- JWT token via `Authorization: Bearer {token}` header

## Testing

Use the frontend's API clients to test endpoints:

```typescript
import { getUserEnrollments } from "@/lib/api/enrollment";

// This will call GET /api/enrollment/user
const enrollments = await getUserEnrollments();
```

Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local` to point to your backend.

## Admin Endpoints

Admin panel APIs (`/api/admin/*`) are documented separately because they span site management, student dashboard data, and teacher dashboard data.

See **`ADMIN_API_SPECIFICATION.md`** for the full reference and **`lib/api/admin.ts`** for the frontend client.

Summary:

- **Auth**: Admin uses `POST /api/auth/login` with role `Admin` (all `/api/admin/*` require `[Authorize(Roles = "Admin")]`)
- **Dashboard**: `GET /api/admin/dashboard/stats`
- **Students**: CRUD, status, enrollments, progress under `/api/admin/students/*`
- **Teachers**: CRUD, status, availability, student list under `/api/admin/teachers/*`
- **Site**: Course pricing, blog CRUD, settings under `/api/admin/courses/*`, `/api/admin/blog/*`, `/api/admin/settings`