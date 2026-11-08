# نیازمندی API مدیریت کلاس‌های زمان‌بندی‌شده توسط ادمین

این سند قرارداد endpointهایی را مشخص می‌کند که پنل ادمین برای ویرایش کلاس،
تغییر مدرس، افزودن دانش‌آموز و انتقال دانش‌آموز بین کلاس‌ها استفاده می‌کند.
تمام مسیرهای `/api/admin/...` فقط برای کاربر احراز هویت‌شده با نقش Admin مجازند.
فرانت‌اند در این مخزن کلاینت API و UI را دارد؛ منطق پایگاه داده و مجوزها باید
در بک‌اند پیاده‌سازی شوند.

## ۱. ویرایش کلاس

### `PATCH /api/admin/class-slots/{slotId}`

فیلدهای قابل‌ویرایش اختیاری‌اند:

```json
{
  "title": "English Conversation B1",
  "description": "Weekly conversation class",
  "level": "B1",
  "classType": "public",
  "teacherRole": "english",
  "language": "english",
  "startsAt": "2026-12-01T14:00:00Z",
  "endsAt": "2026-12-01T15:00:00Z",
  "timeZone": "Asia/Tehran",
  "capacity": 12,
  "basePrice": 850000,
  "currency": "IRR"
}
```

پاسخ باید رکورد کامل کلاس را با `id`, `courseId`, `title`, `description`,
`level`, `term`, `language`, `classType`, `startsAt`, `endsAt`, `capacity`,
`basePrice`, `finalPrice`, `currency`, `enrolledCount`, `remainingSeats` و
`teacherAssignments` برگرداند.

اعتبارسنجی لازم:

- ظرفیت عدد صحیح مثبت باشد و از تعداد ثبت‌نام‌های فعال کمتر نشود.
- زمان پایان بعد از شروع باشد؛ تغییر برنامه‌ای که با حضورهای ثبت‌شده یا
  برنامهٔ مدرس تداخل دارد باید طبق سیاست آکادمی رد شود.
- مبلغ نامنفی و واحد پول معتبر باشد.
- `enrolledCount` و `remainingSeats` فقط در سرور محاسبه شوند؛ ظرفیت کمتر از
  تعداد ثبت‌نام فعال با خطای قابل‌نمایش (مثلاً `409 Conflict`) رد شود.

## ۲. تعویض یا حذف مدرس کلاس

### `PUT /api/admin/class-slots/{slotId}/teacher`

تعویض مدرس:

```json
{ "teacherId": "approved-teacher-id" }
```

حذف تخصیص مدرس:

```json
{ "teacherId": null }
```

بک‌اند باید عملیات را اتمیک انجام دهد، تأییدشدن مدرس و تداخل برنامه/availability
را دوباره بررسی کند، تخصیص قبلی را به‌صورت تاریخی نگه دارد و تنها یک تخصیص
فعال/قطعی برای کلاس باقی بگذارد. برای مدرس نامعتبر یا دارای تداخل، `409` یا
`422` همراه `message` برگرداند.

### فهرست مدرسان واجدشرایط موجود

رابط کاربری از endpoint فعلی زیر برای پرکردن فهرست انتخاب مدرس استفاده می‌کند:

`GET /api/admin/class-slots/{slotId}/available-teachers`

پاسخ باید حداقل `id`, `name` و در صورت وجود `matchedAvailability` را داشته باشد.

## ۳. فهرست ثبت‌نام‌های یک کلاس

### `GET /api/admin/class-slots/{slotId}/enrollments`

ثبت‌نام‌های فعال کلاس را همراه مشخصات قابل‌نمایش دانش‌آموز برگرداند:

```json
[
  {
    "id": "enrollment-id",
    "assignmentId": "teacher-assignment-id",
    "studentId": "student-id",
    "studentName": "Student Name",
    "studentEmail": "student@example.com",
    "status": "active",
    "enrolledAt": "2026-11-01T10:00:00Z"
  }
]
```

`assignmentId` شناسهٔ تخصیص قطعی کلاس/مدرس است که ثبت‌نام به آن تعلق دارد.
اگر کلاس مدرس قطعی ندارد، پاسخ خالی یا خطای وضعیت‌دار بدهید؛ شناسهٔ تخصیص
ساختگی ایجاد نشود.

## ۴. افزودن دانش‌آموز به کلاس

### `POST /api/admin/class-slots/{slotId}/enrollments`

درخواست:

```json
{ "studentId": "student-id" }
```

پاسخ باید enrollment ساخته‌شده با همان شکل فهرست بالا باشد. عملیات باید در
تراکنش ظرفیت را بررسی کند، ثبت‌نام تکراری نسازد، ثبت‌نام فعال دانش‌آموز در
همان بازهٔ زمانی را کنترل کند و ظرفیت را اتمیک به‌روز کند. در صورت تکمیل
ظرفیت یا عدم امکان ثبت‌نام، `409 Conflict` برگرداند.

فهرست جستجوی دانش‌آموز از endpoint موجود استفاده می‌کند:

`GET /api/admin/students?page=1&pageSize=20&search={name-or-email}`

## ۵. انتقال دانش‌آموز بین کلاس‌ها

### `POST /api/admin/class-enrollments/{enrollmentId}/move`

درخواست:

```json
{ "targetSlotId": "destination-slot-id" }
```

پاسخ enrollment جدید در کلاس مقصد را با شکل بخش ۳ برگرداند. انتقال باید
اتمیک باشد: ظرفیت و مدرس قطعی مقصد، ثبت‌نام تکراری و تداخل زمانی را بررسی
کنید؛ سپس ثبت‌نام مبدأ را لغو/منتقل کنید و مقصد را فعال کنید. در صورت خطا،
ثبت‌نام مبدأ نباید تغییر کند. وضعیت/تاریخچهٔ مبدأ برای گزارش و audit حفظ شود.

## ۶. انواع کلاس و ظرفیت نیمه‌خصوصی

در `POST /api/admin/class-slots`, `PATCH /api/admin/class-slots/{slotId}`,
`GET /api/admin/class-slots` و `GET /api/student/class-slots` مقدار
`classType` باید یکی از `public`, `semi_private` یا `private` باشد.
`semi_private` ظرفیت ثابت ۴ دانش‌آموز دارد؛ سرور باید این ظرفیت را در ایجاد و
ویرایش اعمال کند، تعداد ثبت‌نام‌های فعال را از ۴ بیشتر نکند و `remainingSeats`
را از ثبت‌نام‌های واقعی محاسبه کند. مقادیر ورودی قدیمی مانند
`semi-private` یا `semi private` در صورت دریافت باید به `semi_private`
یکسان‌سازی شوند.

## قواعد مشترک

- نقش ادمین در بک‌اند کنترل شود؛ مخفی‌کردن دکمه در UI مجوز محسوب نمی‌شود.
- شناسهٔ دانش‌آموز یا مدرس از ورودی به‌تنهایی مجوز ایجاد نمی‌کند.
- تغییر ظرفیت، قیمت، ثبت‌نام، تخصیص مدرس و انتقال باید پایدار و تراکنشی باشد.
- خطاها با status code معنادار و بدنهٔ `message` یا `detail` برگردند تا UI
  نتیجهٔ ناموفق را به اشتباه موفق نشان ندهد.
