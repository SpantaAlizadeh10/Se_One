# فهرست APIهای مورد استفاده SE One

این سند فهرست endpointهایی است که فرانت‌اند فعلی از API clientها فراخوانی می‌کند تا بک‌اند بتواند آن‌ها را پیاده‌سازی یا تطبیق دهد. مسیرها از `lib/api/*.ts` استخراج شده‌اند؛ این فهرست جایگزین قرارداد جزئی درخواست/پاسخ در مستندات تخصصی نیست.

## تنظیمات و قرارداد عمومی

- آدرس پایه بک‌اند از متغیر `NEXT_PUBLIC_API_BASE_URL` خوانده می‌شود؛ مسیرهای جدول‌ها نسبت به آن هستند.
- فرانت‌اند درخواست‌ها را با `credentials: include` ارسال می‌کند. اگر توکن در مرورگر ذخیره شده باشد، هدر `Authorization: Bearer ...` نیز ارسال می‌شود.
- بدنه درخواست‌ها به‌طور پیش‌فرض JSON است. برای `FormData`، هدر `Content-Type` را خودکار تنظیم نمی‌کنیم تا مرورگر boundary را اضافه کند.
- پاسخ خطا ترجیحاً `ProblemDetails` یا JSON دارای `message`، `title` یا `detail` باشد.
- `{id}` و `{...Id}` مقدار مسیر هستند؛ `?` در ستون مسیر یعنی query string اختیاری است.
- endpointهای `/api/admin/*` فقط برای کاربر Admin مجاز باشند. endpointهای student/teacher باید هویت کاربر را از نشست یا توکن احراز هویت بگیرند، نه از شناسه‌ای که کاربر بتواند جعل کند.
- برای لیست‌های صفحه‌بندی‌شده، فرانت‌اند عموماً `page`, `pageSize`, `search`, `status` و فیلترهای مختص همان بخش را می‌فرستد.

## 1. احراز هویت

| Method | Path | استفاده |
|---|---|---|
| POST | `/api/auth/login` | ورود با ایمیل و گذرواژه |
| POST | `/api/auth/register` | ثبت‌نام؛ در فرم دانش‌آموز ممکن است `dateOfBirth` و `parentalConsent` نیز ارسال شود |
| GET | `/api/auth/me` | دریافت کاربر جاری |
| POST | `/api/auth/logout` | خروج |
| POST | `/api/auth/otp/request` | درخواست کد یک‌بارمصرف با تلفن |
| POST | `/api/auth/otp/verify` | تأیید کد یک‌بارمصرف |
| POST | `/api/auth/forgot-password` | درخواست بازیابی گذرواژه |

## 2. دوره‌ها، جستجو، کلاس‌های قابل رزرو و ثبت‌نام

### کاتالوگ و جستجوی دوره

| Method | Path | استفاده |
|---|---|---|
| GET | `/api/courses?lang={lang}` | دوره‌های عمومی، با فیلتر زبان |
| GET | `/api/courses/search?{filters}` | جستجوی دوره‌ها |
| GET | `/api/courses/suggestions?{filters}` | پیشنهادهای جستجو |
| GET | `/api/courses/filters?{filters}` | مقادیر قابل استفاده در فیلترها |
| GET | `/api/courses/featured?{filters}` | دوره‌های ویژه |
| GET | `/api/courses/trending?{filters}` | دوره‌های پرطرفدار |
| GET | `/api/courses/similar/{courseId}?{filters}` | دوره‌های مشابه |
| GET | `/api/teachers` | فهرست مدرس‌های عمومی |
| GET | `/api/blog?lang={lang}` | فهرست نوشته‌های وبلاگ |
| GET | `/api/blog/{idOrSlug}?lang={lang}` | جزئیات نوشته وبلاگ |

### کلاس‌ها و گروه‌های دوره

