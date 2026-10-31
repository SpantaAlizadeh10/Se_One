# Backend Payment System - پرداخت با شماره کارت و ارسال فیش به واتساپ

## نیازمندی‌ها

### جریان پرداخت
1. دانش‌آموز کلاس را انتخاب می‌کند
2. سیستم شماره کارت را نمایش می‌دهد
3. دانش‌آموز مبلغ را به شماره کارت واریز می‌کند
4. دانش‌آموز فیش پرداخت را آپلود می‌کند
5. فیش به واتساپ ارسال می‌شود
6. پس از تایید، ثبت‌نام نهایی می‌شود

---

## مدل‌های داده (Data Models)

### 1. Payment (پرداخت)

```csharp
public class Payment
{
    public string Id { get; set; }
    public string EnrollmentId { get; set; }           // ثبت‌نام مربوطه
    public string StudentId { get; set; }              // دانش‌آموز
    public decimal Amount { get; set; }                // مبلغ پرداختی
    public string Currency { get; set; }              // واحد پول (IRR)
    public string? ReceiptImageUrl { get; set; }       // URL فیش پرداخت
    public string? WhatsAppMessageId { get; set; }     // ID پیام واتساپ
    public PaymentStatus Status { get; set; }         // وضعیت پرداخت
    public string? RejectionReason { get; set; }      // دلیل رد (در صورت رد)
    public DateTime CreatedAt { get; set; }
    public DateTime? VerifiedAt { get; set; }          // زمان تایید
    public string? VerifiedBy { get; set; }            // کسی که تایید کرده (admin)
}

public enum PaymentStatus
{
    Pending,        // در انتظار تایید
    Verified,       // تایید شده
    Rejected,       // رد شده
    Refunded        // بازگشت وجه
}
```

### 2. PaymentSettings (تنظیمات پرداخت)

```csharp
public class PaymentSettings
{
    public string Id { get; set; }
    public string CardNumber { get; set; }            // شماره کارت (با فرمت)
    public string CardHolderName { get; set; }        // نام دارنده کارت
    public string BankName { get; set; }              // نام بانک
    public string? WhatsAppNumber { get; set; }      // شماره واتساپ برای ارسال فیش
    public bool IsActive { get; set; }                // آیا فعال است
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

---

## Backend Endpoints

### 1. GET /api/payment/settings - دریافت تنظیمات پرداخت

```csharp
[HttpGet("api/payment/settings")]
[Authorize(Roles = "Student,Teacher,Admin")]
public async Task<ActionResult<PaymentSettingsDto>> GetPaymentSettings()
{
    var settings = await _context.PaymentSettings
        .Where(s => s.IsActive)
        .OrderByDescending(s => s.UpdatedAt)
        .FirstOrDefaultAsync();

    if (settings == null)
    {
        return NotFound("Payment settings not configured");
    }

    return Ok(new PaymentSettingsDto
    {
        CardNumber = MaskCardNumber(settings.CardNumber), // فقط 4 رقم آخر
        CardHolderName = settings.CardHolderName,
        BankName = settings.BankName,
        WhatsAppNumber = settings.WhatsappNumber
    });
}

