# Backend Developer Quick Start Guide

This guide helps backend developers quickly understand what needs to be built and how to test it.

## 📋 Prerequisites

1. **Read the API Specification**: `API_SPECIFICATION.md` - Contains all endpoint details
2. **Read Integration Plan**: `BACKEND_INTEGRATION_PLAN.md` - Overall architecture
3. **Environment Setup**: Ensure `.env.local` has your backend URL

## 🚀 Quick Start

### 1. Set Your Backend URL

Edit `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

### 2. Implement Core Endpoints (Priority Order)

**Phase 1 - Essential:**
- ✅ Auth endpoints (`/api/auth/*`)
- ✅ Courses endpoints (`/api/courses`)
- ✅ Enrollment endpoints (`/api/enrollment/*`)
- ✅ Modules endpoints (`/api/courses/{courseId}/modules`)
- ✅ Lessons endpoints (`/api/modules/{moduleId}/lessons`)
- ✅ Progress endpoints (`/api/progress/*`)
- ✅ Learning endpoints (`/api/learning/*`)

**Phase 2 - Nice to Have:**
- Teachers endpoints (`/api/teachers`)
- Blog endpoints (`/api/blog`)

### 3. Test Your Implementation

Use the provided test file:
```bash
cd lib/api/__tests__
node api-test.ts
```

Or manually test with the API clients:
```typescript
import { login } from "@/lib/api/auth";
import { getCourses } from "@/lib/api/courses";

// Test auth
const result = await login("test@example.com", "password");
console.log(result);

// Test courses
const courses = await getCourses("en");
console.log(courses);
```

## 📁 Important Files

### API Clients (Frontend Side)
- `lib/api/auth.ts` - Authentication
- `lib/api/courses.ts` - Courses
- `lib/api/enrollment.ts` - Enrollment management
- `lib/api/modules.ts` - Course modules
- `lib/api/lessons.ts` - Lesson content and progress
- `lib/api/progress.ts` - User progress tracking
- `lib/api/learning.ts` - Learning sessions
- `lib/api/teachers.ts` - Teacher directory
- `lib/api/blog.ts` - Blog posts
- `lib/api/client.ts` - Base API client (handles auth, errors, etc.)

### Documentation
- `API_SPECIFICATION.md` - Complete API reference
- `BACKEND_INTEGRATION_PLAN.md` - Integration strategy
- `BACKEND_DEVELOPER_GUIDE.md` - This file

### Testing
- `lib/api/__tests__/api-test.ts` - Automated API tests

## 🔧 Development Tips

### Response Format
The frontend handles both camelCase and PascalCase, but prefer camelCase:
```json
{
  "userId": "123",           // Preferred
  "UserName": "John Doe"     // Also works
}
```

### Error Handling
Return consistent error responses:
```json
{
  "message": "User not found",
  "title": "Not Found",
  "detail": "No user exists with the provided ID"
}
```

### Authentication
Support both methods:
1. **Cookie Auth**: Set via ASP.NET Identity cookies
2. **JWT Auth**: Return token in response, frontend stores in localStorage

### CORS
Enable CORS for your frontend domain:
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

## 🧪 Testing Strategy

### Manual Testing
1. Start your backend server
2. Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
3. Use browser DevTools to test endpoints
4. Check frontend network tab for API calls

### Automated Testing
Run the provided test file:
```bash
node lib/api/__tests__/api-test.ts
```

### Frontend Integration Testing
1. Start backend server
2. Start frontend: `npm run dev`
3. Navigate through the app
4. Check console for API errors
5. Verify data displays correctly

## 📊 Data Models

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

### Module
```typescript
{
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessonCount: number;
  completedLessons?: number;
  isCompleted?: boolean;
}
```

### Lesson
```typescript
{
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  description: string;
  content?: string;
  videoUrl?: string;
  audioUrl?: string;
  order: number;
  duration?: number;
  isCompleted?: boolean;
}
```

## ⚠️ Common Issues

### CORS Errors
- Ensure CORS is configured for your frontend URL
- Check that `AllowCredentials()` is included
- Verify the origin matches exactly (no trailing slashes)

### Authentication Issues
- Check that cookies are being set/returned
- Verify JWT token format in response
- Ensure `credentials: "include"` is working

### Data Format Issues
- Check for PascalCase vs camelCase mismatches
- Verify date formats (ISO 8601)
- Ensure numbers are not sent as strings

### 404 Errors
- Verify endpoint paths match exactly
- Check for trailing slashes in URLs
- Ensure route configuration is correct

## 🎯 Next Steps

1. **Implement Phase 1 endpoints** following `API_SPECIFICATION.md`
2. **Test with provided test file**
3. **Integrate with frontend** by starting the dev server
4. **Handle edge cases** (error scenarios, validation)
5. **Add logging** for debugging
6. **Deploy** and test in production environment

## 📞 Support

If you encounter issues:
1. Check the API specification first
2. Review the frontend API client code
3. Test endpoints manually with curl/Postman
4. Check browser console for error details
5. Verify environment configuration

## 🔄 Updates

When you make changes to the backend:
1. Update the API specification if endpoints change
2. Re-run the test file to verify compatibility
3. Communicate changes to the frontend developer
4. Update any relevant documentation

---

Good luck with the backend development! The frontend is ready to integrate once these endpoints are implemented.