# سند یکپارچه تحویل به تیم بک‌اند SE ONE

**نسخه:** ۱.۰  
**تاریخ:** ۹ نوامبر ۲۰۲۶  
**مخزن بررسی‌شده:** `https://github.com/SpantaAlizadeh10/Se_One`  
**هدف:** یک مرجع واحد برای توضیح APIهای فعلی مورد انتظار فرانت‌اند، تغییرات اخیر سایت، نیازمندی‌های بک‌اند، و خطای 500 گزارش‌شده.

> این سند برای ارسال به تیم بک‌اند تهیه شده است. آن را به‌عنوان مرجع یکپارچهٔ نیازهای فعلی در نظر بگیرید؛ چند فایل قدیمی داخل مخزن قراردادهای متفاوت یا فرضی دارند و در بخش ۹ تفاوت‌های مهم آن‌ها مشخص شده است.

---

## ۱. نتیجهٔ بررسی مخزن و محدودهٔ اطمینان

مخزن عمومی ارسالی، برنامهٔ **Next.js / TypeScript فرانت‌اند** و فایل‌های مستندات API را دارد. در درخت مخزن، پیاده‌سازی API با Controllerهای C#، پروژهٔ `.csproj` یا Schema کامل دیتابیس دیده نشد؛ فقط تعدادی migration محدود Supabase وجود دارد. بنابراین:

- مسیرهایی که در این سند «فعلی» نامیده شده‌اند، مسیرهایی هستند که **کلاینت فرانت‌اند فراخوانی می‌کند یا اسناد موجود برایشان قرارداد تعریف کرده‌اند**.
- این بررسی، وجود یا عملکرد این endpointها را روی سرور واقعی اثبات نمی‌کند. تیم بک‌اند باید آن‌ها را با routeهای مستقرشده و دیتابیس مقایسه کند.
- تیک‌های `[x]` در اسناد قدیمی، به‌تنهایی به معنای پیاده‌سازی بک‌اند نیستند.
- برای قابلیت‌های جدید، تا زمان پیاده‌سازی API، ذخیرهٔ دیتابیس و کنترل مجوز سمت سرور، نمایش UI به‌تنهایی جریان را عملیاتی نمی‌کند.

**Base URL:** فرانت‌اند از مقدار `NEXT_PUBLIC_API_BASE_URL` استفاده می‌کند. مسیرهای این سند نسبت به آن هستند؛ مسیرهای `/_next/*` و `/api/blog/cambridge` و `/api/youtube-videos` در این پروژه ممکن است مسیرهای داخلی Next.js باشند و نباید با API بک‌اند اشتباه شوند.

**قرارداد عمومی پاسخ:** JSON با نام‌گذاری ترجیحی `camelCase`، زمان ISO-8601، خطاهای استاندارد (ترجیحاً `ProblemDetails`) و وضعیت HTTP مناسب:

- `400` دادهٔ نامعتبر
- `401` ورود لازم است
- `403` نقش/مجوز ناکافی
- `404` منبع وجود ندارد یا برای کاربر قابل مشاهده نیست
- `409` تداخل برنامه، رزرو تکراری یا ظرفیت تکمیل

شناسه، نقش، نام فرستنده، تعداد ثبت‌نام، وضعیت پرداخت و مجوز دسترسی را سرور از نشست احراز هویت و دیتابیس استخراج کند، نه از مقادیر قابل‌اعتماد فرض‌شده در کلاینت.

---

## ۲. خطای `GET /_next/static/chunks/fallback/*.js 500` در `localhost:3000`

آدرس `http://localhost:3000/en/courses` از فرانت‌اند در دسترس بود، اما پاسخ HTML با `500` دریافت شد. متن خطا در صفحهٔ Next.js این بود:

```text
Cannot find module './1682.js'
Require stack:
.../.next/server/webpack-runtime.js
.../.next/server/app/_not-found/page.js
```

درخواست‌های زیر نیز خطای 500 برمی‌گرداندند:

```text
/_next/static/chunks/fallback/pages/_app.js
/_next/static/chunks/fallback/pages/_error.js
```

این خطا **خطای API بک‌اند یا endpoint دوره‌ها نیست**:

1. `/_next/static/chunks/...` فایل‌های build/runtime خود Next.js هستند، نه مسیر `/api/courses`.
2. خطای اصلی نشان می‌دهد runtime توسعهٔ Next.js به chunk محلی `./1682.js` در پوشهٔ `.next` دسترسی ندارد.
3. احتمالاً خروجی توسعه/build در `.next` ناسازگار یا ناقص شده است؛ برای مثال با اجرای هم‌زمان dev و build یا قطع/تغییر خروجی build. این علت محتمل است، نه اثبات قطعی.

**اقدام پیشنهادی برای رفع:**

1. اجرای Next.js و هر build هم‌زمان را متوقف کنید.
2. فقط یک بار `npm run dev` اجرا کنید و اجازه دهید Next.js خروجی dev را دوباره بسازد.
3. اگر خطا ماند، پس از توقف dev/build، پوشهٔ تولیدی `.next` را پاک‌سازی و dev server را دوباره اجرا کنید؛ فایل‌های سورس یا `node_modules` را پاک نکنید.
4. در DevTools بخش Network، درخواست `/api/courses?lang=en` را جداگانه بررسی کنید. فقط پاسخ همان مسیر می‌تواند دربارهٔ وضعیت API دوره‌ها اطلاع دهد.

