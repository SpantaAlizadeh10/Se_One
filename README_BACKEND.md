# Backend Developer Guide - Quick Start

## 📁 Important Files for Backend Development

### 📘 Documentation
- **`API_SPECIFICATION.md`** - Complete API reference with all endpoints
- **`ADMIN_API_SPECIFICATION.md`** - Admin panel APIs (site + student/teacher management)
- **`BACKEND_DEVELOPER_GUIDE.md`** - Step-by-step development guide
- **`API_TESTING_EXAMPLES.md`** - Curl commands and testing examples
- **`BACKEND_INTEGRATION_PLAN.md`** - Overall architecture and strategy

### 🔧 API Clients (Reference Implementation)
- **`lib/api/client.ts`** - Base API client (handles auth, errors, CORS)
- **`lib/api/auth.ts`** - Authentication endpoints
- **`lib/api/courses.ts`** - Courses endpoints
- **`lib/api/enrollment.ts`** - Enrollment management
- **`lib/api/modules.ts`** - Course modules
- **`lib/api/lessons.ts`** - Lesson content and progress
- **`lib/api/progress.ts`** - User progress tracking
- **`lib/api/learning.ts`** - Learning sessions
- **`lib/api/teachers.ts`** - Teacher directory
- **`lib/api/blog.ts`** - Blog posts
- **`lib/api/admin.ts`** - Admin panel (students, teachers, courses, blog, settings)

### 🧪 Testing
- **`lib/api/__tests__/api-test.ts`** - Automated API tests
- **`.env.local`** - Environment configuration (you'll need to set this)

## 🚀 Quick Start (5 Minutes)

### 1. Set Your Backend URL
Edit `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

### 2. Read the API Specification
Open `API_SPECIFICATION.md` - this contains all endpoint details, request/response formats, and data models.

### 3. Implement Core Endpoints
Focus on these first (in order):
1. Auth (`/api/auth/*`)
2. Courses (`/api/courses`)
3. Enrollment (`/api/enrollment/*`)
4. Modules (`/api/courses/{courseId}/modules`)
5. Lessons (`/api/modules/{moduleId}/lessons`)
6. Progress (`/api/progress/*`)
7. Learning (`/api/learning/*`)

### 4. Test Your Implementation
Run the automated tests:
```bash
cd lib/api/__tests__
node api-test.ts
```

Or use curl commands from `API_TESTING_EXAMPLES.md`

## 📋 What Needs to Be Built

### ✅ Priority 1 - Core Learning Flow
These endpoints are essential for the basic learning experience:

- **Authentication**: Login, register, logout, current user
- **Courses**: List courses, get course details
- **Enrollment**: Enroll in courses, get user enrollments, track progress
- **Modules**: Get course modules
- **Lessons**: Get lessons, complete lessons, track progress
- **Progress**: User progress, achievements, learning streaks
- **Learning**: Start/continue sessions, recommendations

### ⏳ Priority 2 - Enhanced Features
These improve the experience but aren't critical:

- **Teachers**: Teacher directory with availability
- **Blog**: Blog posts for different languages

### ⏳ Priority 3 - Admin Panel (C# `/api/admin/*`)
Required for the admin dashboard to manage the site and oversee student/teacher data:

- **Admin auth**: Users with role `Admin` via existing auth endpoints
- **Dashboard stats**, **students** (CRUD + status + enrollments), **teachers** (CRUD + approve + availability)
- **Course pricing** in DB (replaces frontend-only localStorage discounts)
- **Blog** admin CRUD, **site settings**

Full list: **`ADMIN_API_SPECIFICATION.md`**

### ❌ Do NOT Build Yet
These features exist in the frontend but need backend design first:

- **Teacher Scheduling & Booking** - Keep as mock
- **Messages System** - Keep as mock
- **Assignments System** - Keep as mock
- **Course Reviews** - Keep as mock
- **Payment Integration** - Keep as mock

## 🔑 Key Technical Requirements

### Authentication
Support both:
- **Cookie-based auth** (ASP.NET Identity cookies)
- **JWT Bearer tokens** (Authorization header)

### CORS
Must allow requests from frontend with credentials:
```csharp
services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // or your frontend URL
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});
```

### Response Format
- Prefer camelCase (frontend handles both camelCase and PascalCase)
- Use ISO 8601 for dates: `2026-09-15T10:00:00Z`
- Numbers should be actual numbers, not strings
- Booleans should be `true`/`false`, not strings

### Error Handling
Return consistent error responses:
```json
{
  "message": "Error message",
  "title": "Error title",
  "detail": "Detailed error information"
}
```

## 🧪 Testing Strategy

### Manual Testing
1. Start your backend server
2. Use curl commands from `API_TESTING_EXAMPLES.md`
3. Check responses match expected format

### Automated Testing
1. Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
2. Run: `node lib/api/__tests__/api-test.ts`
3. All tests should pass

### Frontend Integration
1. Start backend server
2. Start frontend: `npm run dev`
3. Navigate through the app
4. Check browser console for API errors

## 📊 Data Models Summary

### User
```typescript
{
  id: string;
  fullName: string;
  email: string;
  role: "student" | "teacher" | "admin";
}
```

### Course
```typescript
{
  id: string;
  title: string;
  level: string;
  desc: string;
  lessons: number;
  students: number;
  price: string;
  duration?: string;
  image?: string;
}
```

### Enrollment
```typescript
{
  id: string;
  courseId: string;
  userId: string;
  enrolledAt: string;
  status: "active" | "completed" | "cancelled";
  progress?: number;
}
```

## ⚠️ Common Issues

### CORS Errors
- Ensure CORS is configured for your frontend URL
- Check that `AllowCredentials()` is included
- Verify the origin matches exactly

### Authentication Issues
- Check that cookies are being set/returned
- Verify JWT token format in response
- Ensure `credentials: "include"` is working

### Data Format Issues
- Check for PascalCase vs camelCase mismatches
- Verify date formats (ISO 8601)
- Ensure numbers are not sent as strings

## 🎯 Development Workflow

1. **Read** the API specification for the endpoint you're implementing
2. **Implement** the endpoint following the specification
3. **Test** manually with curl or Postman
4. **Run** the automated test file
5. **Verify** with the frontend if needed
6. **Document** any changes to the API specification

## 📞 Support

If you encounter issues:
1. Check `API_SPECIFICATION.md` first
2. Review the frontend API client code in `lib/api/`
3. Test endpoints manually with curl/Postman
4. Check browser console for error details
5. Verify environment configuration in `.env.local`

## 🔄 Communication

When you make changes:
1. Update `API_SPECIFICATION.md` if endpoints change
2. Re-run tests to verify compatibility
3. Communicate changes to the frontend developer
4. Update any relevant documentation

---

**Start with `API_SPECIFICATION.md` and `BACKEND_DEVELOPER_GUIDE.md` for detailed information.**