# New Backend API Specification

This document describes the newly implemented frontend API clients that need corresponding backend endpoints.

## Overview

The following API clients have been added to the frontend to handle features that were previously missing or mocked:

1. **Wishlist** (`lib/api/wishlist.ts`)
2. **Course Reviews & Ratings** (`lib/api/reviews.ts`)
3. **Messaging** (`lib/api/messaging.ts`)
4. **Assignments** (`lib/api/assignments.ts`)
5. **Practice / Exercises** (`lib/api/practice.ts`)
6. **User Settings/Profile** (`lib/api/settings.ts`)
7. **Notifications** (`lib/api/notifications.ts`)
8. **Contact / Support** (`lib/api/support.ts`)
9. **Newsletter** (`lib/api/newsletter.ts`)
10. **Course Search/Filtering** (`lib/api/search.ts`)
11. **Student Dashboard Data** (`lib/api/student-dashboard.ts`)
12. **Teacher Dashboard Data** (`lib/api/teacher-dashboard.ts`)
13. **Teacher Profile** (`lib/api/teacher-profile.ts`)

## 1. Wishlist API

### Endpoints

- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist` - Add course to wishlist
- `DELETE /api/wishlist/{courseId}` - Remove course from wishlist
- `GET /api/wishlist/check/{courseId}` - Check if course is in wishlist

### Data Model

```typescript
{
  id: string;
  courseId: string;
  courseTitle: string;
  courseImage?: string;
  coursePrice: string;
  addedAt: string;
}
```

---

## 2. Course Reviews & Ratings API

### Endpoints

- `GET /api/reviews/course/{courseId}` - Get reviews for a course
- `GET /api/reviews/course/{courseId}/summary` - Get rating summary
- `POST /api/reviews` - Create a new review
- `GET /api/reviews/user` - Get current user's reviews
- `GET /api/reviews/{reviewId}` - Get a specific review
- `PATCH /api/reviews/{reviewId}` - Update a review
- `DELETE /api/reviews/{reviewId}` - Delete a review
- `POST /api/reviews/{reviewId}/helpful` - Mark review as helpful
- `DELETE /api/reviews/{reviewId}/helpful` - Remove helpful mark

### Data Model

```typescript
Review: {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  helpfulCount: number;
  isHelpful: boolean;
}

CourseRatingSummary: {
  courseId: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { 5: number; 4: number; 3: number; 2: number; 1: number };
}
```

---

## 3. Messaging API

### Endpoints

- `GET /api/conversations` - Get user's conversations
- `GET /api/conversations/search?query={query}` - Search conversations
- `POST /api/conversations` - Create a new conversation
- `GET /api/conversations/{conversationId}` - Get a specific conversation
- `GET /api/conversations/{conversationId}/messages` - Get messages in a conversation
- `POST /api/conversations/{conversationId}/messages` - Send a message
- `PATCH /api/conversations/{conversationId}/read` - Mark conversation as read
- `PATCH /api/messages/{messageId}/read` - Mark specific message as read
- `GET /api/conversations/{conversationId}/typing` - Get typing status
- `POST /api/conversations/{conversationId}/typing` - Set typing status

### Data Model

```typescript
Message: {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderRole: "student" | "teacher" | "admin" | "support";
  content: string;
  attachments?: string[];
  createdAt: string;
  isRead: boolean;
  readAt?: string;
}

Conversation: {
  id: string;
  participants: { id: string; name: string; avatar?: string; role: string }[];
  lastMessage?: { content: string; createdAt: string; senderName: string };
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  subject?: string;
  type: "student_teacher" | "student_support" | "teacher_support" | "admin";
  relatedCourseId?: string;
  relatedAssignmentId?: string;
}
```

---

## 4. Assignments API

### Endpoints (Teacher)

- `GET /api/teacher/assignments` - Get assignments created by teacher
- `POST /api/teacher/assignments` - Create a new assignment
- `GET /api/teacher/assignments/{assignmentId}` - Get a specific assignment
- `PATCH /api/teacher/assignments/{assignmentId}` - Update an assignment
- `DELETE /api/teacher/assignments/{assignmentId}` - Delete an assignment
- `GET /api/teacher/assignments/{assignmentId}/submissions` - Get all submissions
- `PATCH /api/teacher/submissions/{submissionId}/grade` - Grade a submission

### Endpoints (Student)

- `GET /api/student/assignments` - Get assignments for student
- `GET /api/student/assignments/{assignmentId}` - Get assignment details
- `POST /api/student/assignments/{assignmentId}/submissions` - Submit an assignment
- `GET /api/student/submissions` - Get student's submission history
- `GET /api/student/submissions/{submissionId}` - Get a specific submission
- `PATCH /api/student/submissions/{submissionId}` - Update a draft submission

### Data Model

```typescript
Assignment: {
  id: string;
  courseId: string;
  courseTitle: string;
  moduleId?: string;
  moduleTitle?: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description: string;
  instructions?: string;
  dueDate: string;
  maxPoints: number;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
}

