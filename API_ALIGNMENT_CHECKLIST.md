# API Alignment Checklist

This document ensures all teacher-related APIs and forms are aligned across the frontend and backend.

## ✅ Data Model Alignment

### Shared Teacher Fields
- [x] `id` / `Id` - Unique identifier
- [x] `name` / `fullName` / `FullName` - Teacher's name
- [x] `email` / `Email` - Teacher's email
- [x] `avatar` / `avatarUrl` / `AvatarUrl` - Profile image URL
- [x] `teachingLanguage` / `TeachingLanguage` - "english" or "german"
- [x] `subject` / `Subject` - Teaching specialty
- [x] `level` / `Level` - Teaching level (e.g., "A1 - C1")
- [x] `rating` / `Rating` - Average rating (0-5)
- [x] `bio` / `Bio` - Teacher biography
- [x] `videoUrl` / `VideoUrl` - Introduction video URL (optional)
- [x] `status` / `Status` - "pending", "active", "suspended"

### Field Name Consistency
- [x] All specifications use camelCase for JSON properties
- [x] Frontend clients handle both camelCase and PascalCase
- [x] Backend should output camelCase for consistency

## ✅ Endpoint Alignment

### Registration Flow
- [x] `POST /api/auth/register` - Basic user registration
  - Fields: `fullName`, `email`, `password`, `role`
  - For teachers: redirects to profile completion

### Profile Completion Flow
- [x] `POST /api/teacher/profile/complete` - Complete teacher profile
  - Fields: `subject`, `level`, `teachingLanguage`, `bio`, `avatarUrl?`
  - Called after registration

### Admin Teacher Management
- [x] `GET /api/admin/teachers` - List teachers
- [x] `POST /api/admin/teachers` - Create teacher (admin)
  - Fields: `fullName`, `email`, `subject`, `level`, `teachingLanguage`, `bio`, `avatarUrl?`, `videoUrl?`
- [x] `PATCH /api/admin/teachers/{teacherId}` - Update teacher
- [x] `PATCH /api/admin/teachers/{teacherId}/status` - Update status
- [x] `DELETE /api/admin/teachers/{teacherId}` - Delete teacher

### Teacher Self-Management
- [x] `GET /api/teacher/profile` - Get own profile
- [x] `PATCH /api/teacher/profile` - Update own profile
- [x] `POST /api/teacher/profile/avatar` - Upload avatar
- [x] `POST /api/teacher/profile/video` - Upload video

### Public Teacher Listing
- [x] `GET /api/teachers` - Get all teachers (public)
  - Includes `videoUrl` field

## ✅ Frontend Form Alignment

### Registration Form
- [x] `/app/[lang]/(marketing)/signup/page.tsx`
  - Fields: `firstName`, `lastName`, `email`, `password`, `role`
  - Teachers redirect to `/teacher/complete-profile`

### Profile Completion Form
- [x] `/app/[lang]/(teacher)/teacher/complete-profile/page.tsx`
  - Fields: `subject`, `level`, `teachingLanguage`, `bio`
  - Calls `completeTeacherProfile()`

### Admin Add Teacher Form
- [x] `/app/[lang]/(admin)/admin/teachers/page.tsx` (AddTeacherForm)
  - Fields: `name`, `subject`, `level`, `teachingLanguage`, `bio`, `avatar`, `videoUrl`
  - Calls `createAdminTeacher()`

### Admin Edit Teacher Form
- [x] `/app/[lang]/(admin)/admin/teachers/page.tsx` (EditTeacherForm)
  - Fields: `name`, `subject`, `level`, `teachingLanguage`, `bio`, `rating`, `videoUrl`
  - Calls `updateAdminTeacher()`

### Teacher Settings Form
- [x] `/components/teacher-settings/TeacherSettingsView.tsx`
  - Fields: `subject`, `level`, `teachingLanguage`, `bio`, `videoUrl`
  - Supports avatar and video upload
  - Calls `updateTeacherProfile()`

## ✅ API Client Alignment

### Frontend API Clients
- [x] `/lib/api/auth.ts` - Registration
- [x] `/lib/api/admin.ts` - Admin teacher management
- [x] `/lib/api/teachers.ts` - Public teacher listing
- [x] `/lib/api/teacher-profile.ts` - Teacher profile management

### Data Type Definitions
- [x] `TeacherProfile` - Public teacher data
- [x] `AdminTeacher` - Admin teacher data
- [x] `TeacherProfileData` - Profile completion/update data
- [x] `TeacherProfileResponse` - Complete teacher response

## ✅ Specification Document Alignment

