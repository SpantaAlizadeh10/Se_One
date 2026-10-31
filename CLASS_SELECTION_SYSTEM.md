# سیستم انتخاب کلاس - معماری و پیاده‌سازی

## نیازمندی‌ها

### برای دانش‌آموز
1. بعد از ثبت‌نام، بتواند تمام کلاس‌ها را ببیند
2. بتواند کلاس‌ها را فیلتر کند:
   - بر اساس معلم
   - بر اساس نوع کلاس (خصوصی/عمومی)
   - بر اساس ظرفیت باقی‌مانده
3. بتواند کلاس‌های با ظرفیت باقی‌مانده را انتخاب کند
4. برای کلاس‌های خصوصی، بتواند یک دوست را دعوت کند (نفر دوم)

### ظرفیت کلاس‌ها
- **کلاس‌های عمومی**: 10 نفر (100% ظرفیت)
- **کلاس‌های خصوصی**: 2 نفر
  - نفر دوم توسط دانش‌آموز دعوت می‌شود

### قیمت‌گذاری
- وقتی دو نفر برای کلاس خصوصی ثبت‌نام می‌کنند: **30% تخفیف**

### محدودیت معلم
- معلم نمی‌تواند در یک ساعت دو کلاس داشته باشد (conflict detection)

---

## مدل‌های داده (Data Models)

### 1. CourseClass (کلاس)

```csharp
public class CourseClass
{
    public string Id { get; set; }
    public string CourseId { get; set; }           // دوره مربوطه
    public string TeacherId { get; set; }          // معلم کلاس
    public string Title { get; set; }              // عنوان کلاس
    public string Description { get; set; }       // توضیحات
    public string Level { get; set; }              // سطح (A1, A2, B1, etc.)
    public string Subject { get; set; }            // موضوع
    public ClassType Type { get; set; }           // نوع کلاس (خصوصی/عمومی)
    public int MaxCapacity { get; set; }           // حداکثر ظرفیت (10 برای عمومی، 2 برای خصوصی)
    public int CurrentEnrollment { get; set; }    // تعداد ثبت‌نام شده
    public decimal BasePrice { get; set; }         // قیمت پایه
    public DateTime ScheduledDate { get; set; }    // تاریخ برگزاری
    public string StartTime { get; set; }          // ساعت شروع (09:00)
    public string EndTime { get; set; }            // ساعت پایان (10:00)
    public string TimeZone { get; set; }           // timezone
    public string MeetingUrl { get; set; }         // لینک جلسه (Zoom, etc.)
    public ClassStatus Status { get; set; }        // وضعیت کلاس
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public Course Course { get; set; }
    public TeacherProfile Teacher { get; set; }
    public List<Enrollment> Enrollments { get; set; }
}

public enum ClassType
{
    Public,     // عمومی - 10 نفر
    Private     // خصوصی - 2 نفر
}

public enum ClassStatus
{
    Scheduled,  // برنامه‌ریزی شده
    Ongoing,    // در حال برگزاری
    Completed,  // تکمیل شده
    Cancelled   // لغو شده
}
```

### 2. Enrollment (ثبت‌نام)

```csharp
public class Enrollment
{
    public string Id { get; set; }
    public string ClassId { get; set; }           // کلاس
    public string StudentId { get; set; }          // دانش‌آموز
    public decimal FinalPrice { get; set; }        // قیمت نهایی (با تخفیف)
    public decimal DiscountPercent { get; set; }   // درصد تخفیف
    public EnrollmentStatus Status { get; set; }   // وضعیت ثبت‌نام
    public string? InviteCode { get; set; }       // کد دعوت (برای کلاس خصوصی)
    public string? InvitedByStudentId { get; set; } // دانش‌آموزی که دعوت کرده
    public DateTime EnrolledAt { get; set; }
    public DateTime? CancelledAt { get; set; }

    // Navigation properties
    public CourseClass Class { get; set; }
    public Student Student { get; set; }
}

public enum EnrollmentStatus
{
    Pending,    // در انتظار پرداخت
    Confirmed,  // تایید شده
    Cancelled,  // لغو شده
    Completed   // تکمیل شده
}
```

### 3. Course (دوره)

```csharp
public class Course
{
    public string Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string Level { get; set; }
    public string Subject { get; set; }
    public string ImageUrl { get; set; }
    public decimal Price { get; set; }
    public int Duration { get; set; }             // مدت دوره (ساعت)
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

---

## منطق کسب‌وکار (Business Logic)

### 1. محاسبه قیمت کلاس

```csharp
public class PricingService
{
    private const decimal PRIVATE_CLASS_DISCOUNT = 0.30m; // 30% تخفیف