این خطای chunk نباید با `GET /api/courses` یکی گرفته شود. در زمان بررسی، پاسخ مستقیم API دوره‌ها از این پیام قابل استنتاج نیست.

---

## ۳. APIها و جریان‌های موجود در قرارداد/کلاینت فرانت‌اند

این بخش endpointهای مرتبطی را فهرست می‌کند که کلاینت فعلی فرانت‌اند یا مستندات API موجود برایشان قرارداد دارند. **وجودشان در این فهرست به معنی تأیید پیاده‌سازی روی بک‌اند نیست.**

### ۳.۱ احراز هویت و ثبت‌نام

کلاینت از این مسیرها استفاده می‌کند:

| روش | مسیر | کاربرد |
|---|---|---|
| `POST` | `/api/auth/register` | ساخت کاربر |
| `POST` | `/api/auth/login` | ورود |
| `GET` | `/api/auth/me` | کاربر فعلی |
| `POST` | `/api/auth/logout` | خروج |
| `POST` | `/api/auth/otp/request` | درخواست کد یک‌بارمصرف |
| `POST` | `/api/auth/otp/verify` | تأیید کد و ورود |
| `POST` | `/api/auth/forgot-password` | بازیابی رمز |

کلاینت فعلی برای ثبت‌نام نام را به `firstName` و `familyName` می‌شکند و `email`, `password`, `role` می‌فرستد؛ برای دانش‌آموز همچنین `dateOfBirth` و `parentalConsent` ارسال می‌شود. نقش از فرانت‌اند به صورت `"Teacher"` یا `"Student"` ارسال می‌شود.

### ۳.۲ معلم و تأیید ادمین

کلاینت فعال فعلی برای پروفایل شخصی معلم از **`GET/PUT /api/teachers/me`** استفاده می‌کند. آپلودها در کلاینت به این مسیرها متصل‌اند:

- `POST /api/teacher/profile/avatar`
- `POST /api/teacher/profile/video`

پنل ادمین از این مسیرها استفاده می‌کند:

- `GET /api/admin/teachers?search=&status=&page=&pageSize=`
- `GET /api/admin/teachers/{teacherId}`
- `POST /api/admin/teachers`
- `PATCH /api/admin/teachers/{teacherId}`
- `PATCH /api/admin/teachers/{teacherId}/status` با `{ "status": "..." }`
- `DELETE /api/admin/teachers/{teacherId}`

مدل معلمی که کلاینت می‌شناسد شامل `id`, `userId`, `fullName`, `email`, `avatarUrl`, `teachingLanguage`, `subject`, `level`, `bio`, `videoUrl`, `rating`, `status` است. وضعیت‌های پشتیبانی‌شده در مدل فعلی فرانت‌اند `pending`, `active`, `suspended` هستند.

### ۳.۳ دسترس‌پذیری و زمان‌بندی کلاس

| روش | مسیر | کاربرد |
|---|---|---|
| `GET` | `/api/teacher/availability` | دریافت زمان‌های آزاد معلم جاری |
| `PUT` | `/api/teacher/availability` | جایگزینی زمان‌های آزاد معلم جاری |
| `GET` | `/api/admin/class-slots` | فهرست کلاس‌های زمان‌بندی‌شده برای ادمین |
| `POST` | `/api/admin/class-slots` | ساخت کلاس/slot توسط ادمین |
| `GET` | `/api/admin/class-slots/{slotId}/available-teachers` | معلم‌های مناسب برای slot |
| `POST` | `/api/admin/class-slot-assignments` | تخصیص مستقیم معلم به slot توسط ادمین |
| `GET` | `/api/teacher/class-slots` | کلاس‌ها و وضعیت تخصیص معلم فعلی |
| `POST` | `/api/teacher/class-slots/{slotId}/request` | درخواست معلم برای کلاس، در جریان درخواست-تأیید |
| `PATCH` | `/api/admin/class-slot-assignments/{assignmentId}` | تأیید/رد درخواست معلم |
| `GET` | `/api/student/class-slots` | کلاس‌های قابل‌رزرو و وضعیت ثبت‌نام دانش‌آموز |
| `POST` | `/api/student/class-slots/{assignmentId}/enroll` | ایجاد رزرو دانش‌آموز |

قرارداد دسترس‌پذیری مورد استفادهٔ فرانت‌اند:

```json
{
  "timeZone": "Asia/Tehran",
  "slots": [
    {
      "id": "availability-id",
      "dayOfWeek": "Monday",
      "startTime": "09:00",
      "endTime": "10:00"
    }
  ]
}
```

کلاس‌ها باید ظرفیت، شمار ثبت‌نام و صندلی‌های باقی‌مانده را از دیتابیس برگردانند. UI ظرفیت صندلی‌های پر/خالی را نشان می‌دهد.

### ۳.۴ پرداخت رزرو کلاس

کلاینت فعلی از مسیرهای زیر استفاده می‌کند:

- `GET /api/payment/settings`
- `POST /api/payments` با `{ "enrollmentId", "paymentMethod" }`
- `POST /api/payments/{paymentId}/receipt` با فایل `receipt`