Submission: {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  content: string;
  attachments?: string[];
  submittedAt: string;
  grade?: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: string;
  gradedByName?: string;
  status: "draft" | "submitted" | "graded" | "returned";
}
```

---

## 5. Practice / Exercises API

### Endpoints

- `GET /api/practice` - Get available practice content
- `GET /api/practice/{practiceId}` - Get specific practice content
- `POST /api/practice` - Create practice content (teacher/admin)
- `PATCH /api/practice/{practiceId}` - Update practice content
- `DELETE /api/practice/{practiceId}` - Delete practice content
- `POST /api/practice/attempts` - Start a practice attempt
- `POST /api/practice/attempts/{attemptId}/submit` - Submit practice attempt
- `GET /api/practice/attempts` - Get user's practice attempts
- `GET /api/practice/attempts/{attemptId}` - Get specific attempt
- `GET /api/practice/history` - Get practice history summary
- `GET /api/practice/streak` - Get user's streak information
- `GET /api/practice/leaderboard/{practiceId}` - Get leaderboard

### Data Model

```typescript
PracticeQuestion: {
  id: string;
  practiceId: string;
  question: string;
  type: "multiple_choice" | "fill_blank" | "matching" | "translation" | "listening";
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  order: number;
  points: number;
}

PracticeContent: {
  id: string;
  courseId: string;
  courseTitle: string;
  moduleId?: string;
  moduleTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  title: string;
  description: string;
  language: "english" | "german";
  level: string;
  category: string;
  questions: PracticeQuestion[];
  timeLimit?: number;
  passingScore: number;
  createdAt: string;
  updatedAt: string;
}

PracticeAttempt: {
  id: string;
  practiceId: string;
  practiceTitle: string;
  userId: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  startedAt: string;
  completedAt: string;
  timeSpent: number;
  answers: { questionId: string; userAnswer: string; isCorrect: boolean; pointsEarned: number }[];
}