private string MaskCardNumber(string cardNumber)
{
    // ماسک کردن شماره کارت: 6037-****-****-5678
    if (string.IsNullOrEmpty(cardNumber) || cardNumber.Length < 16)
        return cardNumber;

    return $"{cardNumber.Substring(0, 4)}-****-****-{cardNumber.Substring(cardNumber.Length - 4)}";
}
```

### 2. POST /api/payments - ایجاد درخواست پرداخت

```csharp
[HttpPost("api/payments")]
[Authorize(Roles = "Student")]
public async Task<ActionResult<PaymentDto>> CreatePayment(
    [FromBody] CreatePaymentRequest request)
{
    var studentId = GetCurrentStudentId();

    // بررسی آیا ثبت‌نام وجود دارد
    var enrollment = await _context.Enrollments
        .Include(e => e.Class)
        .FirstOrDefaultAsync(e => e.Id == request.EnrollmentId && e.StudentId == studentId);

    if (enrollment == null)
    {
        return NotFound("Enrollment not found");
    }

    // بررسی آیا قبلاً پرداختی برای این ثبت‌نام وجود دارد
    var existingPayment = await _context.Payments
        .FirstOrDefaultAsync(p => p.EnrollmentId == request.EnrollmentId && p.Status != PaymentStatus.Rejected);

    if (existingPayment != null)
    {
        return BadRequest("Payment already exists for this enrollment");
    }

    // ایجاد پرداخت
    var payment = new Payment
    {
        Id = Guid.NewGuid().ToString(),
        EnrollmentId = request.EnrollmentId,
        StudentId = studentId,
        Amount = enrollment.FinalPrice,
        Currency = "IRR",
        Status = PaymentStatus.Pending,
        CreatedAt = DateTime.UtcNow
    };

    _context.Payments.Add(payment);
    await _context.SaveChangesAsync();

    return Ok(new PaymentDto
    {
        Id = payment.Id,
        Amount = payment.Amount,
        Currency = payment.Currency,
        Status = payment.Status,
        CreatedAt = payment.CreatedAt
    });
}

public class CreatePaymentRequest
{
    public string EnrollmentId { get; set; }
}
```

### 3. POST /api/payments/{paymentId}/receipt - آپلود فیش پرداخت

```csharp
[HttpPost("api/payments/{paymentId}/receipt")]
[Authorize(Roles = "Student")]
public async Task<ActionResult<PaymentDto>> UploadReceipt(
    string paymentId,
    IFormFile receipt)
{
    var studentId = GetCurrentStudentId();
    var payment = await _context.Payments
        .Include(p => p.Enrollment)
        .FirstOrDefaultAsync(p => p.Id == paymentId && p.StudentId == studentId);

    if (payment == null)
    {
        return NotFound("Payment not found");
    }

    if (payment.Status != PaymentStatus.Pending)
    {
        return BadRequest("Payment is not in pending status");
    }

    // آپلود فیش به Supabase یا سرویس ذخیره‌سازی
    var receiptUrl = await _storageService.UploadFileAsync(receipt, "payment-receipts");

    payment.ReceiptImageUrl = receiptUrl;
    await _context.SaveChangesAsync();

    // ارسال فیش به واتساپ
    await SendReceiptToWhatsApp(payment);

    return Ok(new PaymentDto
    {
        Id = payment.Id,
        Amount = payment.Amount,
        ReceiptImageUrl = receiptUrl,
        Status = payment.Status,
        CreatedAt = payment.CreatedAt
    });
}

