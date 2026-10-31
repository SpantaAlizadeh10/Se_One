# Backend Complete Requirements - تمام نیازمندی‌های Backend

این فایل تمام تغییرات مورد نیاز برای backend را خلاصه می‌کند.

---

## 📋 فهرست تغییرات

### 1. سیستم انتخاب کلاس (Class Selection System)
### 2. سیستم پرداخت با واتساپ (Payment with WhatsApp)
### 3. اصلاح زمان‌های در دسترسی معلم (Teacher Availability)
### 4. اصلاح فایل‌های ضمیمه در چت (Chat Attachments)

---

## 1. سیستم انتخاب کلاس

### Frontend Route
- **URL**: `/dashboard/bookClass` (نه `/dashboard/teachers`)
- **Page**: نمایش کلاس‌ها با فیلترها

### Backend Endpoints مورد نیاز

#### GET /api/classes
لیست کلاس‌ها با فیلترهای کامل

**Query Parameters:**
- `teacherId` (optional) - فیلتر بر اساس معلم
- `type` (optional) - "public" یا "private"
- `availableOnly` (optional) - boolean، فقط کلاس‌های با ظرفیت
- `level` (optional) - سطح (A1, A2, B1, etc.)
- `subject` (optional) - موضوع
- `page` (default: 1) - صفحه
- `pageSize` (default: 20) - تعداد در هر صفحه

**Response:**
```json
{
  "items": [
    {
      "id": "class-1",
      "title": "Business English Conversation",
      "description": "...",
      "level": "B2",
      "subject": "Business English",
      "type": "public",
      "maxCapacity": 10,
      "currentEnrollment": 7,
      "remainingCapacity": 3,
      "basePrice": 500000,
      "finalPrice": 500000,
      "scheduledDate": "2026-11-05T10:00:00Z",
      "startTime": "10:00",
      "endTime": "11:00",
      "timeZone": "UTC",
      "status": "scheduled",
      "teacher": {
        "id": "teacher-1",
        "name": "Ali Alizadeh",
        "avatar": "/images/Teacher.jpeg",
        "rating": 4.8
      },
      "course": {
        "id": "course-1",
        "title": "Business English",
        "imageUrl": "/images/course-placeholder.jpg"
      }
    }
  ],
  "totalCount": 50,
  "page": 1,
  "pageSize": 20
}
```

#### POST /api/classes/{classId}/enroll
ثبت‌نام در کلاس

**Request Body:**
```json
{
  "inviteCode": "ABC12345",      // optional
  "invitedByStudentId": "student-2" // optional
}
```

**Response:**
```json
{
  "id": "enrollment-1",
  "classId": "class-1",
  "studentId": "student-1",
  "finalPrice": 500000,
  "discountPercent": 0,
  "status": "pending",
  "inviteCode": null,
  "invitedByStudentId": null,
  "enrolledAt": "2026-10-31T10:00:00Z",
  "cancelledAt": null
}
```

#### POST /api/classes/{classId}/invite
ایجاد کد دعوت برای کلاس خصوصی

**Response:**
```json
{
  "inviteCode": "ABC12345",
  "inviteUrl": "https://example.com/classes/class-1?invite=ABC12345"
}
```

#### GET /api/classes/{classId}/check-conflict
بررسی تدامل زمانی برای معلم

**Response:**
```json
{
  "hasConflict": false
}
```

---

## 2. سیستم پرداخت با واتساپ

### Backend Endpoints مورد نیاز

#### GET /api/payment/settings
دریافت تنظیمات پرداخت (شماره کارت و واتساپ)

**Response:**
```json
{
  "cardNumber": "6037-****-****-5678",
  "cardHolderName": "علی علیزاده",
  "bankName": "بانک ملت",
  "whatsappNumber": "+989123456789"
}
```

#### POST /api/payments
ایجاد درخواست پرداخت

**Request Body:**
```json
{
  "enrollmentId": "enrollment-1"
}
```

**Response:**
```json
{
  "id": "payment-1",
  "enrollmentId": "enrollment-1",
  "amount": 500000,
  "currency": "IRR",
  "status": "pending",
  "createdAt": "2026-10-31T10:00:00Z"
}
```

#### POST /api/payments/{paymentId}/receipt
آپلود فیش پرداخت و ارسال به واتساپ

**Request:** FormData with file

