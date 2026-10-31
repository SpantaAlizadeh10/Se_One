# فهرست یکپارچه APIهای موردنیاز وب‌سایت SE ONE

این سند فهرست endpointهای موردنیاز فرانت‌اند را از مستندات موجود و فراخوانی‌های فعلی در `lib/api/` یک‌جا جمع می‌کند. مسیرهای دارای `{...}` پارامتر پویا هستند. مگر آن‌که خلافش نوشته شده باشد، بدنه و پاسخ JSON است.

## تنظیمات و قرارداد عمومی

- **Base URL بک‌اند:** مقدار `NEXT_PUBLIC_API_BASE_URL`؛ مسیرها در جدول‌ها نسبت به این آدرس هستند.
- **احراز هویت:** cookie و/یا `Authorization: Bearer <token>`؛ مسیرهای شخصی نیازمند ورودند.
- **محدودیت دسترسی:** `Admin` فقط برای مسیرهای `/api/admin/*`؛ مسیرهای `/api/student/*` و `/api/teacher/*` فقط برای نقش متناظر. شناسه کاربر و نقش باید از اطلاعات احراز هویت استخراج شوند، نه از داده ارسالی کاربر.
- **خطاها:** پاسخ‌های سازگار با `ProblemDetails` و کدهای مناسب مانند 400، 401، 403، 404 و 409.
- **فهرست‌های مدیریتی:** معمولاً پارامترهای `page`, `pageSize`, `search`, `status` و پاسخ صفحه‌بندی‌شده دارند.

## ۱. ورود، ثبت‌نام و احراز هویت

| روش  | مسیر                        | دسترسی / توضیح                                                                                       |
| ---- | --------------------------- | ---------------------------------------------------------------------------------------------------- |
| POST | `/api/auth/login`           | عمومی؛ ورود ایمیل و رمز، برگرداندن کاربر و token                                                     |
| POST | `/api/auth/register`        | عمومی؛ ساخت حساب دانش‌آموز/معلم؛ ثبت‌نام دانش‌آموز ممکن است `dateOfBirth` و `parentalConsent` بفرستد |
| GET  | `/api/auth/me`              | کاربر واردشده؛ اطلاعات کاربر فعلی                                                                    |
| POST | `/api/auth/logout`          | کاربر واردشده                                                                                        |
| POST | `/api/auth/otp/request`     | عمومی؛ درخواست کد یک‌بارمصرف پیامکی                                                                  |
| POST | `/api/auth/otp/verify`      | عمومی؛ تأیید OTP و ورود                                                                              |
| POST | `/api/auth/forgot-password` | عمومی؛ درخواست بازیابی رمز                                                                           |
| POST | `/api/admin/auth/login`     | اختیاری؛ ورود اختصاصی ادمین، در صورت پیاده‌سازی باید نقش Admin را بررسی کند                          |

**نکته ثبت‌نام کودک:** سن باید سمت سرور محاسبه شود. برای دانش‌آموز زیر ۱۴ سال، تیک فرانت‌اند به‌تنهایی رضایت معتبر سرپرست محسوب نمی‌شود و گردش‌کار/مدرک رضایت باید سمت سرور انجام شود. تاریخ تولد در پروفایل عمومی نباید افشا شود.

## ۲. کاتالوگ دوره‌ها، جست‌وجو و محتوای آموزشی

### دوره‌ها و جست‌وجو

| روش   | مسیر                                                        | توضیح                                                                                                                                                                             |
| ----- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET   | `/api/courses?lang={lang}`                                  | فهرست عمومی دوره‌ها                                                                                                                                                               |
| GET   | `/api/courses/search`                                       | جست‌وجو و فیلتر دوره‌ها؛ پشتیبانی از `q`, `level`, `category`, `language`, `minPrice`, `maxPrice`, `teacherId`, `hasDiscount`, `featured`, `minRating`، صفحه‌بندی، `sort`, `lang` |
| GET   | `/api/courses/suggestions?q={query}&lang={lang}`            | پیشنهادهای autocomplete                                                                                                                                                           |
| GET   | `/api/courses/filters?lang={lang}`                          | گزینه‌های فیلتر، سطوح، دسته‌ها، معلمان و بازه قیمت                                                                                                                                |
| GET   | `/api/courses/featured?lang={lang}&limit={limit}`           | دوره‌های ویژه                                                                                                                                                                     |
| GET   | `/api/courses/trending?lang={lang}&limit={limit}`           | دوره‌های پرطرفدار                                                                                                                                                                 |
| GET   | `/api/courses/similar/{courseId}?lang={lang}&limit={limit}` | دوره‌های مشابه                                                                                                                                                                    |
| GET   | `/api/courses/{courseId}/modules`                           | ماژول‌های یک دوره                                                                                                                                                                 |
| GET   | `/api/modules/{moduleId}`                                   | جزئیات ماژول                                                                                                                                                                      |
| GET   | `/api/modules/{moduleId}/lessons`                           | درس‌های ماژول                                                                                                                                                                     |
| GET   | `/api/lessons/{lessonId}`                                   | جزئیات درس و محتوای آموزشی                                                                                                                                                        |
| POST  | `/api/lessons/{lessonId}/complete`                          | ثبت تکمیل درس                                                                                                                                                                     |
| GET   | `/api/lessons/{lessonId}/progress`                          | دریافت پیشرفت درس                                                                                                                                                                 |
| PATCH | `/api/lessons/{lessonId}/progress`                          | به‌روزرسانی زمان مطالعه و موقعیت درس                                                                                                                                              |