private async Task SendReceiptToWhatsApp(Payment payment)
{
    // دریافت تنظیمات واتساپ
    var settings = await _context.PaymentSettings
        .Where(s => s.IsActive)
        .FirstOrDefaultAsync();

    if (settings?.WhatsAppNumber == null)
    {
        // لاگ کردن خطا، اما پرداخت را نگه دارید
        return;
    }

    // استفاده از WhatsApp Business API برای ارسال فیش
    var message = $"""
        📄 فیش پرداخت جدید

        💰 مبلغ: {payment.Amount} {payment.Currency}
        📅 تاریخ: {payment.CreatedAt:yyyy/MM/dd HH:mm}
        👤 دانش‌آموز: {payment.StudentId}
        📎 فیش: {payment.ReceiptImageUrl}

        لطفاً بررسی و تایید کنید.
        """;

    await _whatsappService.SendImageMessageAsync(
        settings.WhatsappNumber,
        payment.ReceiptImageUrl,
        message
    );
}
```

### 4. PATCH /api/payments/{paymentId}/verify - تایید یا رد پرداخت (Admin)

```csharp
[HttpPatch("api/payments/{paymentId}/verify")]
[Authorize(Roles = "Admin")]
public async Task<ActionResult<PaymentDto>> VerifyPayment(
    string paymentId,
    [FromBody] VerifyPaymentRequest request)
{
    var adminId = GetCurrentUserId();
    var payment = await _context.Payments
        .Include(p => p.Enrollment)
        .FirstOrDefaultAsync(p => p.Id == paymentId);

    if (payment == null)
    {
        return NotFound("Payment not found");
    }

    if (payment.Status != PaymentStatus.Pending)
    {
        return BadRequest("Payment is not in pending status");
    }

    if (request.Approved)
    {
        // تایید پرداخت
        payment.Status = PaymentStatus.Verified;
        payment.VerifiedAt = DateTime.UtcNow;
        payment.VerifiedBy = adminId;

        // تایید ثبت‌نام
        payment.Enrollment.Status = EnrollmentStatus.Confirmed;
    }
    else
    {
        // رد پرداخت
        payment.Status = PaymentStatus.Rejected;
        payment.RejectionReason = request.RejectionReason;

        // لغو ثبت‌نام
        payment.Enrollment.Status = EnrollmentStatus.Cancelled;
    }

    await _context.SaveChangesAsync();

    return Ok(new PaymentDto
    {
        Id = payment.Id,
        Amount = payment.Amount,
        Status = payment.Status,
        RejectionReason = payment.RejectionReason,
        VerifiedAt = payment.VerifiedAt,
        CreatedAt = payment.CreatedAt
    });
}

public class VerifyPaymentRequest
{
    public bool Approved { get; set; }
    public string? RejectionReason { get; set; }
}
```

### 5. GET /api/payments - لیست پرداخت‌های کاربر

```csharp
[HttpGet("api/payments")]
[Authorize(Roles = "Student,Admin")]
public async Task<ActionResult<PagedResult<PaymentDto>>> GetPayments(
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 20)
{
    var userId = GetCurrentUserId();
    var isAdmin = IsAdmin();

    var query = _context.Payments
        .Include(p => p.Enrollment)
        .ThenInclude(e => e.Class)
        .AsQueryable();

    if (!isAdmin)
    {
        query = query.Where(p => p.StudentId == userId);
    }

    var totalCount = await query.CountAsync();
    var payments = await query
        .OrderByDescending(p => p.CreatedAt)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();

    var result = payments.Select(p => new PaymentDto
    {
        Id = p.Id,
        EnrollmentId = p.EnrollmentId,
        Amount = p.Amount,
        Currency = p.Currency,
        ReceiptImageUrl = p.ReceiptImageUrl,
        Status = p.Status,
        RejectionReason = p.RejectionReason,
        CreatedAt = p.CreatedAt,
        VerifiedAt = p.VerifiedAt,
        ClassTitle = p.Enrollment.Class.Title,
        ClassDate = p.Enrollment.Class.ScheduledDate
    }).ToList();

    return Ok(new PagedResult<PaymentDto>
    {
        Items = result,
        TotalCount = totalCount,
        Page = page,
        PageSize = pageSize
    });
}
```

---

## سرویس واتساپ (WhatsApp Service)

```csharp
public interface IWhatsAppService
{
    Task SendTextMessageAsync(string phoneNumber, string message);
    Task SendImageMessageAsync(string phoneNumber, string imageUrl, string caption);
}

public class WhatsAppService : IWhatsAppService
{
    private readonly string _apiUrl;
    private readonly string _apiKey;

    public WhatsAppService(IConfiguration configuration)
    {
        _apiUrl = configuration["WhatsApp:ApiUrl"];
        _apiKey = configuration["WhatsApp:ApiKey"];
    }