رزروهایی که پرداخت لازم دارند تا پیش از تأیید پرداخت نباید عضو گروه کلاس یا دارای دسترسی به منابع خصوصی شوند.

### ۳.۵ Adobe Connect و فایل‌های جلسه

کلاینت فعلی جلسه‌ها را از این API می‌خواند و مدیریت می‌کند:

- `GET /api/classrooms/sessions`
- `POST /api/classrooms/sessions`
- `PATCH /api/classrooms/sessions/{sessionId}`
- `POST /api/classrooms/sessions/{sessionId}/join`
- `POST /api/classrooms/sessions/{sessionId}/files/upload-grant`
- `POST /api/classrooms/sessions/{sessionId}/files`

مدل جلسه شامل `courseId`, `courseTitle`, `teacherId`, `teacherName`, `scheduledAt`, `status`, `provider`, `meetingUrl`, `recordingUrl`, `materials`, `notes` است. `provider` برای این جریان `adobe_connect` است.

### ۳.۶ پروفایل و داشبورد دانش‌آموز

کلاینت از این مسیرهای مرتبط استفاده می‌کند:

- `GET /api/user/profile`
- `PATCH /api/user/profile`
- `POST /api/user/profile/avatar` با multipart field به نام `file`
- `GET /api/student/dashboard/overview`
- `GET /api/student/dashboard/upcoming-classes`
- `GET /api/student/dashboard/calendar`
- `GET /api/student/dashboard/recent-activity`
- `GET /api/student/dashboard/statistics`

### ۳.۷ کاتالوگ عمومی دوره‌ها و دادهٔ Supabase

صفحهٔ عمومی `/[lang]/courses` و کارت‌های دوره از فرانت‌اند `GET /api/courses?lang={fa|en}` را صدا می‌زنند. برای نمایش دوره‌هایی که در Supabase تعریف شده‌اند، این endpoint باید کاتالوگ منتشرشده را از دیتابیس Supabase بخواند و در خروجی همان فیلدهای مصرف‌شده در کارت‌ها را برگرداند:

```json
{
  "data": [
    {
      "id": "course-id",
      "title": "Course title",
      "level": "A1",
      "term": "Fall",
      "language": "English",
      "description": "Course description",
      "lessons": 12,
      "students": 8,
      "price": "$120",
      "basePrice": 120,
      "currency": "USD",
      "discountPercent": 0,
      "duration": "8 weeks",
      "imageUrl": "https://..."
    }
  ]
}
```

`data` می‌تواند خود آرایه یا در یکی از کلیدهای `items`/`courses` نیز برگردد. بک‌اند باید schema واقعی جدول Supabase را به این DTO نگاشت کند؛ نام جدول و ستون‌ها در مخزن فرانت‌اند تعریف نشده‌اند. فقط دوره‌های مجاز برای نمایش عمومی باید برگردند و دسترسی خواندن عمومی نباید اطلاعات خصوصی دانش‌آموزان یا دوره‌های پیش‌نویس را افشا کند. اگر endpoint داده‌ای برنمی‌گرداند، تیم بک‌اند باید اتصال آن به جدول دوره‌های Supabase و مجوزهای RLS را بررسی کند.

---

## ۴. تغییرات رابط کاربری که بک‌اند باید از آن‌ها مطلع باشد

### ثبت‌نام و پروفایل

- فوتر موبایل هنگام تایپ در فرم ثبت‌نام پنهان می‌شود و اندازهٔ متن ورودی برای جلوگیری از زوم خودکار موبایل تنظیم شده است.
- شرایط استفاده و حریم خصوصی در dialog نمایش داده می‌شوند؛ این دو تغییر API جدید نمی‌خواهند.
- در فرم مشترک ثبت‌نام، عنوان سن خنثی شده است.
- پروفایل دانش‌آموز سن را از `dateOfBirth` برگشتی از API محاسبه می‌کند؛ سن جداگانه و قابل‌منسوخ‌شدن ذخیره نشود.
- عکس پروفایل از endpoint آپلود موجود دریافت می‌شود؛ بیو و نام از `PATCH /api/user/profile` ذخیره می‌شوند.
- داشبورد دانش‌آموز آزمون تعیین سطح دارد و نتیجه را در پروفایل ذخیره می‌کند.

### داشبورد، رزرو و کلاس

- کارت غیرمرتبط **Next milestone** برای داشبورد دانش‌آموز بزرگسال حذف شده است؛ نمایش تجربهٔ کودک مجزا باقی مانده است.
- صفحهٔ رزرو کلاس فیلترهای نوع کلاس، ترم، سطح، زبان، معلم و ظرفیت دارد.
- کارت کلاس‌ها تعداد ظرفیت، ثبت‌نام‌شده‌ها و صندلی‌های باقی‌مانده را نشان می‌دهد.
- صفحهٔ «کلاس‌های من» از صفحهٔ پیدا/رزرو کلاس جدا شده و برای کلاس‌های رزروشده نقش فهرست گروه‌های کلاس را دارد.
- دانش‌آموزان کلاس عمومی باید در یک گروه مشترک همان کلاس باشند. کلاس خصوصی فقط معلم تخصیص‌یافته و دانش‌آموز/دانش‌آموزان مجاز همان رزرو را در گروه خود داشته باشد.
- کلاس تکمیل‌شده باید دسترسی به منابع/ضبط همان دوره یا گروه کلاس داشته باشد.
- تب «وظایف» در نوار پایین موبایل دانش‌آموز با «AI» جایگزین شده است؛ مقصد فعلی همان صفحهٔ تمرین موجود است و API جدید هوش مصنوعی در این تغییر اضافه نشده است.