### ثبت‌نام در دوره

| روش    | مسیر                                      | توضیح                                            |
| ------ | ----------------------------------------- | ------------------------------------------------ |
| POST   | `/api/enrollment/{courseId}`              | ثبت‌نام کاربر در دوره؛ ممکن است پرداخت لازم باشد |
| GET    | `/api/enrollment/user`                    | ثبت‌نام‌های کاربر فعلی                           |
| GET    | `/api/enrollment/{enrollmentId}`          | جزئیات ثبت‌نام                                   |
| DELETE | `/api/enrollment/{enrollmentId}`          | لغو ثبت‌نام                                      |
| GET    | `/api/enrollment/{enrollmentId}/progress` | پیشرفت ثبت‌نام/دوره                              |

### پیشرفت و جلسات یادگیری

| روش  | مسیر                                               | توضیح                                       |
| ---- | -------------------------------------------------- | ------------------------------------------- |
| GET  | `/api/progress/user`                               | نمای کلی پیشرفت کاربر، زمان مطالعه و streak |
| GET  | `/api/progress/course/{courseId}`                  | پیشرفت یک دوره                              |
| GET  | `/api/progress/achievements`                       | دستاوردهای کاربر                            |
| POST | `/api/progress/achievements/{achievementId}/claim` | دریافت جایزه دستاورد                        |
| GET  | `/api/learning/current`                            | وضعیت یادگیری فعلی                          |
| POST | `/api/learning/start/{courseId}`                   | شروع جلسه یادگیری                           |
| POST | `/api/learning/continue/{lessonId}`                | ادامه یادگیری از درس                        |
| POST | `/api/learning/session/{sessionId}/end`            | پایان جلسه و ثبت زمان/پیشرفت                |
| GET  | `/api/learning/recommendations`                    | پیشنهادهای یادگیری                          |

## ۳. معلمان، رزرو و کلاس زنده

### فهرست عمومی، پروفایل و دسترس‌پذیری

| روش | مسیر               | دسترسی / توضیح                                   |
| --- | ------------------ | ------------------------------------------------ |
| GET | `/api/teachers`    | عمومی؛ فهرست معلمان فعال، امتیاز و زمان‌های آزاد |
| GET | `/api/teachers/me` | معلم واردشده؛ پروفایل خودش                       |

| PUT | `/api/teachers/me` | معلم واردشده؛ تکمیل/به‌روزرسانی پروفایل |
| POST | `/api/teacher/profile/avatar` | معلم؛ آپلود تصویر پروفایل (multipart `file`) |
| POST | `/api/teacher/profile/video` | معلم؛ آپلود ویدیوی معرفی (multipart `file`) |
| GET | `/api/teacher/availability` | معلم؛ زمان‌های دسترس‌پذیری خودش |
| PUT | `/api/teacher/availability` | معلم؛ جایگزینی زمان‌های دسترس‌پذیری؛ نباید slot رزروشده حذف/تغییر کند |
| POST | `/api/bookings` | دانش‌آموز؛ رزرو با `teacherId` و `slotId` |

### کلاس‌های گروهی زمان‌بندی‌شده

کلاس زمان‌دار می‌تواند عمومی یا خصوصی باشد. ادمین کلاس را با تاریخ شروع/پایان تعریف می‌کند؛ ظرفیت عمومی دقیقاً ۱۰ نفر و ظرفیت خصوصی ۱ یا ۲ نفر است. معلم کلاس بدون تداخل زمانی را می‌پذیرد؛ دانش‌آموز می‌تواند همه کلاس‌های پذیرفته‌شده‌ای را که ظرفیت دارند ببیند و با فیلتر عمومی/خصوصی و معلم جست‌وجو کند.

| روش  | مسیر                                             | دسترسی / توضیح                                                                                                        |
| ---- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| GET  | `/api/admin/class-slots`                         | ادمین؛ فهرست کلاس‌ها همراه `capacity`, `enrolledCount`, `remainingSeats`, وضعیت و معلم‌های پذیرفته‌شده                |
| POST | `/api/admin/class-slots`                         | ادمین؛ ساخت کلاس با `classType: public\|private`; ظرفیت عمومی ۱۰ و ظرفیت خصوصی فقط ۱ یا ۲، اعتبارسنجی سمت سرور الزامی |
| GET  | `/api/teacher/class-slots`                       | معلم واردشده؛ کلاس‌های قابل‌پذیرش و وضعیت پذیرش او                                                                    |
| POST | `/api/teacher/class-slots/{slotId}/accept`       | پذیرش کلاس توسط معلم؛ رد با 409 اگر برنامه همان معلم بازه زمانی هم‌پوشان داشته باشد                                   |
| GET  | `/api/student/class-slots?teacherId={id}`        | دانش‌آموز واردشده؛ کلاس‌های فعال و پذیرفته‌شده توسط معلم، با صندلی خالی و وضعیت ثبت‌نام دانش‌آموز فعلی                |
| POST | `/api/student/class-slots/{assignmentId}/enroll` | ثبت‌نام اتمیک در کلاس؛ رد با 409 برای ظرفیت پر، تکرار ثبت‌نام یا تداخل برنامه دانش‌آموز                               |

