# Backend Availability Fix - نمایش زمان‌های در دسترسی در داشبورد دانش‌آموز

## مشکل
زمان‌های در دسترسی که معلم در داشبورد خودش اضافه می‌کند، در داشبورد دانش‌آموز نمایش داده نمی‌شود و پیام "This teacher has no open slots right now" نشان داده می‌شود.

## علت
endpoint `/api/teachers` در backend فیلد `slots` را برنمی‌گرداند، اما frontend این فیلد را برای نمایش زمان‌های در دسترسی نیاز دارد.

---

## تغییرات مورد نیاز

### 1. مدل‌های داده (Data Models)

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
    public string? VideoUrl { get; set; }
    public List<AvailabilitySlot> Slots { get; set; } // اضافه شده
}

public class AvailabilitySlot
{
    public string Id { get; set; }
    public string Day { get; set; } // Monday, Tuesday, etc.
    public string Time { get; set; } // Format: "09:00 - 10:00"
    public bool Booked { get; set; }
}

// برای دریافت درخواست PUT
public class AvailabilityUpdateRequest
{
    public List<AvailabilitySlotInput> Slots { get; set; }
}

public class AvailabilitySlotInput
{
    public string? Id { get; set; } // اختیاری برای آپدیت
    public string DayOfWeek { get; set; } // Monday, Tuesday, etc.
    public string StartTime { get; set; } // 09:00
    public string EndTime { get; set; } // 10:00
}
```

---

### 2. اسکیمای دیتابیس (Database Schema)

```sql
-- جدول TeacherProfiles
CREATE TABLE TeacherProfiles (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    UserId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(Id),
    FullName NVARCHAR(100),
    AvatarUrl NVARCHAR(500),
    TeachingLanguage NVARCHAR(20), -- "english" or "german"
    Subject NVARCHAR(100),
    Level NVARCHAR(50),
    Rating DECIMAL(3, 2) DEFAULT 0.00,
    Bio NVARCHAR(MAX),
    VideoUrl NVARCHAR(500),
    Status NVARCHAR(20) DEFAULT "pending", -- "pending", "active", "suspended"
    CreatedAt DATETIME2,
    UpdatedAt DATETIME2
);