    public decimal CalculateFinalPrice(CourseClass courseClass, int currentEnrollmentCount)
    {
        // کلاس عمومی: قیمت پایه
        if (courseClass.Type == ClassType.Public)
        {
            return courseClass.BasePrice;
        }

        // کلاس خصوصی: چک کنید آیا نفر دوم هم ثبت‌نام کرده
        if (courseClass.Type == ClassType.Private && currentEnrollmentCount >= 1)
        {
            // اگر نفر دوم هم هست، 30% تخفیف برای هر دو نفر
            return courseClass.BasePrice * (1 - PRIVATE_CLASS_DISCOUNT);
        }

        // کلاس خصوصی با یک نفر: قیمت کامل
        return courseClass.BasePrice;
    }

    public decimal CalculateFinalPriceWithDiscount(decimal basePrice, decimal discountPercent)
    {
        return basePrice * (1 - discountPercent / 100);
    }
}
```

### 2. Conflict Detection برای معلم

```csharp
public class ScheduleConflictService
{
    public async Task<bool> HasScheduleConflictAsync(
        string teacherId,
        DateTime scheduledDate,
        string startTime,
        string endTime,
        string? excludeClassId = null)
    {
        // همه کلاس‌های معلم در همان تاریخ را بگیرید
        var teacherClasses = await _context.CourseClasses
            .Where(c => c.TeacherId == teacherId
                && c.ScheduledDate.Date == scheduledDate.Date
                && c.Status == ClassStatus.Scheduled
                && (excludeClassId == null || c.Id != excludeClassId))
            .ToListAsync();

        // چک کنید آیا تداخل زمانی وجود دارد
        foreach (var existingClass in teacherClasses)
        {
            if (IsTimeOverlap(startTime, endTime, existingClass.StartTime, existingClass.EndTime))
            {
                return true; // تداخل وجود دارد
            }
        }

        return false; // تداخل وجود ندارد
    }

    private bool IsTimeOverlap(string start1, string end1, string start2, string end2)
    {
        var s1 = TimeSpan.Parse(start1);
        var e1 = TimeSpan.Parse(end1);
        var s2 = TimeSpan.Parse(start2);
        var e2 = TimeSpan.Parse(end2);

        // تداخل زمانی: اگر بازه‌ها همپوشانی داشته باشند
        return s1 < e2 && s2 < e1;
    }
}
```

### 3. بررسی ظرفیت کلاس

```csharp
public class CapacityService
{
    public bool HasAvailableCapacity(CourseClass courseClass)
    {
        return courseClass.CurrentEnrollment < courseClass.MaxCapacity;
    }

    public int GetRemainingCapacity(CourseClass courseClass)
    {
        return courseClass.MaxCapacity - courseClass.CurrentEnrollment;
    }