**مدل کلاس پیشنهادی:** `{ id, title, description, classType: "public" | "private", teacherRole, capacity, startsAt, endsAt, status, enrolledCount, remainingSeats }`. برای public ظرفیت باید ۱۰ و برای private ظرفیت باید ۱ یا ۲ باشد. تاریخ‌ها ISO-8601 باشند. هر پذیرش معلم یک `assignmentId` دارد و پاسخ کلاس دانش‌آموز باید شامل `assignmentId`, `teacherId`, `teacherName`, `enrolled` باشد.

**الزامات اجباری سمت سرور:**

- احراز نقش و شناسه معلم/دانش‌آموز از token/cookie؛ هرگز از بدنه درخواست اعتماد نشود.
- زمان شروع قبل از پایان باشد؛ فقط کلاس‌های فعال و آینده برای پذیرش/ثبت‌نام ارائه شوند.
- پذیرش معلم و ثبت‌نام دانش‌آموز در تراکنش اتمیک انجام شود. برای جلوگیری از overselling، تعداد ثبت‌نام فعال هنگام درج دوباره بررسی/قفل شود.
- تداخل زمانی با شرط `startA < endB && endA > startB` بررسی شود؛ بازه‌های صرفاً مماس (یکی دقیقاً در پایان دیگری) تداخل نیستند.
- معلم نتواند بیش از یک کلاس هم‌پوشان را بپذیرد. سقف ثبت‌نام فعال کلاس عمومی ۱۰ و کلاس خصوصی طبق تنظیم ادمین ۱ یا ۲ است. پاسخ صندلی‌های باقی‌مانده از شمار ثبت‌نام‌های فعال محاسبه شود، نه مقدار ذخیره‌شده/قابل‌دست‌کاری کلاینت.
- دانش‌آموز نتواند دوبار در یک کلاس یا در دو کلاس هم‌زمان ثبت‌نام کند. لغو ثبت‌نام باید صندلی را آزاد کند.
- ثبت‌نام‌های لغوشده در شمار ظرفیت و کنترل تداخل لحاظ نشوند.

### داشبورد معلم

| روش  | مسیر                                                                             | توضیح                                                         |
| ---- | -------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| GET  | `/api/teacher/dashboard/classes?status={status}&startDate={date}&endDate={date}` | کلاس‌های معلم                                                 |
| GET  | `/api/teacher/dashboard/schedule?startDate={date}&endDate={date}`                | برنامه معلم                                                   |
| GET  | `/api/teacher/dashboard/students?courseId={id}&activeOnly={bool}`                | دانش‌آموزان معلم                                              |
| GET  | `/api/teacher/dashboard/earnings?period={period}`                                | درآمد و `availableBalance`                                    |
| GET  | `/api/teacher/dashboard/analytics`                                               | آمار معلم                                                     |
| GET  | `/api/teacher/dashboard/overview`                                                | داده تجمیعی صفحه اصلی داشبورد معلم                            |
| GET  | `/api/teacher/dashboard/progression?lang=fa\|en`                                 | سطح رشد و سهم درآمد محاسبه‌شده سمت سرور                       |
| POST | `/api/teacher/dashboard/withdrawals`                                             | درخواست برداشت؛ `{ amount, iban }`؛ بررسی اتمیک موجودی الزامی |

### کلاس‌های آنلاین و فایل‌های کلاس

| روش   | مسیر                                                      | دسترسی / توضیح                                                       |
| ----- | --------------------------------------------------------- | -------------------------------------------------------------------- |
| GET   | `/api/classrooms/sessions`                                | نشست‌های کلاس مجاز برای کاربر                                        |
| POST  | `/api/classrooms/sessions`                                | ایجاد نشست کلاس؛ معمولاً معلم/ادمین                                  |
| PATCH | `/api/classrooms/sessions/{sessionId}`                    | تغییر وضعیت، لینک جلسه، ضبط یا یادداشت                               |
| POST  | `/api/classrooms/sessions/{sessionId}/join`               | ورود مجاز به کلاس و ثبت رویداد حضور؛ پاسخ شامل meeting URL امن HTTPS |
| POST  | `/api/classrooms/sessions/{sessionId}/files/upload-grant` | ایجاد مجوز موقت و محدود برای آپلود فایل                              |
| POST  | `/api/classrooms/sessions/{sessionId}/files`              | ثبت metadata/path فایل آپلودشده در نشست                              |

## ۴. داشبورد دانش‌آموز

| روش | مسیر                                                                          | توضیح                             |
| --- | ----------------------------------------------------------------------------- | --------------------------------- |
| GET | `/api/student/dashboard/overview`                                             | داده تجمیعی داشبورد               |
| GET | `/api/student/dashboard/upcoming-classes?limit={limit}`                       | کلاس‌های آینده                    |
| GET | `/api/student/dashboard/calendar?startDate={date}&endDate={date}&type={type}` | رویدادهای تقویم                   |
| GET | `/api/student/dashboard/recent-activity?limit={limit}`                        | فعالیت‌های اخیر                   |
| GET | `/api/student/dashboard/statistics`                                           | زمان مطالعه، streak و آمار آموزشی |

## ۵. علاقه‌مندی‌ها و دیدگاه‌ها

### فهرست علاقه‌مندی

| روش    | مسیر                             | توضیح                             |
| ------ | -------------------------------- | --------------------------------- |
| GET    | `/api/wishlist`                  | علاقه‌مندی‌های کاربر              |
| POST   | `/api/wishlist`                  | افزودن دوره؛ بدنه شامل `courseId` |
| DELETE | `/api/wishlist/{courseId}`       | حذف دوره از علاقه‌مندی            |
| GET    | `/api/wishlist/check/{courseId}` | بررسی وجود دوره در علاقه‌مندی     |