### ارتباط معلمان و مدیریت کلاس

- بخش Messages معلمان یک گروه مشترک برای معلمان تأییدشده است، نه پیام خصوصی معلم با معلم.
- ادمین می‌تواند در همان گروه پیام را به‌عنوان اطلاعیه ثبت کند.
- زمان‌های آزاد معلم در بخش «Available Times» ثبت می‌شوند.
- ادمین کلاس/دوره را با سطح، برنامه، تاریخ آغاز/پایان و ظرفیت ایجاد و معلم مناسب را تخصیص می‌دهد.
- پس از ثبت‌نام تأییدشده، دانش‌آموز و معلم به گروه همان کلاس و صفحهٔ منابع مربوط دسترسی می‌گیرند.

---

## ۵. نیازمندی‌های بک‌اند تازه یا تکمیل‌شونده

### ۵.۱ گردش‌کار ثبت‌نام و تأیید معلم — اولویت خیلی بالا

1. هنگام `POST /api/auth/register` برای نقش Teacher، کاربر و پروفایل معلم را به شکل اتمیک بسازید و `status: "pending"` ذخیره کنید.
2. پاسخ ثبت‌نام و `GET /api/auth/me` (یا `GET /api/teachers/me`) باید وضعیت حساب معلم را برگردانند تا فرانت‌اند بتواند صفحهٔ انتظار/تکمیل پروفایل را نشان دهد.
3. نمایش پیام موفقیت ثبت‌نام معلم در UI:

   > Your registration request has been successfully submitted.  
   >  
   > Your account is currently under review. Within the next 2–3 days, we will contact you to arrange an introductory meeting with the academy manager and introduce you to the SE One educational platform.  
   >  
   > Thank you for your interest in joining SE One Academy.

4. ادمین باید از `GET /api/admin/teachers?status=pending` درخواست‌ها را ببیند و از مسیر وضعیت موجود تصمیم بگیرد. پیشنهاد می‌شود endpoint فعلی حفظ و enum آن گسترش یابد:

```http
PATCH /api/admin/teachers/{teacherId}/status
Content-Type: application/json

{ "status": "active" }
```

برای رد درخواست:

```json
{ "status": "rejected", "reason": "..." }
```

وضعیت‌های موردنیاز: `pending`, `active`, `rejected`, `suspended`. در صورت نیاز به سازگاری با دیتابیس فعلی می‌توان رد درخواست را جدا از تعلیق نگه داشت؛ رد درخواست و تعلیق پس از استخدام دو مفهوم کاری متفاوت‌اند.

5. فقط معلم `active` اجازهٔ استفاده از امکانات تدریس/دانش‌آموز/گروه‌های تدریس را دارد. معلم `pending` می‌تواند فقط مسیرهای احراز هویت و تکمیل پروفایل مجاز را استفاده کند. `rejected` و `suspended` دسترسی تدریس نداشته باشند.
6. کنترل دسترسی باید در بک‌اند روی تمام endpointهای `/api/teacher/*` انجام شود؛ مخفی‌کردن صفحه در فرانت‌اند به‌تنهایی مجوز محسوب نمی‌شود.
7. وضعیت نقش و وضعیت تأیید معلم باید تا هنگام ورود و دریافت اطلاعات کاربر سازگار بماند؛ توکن Teacher به‌تنهایی نباید دسترسی فعال را تضمین کند.

**یادداشت UI:** در کلاینت فعلی مدل `TeacherWorkflowStatus` فقط `pending | active | suspended` را می‌پذیرد. برای پشتیبانی از `rejected`، فرانت‌اند نیز باید enum، فیلترهای ادمین و دکمهٔ رد درخواست را به‌روزرسانی کند؛ قرارداد بک‌اند را پیش از این هماهنگی در محیط production فعال نکنید.

### ۵.۲ دادهٔ ترم/زبان و ظرفیت در کلاس‌ها

برای فیلترهای جدید، API دوره یا slot باید این فیلدهای اختیاری/قابل‌فیلتر را برگرداند:

```json
{
  "term": "Fall 2026",
  "language": "English",
  "level": "B1"
}
```

منبع ترجیحی `term` و `language`، رکورد دوره است؛ slot می‌تواند مقدار جایگزین داشته باشد. فرانت‌اند در حال حاضر فیلتر را روی دادهٔ دریافت‌شده انجام می‌دهد؛ endpoint فیلتر جداگانه الزامی نیست. اگر تعداد کلاس‌ها زیاد است، افزودن query اختیاری `term`, `language`, `level`, `classType`, `teacherId`, `availableOnly` به `GET /api/student/class-slots` مجاز و مفید است.

فیلدهای authoritative کلاس:

```json
{
  "id": "slot-id",
  "assignmentId": "assignment-id",
  "courseId": "course-id",
  "courseTitle": "B1 English",
  "title": "B1 Group",
  "level": "B1",
  "term": "Fall 2026",
  "language": "English",
  "classType": "public",
  "teacherId": "teacher-id",
  "teacherName": "Teacher Name",
  "capacity": 8,
  "enrolledCount": 5,
  "remainingSeats": 3,
  "startsAt": "2026-11-15T10:00:00Z",
  "endsAt": "2026-11-15T11:00:00Z",
  "enrolled": false
}
```

- ظرفیت را ادمین برای هر کلاس تعیین می‌کند؛ API نباید ظرفیت را به ۱۰ برای عمومی یا ۱/۲ برای خصوصی محدود کند، مگر سیاست نهایی محصول صراحتاً چنین باشد.
- `remainingSeats = capacity - تعداد ثبت‌نام‌های معتبر` باید از دیتابیس محاسبه شود.
- رزرو تکراری، ظرفیت پر و تداخل برنامه را در لحظهٔ نوشتن اتمیک بررسی کنید.

### ۵.۳ گروه مشترک معلمان

کلاینت جدید از این دو endpoint استفاده می‌کند:

#### `GET /api/teacher-group-chat/messages?limit=200`

دسترسی: معلم `active` و ادمین. پیام‌های گروه آکادمی را به ترتیب زمانی برگرداند.

#### `POST /api/teacher-group-chat/messages`

```json
{ "content": "Message text", "isAnnouncement": false }
```

پاسخ نمونه:

```json
{
  "id": "message-id",
  "senderId": "user-id",
  "senderName": "Teacher Name",
  "senderRole": "teacher",
  "content": "Message text",
  "createdAt": "2026-11-09T10:00:00Z",
  "isAnnouncement": false
}
```

- معلمان تأییدشده خودکار عضو گروه شوند؛ معلم pending/rejected/suspended عضو نباشد.
- هویت، نقش و زمان ارسال را سرور تعیین کند؛ حداکثر طول پیام ۵۰۰۰ نویسه.
- `isAnnouncement: true` فقط با نقش Admin مجاز باشد.
- پیام خصوصی معلم با معلم از مسیرهای مکالمهٔ خصوصی ممنوع شود؛ ارتباط مجاز دانش‌آموز و معلم که از قبل پشتیبانی می‌شود بی‌دلیل حذف نشود.
- اعلان و پیام گروه باید در دیتابیس ماندگار باشند.

### ۵.۴ گروه مخصوص هر کلاس رزروشده

APIهای زیر توسط رابط گروه کلاس فراخوانی می‌شوند:

#### `GET /api/class-groups/{groupId}`

```json
{
  "id": "group-id",
  "title": "B1 English · Fall 2026",
  "teacherName": "Teacher Name",
  "memberCount": 6
}
```

#### `GET /api/class-groups/{groupId}/messages?limit=200`

فهرست پیام‌های گروه به ترتیب زمانی، با شناسه و نام فرستنده، نقش، محتوا و زمان server-side.

#### `POST /api/class-groups/{groupId}/messages`

```json
{ "content": "Message text" }
```

پاسخ باید پیام ایجادشده را برگرداند. دسترسی برای دانش‌آموز فعال همان ثبت‌نام و معلم تخصیص‌یافته مجاز است؛ ادمین بر اساس سیاست سازمان می‌تواند دسترسی مدیریتی داشته باشد. روی هر درخواست عضویت گروه را مجدداً بررسی کنید؛ دانستن `groupId` به معنی مجوز نیست.

**ساخت و عضویت گروه:**

- برای هر کلاس/assignment، حداکثر یک گروه فعال بسازید (idempotent).
- گروه کلاس عمومی: معلم تخصیص‌یافته و همهٔ ثبت‌نام‌های فعال/پرداخت‌شده همان assignment.
- گروه کلاس خصوصی: معلم و دانش‌آموز/دانش‌آموزان مجاز همان رزرو.
- گروه پس از نهایی‌شدن رزرو/تأیید پرداخت ساخته یا فعال شود؛ رزرو pending/unpaid نباید دسترسی منابع یا گروه بدهد.
- لغو رزرو، عضویت آن دانش‌آموز را لغو کند. تغییر ظرفیت یا تعداد عضو صرفاً از دیتابیس به دست آید.
- `GET /api/student/class-slots` و `GET /api/teacher/class-slots` برای کلاس مرتبط `classGroupId` برگردانند.

### ۵.۵ صفحهٔ منابع، فایل‌ها و ضبط Adobe Connect

endpoint جدید برای خود Adobe Connect لازم نیست. کاربر مجاز، URL ضبطی را که Adobe Connect تولید کرده در جلسه ثبت می‌کند؛ سایت آن را به شکل لینک امن نمایش می‌دهد.