| Method | Path | استفاده |
|---|---|---|
| GET | `/api/classes?{filters}` | جستجو و صفحه‌بندی کلاس‌ها؛ فیلترهای استفاده‌شده شامل `teacherId`, `type`, `availableOnly`, `level`, `subject`, `page`, `pageSize` هستند |
| POST | `/api/classes/{classId}/enroll` | ثبت‌نام کاربر در کلاس |
| POST | `/api/classes/{classId}/invite` | ساخت کد دعوت برای کلاس خصوصی |
| GET | `/api/classes/{classId}/check-conflict` | بررسی تداخل زمانی کلاس |
| GET | `/api/enrollments` | ثبت‌نام‌های کاربر جاری |
| GET | `/api/student/class-slots?{filters}` | گزینه‌های رزرو دانش‌آموز؛ هر گروهِ مدرس/زمان باید جداگانه برگردد |
| POST | `/api/student/class-slots/{assignmentId}/enroll` | رزرو گروه مشخص‌شده توسط assignment |
| GET | `/api/enrollment/user` | ثبت‌نام‌های دوره‌ای کاربر جاری |
| POST | `/api/enrollment/{courseId}` | ثبت‌نام در دوره |
| GET | `/api/enrollment/{enrollmentId}` | جزئیات ثبت‌نام |
| DELETE | `/api/enrollment/{enrollmentId}` | لغو ثبت‌نام |
| GET | `/api/enrollment/{enrollmentId}/progress` | پیشرفت ثبت‌نام |

**نکته گروه‌های چندمدرسی:** گزینه‌های student باید به‌ازای هر گروه تأییدشده‌ی مدرس/کلاس به‌صورت آیتم مستقل برگردند و حداقل `assignmentId`, `courseId`, زمان، ظرفیت، تعداد ثبت‌نام، `basePrice`, `finalPrice`, ارز، شناسه و نام مدرس و `teacherAvatarUrl` را شامل شوند. قیمت و ظرفیت ممکن است برای گروه‌های یک دوره متفاوت باشد. انتساب مدرس باید با availability و تداخل برنامه بررسی شود.

## 3. برنامه درسی، درس و یادگیری

| Method | Path | استفاده |
|---|---|---|
| GET | `/api/courses/{courseId}/modules` | ماژول‌های دوره |
| GET | `/api/modules/{moduleId}` | جزئیات ماژول |
| GET | `/api/modules/{moduleId}/lessons` | درس‌های ماژول |
| POST | `/api/lessons/{lessonId}/complete` | تکمیل درس |
| GET | `/api/lessons/{lessonId}` | جزئیات درس |
| GET | `/api/lessons/{lessonId}/progress` | وضعیت پیشرفت درس |
| PATCH | `/api/lessons/{lessonId}/progress` | به‌روزرسانی پیشرفت درس |
| GET | `/api/progress/user` | پیشرفت کلی کاربر |
| GET | `/api/progress/course/{courseId}` | پیشرفت دوره |
| GET | `/api/progress/achievements` | دستاوردها |
| POST | `/api/progress/achievements/{achievementId}/claim` | دریافت/claim دستاورد |
| GET | `/api/learning/current` | جلسه یادگیری جاری |
| POST | `/api/learning/start/{courseId}` | شروع یادگیری دوره |
| POST | `/api/learning/continue/{lessonId}` | ادامه یادگیری از درس |
| POST | `/api/learning/session/{sessionId}/end` | پایان جلسه یادگیری |
| GET | `/api/learning/recommendations` | پیشنهادهای یادگیری |

## 4. تمرین هوش مصنوعی و تمرین‌ها

| Method | Path | استفاده |
|---|---|---|
| GET | `/api/practice?{filters}` | فهرست تمرین‌ها |
| GET | `/api/practice/{practiceId}` | جزئیات تمرین |
| POST | `/api/practice` | ساخت تمرین (مسیر موجود در client) |
| PATCH | `/api/practice/{practiceId}` | ویرایش تمرین |
| DELETE | `/api/practice/{practiceId}` | حذف تمرین |
| POST | `/api/practice/attempts` | شروع تلاش برای انجام تمرین |
| POST | `/api/practice/attempts/{attemptId}/submit` | ارسال پاسخ تمرین |
| GET | `/api/practice/attempts?{filters}` | فهرست تلاش‌ها |
| GET | `/api/practice/attempts/{attemptId}` | جزئیات تلاش |
| GET | `/api/practice/history` | تاریخچه تمرین |
| GET | `/api/practice/streak` | اطلاعات زنجیره تمرین |
| GET | `/api/practice/leaderboard/{practiceId}` | رتبه‌بندی تمرین |

## 5. تکالیف و فایل‌های دانش‌آموز