### امتیاز و review دوره

| روش    | مسیر                                     | توضیح                           |
| ------ | ---------------------------------------- | ------------------------------- |
| GET    | `/api/reviews/course/{courseId}`         | دیدگاه‌های یک دوره              |
| GET    | `/api/reviews/course/{courseId}/summary` | میانگین، تعداد و توزیع امتیازها |
| POST   | `/api/reviews`                           | ثبت دیدگاه                      |
| GET    | `/api/reviews/user`                      | دیدگاه‌های کاربر فعلی           |
| GET    | `/api/reviews/{reviewId}`                | یک دیدگاه                       |
| PATCH  | `/api/reviews/{reviewId}`                | ویرایش دیدگاه خود کاربر         |
| DELETE | `/api/reviews/{reviewId}`                | حذف دیدگاه خود کاربر            |
| POST   | `/api/reviews/{reviewId}/helpful`        | علامت‌گذاری مفید                |
| DELETE | `/api/reviews/{reviewId}/helpful`        | برداشتن علامت مفید              |

## ۶. پیام‌رسانی

| روش   | مسیر                                                              | توضیح                                                             |
| ----- | ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| GET   | `/api/conversations`                                              | گفتگوهای کاربر                                                    |
| GET   | `/api/conversations/contacts`                                     | مخاطبان مجاز برای گفتگو                                           |
| GET   | `/api/conversations/search?query={query}`                         | جست‌وجوی گفتگو                                                    |
| POST  | `/api/conversations`                                              | ایجاد گفتگو؛ اعتبارسنجی مجوز ارتباط با مخاطب الزامی است           |
| GET   | `/api/conversations/{conversationId}`                             | جزئیات گفتگو                                                      |
| GET   | `/api/conversations/{conversationId}/messages`                    | پیام‌های گفتگو                                                    |
| POST  | `/api/conversations/{conversationId}/messages`                    | ارسال پیام                                                        |
| POST  | `/api/conversations/{conversationId}/messages/{messageId}/upload` | آپلود پیوست؛ حداکثر ۵ فایل و ۲۰ مگابایت برای هر فایل، ذخیره خصوصی |
| PATCH | `/api/conversations/{conversationId}/read`                        | خوانده‌شده‌کردن گفتگو                                             |
| PATCH | `/api/messages/{messageId}/read`                                  | خوانده‌شده‌کردن پیام                                              |
| GET   | `/api/conversations/{conversationId}/typing`                      | وضعیت تایپ                                                        |
| POST  | `/api/conversations/{conversationId}/typing`                      | ثبت وضعیت تایپ                                                    |

## ۷. تکالیف و تمرین

### تکالیف معلم

| روش    | مسیر                                                  | توضیح                      |
| ------ | ----------------------------------------------------- | -------------------------- |
| GET    | `/api/teacher/assignments`                            | تکالیف ساخته‌شده توسط معلم |
| POST   | `/api/teacher/assignments`                            | ساخت تکلیف                 |
| GET    | `/api/teacher/assignments/{assignmentId}`             | جزئیات تکلیف               |
| PATCH  | `/api/teacher/assignments/{assignmentId}`             | ویرایش تکلیف               |
| DELETE | `/api/teacher/assignments/{assignmentId}`             | حذف تکلیف                  |
| GET    | `/api/teacher/assignments/{assignmentId}/submissions` | پاسخ‌های دانش‌آموزان       |
| PATCH  | `/api/teacher/submissions/{submissionId}/grade`       | نمره‌دهی و بازخورد         |

### تکالیف دانش‌آموز

| روش   | مسیر                                                               | توضیح                                                               |
| ----- | ------------------------------------------------------------------ | ------------------------------------------------------------------- |
| GET   | `/api/student/assignments`                                         | تکالیف دانش‌آموز                                                    |
| GET   | `/api/student/assignments/{assignmentId}`                          | جزئیات تکلیف                                                        |
| POST  | `/api/student/assignments/{assignmentId}/submissions`              | ایجاد/ارسال پاسخ اولیه                                              |
| PUT   | `/api/student/assignments/{assignmentId}/submissions/draft`        | ساخت یا به‌روزرسانی پیش‌نویس؛ idempotent برای دانش‌آموز/تکلیف       |
| POST  | `/api/student/submissions/{submissionId}/submit`                   | ارسال یا ارسال مجدد پیش‌نویس                                        |
| PATCH | `/api/student/submissions/{submissionId}`                          | ویرایش پاسخ پیش‌نویس                                                |
| GET   | `/api/student/submissions`                                         | تاریخچه پاسخ‌ها                                                     |
| GET   | `/api/student/submissions/{submissionId}`                          | جزئیات پاسخ                                                         |
| POST  | `/api/student/assignments/{assignmentId}/submissions/upload-grant` | مجوز کوتاه‌عمر آپلود خصوصی؛ حداکثر ۵ فایل و ۲۰ مگابایت برای هر فایل |
| GET   | `/api/student/attachments/download-url?path={storagePath}`         | لینک دانلود کوتاه‌عمر پس از کنترل دسترسی                            |

### تمرین و آزمون