StreakInfo: {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string;
  streakHistory: { date: string; practicesCompleted: number }[];
}
```

---

## 6. User Settings/Profile API

### Endpoints

- `GET /api/user/profile` - Get current user's profile
- `PATCH /api/user/profile` - Update user profile
- `POST /api/user/profile/avatar` - Upload avatar
- `DELETE /api/user/profile/avatar` - Remove avatar
- `POST /api/user/password/change` - Change password
- `GET /api/user/2fa/status` - Get 2FA status
- `POST /api/user/2fa/enable` - Enable 2FA
- `POST /api/user/2fa/verify` - Verify 2FA setup
- `POST /api/user/2fa/disable` - Disable 2FA
- `POST /api/user/2fa/backup/regenerate` - Regenerate backup codes
- `GET /api/user/notifications/preferences` - Get notification preferences
- `PATCH /api/user/notifications/preferences` - Update notification preferences
- `POST /api/user/account/delete` - Request account deletion
- `DELETE /api/user/account/delete/{token}` - Confirm account deletion
- `POST /api/user/account/delete/cancel` - Cancel pending deletion

### Data Model

```typescript
UserProfile: {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  country?: string;
  language: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

NotificationPreferences: {
  email: { booking: boolean; payment: boolean; assignment: boolean; message: boolean; promotion: boolean; newsletter: boolean };
  push: { booking: boolean; payment: boolean; assignment: boolean; message: boolean; promotion: boolean };
  inApp: { booking: boolean; payment: boolean; assignment: boolean; message: boolean; promotion: boolean };
}

TwoFactorStatus: {
  enabled: boolean;
  method: "sms" | "app" | "email";
  phoneNumber?: string;
  email?: string;
  backupCodes?: string[];
}
```

---

## 7. Notifications API

### Endpoints

- `GET /api/notifications` - Get user's notifications
- `GET /api/notifications/stats` - Get notification statistics
- `GET /api/notifications/{notificationId}` - Get a specific notification
- `PATCH /api/notifications/{notificationId}/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/{notificationId}` - Delete a notification
- `DELETE /api/notifications/clear` - Clear all notifications
- `POST /api/notifications/{notificationId}/action` - Execute notification action
- `POST /api/notifications/test` - Create a test notification

### Data Model

```typescript
Notification: {
  id: string;
  userId: string;
  type: "booking" | "payment" | "assignment" | "message" | "promotion" | "system";
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  expiresAt?: string;
  actionUrl?: string;
  actionLabel?: string;
}

NotificationStats: {
  total: number;
  unread: number;
  byType: { booking: number; payment: number; assignment: number; message: number; promotion: number; system: number };
}
```

---

## 8. Contact / Support API

### Endpoints

- `POST /api/contact` - Submit contact form (public)
- `GET /api/support/tickets` - Get user's support tickets
- `POST /api/support/tickets` - Create a new support ticket
- `GET /api/support/tickets/{ticketId}` - Get a specific support ticket
- `PATCH /api/support/tickets/{ticketId}` - Update support ticket
- `POST /api/support/tickets/{ticketId}/close` - Close a support ticket
- `POST /api/support/tickets/{ticketId}/reopen` - Reopen a support ticket
- `POST /api/support/tickets/{ticketId}/messages` - Add a message
- `GET /api/support/tickets/{ticketId}/messages` - Get all messages
- `POST /api/support/tickets/{ticketId}/messages/{messageId}/upload` - Upload attachment
- `GET /api/support/faq` - Get FAQ articles

`PATCH /api/support/tickets/{ticketId}` accepts any supported subset of `subject`, `category`, `priority`, and `status`. Status values are `open`, `in_progress`, `resolved`, and `closed`; closing and reopening may also use the dedicated endpoints above. Ticket/message visibility and status changes must be authorized by the backend for the current role.

### Data Model

```typescript
SupportTicket: {
  id: string;
  userId?: string;
  userName?: string;
  userEmail: string;
  subject: string;
  category: "technical" | "billing" | "academic" | "account" | "general";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  description: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  assignedTo?: string;
  assignedToName?: string;
  messages: SupportMessage[];
}

SupportMessage: {
  id: string;
  ticketId: string;
  userId?: string;
  userName?: string;
  isFromSupport: boolean;
  content: string;
  attachments?: string[];
  createdAt: string;
  isInternal?: boolean;
}
```

---

## 9. Newsletter API

### Endpoints (Public)

- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `POST /api/newsletter/unsubscribe` - Unsubscribe from newsletter
- `GET /api/newsletter/preferences/{token}` - Get newsletter preferences
- `PATCH /api/newsletter/preferences/{token}` - Update newsletter preferences
- `POST /api/blog/newsletter/subscribe` - Subscribe from blog page

### Endpoints (Admin)

- `GET /api/newsletter/subscribers` - Get all subscribers
- `GET /api/newsletter/subscribers/{subscriberId}` - Get specific subscriber
- `PATCH /api/newsletter/subscribers/{subscriberId}` - Update subscriber
- `DELETE /api/newsletter/subscribers/{subscriberId}` - Delete subscriber
- `POST /api/newsletter/subscribers/import` - Import subscribers from CSV
- `GET /api/newsletter/campaigns` - Get all campaigns
- `POST /api/newsletter/campaigns` - Create a new campaign
- `GET /api/newsletter/campaigns/{campaignId}` - Get specific campaign
- `PATCH /api/newsletter/campaigns/{campaignId}` - Update campaign
- `POST /api/newsletter/campaigns/{campaignId}/send` - Send campaign
- `DELETE /api/newsletter/campaigns/{campaignId}` - Delete campaign
- `GET /api/newsletter/stats` - Get newsletter statistics

### Data Model

```typescript
NewsletterSubscriber: {
  id: string;
  email: string;
  name?: string;
  status: "active" | "unsubscribed" | "bounced" | "pending";
  subscribedAt: string;
  unsubscribedAt?: string;
  preferences: { blog: boolean; courses: boolean; promotions: boolean; tips: boolean };
  source: "website" | "blog" | "admin" | "import";
}

NewsletterCampaign: {
  id: string;
  subject: string;
  content: string;
  category: "blog" | "courses" | "promotions" | "tips";
  status: "draft" | "scheduled" | "sent";
  scheduledAt?: string;
  sentAt?: string;
  recipientCount: number;
  openCount: number;
  clickCount: number;
  createdAt: string;
  createdBy: string;
}
```

---

## 10. Course Search/Filtering API

### Endpoints

- `GET /api/courses/search` - Search courses with filters and pagination
- `GET /api/courses/suggestions` - Get search suggestions (autocomplete)
- `GET /api/courses/filters` - Get available filter options
- `GET /api/courses/featured` - Get featured courses
- `GET /api/courses/trending` - Get trending courses
- `GET /api/courses/similar/{courseId}` - Get similar courses

### Data Model

```typescript
CourseSearchResult: {
  id: string;
  title: string;
  level: string;
  desc: string;
  lessons: number;
  students: number;
  price: string;
  duration?: string;
  image?: string;
  category?: string;
  teacher?: { id: string; name: string; avatar?: string };
  rating?: number;
  reviewCount?: number;
  discountPercent?: number;
  language: string;
  featured: boolean;
}

SearchResults: {
  courses: CourseSearchResult[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  facets: {
    levels: { value: string; count: number }[];
    categories: { value: string; count: number }[];
    languages: { value: string; count: number }[];
    priceRanges: { label: string; min: number; max: number; count: number }[];
  };
}
```

---

## 11. Student Dashboard Data API

### Endpoints

- `GET /api/student/dashboard/upcoming-classes` - Get upcoming classes
- `GET /api/student/dashboard/calendar` - Get calendar events
- `GET /api/student/dashboard/recent-activity` - Get recent activity
- `GET /api/student/dashboard/statistics` - Get study statistics
- `GET /api/student/dashboard/overview` - Get complete dashboard overview

### Data Model

```typescript
UpcomingClass: {
  id: string;
  courseId: string;
  courseTitle: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar?: string;
  subject: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  location?: string;
  meetingUrl?: string;
  status: "scheduled" | "ongoing" | "completed" | "cancelled";
  type: "one_on_one" | "group" | "practice";
}

CalendarEvent: {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  type: "class" | "assignment_due" | "exam" | "practice" | "other";
  courseId?: string;
  courseTitle?: string;
  color?: string;
}

RecentActivity: {
  id: string;
  type: "lesson_completed" | "course_enrolled" | "assignment_submitted" | "practice_completed" | "booking_created";
  title: string;
  description: string;
  courseId?: string;
  courseTitle?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

StudyStatistics: {
  totalStudyTime: number;
  todayStudyTime: number;
  weekStudyTime: number;
  monthStudyTime: number;
  dailyGoal: number;
  dailyGoalProgress: number;
  currentStreak: number;
  longestStreak: number;
  lessonsCompleted: number;
  coursesInProgress: number;
  coursesCompleted: number;
  averageScore: number;
  weeklyActivity: { date: string; minutes: number }[];
  activityByType: { lessons: number; practice: number; assignments: number; classes: number };
}
```

---

## 12. Teacher Dashboard Data API

### Endpoints

- `GET /api/teacher/dashboard/classes` - Get teacher's classes
- `GET /api/teacher/dashboard/schedule` - Get teacher's schedule
- `GET /api/teacher/dashboard/students` - Get teacher's students
- `GET /api/teacher/dashboard/earnings` - Get teacher's earnings
- `POST /api/teacher/dashboard/withdrawals` - Submit a teacher withdrawal request (`{ amount, iban }`)
- `GET /api/teacher/dashboard/analytics` - Get teacher's analytics
- `GET /api/teacher/dashboard/overview` - Get complete dashboard overview

### Data Model

```typescript
TeacherClass: {
  id: string;
  courseId: string;
  courseTitle: string;
  teacherId: string;
  subject: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  status: "scheduled" | "ongoing" | "completed" | "cancelled";
  type: "one_on_one" | "group";
  meetingUrl?: string;
  notes?: string;
}

TeacherStudent: {
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lastActivity: string;
  upcomingClass?: { id: string; scheduledDate: string; startTime: string };
}

TeacherEarnings: {
  teacherId: string;
  period: string;
  totalEarnings: number;
  currency: string;
  completedClasses: number;
  totalHours: number;
  hourlyRate: number;
  breakdown: { date: string; earnings: number; hours: number; classes: number }[];
}

TeacherAnalytics: {
  totalStudents: number;
  activeStudents: number;
  totalClasses: number;
  completedClasses: number;
  cancelledClasses: number;
  averageRating: number;
  totalHoursTaught: number;
  currentMonthEarnings: number;
  lastMonthEarnings: number;
  earningsGrowth: number;
  studentProgressRate: number;
  classCompletionRate: number;
  upcomingClasses: number;
  weeklySchedule: { day: string; classes: number; hours: number }[];
  monthlyTrends: { month: string; earnings: number; classes: number; students: number }[];
}
```

---

## Implementation Notes

### Authentication

All endpoints except public ones (contact form, newsletter subscription) require authentication. Use the existing authentication system with role-based authorization where applicable.

### Response Format

Follow the existing response format conventions:

- Use camelCase for JSON properties (or configure ASP.NET to output camelCase)
- Use ISO 8601 format for dates
- Return appropriate HTTP status codes
- Include error details in error responses

### Pagination

For list endpoints, support:

- `page` (default: 1)
- `pageSize` (default: 20, max: 100)
- Return paged response with `items`, `page`, `pageSize`, `totalCount`, `totalPages`

### Error Handling

Return appropriate HTTP status codes:

- 200 OK - Successful GET
- 201 Created - Successful POST
- 204 No Content - Successful DELETE/PUT with no response body
- 400 Bad Request - Invalid request data
- 401 Unauthorized - Missing or invalid authentication
- 403 Forbidden - Valid auth but insufficient permissions
- 404 Not Found - Resource doesn't exist
- 500 Internal Server Error - Server error

### File Uploads

For file upload endpoints (avatar, attachments):

- Accept `multipart/form-data`
- Return the uploaded file URL in the response
- Validate file types and sizes

### Real-time Features

For messaging and typing status:

- Consider implementing SignalR for real-time updates
- The API endpoints provided are polling-based fallbacks
- Real-time implementation can replace polling where beneficial

---

## Frontend Integration

All API clients are exported from `lib/api/index.ts` for easy importing:

```typescript
import {
  getWishlist,
  addToWishlist,
  getCourseReviews,
  createReview,
  getConversations,
  sendMessage,
  // ... etc
} from "@/lib/api";
```

Each API client follows the same pattern:

- Type definitions for request/response
- Normalization functions to handle backend response format
- Consistent error handling via `apiFetch`

---

## Testing

Use the existing test infrastructure in `lib/api/__tests__/` to test the new endpoints once implemented. Refer to `API_TESTING_EXAMPLES.md` for testing patterns.

---

## 13. Teacher Profile API

### Endpoints

- `GET /api/teacher/profile` - Get current teacher's profile
- `POST /api/teacher/profile/complete` - Complete teacher profile (after registration)
- `PATCH /api/teacher/profile` - Update teacher profile settings (including video)
- `POST /api/teacher/profile/avatar` - Upload teacher avatar image
- `POST /api/teacher/profile/video` - Upload teacher introduction video

### Data Model

```typescript
TeacherProfileData: {
  subject: string;
  level: string;
  teachingLanguage: "english" | "german";
  bio: string;
  avatarUrl?: string;
  videoUrl?: string;
}

TeacherProfileResponse: {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  teachingLanguage: "english" | "german";
  subject: string;
  level: string;
  rating: number;
  bio: string;
  videoUrl?: string;
  status: "pending" | "active" | "suspended";
}
```

### Endpoint Details

#### GET /api/teacher/profile

Get the current authenticated teacher's complete profile.

**Response:** `TeacherProfileResponse`

#### POST /api/teacher/profile/complete

Called after a new teacher registers to complete their profile with teaching-specific information.

**Request:** `Omit<TeacherProfileData, "videoUrl">` (subject, level, teachingLanguage, bio, avatarUrl)
**Response:** `TeacherProfileResponse`

#### PATCH /api/teacher/profile

Update teacher profile fields. Used when teacher updates their settings.

**Request:** `Partial<TeacherProfileData>` (any combination of fields)
**Response:** `TeacherProfileResponse`

#### POST /api/teacher/profile/avatar

Upload teacher avatar image file.

**Request:** `FormData` with `file` field
**Response:** `{ avatarUrl: string }`

#### POST /api/teacher/profile/video

Upload teacher introduction video file.

**Request:** `FormData` with `file` field
**Response:** `{ videoUrl: string }`

---

## Priority Implementation Order

Recommended implementation order for backend developers:

1. **Wishlist** - Simple CRUD, high value
2. **Course Reviews & Ratings** - Critical for course pages
3. **User Settings/Profile** - Essential user management
4. **Teacher Profile** - Essential for teacher registration flow
5. **Notifications** - Core engagement feature
6. **Contact / Support** - Customer service requirement
7. **Newsletter** - Marketing requirement
8. **Course Search/Filtering** - User experience improvement
9. **Student Dashboard Data** - Student experience
10. **Teacher Dashboard Data** - Teacher experience
11. **Assignments** - Academic feature
12. **Practice / Exercises** - Learning feature
13. **Messaging** - Advanced feature (consider SignalR)

---

## Existing APIs (Already Implemented)

The following APIs were already implemented and should NOT be duplicated:

- Authentication (login, register, OTP, forgot password)
- Courses (basic CRUD)
- Enrollments
- Modules
- Lessons
- Lesson progress
- Course learning
- Student/teacher dashboards (base APIs)
- Teacher profiles
- Teacher availability
- Bookings
- Course details
- Teacher course students
- Blog
- Logout

See `API_SPECIFICATION.md` and `ADMIN_API_SPECIFICATION.md` for details on existing APIs.