**Response:**
```json
{
  "id": "payment-1",
  "amount": 500000,
  "receiptImageUrl": "https://storage.example.com/receipts/abc123.jpg",
  "status": "pending",
  "createdAt": "2026-10-31T10:00:00Z"
}
```

#### PATCH /api/payments/{paymentId}/verify
تایید یا رد پرداخت (Admin only)

**Request Body:**
```json
{
  "approved": true,
  "rejectionReason": null
}
```

**Response:**
```json
{
  "id": "payment-1",
  "amount": 500000,
  "status": "verified",
  "rejectionReason": null,
  "verifiedAt": "2026-10-31T11:00:00Z",
  "createdAt": "2026-10-31T10:00:00Z"
}
```

#### GET /api/payments
لیست پرداخت‌ها

**Query Parameters:**
- `page` (default: 1)
- `pageSize` (default: 20)

**Response:**
```json
{
  "items": [...],
  "totalCount": 100,
  "page": 1,
  "pageSize": 20
}
```

---

## 3. اصلاح زمان‌های در دسترسی معلم

### تغییرات مورد نیاز در GET /api/teachers

**Response باید شامل فیلد `slots` باشد:**
```json
[
  {
    "id": "teacher-1",
    "name": "Ali Alizadeh",
    "avatar": "/images/Teacher.jpeg",
    "teachingLanguage": "english",
    "subject": "Business English",
    "level": "B2",
    "rating": 4.8,
    "bio": "...",
    "slots": [
      {
        "id": "slot-1",
        "day": "Monday",
        "time": "09:00 - 10:00",
        "booked": false
      }
    ]
  }
]
```

### تغییرات مورد نیاز در GET /api/teacher/availability

**Response:**
```json
[
  {
    "id": "slot-1",
    "day": "Monday",
    "time": "09:00 - 10:00",
    "booked": false
  }
]
```

### تغییرات مورد نیاز در PUT /api/teacher/availability

**Request Body:**
```json
{
  "slots": [
    {
      "id": "slot-1",
      "dayOfWeek": "Monday",
      "startTime": "09:00",
      "endTime": "10:00"
    }
  ]
}
```

---

## 4. اصلاح فایل‌های ضمیمه در چت

### تغییرات مورد نیاز در GET /api/conversations/{conversationId}/messages

**Response باید شامل `attachmentDetails` باشد:**
```json
[
  {
    "id": "message-1",
    "conversationId": "conv-1",
    "senderId": "user-1",
    "senderName": "Ali",
    "senderAvatar": "/images/avatar.jpg",
    "senderRole": "student",
    "content": "Here is the file",
    "attachments": ["https://.../file.png?token=..."],
    "attachmentDetails": [
      {
        "displayName": "file.png",
        "downloadUrl": "https://.../file.png?token=...",
        "fileType": "image",
        "fileSize": 1024000
      }
    ],
    "createdAt": "2026-10-31T10:00:00Z",
    "isRead": false,
    "readAt": null
  }
]
```

**نکته مهم:**
- `displayName`: نام فایل (نه لینک کامل)
- `downloadUrl`: لینک کامل برای دانلود
- استخراج نام فایل از URL: `9927aca766ee47328086a6644cdb5a63__addons.png` → `addons.png`

---

## مدل‌های داده (Data Models)

### CourseClass
```csharp
public class CourseClass
{
    public string Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string Level { get; set; }
    public string Subject { get; set; }
    public ClassType Type { get; set; }
    public int MaxCapacity { get; set; }
    public int CurrentEnrollment { get; set; }
    public int RemainingCapacity { get; set; }
    public decimal BasePrice { get; set; }
    public decimal FinalPrice { get; set; }
    public DateTime ScheduledDate { get; set; }
    public string StartTime { get; set; }
    public string EndTime { get; set; }
    public string TimeZone { get; set; }
    public string? MeetingUrl { get; set; }
    public ClassStatus Status { get; set; }
    public TeacherBasic Teacher { get; set; }
    public CourseBasic Course { get; set; }
}

public enum ClassType { Public, Private }
public enum ClassStatus { Scheduled, Ongoing, Completed, Cancelled }
```

### Enrollment
```csharp
public class Enrollment
{
    public string Id { get; set; }
    public string ClassId { get; set; }
    public string StudentId { get; set; }
    public decimal FinalPrice { get; set; }
    public decimal DiscountPercent { get; set; }
    public EnrollmentStatus Status { get; set; }
    public string? InviteCode { get; set; }
    public string? InvitedByStudentId { get; set; }
    public DateTime EnrolledAt { get; set; }
    public DateTime? CancelledAt { get; set; }
}

public enum EnrollmentStatus { Pending, Confirmed, Cancelled, Completed }
```