| Method | Path | استفاده |
|---|---|---|
| GET | `/api/teacher/assignments` | تکالیف ساخته‌شده توسط مدرس جاری |
| POST | `/api/teacher/assignments` | ساخت تکلیف |
| GET | `/api/teacher/assignments/{assignmentId}` | جزئیات تکلیف برای مدرس |
| PATCH | `/api/teacher/assignments/{assignmentId}` | ویرایش تکلیف |
| DELETE | `/api/teacher/assignments/{assignmentId}` | حذف تکلیف |
| GET | `/api/teacher/assignments/{assignmentId}/submissions` | پاسخ‌های ارسال‌شده برای تکلیف |
| PATCH | `/api/teacher/submissions/{submissionId}/grade` | نمره‌دهی به پاسخ |
| GET | `/api/student/assignments` | تکالیف دانش‌آموز جاری |
| GET | `/api/student/assignments/{assignmentId}` | تکلیف و پاسخ دانش‌آموز |
| POST | `/api/student/assignments/{assignmentId}/submissions` | ارسال پاسخ تکلیف |
| POST | `/api/student/assignments/{assignmentId}/submissions/upload-grant` | درخواست مجوز کوتاه‌مدت آپلود فایل |
| GET | `/api/student/attachments/download-url?path={path}` | دریافت لینک دانلود مجاز و کوتاه‌مدت |
| PUT | `/api/student/assignments/{assignmentId}/submissions/draft` | ذخیره پیش‌نویس پاسخ |
| POST | `/api/student/submissions/{submissionId}/submit` | ارسال/ارسال مجدد پاسخ ذخیره‌شده |
| POST | `/api/student/assignments/{assignmentId}/complete` | تکمیل تمرین |
| GET | `/api/student/submissions` | تاریخچه پاسخ‌های دانش‌آموز |
| GET | `/api/student/submissions/{submissionId}` | جزئیات پاسخ |
| PATCH | `/api/student/submissions/{submissionId}` | ویرایش پاسخ پیش‌نویس |

**آپلود فایل تکلیف:** بک‌اند مجوز و مسیر آپلود امضاشده را صادر می‌کند؛ فایل مستقیماً از مرورگر به Supabase Storage آپلود می‌شود. دانلود باید با endpoint بالا مجازسازی شده و لینک کوتاه‌مدت باشد.

## 6. داشبورد دانش‌آموز

| Method | Path | استفاده |
|---|---|---|
| GET | `/api/student/dashboard/upcoming-classes?{filters}` | کلاس‌های پیش‌رو |
| GET | `/api/student/dashboard/calendar?{filters}` | رویدادهای تقویم |
| GET | `/api/student/dashboard/recent-activity?{filters}` | فعالیت‌های اخیر |
| GET | `/api/student/dashboard/statistics` | آمار یادگیری |
| GET | `/api/student/dashboard/overview` | نمای کلی داشبورد |

## 7. داشبورد مدرس و پروفایل مدرس

| Method | Path | استفاده |
|---|---|---|
| GET | `/api/teacher/dashboard/progression?lang={fa\|en}` | سطح پیشرفت، معیارهای تأییدشده و سهم درآمد مدرس |
| GET | `/api/teacher/dashboard/classes?{filters}` | کلاس‌های مدرس |
| GET | `/api/teacher/dashboard/schedule?{filters}` | برنامه مدرس |
| GET | `/api/teacher/dashboard/students?{filters}` | دانش‌آموزان مرتبط با مدرس جاری؛ فیلترهای اختیاری `courseId`, `activeOnly` |
| GET | `/api/teacher/dashboard/earnings?period={period}` | درآمد مدرس |
| POST | `/api/teacher/dashboard/withdrawals` | درخواست برداشت؛ body شامل `amount`, `iban` |
| GET | `/api/teacher/dashboard/analytics` | تحلیل‌های مدرس |
| GET | `/api/teacher/dashboard/overview` | داده تجمیعی داشبورد مدرس |
| GET | `/api/teacher/availability` | زمان‌های در دسترس مدرس جاری |
| PUT | `/api/teacher/availability` | ذخیره زمان‌های در دسترس |
| GET | `/api/teacher/class-slots` | کلاس‌های منتسب به مدرس جاری |
| GET | `/api/teachers/me` | پروفایل مدرس جاری |
| PUT | `/api/teachers/me` | تکمیل یا ویرایش پروفایل مدرس |
| POST | `/api/teacher/profile/avatar` | آپلود تصویر پروفایل مدرس |
| POST | `/api/teacher/profile/video` | آپلود ویدیوی معرفی مدرس |

## 8. مدیریت گروه کلاس و انتساب مدرس (Admin)