| روش    | مسیر                                        | توضیح                               |
| ------ | ------------------------------------------- | ----------------------------------- |
| GET    | `/api/practice`                             | محتوای تمرین؛ امکان فیلتر/صفحه‌بندی |
| GET    | `/api/practice/{practiceId}`                | جزئیات تمرین                        |
| POST   | `/api/practice`                             | ایجاد محتوا؛ معلم/ادمین             |
| PATCH  | `/api/practice/{practiceId}`                | ویرایش محتوا                        |
| DELETE | `/api/practice/{practiceId}`                | حذف محتوا                           |
| POST   | `/api/practice/attempts`                    | شروع تلاش                           |
| POST   | `/api/practice/attempts/{attemptId}/submit` | ارسال پاسخ‌ها و ثبت نتیجه           |
| GET    | `/api/practice/attempts`                    | تلاش‌های کاربر                      |
| GET    | `/api/practice/attempts/{attemptId}`        | جزئیات تلاش                         |
| GET    | `/api/practice/history`                     | خلاصه سابقه تمرین                   |
| GET    | `/api/practice/streak`                      | اطلاعات استمرار تمرین               |
| GET    | `/api/practice/leaderboard/{practiceId}`    | جدول رتبه‌بندی                      |

## ۸. پروفایل، امنیت حساب و تنظیمات کاربر

| روش    | مسیر                                  | توضیح                                                      |
| ------ | ------------------------------------- | ---------------------------------------------------------- |
| GET    | `/api/user/profile`                   | پروفایل کاربر؛ تاریخ تولد فقط برای خود کاربر/گردش‌کار مجاز |
| PATCH  | `/api/user/profile`                   | ویرایش پروفایل                                             |
| POST   | `/api/user/profile/avatar`            | آپلود avatar                                               |
| DELETE | `/api/user/profile/avatar`            | حذف avatar                                                 |
| POST   | `/api/user/password/change`           | تغییر رمز عبور                                             |
| GET    | `/api/user/2fa/status`                | وضعیت احراز هویت دومرحله‌ای                                |
| POST   | `/api/user/2fa/enable`                | آغاز فعال‌سازی 2FA                                         |
| POST   | `/api/user/2fa/verify`                | تأیید راه‌اندازی 2FA                                       |
| POST   | `/api/user/2fa/disable`               | غیرفعال‌کردن 2FA                                           |
| POST   | `/api/user/2fa/backup/regenerate`     | تولید مجدد کدهای پشتیبان                                   |
| GET    | `/api/user/notifications/preferences` | دریافت ترجیحات اعلان                                       |
| PATCH  | `/api/user/notifications/preferences` | ویرایش ترجیحات اعلان                                       |
| POST   | `/api/user/account/delete`            | درخواست حذف حساب                                           |
| DELETE | `/api/user/account/delete/{token}`    | تأیید حذف با token                                         |
| POST   | `/api/user/account/delete/cancel`     | لغو درخواست حذف حساب                                       |

## ۹. اعلان‌ها و اطلاعیه‌های داشبورد

### اعلان‌های شخصی

| روش    | مسیر                                                                    | توضیح                               |
| ------ | ----------------------------------------------------------------------- | ----------------------------------- |
| GET    | `/api/notifications?type={type}&unreadOnly={bool}&limit={n}&offset={n}` | فهرست اعلان‌ها                      |
| GET    | `/api/notifications/stats`                                              | شمار کل/خوانده‌نشده و تفکیک نوع     |
| GET    | `/api/notifications/{notificationId}`                                   | یک اعلان                            |
| PATCH  | `/api/notifications/{notificationId}/read`                              | خوانده‌شده‌کردن اعلان               |
| PATCH  | `/api/notifications/read-all`                                           | خوانده‌شده‌کردن همه اعلان‌ها        |
| DELETE | `/api/notifications/{notificationId}`                                   | حذف یک اعلان                        |
| DELETE | `/api/notifications/clear?readOnly={bool}&olderThan={date}`             | پاک‌سازی اعلان‌ها                   |
| POST   | `/api/notifications/{notificationId}/action`                            | اجرای اقدام اعلان                   |
| POST   | `/api/notifications/test`                                               | ساخت اعلان آزمایشی؛ فقط توسعه/ادمین |

### اطلاعیه‌های مشترک

| روش    | مسیر                                                                 | دسترسی / توضیح                                         |
| ------ | -------------------------------------------------------------------- | ------------------------------------------------------ |
| GET    | `/api/admin/announcements?status={all\|draft\|scheduled\|published}` | ادمین؛ مدیریت اطلاعیه‌ها                               |
| POST   | `/api/admin/announcements`                                           | ادمین؛ ایجاد اطلاعیه                                   |
| PATCH  | `/api/admin/announcements/{id}`                                      | ادمین؛ ویرایش/تغییر وضعیت                              |
| DELETE | `/api/admin/announcements/{id}`                                      | ادمین؛ حذف اطلاعیه                                     |
| GET    | `/api/announcements?limit={n}`                                       | کاربر واردشده؛ اطلاعیه‌های منتشرشده و مجاز برای نقش او |
| POST   | `/api/announcements/{id}/read`                                       | علامت‌گذاری به‌عنوان خوانده‌شده                        |
| POST   | `/api/announcements/{id}/dismiss`                                    | بستن اطلاعیه برای کاربر                                |

## ۱۰. پشتیبانی و تماس