### Payment
```csharp
public class Payment
{
    public string Id { get; set; }
    public string EnrollmentId { get; set; }
    public string StudentId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; }
    public string? ReceiptImageUrl { get; set; }
    public string? WhatsAppMessageId { get; set; }
    public PaymentStatus Status { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public string? VerifiedBy { get; set; }
}

public enum PaymentStatus { Pending, Verified, Rejected, Refunded }
```

### PaymentSettings
```csharp
public class PaymentSettings
{
    public string Id { get; set; }
    public string CardNumber { get; set; }
    public string CardHolderName { get; set; }
    public string BankName { get; set; }
    public string? WhatsAppNumber { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

### AttachmentDetail
```csharp
public class AttachmentDetail
{
    public string DisplayName { get; set; }
    public string DownloadUrl { get; set; }
    public string? FileType { get; set; }
    public long? FileSize { get; set; }
}
```

---

## منطق کسب‌وکار (Business Logic)

### 1. محاسبه قیمت کلاس
```csharp
public decimal CalculateFinalPrice(CourseClass courseClass, int currentEnrollmentCount)
{
    // کلاس عمومی: قیمت پایه
    if (courseClass.Type == ClassType.Public)
        return courseClass.BasePrice;

    // کلاس خصوصی: اگر نفر دوم هست، 30% تخفیف
    if (courseClass.Type == ClassType.Private && currentEnrollmentCount >= 1)
        return courseClass.BasePrice * 0.70m; // 30% تخفیف

    // کلاس خصوصی با یک نفر: قیمت کامل
    return courseClass.BasePrice;
}
```

### 2. Conflict Detection برای معلم
```csharp
public bool HasScheduleConflict(
    string teacherId,
    DateTime scheduledDate,
    string startTime,
    string endTime,
    string? excludeClassId = null)
{
    var teacherClasses = _context.CourseClasses
        .Where(c => c.TeacherId == teacherId
            && c.ScheduledDate.Date == scheduledDate.Date
            && c.Status == ClassStatus.Scheduled
            && (excludeClassId == null || c.Id != excludeClassId))
        .ToList();

    foreach (var existingClass in teacherClasses)
    {
        if (IsTimeOverlap(startTime, endTime, existingClass.StartTime, existingClass.EndTime))
            return true;
    }

    return false;
}