| Method | Path | استفاده |
|---|---|---|
| GET | `/api/admin/class-slots` | فهرست گروه‌ها/زمان‌بندی‌های کلاس |
| POST | `/api/admin/class-slots` | ساخت گروه کلاس |
| PATCH | `/api/admin/class-slots/{slotId}` | ویرایش گروه، زمان، ظرفیت یا قیمت |
| GET | `/api/admin/class-slots/{slotId}/enrollments` | فهرست ثبت‌نام‌های گروه |
| POST | `/api/admin/class-slots/{slotId}/enrollments` | افزودن دانش‌آموز به گروه |
| POST | `/api/admin/class-enrollments/{enrollmentId}/move` | انتقال دانش‌آموز بین گروه‌ها |
| GET | `/api/admin/class-slots/{slotId}/available-teachers` | مدرس‌های در دسترس برای گروه |
| PUT | `/api/admin/class-slots/{slotId}/teacher` | تعیین/جایگزینی مدرس گروه |
| POST | `/api/admin/class-slot-assignments` | ایجاد انتساب مدرس به گروه |
| PATCH | `/api/admin/class-slot-assignments/{assignmentId}` | ویرایش وضعیت انتساب مدرس |

## 9. مدیریت Admin: داشبورد، دانش‌آموز، مدرس و پرداخت

| Method | Path | استفاده |
|---|---|---|
| GET | `/api/admin/dashboard/stats` | آمار صفحه اصلی Admin |
| GET | `/api/admin/students?{filters}` | جستجو و صفحه‌بندی دانش‌آموزها |
| GET | `/api/admin/students/{studentId}` | جزئیات دانش‌آموز |
| POST | `/api/admin/students` | ساخت دانش‌آموز |
| PATCH | `/api/admin/students/{studentId}` | ویرایش دانش‌آموز |
| PATCH | `/api/admin/students/{studentId}/status` | تغییر وضعیت حساب |
| DELETE | `/api/admin/students/{studentId}` | حذف دانش‌آموز |
| GET | `/api/admin/students/{studentId}/enrollments` | ثبت‌نام‌های دانش‌آموز |
| GET | `/api/admin/courses/{courseId}/enrollments` | ثبت‌نام‌های دوره |
| GET | `/api/admin/students/{studentId}/progress` | پیشرفت دانش‌آموز |
| POST | `/api/admin/students/{studentId}/enrollments` | افزودن دانش‌آموز به دوره |
| DELETE | `/api/admin/students/{studentId}/enrollments/{enrollmentId}` | حذف ثبت‌نام دانش‌آموز از دوره |
| GET | `/api/admin/teachers?{filters}` | فهرست مدرس‌ها |
| GET | `/api/admin/teachers/{teacherId}` | جزئیات مدرس |
| POST | `/api/admin/teachers` | ساخت مدرس |
| PATCH | `/api/admin/teachers/{teacherId}` | ویرایش مدرس |
| PATCH | `/api/admin/teachers/{teacherId}/status` | تغییر وضعیت مدرس |
| DELETE | `/api/admin/teachers/{teacherId}` | حذف مدرس |
| GET | `/api/admin/teachers/{teacherId}/students` | دانش‌آموزان مرتبط با مدرس |
| GET | `/api/admin/teachers/{teacherId}/availability` | زمان‌های در دسترس مدرس |
| PUT | `/api/admin/teachers/{teacherId}/availability` | ویرایش زمان‌های در دسترس مدرس |
| GET | `/api/admin/withdrawals?{filters}` | صف درخواست‌های برداشت |
| PATCH | `/api/admin/withdrawals/{withdrawalId}/status` | تأیید یا رد درخواست برداشت |

## 10. مدیریت دوره و محتوای سایت (Admin)