| روش   | مسیر                                                          | دسترسی / توضیح                            |
| ----- | ------------------------------------------------------------- | ----------------------------------------- |
| POST  | `/api/contact`                                                | عمومی؛ ارسال فرم تماس                     |
| GET   | `/api/support/tickets`                                        | کاربر؛ فهرست تیکت‌های مجاز                |
| POST  | `/api/support/tickets`                                        | ایجاد تیکت                                |
| GET   | `/api/support/tickets/{ticketId}`                             | جزئیات تیکت با کنترل دسترسی               |
| PATCH | `/api/support/tickets/{ticketId}`                             | ویرایش موضوع/دسته/اولویت/وضعیت در حد مجاز |
| POST  | `/api/support/tickets/{ticketId}/close`                       | بستن تیکت                                 |
| POST  | `/api/support/tickets/{ticketId}/reopen`                      | بازگشایی تیکت                             |
| GET   | `/api/support/tickets/{ticketId}/messages`                    | پیام‌های تیکت                             |
| POST  | `/api/support/tickets/{ticketId}/messages`                    | افزودن پیام                               |
| POST  | `/api/support/tickets/{ticketId}/messages/{messageId}/upload` | آپلود پیوست پیام                          |
| GET   | `/api/support/faq`                                            | سوالات متداول                             |

## ۱۱. خبرنامه و کمپین ایمیلی

### عمومی

| روش   | مسیر                                  | توضیح               |
| ----- | ------------------------------------- | ------------------- |
| POST  | `/api/newsletter/subscribe`           | عضویت در خبرنامه    |
| POST  | `/api/newsletter/unsubscribe`         | لغو عضویت           |
| GET   | `/api/newsletter/preferences/{token}` | ترجیحات مشترک       |
| PATCH | `/api/newsletter/preferences/{token}` | به‌روزرسانی ترجیحات |
| POST  | `/api/blog/newsletter/subscribe`      | عضویت از صفحه وبلاگ |

### مدیریت ادمین

| روش    | مسیر                                          | توضیح          |
| ------ | --------------------------------------------- | -------------- |
| GET    | `/api/newsletter/subscribers`                 | فهرست مشترکان  |
| GET    | `/api/newsletter/subscribers/{subscriberId}`  | جزئیات مشترک   |
| PATCH  | `/api/newsletter/subscribers/{subscriberId}`  | ویرایش مشترک   |
| DELETE | `/api/newsletter/subscribers/{subscriberId}`  | حذف مشترک      |
| POST   | `/api/newsletter/subscribers/import`          | واردکردن CSV   |
| GET    | `/api/newsletter/campaigns`                   | فهرست کمپین‌ها |
| POST   | `/api/newsletter/campaigns`                   | ایجاد کمپین    |
| GET    | `/api/newsletter/campaigns/{campaignId}`      | جزئیات کمپین   |
| PATCH  | `/api/newsletter/campaigns/{campaignId}`      | ویرایش کمپین   |
| POST   | `/api/newsletter/campaigns/{campaignId}/send` | ارسال کمپین    |
| DELETE | `/api/newsletter/campaigns/{campaignId}`      | حذف کمپین      |
| GET    | `/api/newsletter/stats`                       | آمار خبرنامه   |

## ۱۲. وبلاگ

| روش    | مسیر                                                  | دسترسی / توضیح                             |
| ------ | ----------------------------------------------------- | ------------------------------------------ |
| GET    | `/api/blog?lang={lang}`                               | عمومی؛ مطالب منتشرشده                      |
| GET    | `/api/admin/blog/posts?status={status}&search={text}` | ادمین؛ فهرست و جست‌وجوی مطالب با صفحه‌بندی |
| POST   | `/api/admin/blog/posts`                               | ادمین؛ ایجاد مطلب                          |
| GET    | `/api/admin/blog/posts/{postId}`                      | ادمین؛ جزئیات مطلب                         |
| PATCH  | `/api/admin/blog/posts/{postId}`                      | ادمین؛ ویرایش مطلب                         |
| DELETE | `/api/admin/blog/posts/{postId}`                      | ادمین؛ حذف مطلب                            |
| PATCH  | `/api/admin/blog/posts/{postId}/status`               | ادمین؛ انتشار یا پیش‌نویس‌کردن             |

## ۱۳. APIهای پنل ادمین

همه مسیرهای این بخش فقط برای نقش `Admin` هستند.

### داشبورد، دوره‌ها و محتوا

| روش    | مسیر                                    | توضیح                               |
| ------ | --------------------------------------- | ----------------------------------- |
| GET    | `/api/admin/dashboard/stats`            | آمار کلی داشبورد                    |
| GET    | `/api/admin/courses`                    | فهرست دوره‌ها و داده مدیریتی قیمت   |
| POST   | `/api/admin/courses`                    | ایجاد دوره                          |
| POST   | `/api/admin/courses/upload-image`       | آپلود تصویر دوره (multipart `file`) |
| PATCH  | `/api/admin/courses/{courseId}`         | ویرایش اطلاعات/وضعیت انتشار دوره    |
| PATCH  | `/api/admin/courses/{courseId}/pricing` | ویرایش قیمت، تخفیف و ارز            |
| GET    | `/api/admin/courses/{courseId}/modules` | ماژول‌های دوره                      |
| POST   | `/api/admin/courses/{courseId}/modules` | ایجاد ماژول                         |
| PATCH  | `/api/admin/modules/{moduleId}`         | ویرایش ماژول                        |
| DELETE | `/api/admin/modules/{moduleId}`         | حذف ماژول                           |
| GET    | `/api/admin/modules/{moduleId}/lessons` | درس‌های ماژول                       |
| POST   | `/api/admin/modules/{moduleId}/lessons` | ایجاد درس                           |
| PATCH  | `/api/admin/lessons/{lessonId}`         | ویرایش درس                          |
| DELETE | `/api/admin/lessons/{lessonId}`         | حذف درس                             |
| GET    | `/api/admin/settings`                   | تنظیمات سایت                        |
| PATCH  | `/api/admin/settings`                   | تغییر تنظیمات سایت                  |