private bool IsTimeOverlap(string start1, string end1, string start2, string end2)
{
    var s1 = TimeSpan.Parse(start1);
    var e1 = TimeSpan.Parse(end1);
    var s2 = TimeSpan.Parse(start2);
    var e2 = TimeSpan.Parse(end2);

    return s1 < e2 && s2 < e1;
}
```

### 3. استخراج نام فایل از URL
```csharp
private string ExtractFileName(string url)
{
    try
    {
        var uri = new Uri(url);
        var path = uri.AbsolutePath;
        var fileName = Path.GetFileName(path);

        // اگر fileName شامل __ است، بخش بعد از __ را بگیرید
        if (fileName.Contains("__"))
            fileName = fileName.Split("__").Last();

        // اگر fileName شامل ? است، بخش قبل از ? را بگیرید
        if (fileName.Contains("?"))
            fileName = fileName.Split("?").First();

        return string.IsNullOrEmpty(fileName) ? "Attachment" : fileName;
    }
    catch
    {
        return "Attachment";
    }
}
```

---

## نمونه پیاده‌سازی Endpoint (C#)

### GET /api/classes
```csharp
[HttpGet("api/classes")]
[Authorize(Roles = "Student")]
public async Task<ActionResult<PagedResult<ClassDto>>> GetClasses(
    [FromQuery] string? teacherId = null,
    [FromQuery] ClassType? type = null,
    [FromQuery] bool? availableOnly = null,
    [FromQuery] string? level = null,
    [FromQuery] string? subject = null,
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 20)
{
    var query = _context.CourseClasses
        .Include(c => c.Teacher)
        .Include(c => c.Course)
        .Where(c => c.Status == ClassStatus.Scheduled);

    if (!string.IsNullOrEmpty(teacherId))
        query = query.Where(c => c.TeacherId == teacherId);

    if (type.HasValue)
        query = query.Where(c => c.Type == type.Value);

    if (availableOnly == true)
        query = query.Where(c => c.CurrentEnrollment < c.MaxCapacity);

    if (!string.IsNullOrEmpty(level))
        query = query.Where(c => c.Level == level);

    if (!string.IsNullOrEmpty(subject))
        query = query.Where(c => c.Subject == subject);

    var totalCount = await query.CountAsync();
    var classes = await query
        .OrderBy(c => c.ScheduledDate)
        .ThenBy(c => c.StartTime)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();

    var result = classes.Select(c => new ClassDto
    {
        Id = c.Id,
        Title = c.Title,
        Description = c.Description,
        Level = c.Level,
        Subject = c.Subject,
        Type = c.Type,
        MaxCapacity = c.MaxCapacity,
        CurrentEnrollment = c.CurrentEnrollment,
        RemainingCapacity = c.MaxCapacity - c.CurrentEnrollment,
        BasePrice = c.BasePrice,
        FinalPrice = _pricingService.CalculateFinalPrice(c, c.CurrentEnrollment),
        ScheduledDate = c.ScheduledDate,
        StartTime = c.StartTime,
        EndTime = c.EndTime,
        Teacher = new TeacherBasicDto
        {
            Id = c.Teacher.Id,
            Name = c.Teacher.FullName,
            Avatar = c.Teacher.AvatarUrl,
            Rating = c.Teacher.Rating
        },
        Course = new CourseBasicDto
        {
            Id = c.Course.Id,
            Title = c.Course.Title,
            ImageUrl = c.Course.ImageUrl
        }
    }).ToList();

    return Ok(new PagedResult<ClassDto>
    {
        Items = result,
        TotalCount = totalCount,
        Page = page,
        PageSize = pageSize
    });
}
```

---

## فایل‌های مستندات کامل

برای جزئیات بیشتر، به این فایل‌ها مراجعه کنید:

1. **`CLASS_SELECTION_SYSTEM.md`** - سیستم انتخاب کلاس با جزئیات کامل
2. **`BACKEND_PAYMENT_SYSTEM.md`** - سیستم پرداخت با واتساپ
3. **`BACKEND_AVAILABILITY_FIX.md`** - اصلاح زمان‌های در دسترسی
4. **`BACKEND_ATTACHMENT_FIX.md`** - اصلاح فایل‌های ضمیمه در چت

---

## خلاصه تغییرات Frontend

### مسیرها (Routes)
- ❌ `/dashboard/teachers` → حذف شد
- ✅ `/dashboard/bookClass` → صفحه انتخاب کلاس با فیلترها

### سایدبار
- تغییر نام از "پیدا کردن معلم" به "پیدا کردن کلاس"
- تغییر آیکون از GraduationCap به Search

### کامپوننت‌ها
- `components/class-selection/ClassSelectionPage.tsx` - صفحه انتخاب کلاس کامل
- `lib/api/classes.ts` - API client برای کلاس‌ها
- فیلترها: معلم، نوع کلاس، سطح، موضوع، ظرفیت
- سیستم پرداخت با modal
- سیستم دعوت دوست برای کلاس خصوصی

---

## اولویت پیاده‌سازی

### Phase 1 (ضروری)
1. ✅ GET /api/classes - لیست کلاس‌ها با فیلترها
2. ✅ POST /api/classes/{classId}/enroll - ثبت‌نام در کلاس
3. ✅ GET /api/teachers - با فیلد `slots`

### Phase 2 (مهم)
4. ✅ GET /api/payment/settings - تنظیمات پرداخت
5. ✅ POST /api/payments - ایجاد درخواست پرداخت
6. ✅ POST /api/payments/{paymentId}/receipt - آپلود فیش
7. ✅ PATCH /api/payments/{paymentId}/verify - تایید پرداخت

### Phase 3 (پیشرفته)
8. ✅ POST /api/classes/{classId}/invite - کد دعوت
9. ✅ GET /api/teacher/availability - زمان‌های در دسترسی
10. ✅ PUT /api/teacher/availability - بروزرسانی زمان‌ها
11. ✅ GET /api/conversations/{conversationId}/messages - با attachmentDetails

---

## تست کردن

پس از پیاده‌سازی هر endpoint:

1. تست با curl یا Postman
2. بررسی فرمت JSON
3. بررسی فیلدهای مورد نیاز
4. تست فیلترها
5. تست خطاها (validation)
