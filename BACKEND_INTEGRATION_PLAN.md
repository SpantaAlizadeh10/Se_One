# Backend Integration Plan

## Overview
This document outlines the current state of backend API integration and provides guidance for frontend development.

## Architecture Layers

### Layer 1: Backend APIs (Already Built)
The following backend APIs are assumed to be already built and ready for integration:

- **Auth** (`/api/auth/*`)
  - Login/Register/Logout
  - OTP phone login
  - Password reset
  - Current user info

- **Courses** (`/api/courses`)
  - Course listing with language support
  - Course details

- **Enrollment** (`/api/enrollment/*`)
  - Enroll in courses
  - Get user enrollments
  - Enrollment progress tracking
  - Cancel enrollment

- **Modules** (`/api/courses/{courseId}/modules`)
  - Get course modules
  - Module details

- **Lessons** (`/api/modules/{moduleId}/lessons`)
  - Get module lessons
  - Lesson details
  - Mark lesson complete
  - Lesson progress tracking

- **Progress** (`/api/progress/*`)
  - User overall progress
  - Course-specific progress
  - Achievements system

- **Learning** (`/api/learning/*`)
  - Current learning state
  - Start/continue learning sessions
  - Learning recommendations

### Layer 2: Frontend API Clients (Just Created)
The following API client files have been created in `lib/api/`:

- ✅ `auth.ts` - Already existed
- ✅ `courses.ts` - Already existed  
- ✅ `teachers.ts` - Already existed
- ✅ `blog.ts` - Already existed
- ✅ `payments.ts` - Already existed (mock only)
- ✅ `enrollment.ts` - **NEW**
- ✅ `modules.ts` - **NEW**
- ✅ `lessons.ts` - **NEW**
- ✅ `progress.ts` - **NEW**
- ✅ `learning.ts` - **NEW**

### Layer 3: Frontend UI Integration (Work Needed)
The frontend has UI components that need to be connected to the API clients above.

## Features Requiring Backend Design (Keep as Mocks)

The following frontend features exist but **do not have backend APIs designed yet**. These should remain as mock functionality:

### 1. Teacher Schedule & Booking
**Current State**: Mock data in `lib/teachers-directory.ts`
**Frontend Pages**: 
- `app/[lang]/(teacher)/teacher/schedule/page.tsx`
- `app/[lang]/(app)/dashboard/teachers/page.tsx`

**Keep as Mock**: 
- Teacher availability slots
- Booking functionality
- Schedule management

**Future Backend Needed**:
- Teacher availability management API
- Booking system API
- Calendar integration

### 2. Messages System
**Current State**: Mock data in `lib/data.ts` (conversations, messages)
**Frontend Pages**:
- `app/[lang]/(app)/dashboard/messages/page.tsx`
- `app/[lang]/(teacher)/teacher/messages/page.tsx`
- `components/messages/MessagesView.tsx`

**Keep as Mock**:
- Conversation list
- Message threads
- Send/receive messages
- Online status

**Future Backend Needed**:
- Real-time messaging API (WebSocket/SignalR)
- Conversation management
- Message persistence
- Online status tracking

### 3. Assignments System
**Current State**: Mock data in `lib/data.ts` (assignments)
**Frontend Pages**:
- `app/[lang]/(app)/dashboard/assignments/page.tsx`
- `components/assignments/AssignmentsTable.tsx`

**Keep as Mock**:
- Assignment listing
- Submission tracking
- Grading system
- Due date management

**Future Backend Needed**:
- Assignment creation API
- Submission system
- Grading workflow
- File upload for assignments

### 4. Course Reviews
**Current State**: Mock data in `lib/course-reviews.ts`
**Frontend Components**: `components/marketing/course-detail/CourseReviews.tsx`

**Keep as Mock**:
- Course reviews display
- Rating calculation
- Review submission

**Future Backend Needed**:
- Review submission API
- Rating aggregation
- Review moderation

### 5. Payment Integration
**Current State**: Mock function in `lib/api/payments.ts`
**Frontend Pages**: `app/[lang]/(marketing)/checkout/[courseId]/page.tsx`

**Keep as Mock**:
- Payment processing
- Payment confirmation

**Future Backend Needed**:
- Payment gateway integration (Stripe, PayPal, ZarinPal, etc.)
- Payment intent creation
- Webhook handling
- Invoice generation

## Integration Priority

### Phase 1: Core Learning Flow (Do This First)
Connect the existing backend APIs to the learning experience:

1. **Auth Integration** - Already partially done
   - Connect login/register forms to `auth.ts`
   - Wire up token management
   - Protect dashboard routes

2. **Course Enrollment Flow**
   - Connect course detail page "Enroll Now" button to `enrollment.ts`
   - Show enrolled courses in dashboard using `getUserEnrollments()`
   - Display enrollment progress

3. **Learning Interface**
   - Build lesson viewer using `lessons.ts` and `modules.ts`
   - Connect lesson completion to `completeLesson()`
   - Show progress using `progress.ts`
   - Implement learning session flow with `learning.ts`

### Phase 2: Enhanced Features (After Phase 1)
Once core learning works, enhance with:

1. **Progress Dashboard**
   - Connect user progress stats to dashboard
   - Show achievements
   - Display learning streaks

2. **Course Content**
   - Display modules and lessons structure
   - Show navigation between lessons
   - Track time spent

### Phase 3: Admin Panel (Backend + Frontend Wiring)

The admin panel must manage **three surfaces** through one API namespace:

| Surface | What admin manages | Primary endpoints |
|---------|-------------------|-------------------|
| Public site | Courses, discounts, blog, settings | `/api/admin/courses/*`, `/api/admin/blog/*`, `/api/admin/settings` |
| Student dashboard | Accounts, status, enrollments, progress | `/api/admin/students/*` |
| Teacher dashboard | Profiles, approval, availability, roster | `/api/admin/teachers/*` |

**Specification:** `ADMIN_API_SPECIFICATION.md`  
**Frontend client:** `lib/api/admin.ts`

Implementation order for the C# team:

1. `[Authorize(Roles = "Admin")]` on all `/api/admin/*`
2. Students + teachers CRUD (replaces mock tables in admin UI)
3. Course pricing persisted in DB (replaces `localStorage` in `useCoursesPricing`)
4. Blog admin CRUD (feeds public `GET /api/blog`)
5. Teacher `/api/teacher/*` routes for the teacher dashboard (admin overrides via admin routes)
6. Wire admin pages to `lib/api/admin.ts` (remove demo `lib/admin-auth.ts` credentials when API is live)

Admin login should use **`POST /api/auth/login`** and reject users whose role is not `admin`.

### Phase 4: Mock Features (Until Backend Designed)
Keep these as mock functionality until backend systems are designed:

1. Teacher scheduling and booking (beyond availability slots)
2. Messaging system
3. Assignments
4. Course reviews
5. Payment processing

## API Client Usage Pattern

All API clients follow the same pattern:

```typescript
import { apiFetch } from "./client";

// Example: Getting user enrollments
import { getUserEnrollments } from "@/lib/api/enrollment";

const enrollments = await getUserEnrollments();
```

The `apiFetch` function automatically:
- Handles authentication (token from localStorage)
- Includes credentials for cookie auth
- Normalizes errors
- Supports both camelCase and PascalCase responses

## Configuration

Ensure `.env.local` is configured with:
```
NEXT_PUBLIC_API_BASE_URL=http://your-backend-api-url
```

## Development Notes

1. **API Endpoints**: The assumed endpoint paths are documented in each API client file. Adjust these to match your actual .NET API structure.

2. **Response Normalization**: Each API client includes normalization functions that handle both camelCase and PascalCase responses, common in ASP.NET APIs.

3. **Error Handling**: All API calls throw `ApiError` with status codes and error details. Implement proper error boundaries in the UI.

4. **Type Safety**: All API clients include TypeScript types for requests and responses.

## Next Steps for Friend

1. **Read the API client files** in `lib/api/` to understand the available functions
2. **Start with Phase 1 integration** - connect Auth, Enrollment, and Learning flows
3. **Leave mock features as-is** - don't try to build real messaging, booking, etc. yet
4. **Test with real backend** - once backend is deployed, test the integrations
5. **Report API mismatches** - if the assumed endpoints don't match the real API, update the client files

## Backend Design Work for You

While friend works on frontend integration, focus on designing:

1. **Teacher Scheduling System**
   - Availability slot management
   - Booking workflow
   - Calendar integration

2. **Messaging System**
   - Real-time communication
   - Conversation management
   - File sharing

3. **Assignment System**
   - Assignment creation and distribution
   - Submission workflow
   - Grading system

4. **Review System**
   - Review submission and moderation
   - Rating aggregation
   - Review display

5. **Payment System**
   - Payment gateway integration
   - Transaction management
   - Invoice generation

This separation ensures both of you work on compatible systems without blocking each other.