| Method | Path | استفاده |
|---|---|---|
| GET | `/api/admin/courses` | فهرست دوره‌ها و فیلدهای مدیریت |
| POST | `/api/admin/courses` | ساخت دوره |
| PATCH | `/api/admin/courses/{courseId}` | ویرایش اطلاعات دوره |
| PATCH | `/api/admin/courses/{courseId}/pricing` | ویرایش قیمت/تخفیف |
| POST | `/api/admin/courses/upload-image` | آپلود تصویر دوره |
| GET | `/api/admin/courses/{courseId}/modules` | ماژول‌های دوره در پنل |
| POST | `/api/admin/courses/{courseId}/modules` | افزودن ماژول به دوره |
| PATCH | `/api/admin/modules/{moduleId}` | ویرایش ماژول |
| DELETE | `/api/admin/modules/{moduleId}` | حذف ماژول |
| GET | `/api/admin/modules/{moduleId}/lessons` | درس‌های ماژول در پنل |
| POST | `/api/admin/modules/{moduleId}/lessons` | افزودن درس |
| PATCH | `/api/admin/lessons/{lessonId}` | ویرایش درس |
| DELETE | `/api/admin/lessons/{lessonId}` | حذف درس |
| GET | `/api/admin/blog/posts?{filters}` | فهرست نوشته‌های وبلاگ برای Admin |
| POST | `/api/admin/blog/posts` | ساخت نوشته وبلاگ |
| PATCH | `/api/admin/blog/posts/{postId}` | ویرایش نوشته وبلاگ |
| PATCH | `/api/admin/blog/posts/{postId}/status` | انتشار/عدم انتشار نوشته |
| DELETE | `/api/admin/blog/posts/{postId}` | حذف نوشته |
| GET | `/api/admin/settings` | تنظیمات سایت |
| PATCH | `/api/admin/settings` | ذخیره تنظیمات سایت |

## 11. اعلان‌ها و پیام‌ها

### اعلان‌ها و اطلاعیه‌ها

| Method | Path | استفاده |
|---|---|---|
| GET | `/api/notifications?{filters}` | فهرست اعلان‌های کاربر |
| GET | `/api/notifications/stats` | شمارنده/آمار اعلان |
| GET | `/api/notifications/{notificationId}` | جزئیات اعلان |
| PATCH | `/api/notifications/{notificationId}/read` | خوانده‌شدن اعلان |
| PATCH | `/api/notifications/read-all` | خوانده‌شدن همه اعلان‌ها |
| DELETE | `/api/notifications/{notificationId}` | حذف اعلان |
| DELETE | `/api/notifications/clear?{filters}` | پاک‌سازی اعلان‌ها |
| POST | `/api/notifications/{notificationId}/action` | اجرای عمل مرتبط با اعلان |
| POST | `/api/notifications/test` | ارسال اعلان آزمایشی |
| GET | `/api/announcements?limit={limit}` | فهرست اطلاعیه‌ها |
| POST | `/api/announcements/{id}/read` | ثبت مشاهده اطلاعیه |
| POST | `/api/announcements/{id}/dismiss` | بستن اطلاعیه |
| GET | `/api/admin/announcements?{filters}` | فهرست اطلاعیه‌ها برای Admin |
| POST | `/api/admin/announcements` | ساخت اطلاعیه |
| PATCH | `/api/admin/announcements/{id}` | ویرایش اطلاعیه |
| DELETE | `/api/admin/announcements/{id}` | حذف اطلاعیه |

### گفت‌وگوها

| Method | Path | استفاده |
|---|---|---|
| GET | `/api/conversations` | گفت‌وگوهای کاربر |
| GET | `/api/conversations/contacts` | مخاطبان مجاز برای پیام |
| GET | `/api/conversations/search?query={query}` | جستجوی گفت‌وگو |
| POST | `/api/conversations` | ساخت گفت‌وگو |
| GET | `/api/conversations/{conversationId}` | جزئیات گفت‌وگو |
| GET | `/api/conversations/{conversationId}/messages` | پیام‌های گفت‌وگو |
| POST | `/api/conversations/{conversationId}/messages` | ارسال پیام |
| POST | `/api/conversations/{conversationId}/messages/{messageId}/upload` | آپلود پیوست پیام |
| PATCH | `/api/conversations/{conversationId}/read` | خوانده‌شدن گفت‌وگو |
| PATCH | `/api/messages/{messageId}/read` | خوانده‌شدن پیام |
| GET | `/api/conversations/{conversationId}/typing` | وضعیت تایپ |
| POST | `/api/conversations/{conversationId}/typing` | اعلام وضعیت تایپ |
| GET | `/api/class-groups/{groupId}` | جزئیات گروه گفت‌وگوی کلاسی |
| GET | `/api/class-groups/{groupId}/messages?limit=200` | پیام‌های گروه کلاسی |
| POST | `/api/class-groups/{groupId}/messages` | ارسال پیام در گروه کلاسی |
| GET | `/api/teacher-group-chat/messages?limit=200` | تاریخچه چت گروهی مدرس |
| POST | `/api/teacher-group-chat/messages` | ارسال پیام در چت گروهی مدرس |