    public bool CanEnrollInPrivateClass(CourseClass courseClass)
    {
        // کلاس خصوصی: حداکثر 2 نفر
        if (courseClass.Type == ClassType.Private)
        {
            return courseClass.CurrentEnrollment < 2;
        }

        // کلاس عمومی: حداکثر 10 نفر
        return courseClass.CurrentEnrollment < 10;
    }
}
```

---

## Backend Endpoints

### 1. GET /api/classes - لیست کلاس‌ها با فیلتر

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

    // فیلتر بر اساس معلم
    if (!string.IsNullOrEmpty(teacherId))
    {
        query = query.Where(c => c.TeacherId == teacherId);
    }

    // فیلتر بر اساس نوع کلاس
    if (type.HasValue)
    {
        query = query.Where(c => c.Type == type.Value);
    }

    // فیلتر کلاس‌های با ظرفیت باقی‌مانده
    if (availableOnly == true)
    {
        query = query.Where(c => c.CurrentEnrollment < c.MaxCapacity);
    }

    // فیلتر بر اساس سطح
    if (!string.IsNullOrEmpty(level))
    {
        query = query.Where(c => c.Level == level);
    }

    // فیلتر بر اساس موضوع
    if (!string.IsNullOrEmpty(subject))
    {
        query = query.Where(c => c.Subject == subject);
    }

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

### 2. POST /api/classes/{classId}/enroll - ثبت‌نام در کلاس

```csharp
[HttpPost("api/classes/{classId}/enroll")]
[Authorize(Roles = "Student")]
public async Task<ActionResult<EnrollmentDto>> EnrollInClass(
    string classId,
    [FromBody] EnrollInClassRequest request)
{
    var studentId = GetCurrentStudentId();
    var courseClass = await _context.CourseClasses
        .Include(c => c.Enrollments)
        .FirstOrDefaultAsync(c => c.Id == classId);

    if (courseClass == null)
        return NotFound("Class not found");

    // 1. بررسی ظرفیت
    if (!_capacityService.HasAvailableCapacity(courseClass))
    {
        return BadRequest("Class is full");
    }

    // 2. بررسی conflict برای معلم
    var hasConflict = await _conflictService.HasScheduleConflictAsync(
        courseClass.TeacherId,
        courseClass.ScheduledDate,
        courseClass.StartTime,
        courseClass.EndTime,
        classId);

    if (hasConflict)
    {
        return BadRequest("Teacher has a scheduling conflict");
    }

    // 3. بررسی آیا دانش‌آموز قبلاً ثبت‌نام کرده
    var existingEnrollment = courseClass.Enrollments
        .FirstOrDefault(e => e.StudentId == studentId && e.Status != EnrollmentStatus.Cancelled);

    if (existingEnrollment != null)
    {
        return BadRequest("Already enrolled in this class");
    }

    // 4. محاسبه قیمت نهایی
    decimal finalPrice = _pricingService.CalculateFinalPrice(courseClass, courseClass.CurrentEnrollment);
    decimal discountPercent = 0;

    // اگر کلاس خصوصی است و نفر دوم دارد، 30% تخفیف
    if (courseClass.Type == ClassType.Private && courseClass.CurrentEnrollment >= 1)
    {
        discountPercent = 30;
    }

    // 5. ایجاد ثبت‌نام
    var enrollment = new Enrollment
    {
        Id = Guid.NewGuid().ToString(),
        ClassId = classId,
        StudentId = studentId,
        FinalPrice = finalPrice,
        DiscountPercent = discountPercent,
        Status = EnrollmentStatus.Pending,
        InviteCode = request.InviteCode, // برای کلاس خصوصی
        InvitedByStudentId = request.InvitedByStudentId, // اگر توسط دوست دعوت شده
        EnrolledAt = DateTime.UtcNow
    };

    _context.Enrollments.Add(enrollment);

    // 6. به‌روزرسانی ظرفیت کلاس
    courseClass.CurrentEnrollment++;

    await _context.SaveChangesAsync();

    var result = new EnrollmentDto
    {
        Id = enrollment.Id,
        ClassId = enrollment.ClassId,
        StudentId = enrollment.StudentId,
        FinalPrice = enrollment.FinalPrice,
        DiscountPercent = enrollment.DiscountPercent,
        Status = enrollment.Status,
        EnrolledAt = enrollment.EnrolledAt
    };

    return Ok(result);
}

public class EnrollInClassRequest
{
    public string? InviteCode { get; set; }           // کد دعوت (اختیاری)
    public string? InvitedByStudentId { get; set; }   // دانش‌آموزی که دعوت کرده (اختیاری)
}
```

### 3. POST /api/classes/{classId}/invite - ایجاد کد دعوت برای کلاس خصوصی

```csharp
[HttpPost("api/classes/{classId}/invite")]
[Authorize(Roles = "Student")]
public async Task<ActionResult<InviteCodeDto>> CreateInviteCode(string classId)
{
    var studentId = GetCurrentStudentId();
    var courseClass = await _context.CourseClasses
        .Include(c => c.Enrollments)
        .FirstOrDefaultAsync(c => c.Id == classId);

    if (courseClass == null)
        return NotFound("Class not found");

    // فقط کلاس‌های خصوصی
    if (courseClass.Type != ClassType.Private)
    {
        return BadRequest("Invite codes are only available for private classes");
    }

    // بررسی آیا دانش‌آموز در این کلاس ثبت‌نام کرده
    var enrollment = courseClass.Enrollments
        .FirstOrDefault(e => e.StudentId == studentId && e.Status == EnrollmentStatus.Confirmed);

    if (enrollment == null)
    {
        return BadRequest("You must be enrolled in this class to create an invite code");
    }

    // ایجاد کد دعوت یکتا
    var inviteCode = GenerateInviteCode();

    // ذخیره کد دعوت در enrollment
    enrollment.InviteCode = inviteCode;
    await _context.SaveChangesAsync();

    return Ok(new InviteCodeDto
    {
        InviteCode = inviteCode,
        InviteUrl = $"{Request.Scheme}://{Request.Host}/classes/{classId}?invite={inviteCode}"
    });
}