### مدیریت دانش‌آموزان

| روش    | مسیر                                                         | توضیح                                     |
| ------ | ------------------------------------------------------------ | ----------------------------------------- |
| GET    | `/api/admin/students`                                        | فهرست/جست‌وجو/فیلتر/صفحه‌بندی دانش‌آموزان |
| POST   | `/api/admin/students`                                        | ساخت حساب دانش‌آموز                       |
| GET    | `/api/admin/students/{studentId}`                            | جزئیات دانش‌آموز                          |
| PATCH  | `/api/admin/students/{studentId}`                            | ویرایش پروفایل                            |
| PATCH  | `/api/admin/students/{studentId}/status`                     | فعال، تعلیق یا مسدودکردن                  |
| DELETE | `/api/admin/students/{studentId}`                            | حذف/غیرفعال‌سازی حساب                     |
| GET    | `/api/admin/students/{studentId}/enrollments`                | ثبت‌نام‌های دانش‌آموز                     |
| GET    | `/api/admin/students/{studentId}/progress`                   | پیشرفت دانش‌آموز                          |
| POST   | `/api/admin/students/{studentId}/enrollments`                | ثبت دانش‌آموز در دوره                     |
| DELETE | `/api/admin/students/{studentId}/enrollments/{enrollmentId}` | لغو ثبت‌نام                               |

### مدیریت معلمان و برداشت

| روش    | مسیر                                           | توضیح                                         |
| ------ | ---------------------------------------------- | --------------------------------------------- |
| GET    | `/api/admin/teachers`                          | فهرست/جست‌وجو/فیلتر معلمان                    |
| POST   | `/api/admin/teachers`                          | ساخت معلم؛ وضعیت آغازین pending               |
| GET    | `/api/admin/teachers/{teacherId}`              | جزئیات معلم                                   |
| PATCH  | `/api/admin/teachers/{teacherId}`              | ویرایش پروفایل معلم                           |
| PATCH  | `/api/admin/teachers/{teacherId}/status`       | تأیید، تعلیق یا تغییر وضعیت معلم              |
| DELETE | `/api/admin/teachers/{teacherId}`              | حذف معلم                                      |
| GET    | `/api/admin/teachers/{teacherId}/students`     | دانش‌آموزان مرتبط با معلم                     |
| GET    | `/api/admin/teachers/{teacherId}/availability` | دسترس‌پذیری معلم                              |
| PUT    | `/api/admin/teachers/{teacherId}/availability` | جایگزینی زمان‌های معلم                        |
| GET    | `/api/admin/withdrawals?status={status}`       | درخواست‌های برداشت؛ صفحه‌بندی                 |
| PATCH  | `/api/admin/withdrawals/{withdrawalId}/status` | تأیید/رد برداشت در انتظار                     |
| GET    | `/api/admin/teacher-tiers`                     | مشاهده تنظیمات سطح و سهم درآمد معلم           |
| PUT    | `/api/admin/teacher-tiers`                     | تنظیم آستانه‌ها و سهم درآمد؛ ثبت audit الزامی |

### ثبت‌نام و ابزارهای اختیاری مدیریتی

| روش    | مسیر                                                                  | وضعیت / توضیح                                 |
| ------ | --------------------------------------------------------------------- | --------------------------------------------- |
| GET    | `/api/admin/enrollments?courseId={id}&studentId={id}&status={status}` | فهرست ثبت‌نام‌ها؛ در مشخصات ادمین آمده است    |
| PATCH  | `/api/admin/enrollments/{enrollmentId}`                               | تغییر وضعیت ثبت‌نام؛ در مشخصات ادمین آمده است |
| GET    | `/api/admin/conversations`                                            | اختیاری/مرحله بعد؛ فهرست برای نظارت           |
| DELETE | `/api/admin/messages/{messageId}`                                     | اختیاری/مرحله بعد؛ حذف پیام نامناسب           |
| GET    | `/api/admin/assignments`                                              | اختیاری/مرحله بعد؛ فهرست تکالیف               |
| PATCH  | `/api/admin/assignments/{id}`                                         | اختیاری/مرحله بعد؛ اصلاح نمره یا مهلت         |

## ۱۴. مسیرهای داخلی Next.js (نه API بک‌اند)

این مسیرها در برنامه Next.js میزبانی می‌شوند و با `NEXT_PUBLIC_API_BASE_URL` فراخوانی نمی‌شوند:

| روش | مسیر                  | توضیح                                   |
| --- | --------------------- | --------------------------------------- |
| GET | `/api/blog/cambridge` | route داخلی برای دریافت مطالب Cambridge |
| GET | `/api/youtube-videos` | route داخلی ویدیوهای YouTube            |

## ۱۵. مواردی که باید قبل از پیاده‌سازی بک‌اند یکسان‌سازی شوند