    public async Task SendTextMessageAsync(string phoneNumber, string message)
    {
        // استفاده از WhatsApp Business API (مثلاً Twilio, MessageBird, یا Meta API)
        var client = new HttpClient();
        var request = new
        {
            to = phoneNumber,
            type = "text",
            text = new { body = message }
        };

        var response = await client.PostAsJsonAsync(
            $"{_apiUrl}/messages",
            request,
            new { Authorization = $"Bearer {_apiKey}" }
        );

        response.EnsureSuccessStatusCode();
    }

    public async Task SendImageMessageAsync(string phoneNumber, string imageUrl, string caption)
    {
        var client = new HttpClient();
        var request = new
        {
            to = phoneNumber,
            type = "image",
            image = new
            {
                link = imageUrl,
                caption = caption
            }
        };

        var response = await client.PostAsJsonAsync(
            $"{_apiUrl}/messages",
            request,
            new { Authorization = $"Bearer {_apiKey}" }
        );

        response.EnsureSuccessStatusCode();
    }
}
```

---

## تنظیمات (Configuration)

```json
{
  "WhatsApp": {
    "ApiUrl": "https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID",
    "ApiKey": "YOUR_WHATSAPP_ACCESS_TOKEN"
  },
  "Storage": {
    "Provider": "Supabase",
    "BucketName": "payment-receipts"
  }
}
```

---

## نمونه پاسخ

### GET /api/payment/settings

```json
{
  "cardNumber": "6037-****-****-5678",
  "cardHolderName": "علی علیزاده",
  "bankName": "بانک ملت",
  "whatsappNumber": "+989123456789"
}
```

### POST /api/payments

```json
{
  "id": "payment-123",
  "enrollmentId": "enrollment-456",
  "amount": 500000,
  "currency": "IRR",
  "status": "pending",
  "createdAt": "2026-10-31T10:00:00Z"
}
```

### POST /api/payments/{paymentId}/receipt

```json
{
  "id": "payment-123",
  "amount": 500000,
  "receiptImageUrl": "https://storage.example.com/receipts/abc123.jpg",
  "status": "pending",
  "createdAt": "2026-10-31T10:00:00Z"
}
```

---

## Flow کامل

### 1. دانش‌آموز انتخاب کلاس
```
Frontend → POST /api/classes/{classId}/enroll
Backend → ایجاد Enrollment با status = "pending"
```

### 2. دریافت شماره کارت
```
Frontend → GET /api/payment/settings
Backend → شماره کارت ماسک شده را برمی‌گرداند
```

### 3. آپلود فیش
```
Frontend → POST /api/payments/{paymentId}/receipt
Backend → آپلود فیش → ارسال به واتساپ → status = "pending"
```

### 4. تایید توسط Admin
```
Admin → PATCH /api/payments/{paymentId}/verify
Backend → status = "verified" → Enrollment status = "confirmed"
```

---

## نکات مهم

1. **ماسک کردن شماره کارت**: فقط 4 رقم آخر را نمایش دهید
2. **امنیت فیش**: فیش‌ها را در یک bucket امن ذخیره کنید
3. **واتساپ API**: از WhatsApp Business API معتبر استفاده کنید
4. **تایید دو مرحله‌ای**: فقط admin می‌تواند پرداخت را تایید کند
5. **رد پرداخت**: اگر رد شد، ثبت‌نام هم لغو شود
6. **لاگ کردن**: تمام رویدادهای پرداخت را لاگ کنید

---

## APIهای WhatsApp

می‌توانید از یکی از این سرویس‌ها استفاده کنید:

1. **Twilio WhatsApp API**
2. **MessageBird WhatsApp API**
3. **Meta WhatsApp Business API** (رایگان تا 1000 پیام در ماه)
4. **WhatsApp Cloud API** (رسمی متا)

---

## تست کردن

1. یک درخواست پرداخت ایجاد کنید
2. فیش را آپلود کنید
3. بررسی کنید که فیش به واتساپ ارسال شده
4. به عنوان admin وارد شوید و پرداخت را تایید کنید
5. بررسی کنید که ثبت‌نام تایید شده است