- معلم در جلسهٔ اختصاص‌یافته، `recordingUrl` را از طریق `PATCH /api/classrooms/sessions/{sessionId}` ثبت/پاک می‌کند.
- URL ضبط و جلسه باید `https:` باشد.
- `GET /api/classrooms/sessions` بر اساس کاربر جاری محدود شود: دانش‌آموز فقط جلسه‌های ثبت‌نام فعال خودش؛ معلم فقط جلسه‌های کلاس تخصیص‌یافتهٔ خودش.
- پاسخ شامل `courseId`, `courseTitle`, `teacherName`, `scheduledAt`, `status`, `recordingUrl`, `notes`, `materials` باشد.
- فایل‌ها URL دانلود امن و موقت داشته باشند؛ فایل خصوصی کلاس یا دانش‌آموز دیگر افشا نشود.
- ورود به کلاس زنده همچنان از `/api/classrooms/sessions/{sessionId}/join` و کنترل مجوز سرور انجام شود.
- نیازی به sync یا ingest خودکار ضبط از Adobe نیست؛ ذخیره و ارائهٔ لینک ضبط کفایت می‌کند.

### ۵.۶ پروفایل دانش‌آموز و تعیین سطح

API پایه از قبل در کلاینت استفاده شده است؛ قرارداد پاسخ/ذخیره‌سازی باید فیلدها را پوشش دهد:

- `GET /api/user/profile`: برگرداندن `dateOfBirth`, `bio`, `avatarUrl`, `level`, `placementTestResult`.
- `PATCH /api/user/profile`: ذخیرهٔ `fullName`, `bio`, `level`, `placementTestResult`.
- `POST /api/user/profile/avatar`: آپلود multipart با `file` و پاسخ `{ "avatarUrl": "https://..." }`.

نمونهٔ نتیجه:

```json
{
  "level": "B1",
  "placementTestResult": {
    "score": 6,
    "maxScore": 10,
    "completedAt": "2026-11-09T10:00:00Z"
  }
}
```

نگاشت فعلی آزمون ۱۰ سوالی فرانت‌اند: `0–2=A1`, `3–4=A2`, `5–6=B1`, `7–8=B2`, `9–10=C1`. سرور score و maxScore را اعتبارسنجی کند؛ نتیجه و سطح با هم و برای همان کاربر ذخیره شوند. تاریخ تولد فقط در دسترسی مجاز برگردد؛ سن در کلاینت محاسبه شود.

### ۵.۷ امکاناتی که تغییرشان API جدید نمی‌خواهد

- جابه‌جایی/حذف کارت داشبورد، فوتر موبایل، labelهای فرم و popup قوانین: تغییر فرانت‌اند است.
- دکمهٔ «AI» در موبایل فعلاً مسیر بخش تمرین را باز می‌کند؛ در این تغییر endpoint هوش مصنوعی ساخته نشده است.
- بخش منابع از endpoint موجود `/api/classrooms/sessions` و فیلدهای `recordingUrl`/`materials` استفاده می‌کند؛ مجوز و فیلتر خروجی باید سمت بک‌اند تکمیل باشد.

---

## ۶. ترتیب پیاده‌سازی پیشنهادی بک‌اند

### P0 — مجوز و تأیید معلم

1. وضعیت اتمیک Teacher هنگام ثبت‌نام = `pending`.
2. تکمیل پروفایل برای حساب pending، بدون دسترسی به کلاس/دانش‌آموز/تدریس.
3. فهرست درخواست‌های pending برای ادمین.
4. approve/reject/suspend با ثبت ادمین، زمان و دلیل تصمیم.
5. بررسی role + status در تمام مسیرهای معلمی و فهرست عمومی معلمان.

### P1 — کلاس، رزرو و ظرفیت

1. حفظ/تکمیل APIهای class slots و availability.
2. فیلدهای term/language/level و ظرفیت انتخابی ادمین.
3. انتساب معلم با بررسی availability و schedule conflict.
4. رزرو اتمیک، تأیید پرداخت، وضعیت فعال و شمارش ظرفیت authoritative.

### P2 — گروه‌های پیام‌رسان

1. گروه مشترک آکادمی برای معلمان active و endpointهای پیام.
2. گروه idempotent برای هر کلاس بعد از نهایی‌شدن رزرو.
3. مجوز و عضویت سمت سرور برای خواندن و ارسال پیام.

### P3 — منابع و ضبط

1. فیلتر sessionها بر مبنای enrollment/teacher assignment.
2. ذخیرهٔ recording URL امن و HTTPS.
3. URLهای فایل کوتاه‌عمر و کنترل دسترسی.

### P4 — پروفایل و placement

1. برگرداندن `dateOfBirth` از پروفایل کاربر مجاز.
2. ذخیره و بازگرداندن bio/avatar/level/placement result.
3. اعتبارسنجی آپلود عکس و نتیجه آزمون در سرور.

---

## ۷. معیارهای پذیرش و تست

### ثبت‌نام و سطح دسترسی معلم

- ثبت‌نام Teacher رکورد status=`pending` ایجاد می‌کند؛ retry ثبت‌نام رکورد تکراری نمی‌سازد.
- معلم pending صفحهٔ راهنما/تکمیل پروفایل را می‌بیند، اما GET/POST تدریس و دادهٔ دانش‌آموز را نمی‌گیرد.
- ادمین pendingها را فهرست، approve و reject می‌کند؛ اقدام غیرادمین `403` می‌گیرد.
- پس از approve، مجوز backend و رابط کاربری به‌روز می‌شوند. پس از reject/suspend، مجوز تدریس لغو می‌شود.

### رزرو و ظرفیت