### API Specifications
- [x] `API_SPECIFICATION.md` - Public teachers endpoint (includes `videoUrl`)
- [x] `ADMIN_API_SPECIFICATION.md` - Admin teachers endpoints (includes `videoUrl`)
- [x] `NEW_API_SPECIFICATION.md` - Teacher profile API endpoints
- [x] `BACKEND_TEACHER_API_SUMMARY.md` - Complete backend summary

### Documentation Updates
- [x] All specs include `videoUrl` field
- [x] All specs include file upload endpoints
- [x] All specs document the registration flow
- [x] All specs use consistent field naming

## ✅ Database Schema Alignment

### Recommended Tables
- [x] `Users` - Basic user data
- [x] `TeacherProfiles` - Teacher-specific data
- [x] `AvailabilitySlots` - Teacher availability

### Field Mapping
- [x] `Users.FullName` ↔ `teacher.fullName`
- [x] `Users.Email` ↔ `teacher.email`
- [x] `TeacherProfiles.Subject` ↔ `teacher.subject`
- [x] `TeacherProfiles.Level` ↔ `teacher.level`
- [x] `TeacherProfiles.TeachingLanguage` ↔ `teacher.teachingLanguage`
- [x] `TeacherProfiles.Bio` ↔ `teacher.bio`
- [x] `TeacherProfiles.AvatarUrl` ↔ `teacher.avatarUrl`
- [x] `TeacherProfiles.VideoUrl` ↔ `teacher.videoUrl`
- [x] `TeacherProfiles.Status` ↔ `teacher.status`

## ✅ File Upload Alignment

### Avatar Upload
- [x] Endpoint: `POST /api/teacher/profile/avatar`
- [x] Request: FormData with `file` field
- [x] Response: `{ avatarUrl: string }`
- [x] Admin form: URL input field
- [x] Teacher settings: File upload button

### Video Upload
- [x] Endpoint: `POST /api/teacher/profile/video`
- [x] Request: FormData with `file` field
- [x] Response: `{ videoUrl: string }`
- [x] Admin form: URL input field
- [x] Teacher settings: File upload button with preview

## ✅ Workflow Alignment

### Teacher Registration Flow
1. [x] User registers with basic info
2. [x] Redirected to profile completion
3. [x] Fills in teaching-specific info
4. [x] Profile saved with `status: "pending"`
5. [x] Admin approves teacher
6. [x] Teacher becomes visible

### Admin Creation Flow
1. [x] Admin fills complete teacher form
2. [x] Teacher created with all info
3. [x] Status set to `pending` by default
4. [x] Admin can approve immediately

### Teacher Profile Update Flow
1. [x] Teacher accesses settings
2. [x] Updates any profile fields
3. [x] Uploads new avatar/video if desired
4. [x] Changes saved immediately

## 📋 Backend Developer Handoff

### Ready for Implementation
- [x] All frontend forms are aligned
- [x] All API clients are consistent
- [x] All specifications are updated
- [x] Data models are consistent
- [x] File upload flows are documented
- [x] Registration workflow is clear

### Files to Reference
1. `BACKEND_TEACHER_API_SUMMARY.md` - Complete API documentation
2. `NEW_API_SPECIFICATION.md` - New endpoints specification
3. `ADMIN_API_SPECIFICATION.md` - Admin endpoints
4. `API_SPECIFICATION.md` - Public endpoints
5. `lib/api/teacher-profile.ts` - Frontend API client implementation
6. `lib/api/admin.ts` - Admin API client implementation

### Implementation Priority
1. **High Priority:**
   - `POST /api/teacher/profile/complete` - Required for registration flow
   - `GET /api/teacher/profile` - Required for teacher settings
   - `PATCH /api/teacher/profile` - Required for profile updates

2. **Medium Priority:**
   - `POST /api/teacher/profile/avatar` - Nice to have
   - `POST /api/teacher/profile/video` - Nice to have
   - Update existing admin endpoints to include `videoUrl`

3. **Low Priority:**
   - Enhanced validation
   - Additional teacher analytics

## ✅ Testing Checklist

### Unit Tests
- [ ] Test teacher profile completion
- [ ] Test teacher profile update
- [ ] Test avatar upload
- [ ] Test video upload
- [ ] Test admin teacher creation
- [ ] Test admin teacher update

### Integration Tests
- [ ] Test complete registration flow
- [ ] Test admin approval workflow
- [ ] Test teacher settings flow
- [ ] Test public teacher listing with videoUrl

### Manual Testing
- [ ] Register as new teacher
- [ ] Complete profile
- [ ] Upload avatar
- [ ] Upload video
- [ ] Approve as admin
- [ ] Verify teacher appears in public listing
- [ ] Update teacher profile
- [ ] Delete teacher

---

**Status:** ✅ All frontend APIs and forms are aligned and ready for backend implementation.

**Next Steps:** Backend developer should implement the endpoints as documented in `BACKEND_TEACHER_API_SUMMARY.md`.