1. **پروفایل معلم:** اسناد قدیمی در `BACKEND_TEACHER_API_SUMMARY.md` مسیرهای `/api/teacher/profile`, `/complete` و `PATCH` را پیشنهاد می‌کنند؛ کلاینت فعلی از `GET/PUT /api/teachers/me` و آپلودهای `/api/teacher/profile/avatar|video` استفاده می‌کند. قرارداد نهایی را یکی کنید.
2. **APIهای تازه‌تر:** جست‌وجوی دوره، داشبورد دانش‌آموز/معلم، کلاس‌های آنلاین، اعلان‌ها، تنظیمات، تمرین و خبرنامه در مشخصات اولیه نبوده‌اند؛ فهرست بالا براساس کلاینت‌های فرانت‌اند نیز تکمیل شده است.
3. **مسیرهای اختیاری:** ابزارهای مدیریتی پیام/تکلیف در مشخصات ادمین به‌عنوان Phase 2 آمده‌اند و برای نسخه اولیه ضروری نیستند.
4. **آزمون leaderboard و 2FA:** endpointها در مشخصات اعلام شده‌اند؛ مطمئن شوید این قابلیت‌ها واقعاً در UI فعال‌اند و اگر نیستند آن‌ها را به backlog انتقال دهید.
5. **مدیریت مجوز فایل:** فایل تکلیف/کلاس/پیام باید در storage خصوصی بماند؛ لینک عمومی دائمی ندهید و مجوزهای یک‌بارمصرف/کوتاه‌عمر را سمت سرور بررسی کنید.
6. این فهرست «نیاز/قرارداد مورد انتظار فرانت‌اند» است؛ وجود route در این سند به معنی پیاده‌سازی‌شدن آن در بک‌اند نیست.

### مسیرهای قدیمی یا قراردادهای جایگزین در اسناد

این مسیرها در اسناد قدیمی‌تر دیده می‌شوند، اما کلاینت فعال فرانت‌اند مسیرهای دیگری را مصرف می‌کند؛ آن‌ها را هم‌زمان پیاده‌سازی نکنید مگر این‌که تصمیم معماری مشخصی بگیرید:

| روش   | مسیر قدیمی/جایگزین               | نکته                                                                                                         |
| ----- | -------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| GET   | `/api/teacher/me`                | در مشخصات ادمین قدیمی؛ کلاینت فعلی به‌جای آن از `/api/teachers/me` استفاده می‌کند                            |
| GET   | `/api/teacher/students`          | مسیر مرجع قدیمی؛ کلاینت فعلی از `/api/teacher/dashboard/students` استفاده می‌کند                             |
| GET   | `/api/teacher/classes`           | مسیر مرجع قدیمی؛ کلاینت فعلی از `/api/teacher/dashboard/classes` استفاده می‌کند                              |
| GET   | `/api/teacher/schedule`          | مسیر مرجع قدیمی؛ کلاینت فعلی از `/api/teacher/dashboard/schedule` استفاده می‌کند                             |
| GET   | `/api/teacher/profile`           | در راهنمای قدیمی معلم؛ کلاینت فعلی `GET /api/teachers/me` دارد                                               |
| POST  | `/api/teacher/profile/complete`  | در راهنمای قدیمی؛ کلاینت فعلی `PUT /api/teachers/me` دارد                                                    |
| PATCH | `/api/teacher/profile`           | در راهنمای قدیمی؛ کلاینت فعلی `PUT /api/teachers/me` دارد                                                    |
| GET   | `/api/messages/conversations`    | قرارداد نمونه قدیمی پیام‌رسانی؛ کلاینت فعال از `/api/conversations` استفاده می‌کند                           |
| GET   | `/api/messages/{conversationId}` | قرارداد نمونه قدیمی پیام‌رسانی؛ کلاینت فعال از `/api/conversations/{conversationId}/messages` استفاده می‌کند |
| POST  | `/api/messages/{conversationId}` | قرارداد نمونه قدیمی پیام‌رسانی؛ کلاینت فعال از `/api/conversations/{conversationId}/messages` استفاده می‌کند |
| PUT   | `/api/messages/{id}/read`        | قرارداد نمونه قدیمی؛ کلاینت فعال از `PATCH /api/messages/{messageId}/read` استفاده می‌کند                    |
| POST  | `/api/admin/login`               | نمونه قدیمی؛ پیشنهاد فعلی استفاده از `/api/auth/login` برای کاربر Admin است                                  |
| GET   | `/api/admin/session`             | نمونه قدیمی احراز هویت پنل؛ در کلاینت فعلی استفاده نشده                                                      |
| POST  | `/api/admin/logout`              | نمونه قدیمی؛ کلاینت فعلی از `/api/auth/logout` استفاده می‌کند                                                |

### پرداخت؛ قرارداد API هنوز تعریف نشده

پرداخت در برنامه فعلی mock است و مستندات صرفاً نیاز به اتصال درگاه، ساخت payment intent، webhook و صدور فاکتور را ذکر می‌کنند؛ مسیرهای بک‌اند، روش‌ها و payload نهایی مشخص نشده‌اند. پیش از اتصال واقعی checkout، این قرارداد را جداگانه تعریف کنید. ثبت‌نام دوره فعلاً فقط ممکن است `paymentUrl` برگرداند؛ آن را به‌عنوان API کامل پرداخت تلقی نکنید.

## منابع داخل مخزن

- `API_SPECIFICATION.md`
- `NEW_API_SPECIFICATION.md`
- `ADMIN_API_SPECIFICATION.md`
- `BACKEND_TEACHER_API_SUMMARY.md`
- کلاینت‌های TypeScript در `lib/api/`