- هم‌زمانی چند رزرو آخرین صندلی باعث overbooking نمی‌شود.
- `remainingSeats`، `enrolledCount` و ظرفیت پس از رزرو/لغو از دیتابیس درست برمی‌گردند.
- فیلتر term, language, level, classType و teacher بر اساس دادهٔ واقعی کار می‌کند.
- معلم pending یا معلم بدون تخصیص، کلاس قابل‌تدریس/رزروشده نمی‌گیرد.

### گروه‌ها

- پس از نهایی‌شدن رزرو یک گروه ساخته می‌شود؛ اجرای تکراری فرآیند گروه تکراری نمی‌سازد.
- اعضای گروه فقط معلم تخصیص‌یافته و ثبت‌نام فعال هستند.
- دانش‌آموز/معلم غیرعضو در GET/POST گروه `403` یا `404` می‌گیرد.
- پیام‌های معلم گروهی برای سایر معلمان active قابل مشاهده‌اند؛ `isAnnouncement=true` از معلم عادی `403` می‌گیرد.
- پیام خصوصی معلم-معلم از API مکالمه پذیرفته نمی‌شود.

### منابع

- دانش‌آموز منابع جلسهٔ کلاس دیگر را نمی‌بیند.
- لینک ضبط `http:` یا URL نامعتبر رد می‌شود.
- جلسه/فایل خصوصی بدون عضویت قابل‌دسترسی نیست.
- بازکردن لینک ضبط معتبر HTTPS، کاربر را به صفحهٔ Adobe Connect می‌برد.

### پروفایل

- تغییر بیو، عکس، سن محاسبه‌شده، level و نتیجه پس از refresh باقی می‌ماند.
- score خارج از بازه یا maxScore نامعتبر از سرور رد می‌شود.
- تاریخ تولد کاربر دیگر افشا نمی‌شود.

---

## ۸. قراردادهای پاسخ/مجوز کلیدی برای هماهنگی

### وضعیت کلاس و ثبت‌نام

پیشنهاد می‌شود وضعیت رزرو از وضعیت پرداخت و تخصیص معلم جدا باشد:

- `assignment.status`: `pending | confirmed | cancelled`
- `enrollment.status`: `pending | active | confirmed | cancelled | completed`
- `payment.status`: وضعیت پرداخت مستقل و قابل audit

فقط رزرو فعال/پرداخت‌شده باید گروه و منابع دانش‌آموز را فعال کند. `remainingSeats` باید از وضعیت‌هایی محاسبه شود که واقعاً ظرفیت مصرف می‌کنند و یکسان با قوانین لغو/پرداخت باشد.

### مجوزهای سطح بالا

| نقش/وضعیت | مشاهده کلاس عمومی قابل‌رزرو | تدریس | گروه معلمان | گروه کلاس | منابع خصوصی |
|---|---:|---:|---:|---:|---:|
| دانش‌آموز ثبت‌نام‌نشده | بله | خیر | خیر | خیر | خیر |
| دانش‌آموز با رزرو فعال | بله | خیر | خیر | فقط گروه خودش | فقط کلاس خودش |
| معلم `pending` | در صورت عمومی‌بودن | خیر | خیر | خیر | خیر |
| معلم `active` بدون assignment | بله | فقط کلاس‌های خودش | بله | خیر | خیر |
| معلم `active` تخصیص‌یافته | بله | کلاس‌های تخصیص‌یافته | بله | گروه کلاس خودش | کلاس خودش |
| Admin | طبق سیاست مدیریتی | مدیریت | بله/اعلان | طبق سیاست مدیریتی | طبق audit |

---

## ۹. ناسازگاری و وضعیت مستندات قدیمی مخزن

این نکات برای جلوگیری از پیاده‌سازی دوباره یا انتخاب route اشتباه مهم‌اند:

1. `README_BACKEND.md` بعضی بخش‌ها را هنوز mock/مرحلهٔ بعد می‌داند؛ کد فرانت‌اند فعلی از برخی مسیرهای backend برای schedule، کلاس‌ها و chat استفاده می‌کند. متن قدیمی به‌تنهایی مرجع وضعیت امروز نیست.
2. اسناد قدیمی مسیرهای پروفایل معلم مانند `GET /api/teacher/profile`, `POST /api/teacher/profile/complete`, `PATCH /api/teacher/profile` را پیشنهاد می‌کنند؛ کلاینت فعال `GET/PUT /api/teachers/me` را صدا می‌زند. قرارداد نهایی پروفایل باید یکسان شود. مسیرهای upload avatar/video همچنان `/api/teacher/profile/avatar|video` هستند.
3. `MESSAGING_AND_ADMIN_SETUP.md` پیام‌رسان و admin login محلی را برای demo توضیح می‌دهد؛ این سند اثبات پیام‌رسان production یا احراز هویت امن admin نیست. کلاینت گروه معلمان اکنون به `/api/teacher-group-chat/messages` متصل است.
4. برخی اسناد قبلی ظرفیت public را ثابت ۱۰ و private را ۱ یا ۲ تعریف کرده‌اند؛ UI جدید ظرفیت انتخابی ادمین را ارسال می‌کند. سیاست ظرفیت را محصول/بک‌اند نهایی و همهٔ کلاینت‌ها را با آن هماهنگ کنند.
5. `PATCH /api/admin/teachers/{id}/status` در قرارداد قدیمی `pending | active | suspended` دارد؛ نیاز reject درخواست teacher، مقدار/status یا عملیات جداگانه می‌خواهد.
6. `POST /api/enrollment/{courseId}` برای ثبت‌نام در **دورهٔ آموزشی** با `POST /api/student/class-slots/{assignmentId}/enroll` برای رزرو **جلسهٔ زمان‌بندی‌شده** دو جریان متفاوت هستند؛ آن‌ها را با هم ادغام نکنید.
7. مسیر teacher availability در API Client جاری `GET/PUT /api/teacher/availability` است؛ `GET/PUT /api/admin/teachers/{id}/availability` مسیر مدیریتی خواندن/مدیریت است.
8. پیام‌های frontend گروهی و خصوصی مسیر/مجوزهای متفاوت دارند. گروه کلاس و گروه معلمان جدیدند و جایگزین پیام‌های پشتیبانی دانش‌آموز/معلم نیستند.