## 12. کلاس آنلاین

| Method | Path | استفاده |
|---|---|---|
| GET | `/api/classrooms/sessions` | فهرست جلسه‌های کلاس آنلاین |
| POST | `/api/classrooms/sessions` | ساخت جلسه |
| PATCH | `/api/classrooms/sessions/{sessionId}` | ویرایش جلسه |
| POST | `/api/classrooms/sessions/{sessionId}/join` | ورود به جلسه |
| POST | `/api/classrooms/sessions/{sessionId}/files/upload-grant` | دریافت مجوز آپلود فایل جلسه |
| POST | `/api/classrooms/sessions/{sessionId}/files` | ثبت/اتصال فایل جلسه |

آپلود فایل جلسه نیز از مجوز کوتاه‌مدت Supabase استفاده می‌کند و فایل مستقیماً از مرورگر به Storage می‌رود.

## 13. پشتیبانی و تماس

| Method | Path | استفاده |
|---|---|---|
| POST | `/api/contact` | ارسال فرم تماس عمومی |
| GET | `/api/support/tickets?{filters}` | فهرست تیکت‌ها |
| POST | `/api/support/tickets` | ایجاد تیکت |
| GET | `/api/support/tickets/{ticketId}` | جزئیات تیکت |
| PATCH | `/api/support/tickets/{ticketId}` | ویرایش تیکت |
| POST | `/api/support/tickets/{ticketId}/close` | بستن تیکت |
| POST | `/api/support/tickets/{ticketId}/reopen` | بازگشایی تیکت |
| GET | `/api/support/tickets/{ticketId}/messages` | پیام‌های تیکت |
| POST | `/api/support/tickets/{ticketId}/messages` | ارسال پیام تیکت |
| POST | `/api/support/tickets/{ticketId}/messages/{messageId}/upload` | آپلود پیوست پیام تیکت |
| GET | `/api/support/faq?{filters}` | پرسش‌های پرتکرار |

## 14. پروفایل و تنظیمات کاربر

| Method | Path | استفاده |
|---|---|---|
| GET | `/api/user/profile` | پروفایل کاربر جاری |
| PATCH | `/api/user/profile` | ویرایش پروفایل |
| POST | `/api/user/profile/avatar` | آپلود تصویر پروفایل |
| DELETE | `/api/user/profile/avatar` | حذف تصویر پروفایل |
| POST | `/api/user/password/change` | تغییر گذرواژه |
| GET | `/api/user/2fa/status` | وضعیت احراز هویت دومرحله‌ای |
| POST | `/api/user/2fa/enable` | آغاز فعال‌سازی 2FA |
| POST | `/api/user/2fa/verify` | تأیید راه‌اندازی 2FA |
| POST | `/api/user/2fa/disable` | غیرفعال‌سازی 2FA |
| POST | `/api/user/2fa/backup/regenerate` | تولید مجدد کدهای پشتیبان |
| GET | `/api/user/notifications/preferences` | ترجیحات اعلان کاربر |
| PATCH | `/api/user/notifications/preferences` | ویرایش ترجیحات اعلان |
| POST | `/api/user/account/delete` | درخواست حذف حساب |
| DELETE | `/api/user/account/delete/{token}` | تأیید حذف حساب با توکن |
| POST | `/api/user/account/delete/cancel` | لغو درخواست حذف حساب |

## 15. پرداخت

| Method | Path | استفاده |
|---|---|---|
| GET | `/api/payment/settings` | تنظیمات پرداخت قابل نمایش |
| POST | `/api/payments` | ایجاد درخواست پرداخت |
| POST | `/api/payments/{paymentId}/receipt` | آپلود رسید پرداخت |

## 16. نقد و بررسی و علاقه‌مندی‌ها