-- جدول AvailabilitySlots
CREATE TABLE AvailabilitySlots (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    TeacherProfileId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES TeacherProfiles(Id),
    Day NVARCHAR(20), -- Monday, Tuesday, etc.
    StartTime NVARCHAR(10), -- 09:00
    EndTime NVARCHAR(10), -- 10:00
    Booked BIT DEFAULT 0,
    CreatedAt DATETIME2
);
```

---

### 3. endpoint `/api/teachers` (اصلاح شده)

```csharp
[HttpGet("api/teachers")]
public async Task<ActionResult<List<TeacherProfile>>> GetTeachers()
{
    var teachers = await _context.TeacherProfiles
        .Include(t => t.AvailabilitySlots) // مهم: زمان‌ها را لود کنید
        .Where(t => t.Status == "active") // فقط معلمان فعال
        .ToListAsync();
    
    var result = teachers.Select(t => new TeacherProfile
    {
        Id = t.Id,
        Name = t.FullName,
        Avatar = t.AvatarUrl,
        TeachingLanguage = t.TeachingLanguage,
        Subject = t.Subject,
        Level = t.Level,
        Rating = t.Rating,
        Bio = t.Bio,
        VideoUrl = t.VideoUrl,
        Slots = t.AvailabilitySlots.Select(s => new AvailabilitySlot
        {
            Id = s.Id,
            Day = s.Day,
            Time = $"{s.StartTime} - {s.EndTime}", // فرمت باید "09:00 - 10:00" باشد
            Booked = s.Booked
        }).ToList()
    }).ToList();
    
    return Ok(result);
}
```

---

### 4. endpoint `/api/teacher/availability` (GET)

```csharp
[HttpGet("api/teacher/availability")]
[Authorize] // احراز هویت الزامی
public async Task<ActionResult<List<AvailabilitySlot>>> GetMyAvailability()
{
    var teacherId = GetCurrentTeacherId(); // از JWT یا cookie بگیرید
    
    var slots = await _context.AvailabilitySlots
        .Where(s => s.TeacherProfileId == teacherId)
        .ToListAsync();
    
    var result = slots.Select(s => new AvailabilitySlot
    {
        Id = s.Id,
        Day = s.Day,
        Time = $"{s.StartTime} - {s.EndTime}",
        Booked = s.Booked
    }).ToList();
    
    return Ok(result);
}
```

---

### 5. endpoint `/api/teacher/availability` (PUT)

```csharp
[HttpPut("api/teacher/availability")]
[Authorize] // احراز هویت الزامی
public async Task<ActionResult<List<AvailabilitySlot>>> ReplaceMyAvailability([FromBody] AvailabilityUpdateRequest request)
{
    var teacherId = GetCurrentTeacherId(); // از JWT یا cookie بگیرید
    
    // حذف همه زمان‌های قبلی این معلم
    var existingSlots = await _context.AvailabilitySlots
        .Where(s => s.TeacherProfileId == teacherId)
        .ToListAsync();
    _context.AvailabilitySlots.RemoveRange(existingSlots);
    
    // اضافه کردن زمان‌های جدید
    var newSlots = request.Slots.Select(slot => new AvailabilitySlotEntity
    {
        Id = slot.Id != null ? Guid.Parse(slot.Id) : Guid.NewGuid(),
        TeacherProfileId = Guid.Parse(teacherId),
        Day = slot.DayOfWeek,
        StartTime = slot.StartTime,
        EndTime = slot.EndTime,
        Booked = false,
        CreatedAt = DateTime.UtcNow
    }).ToList();
    
    await _context.AvailabilitySlots.AddRangeAsync(newSlots);
    await _context.SaveChangesAsync();
    
    // برگرداندن لیست جدید به فرمت مورد انتظار frontend
    var result = newSlots.Select(s => new AvailabilitySlot
    {
        Id = s.Id.ToString(),
        Day = s.Day,
        Time = $"{s.StartTime} - {s.EndTime}",
        Booked = s.Booked
    }).ToList();
    
    return Ok(result);
}
```

---

### 6. نمونه درخواست و پاسخ

#### نمونه درخواست PUT `/api/teacher/availability`:

```json
{
  "slots": [
    {
      "dayOfWeek": "Monday",
      "startTime": "09:00",
      "endTime": "10:00"
    },
    {
      "dayOfWeek": "Wednesday",
      "startTime": "14:00",
      "endTime": "15:00"
    }
  ]
}
```

#### نمونه پاسخ GET `/api/teachers`:

```json
[
  {
    "id": "917ba131-9c66-4d75-9aac-ba7b6015e255",
    "name": "Ali Alizadeh",
    "avatar": "https://example.com/avatar.jpg",
    "teachingLanguage": "english",
    "subject": "Business English",
    "level": "A2 - Elementary",
    "rating": 4.5,
    "bio": "Experienced teacher",
    "videoUrl": null,
    "slots": [
      {
        "id": "slot-1",
        "day": "Monday",
        "time": "09:00 - 10:00",
        "booked": false
      },
      {
        "id": "slot-2",
        "day": "Wednesday",
        "time": "14:00 - 15:00",
        "booked": true
      }
    ]
  }
]
```

---

## نکات مهم

1. **فرمت Time**: باید به صورت `"09:00 - 10:00"` باشد (StartTime و EndTime با فاصله و خط تیره جدا شوند)
2. **Include**: در endpoint `/api/teachers` حتماً از `.Include(t => t.AvailabilitySlots)` استفاده کنید
3. **Authorization**: endpointهای `/api/teacher/availability` باید احراز هویت داشته باشند
4. **فقط معلمان فعال**: در `/api/teachers` فقط معلمان با Status = "active" را برگردانید
5. **camelCase**: تمام property names باید camelCase باشند (مثلاً `teacherId` نه `TeacherId`)

---

## تست کردن

پس از اعمال تغییرات:

1. با یک اکانت معلم وارد شوید
2. به صفحه availability بروید و زمان‌های در دسترسی اضافه کنید
3. با یک اکانت دانش‌آموز وارد شوید
4. به صفحه معلمان بروید
5. زمان‌های در دسترسی باید نمایش داده شوند

---

## endpointهای مرتبط دیگر (آینده)

در آینده ممکن است به این endpointها هم نیاز داشته باشید:

- `POST /api/bookings` - برای رزرو کردن slot توسط دانش‌آموز
- `GET /api/teacher/dashboard/schedule` - برای نمایش برنامه کلاس‌های معلم