private string GenerateInviteCode()
{
    // ایجاد یک کد 8 کاراکتری یکتا
    const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var random = new Random();
    return new string(Enumerable.Repeat(chars, 8)
        .Select(s => s[random.Next(s.Length)]).ToArray());
}
```

### 4. GET /api/classes/{classId}/check-conflict - بررسی تداخل برای معلم

```csharp
[HttpGet("api/classes/{classId}/check-conflict")]
[Authorize(Roles = "Teacher,Admin")]
public async Task<ActionResult<bool>> CheckScheduleConflict(string classId)
{
    var courseClass = await _context.CourseClasses
        .FirstOrDefaultAsync(c => c.Id == classId);

    if (courseClass == null)
        return NotFound("Class not found");

    var hasConflict = await _conflictService.HasScheduleConflictAsync(
        courseClass.TeacherId,
        courseClass.ScheduledDate,
        courseClass.StartTime,
        courseClass.EndTime,
        classId);

    return Ok(new { HasConflict = hasConflict });
}
```

---

## Frontend Requirements

### 1. صفحه انتخاب کلاس (Class Selection Page)

```typescript
// components/class-selection/ClassSelectionPage.tsx

interface ClassFilters {
  teacherId?: string;
  type?: 'public' | 'private';
  availableOnly?: boolean;
  level?: string;
  subject?: string;
}

interface ClassDto {
  id: string;
  title: string;
  description: string;
  level: string;
  subject: string;
  type: 'public' | 'private';
  maxCapacity: number;
  currentEnrollment: number;
  remainingCapacity: number;
  basePrice: number;
  finalPrice: number;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  teacher: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
  };
  course: {
    id: string;
    title: string;
    imageUrl: string;
  };
}
```

### 2. فیلترها

- **فیلتر معلم**: Dropdown با لیست معلمان
- **فیلتر نوع کلاس**: Radio button (عمومی/خصوصی/همه)
- **فیلتر ظرفیت**: Checkbox (فقط کلاس‌های با ظرفیت)
- **فیلتر سطح**: Dropdown (A1, A2, B1, B2, C1, C2)
- **فیلتر موضوع**: Dropdown (Business English, General English, etc.)

### 3. کارت کلاس (Class Card)

هر کلاس باید نمایش دهد:
- عنوان کلاس
- نام و عکس معلم با rating
- نوع کلاس (خصوصی/عمومی) با badge
- تاریخ و ساعت برگزاری
- ظرفیت باقی‌مانده (مثلاً "3 spots left")
- قیمت (با تخفیف اگر applicable)
- دکمه "Enroll" یا "Join with Friend" (برای خصوصی)

### 4. Modal ثبت‌نام

برای کلاس‌های خصوصی:
- نمایش قیمت با تخفیف اگر نفر دوم join کند
- گزینه "Invite a friend" که کد دعوت ایجاد می‌کند
- کپی لینک دعوت

---

## Flow ثبت‌نام دانش‌آموز

### Flow 1: کلاس عمومی
1. دانش‌آموز کلاس عمومی را انتخاب می‌کند
2. بررسی ظرفیت (کمتر از 10 نفر)
3. بررسی conflict برای معلم
4. محاسبه قیمت (قیمت پایه)
5. ثبت‌نام → Payment → Confirmation

### Flow 2: کلاس خصوصی (نفر اول)
1. دانش‌آموز کلاس خصوصی را انتخاب می‌کند
2. بررسی ظرفیت (کمتر از 2 نفر)
3. بررسی conflict برای معلم
4. محاسبه قیمت (قیمت پایه)
5. ثبت‌نام → Payment → Confirmation
6. گزینه "Invite a friend" برای ایجاد کد دعوت

### Flow 3: کلاس خصوصی (نفر دوم با کد دعوت)
1. دانش‌آموز با کد دعوت وارد می‌شود
2. سیستم چک می‌کند آیا کد معتبر است
3. محاسبه قیمت با 30% تخفیف
4. ثبت‌نام → Payment → Confirmation
5. هر دو نفر تخفیف می‌گیرند

---

## مستندات برای توسعه‌دهنده Backend

این فایل شامل تمام اطلاعات مورد نیاز برای پیاده‌سازی سیستم انتخاب کلاس است:

1. ✅ مدل‌های داده کامل
2. ✅ منطق کسب‌وکار (Pricing, Conflict Detection, Capacity)
3. ✅ Backend endpoints با نمونه کد
4. ✅ Frontend requirements
5. ✅ Flow های ثبت‌نام

توسعه‌دهنده backend باید:
1. مدل‌های داده را در دیتابیس ایجاد کند
2. Service ها (PricingService, ConflictDetectionService, CapacityService) را پیاده‌سازی کند
3. Endpoint ها را طبق نمونه کد پیاده‌سازی کند
4. تست کند که:
   - conflict detection کار می‌کند
   - محاسبه قیمت صحیح است
   - ظرفیت کلاس‌ها محدود است
   - کد دعوت برای کلاس خصوصی کار می‌کند