| Method | Path | استفاده |
|---|---|---|
| GET | `/api/reviews/course/{courseId}` | دیدگاه‌های دوره |
| GET | `/api/reviews/course/{courseId}/summary` | خلاصه امتیاز دوره |
| POST | `/api/reviews` | ثبت دیدگاه |
| GET | `/api/reviews/user` | دیدگاه‌های کاربر جاری |
| GET | `/api/reviews/{reviewId}` | جزئیات دیدگاه |
| PATCH | `/api/reviews/{reviewId}` | ویرایش دیدگاه |
| DELETE | `/api/reviews/{reviewId}` | حذف دیدگاه |
| POST | `/api/reviews/{reviewId}/helpful` | مفید علامت‌زدن دیدگاه |
| DELETE | `/api/reviews/{reviewId}/helpful` | برداشتن علامت مفید |
| GET | `/api/wishlist` | علاقه‌مندی‌های کاربر |
| POST | `/api/wishlist` | افزودن دوره به علاقه‌مندی‌ها |
| DELETE | `/api/wishlist/{courseId}` | حذف دوره از علاقه‌مندی‌ها |
| GET | `/api/wishlist/check/{courseId}` | بررسی علاقه‌مندی دوره |

## 17. خبرنامه

| Method | Path | استفاده |
|---|---|---|
| POST | `/api/newsletter/subscribe` | اشتراک در خبرنامه |
| POST | `/api/newsletter/unsubscribe` | لغو اشتراک |
| GET | `/api/newsletter/preferences/{token}` | دریافت ترجیحات مشترک با توکن |
| PATCH | `/api/newsletter/preferences/{token}` | ویرایش ترجیحات مشترک |
| POST | `/api/blog/newsletter/subscribe` | ثبت‌نام خبرنامه از بخش وبلاگ |
| GET | `/api/newsletter/subscribers?{filters}` | فهرست مشترک‌ها برای Admin |
| GET | `/api/newsletter/subscribers/{subscriberId}` | جزئیات مشترک |
| PATCH | `/api/newsletter/subscribers/{subscriberId}` | ویرایش مشترک |
| DELETE | `/api/newsletter/subscribers/{subscriberId}` | حذف مشترک |
| POST | `/api/newsletter/subscribers/import` | واردکردن مشترک‌ها |
| GET | `/api/newsletter/campaigns?{filters}` | فهرست کمپین‌ها |
| POST | `/api/newsletter/campaigns` | ساخت کمپین |
| GET | `/api/newsletter/campaigns/{campaignId}` | جزئیات کمپین |
| PATCH | `/api/newsletter/campaigns/{campaignId}` | ویرایش کمپین |
| POST | `/api/newsletter/campaigns/{campaignId}/send` | ارسال کمپین |
| DELETE | `/api/newsletter/campaigns/{campaignId}` | حذف کمپین |
| GET | `/api/newsletter/stats` | آمار خبرنامه |

## 18. APIهای داخلی خود سایت (Next.js)

این دو مسیر در خود سایت پیاده‌سازی شده‌اند و endpoint بک‌اند .NET نیستند:

| Method | Path | استفاده |
|---|---|---|
| GET | `/api/blog/cambridge` | پروکسی/تبدیل RSS وبلاگ Cambridge به JSON |
| GET | `/api/youtube-videos` | دریافت و تبدیل feed ویدیوهای کانال YouTube |

## مسیرهای قراردادشده که هنوز client فعال ندارند

- `GET /api/admin/teacher-tiers` و `PUT /api/admin/teacher-tiers` در `NEW_API_SPECIFICATION.md` به‌عنوان قابلیت تنظیم سطح و سهم مدرس مستند شده‌اند، اما در حال حاضر از فرانت‌اند فراخوانی نمی‌شوند.
- هر endpoint دیگری که فقط در مستندات قدیمی آمده و در جدول‌های بالا نیست، از کد فعلی به‌عنوان مسیر فعال تأیید نشده است. پیش از پیاده‌سازی، قراردادهای payload آن را با فرانت‌اند هماهنگ کنید.

## مستندات قرارداد جزئی

- [API_SPECIFICATION.md](./API_SPECIFICATION.md) — احراز هویت، دوره، ثبت‌نام، یادگیری و پیشرفت
- [NEW_API_SPECIFICATION.md](./NEW_API_SPECIFICATION.md) — wishlist، دیدگاه، پیام، تکلیف، تمرین، تنظیمات، پشتیبانی و داشبوردها
- [ADMIN_API_SPECIFICATION.md](./ADMIN_API_SPECIFICATION.md) — پنل Admin، مدیریت دوره و گروه‌های چندمدرسی

## منابع پیاده‌سازی فرانت‌اند

- `lib/api/client.ts` — تنظیم Base URL، احراز هویت و قرارداد عمومی درخواست
- `lib/api/*.ts` — API clientهای هر بخش
- `app/api/**/route.ts` — APIهای داخلی Next.js