---

## ۱۰. خلاصهٔ endpointهای تازه/نیازمند تکمیل

### موجود در کلاینت، نیازمند تکمیل قرارداد/داده/مجوز

- `POST /api/auth/register`: ایجاد Teacher با status=`pending`.
- `GET /api/auth/me` و `GET /api/teachers/me`: برگرداندن status و مجوز مؤثر معلم.
- `PATCH /api/admin/teachers/{teacherId}/status`: پشتیبانی تصمیم reject و ثبت audit.
- `GET /api/courses?lang=...` و/یا `GET /api/student/class-slots`: برگرداندن `term`, `language`, `level`.
- `POST /api/admin/class-slots`: ظرفیت انتخابی، برنامه، بازهٔ زمانی و اتصال اختیاری به دوره.
- `GET /api/student/class-slots` و `GET /api/teacher/class-slots`: افزودن `classGroupId` برای کلاس‌هایی که کاربر مجاز به دیدنشان است.
- `POST /api/student/class-slots/{assignmentId}/enroll`: رزرو اتمیک و اعمال ظرفیت/تداخل.
- `GET /api/classrooms/sessions`: فیلتر براساس enrollment/assignment؛ فیلدهای recording/resources.
- `PATCH /api/classrooms/sessions/{sessionId}`: ذخیره/پاک‌کردن recordingUrl برای معلم/ادمین مجاز.
- `GET/PATCH /api/user/profile` و `POST /api/user/profile/avatar`: ذخیره و بازگرداندن فیلدهای پروفایل دانش‌آموز.

### endpointهای جدیدی که کلاینت گروه کلاس فراخوانی می‌کند

- `GET /api/class-groups/{groupId}`
- `GET /api/class-groups/{groupId}/messages?limit=200`
- `POST /api/class-groups/{groupId}/messages`

### endpointهای تازهٔ گروه معلمان

- `GET /api/teacher-group-chat/messages?limit=200`
- `POST /api/teacher-group-chat/messages`

برای فیلتر term/language، endpoint جدید الزامی نیست؛ فیلدهای قابل‌اعتماد در دادهٔ دوره/کلاس کفایت می‌کند. برای Adobe Connect نیز API integration جدید لازم نیست؛ ذخیره و ارائهٔ URL ضبط کافی است.

---

## ۱۱. تصمیم‌هایی که تیم بک‌اند باید اعلام کند

برای بستن قرارداد بدون ابهام، لطفاً پاسخ دهید:

1. Backend واقعی کدام repository/service است و API Base URL محیط local/staging چیست؟
2. کدام endpointهای جدول بخش ۳ اکنون پیاده‌سازی و deploy شده‌اند؟ لطفاً با `method + path + status` پاسخ دهید.
3. آیا رزرو کلاس قبل از پرداخت `pending` است؟ دقیقاً کدام status ظرفیت را مصرف می‌کند؟
4. آیا ظرفیت کلاس آزادانه توسط ادمین تنظیم می‌شود یا محدودیت نوع کلاس وجود دارد؟
5. آیا ترم و زبان در جدول Course هستند یا باید به ClassSlot افزوده شوند؟
6. برای رد درخواست معلم، status=`rejected` قابل افزودن است یا endpoint تصمیم جدا لازم است؟
7. Adobe Connect URL ضبط توسط معلم وارد می‌شود یا مدیر؟ آیا لینک recording عمومی است یا نیاز به proxy/مجوز موقت دارد؟
8. آیا chat در نسخهٔ نخست با polling قابل قبول است یا backend به WebSocket/SignalR نیاز دارد؟ کلاینت فعلی برای group chat هر ۵ ثانیه polling می‌کند.

---

## ۱۲. مرجع نسخه

این handoff، قراردادهای مربوط به تغییرات اخیر دانش‌آموز، onboarding معلم، کلاس/رزرو، گروه‌ها و منابع را در یک فایل جمع کرده است. فایل‌های قبلی داخل repository شامل فهرست APIها و پیشنهادهای قدیمی‌تر هستند؛ بخش ۹ موارد اختلاف مهم را پوشش می‌دهد تا تیم لازم نباشد چند سند متناقض را مرجع هم‌زمان قرار دهد.
