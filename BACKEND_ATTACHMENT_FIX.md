# Backend Attachment Fix - نمایش صحیح فایل‌های ضمیمه در چت

## مشکل
وقتی فایلی در چت ارسال می‌شود، لینک کامل و طولانی فایل نمایش داده می‌شود که تجربه کاربری بدی است. به جای آن باید نام فایل (`displayName`) نمایش داده شود و لینک فقط به عنوان clickable text استفاده شود.

---

## تغییرات مورد نیاز در Backend

### 1. مدل Message را به‌روز کنید

مدل `Message` باید شامل `attachmentDetails` باشد:

```csharp
public class AttachmentDetail
{
    public string DisplayName { get; set; }  // نام فایل که به کاربر نمایش داده می‌شود
    public string DownloadUrl { get; set; }  // لینک دانلود فایل
    public string? FileType { get; set; }     // نوع فایل (اختیاری)
    public long? FileSize { get; set; }       // حجم فایل (اختیاری)
}

public class Message
{
    public string Id { get; set; }
    public string ConversationId { get; set; }
    public string SenderId { get; set; }
    public string SenderName { get; set; }
    public string? SenderAvatar { get; set; }
    public string SenderRole { get; set; }  // "student", "teacher", "admin", "support"
    public string Content { get; set; }
    public List<string>? Attachments { get; set; }  // برای backward compatibility نگه دارید
    public List<AttachmentDetail>? AttachmentDetails { get; set; }  // این را اضافه کنید
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
}
```

---

### 2. endpoint `/api/conversations/{conversationId}/messages` را اصلاح کنید

وقتی لیست پیام‌ها را برمی‌گردانید، باید `attachmentDetails` را نیز محاسبه کنید:

```csharp
[HttpGet("api/conversations/{conversationId}/messages")]
[Authorize]
public async Task<ActionResult<List<Message>>> GetMessages(string conversationId)
{
    var messages = await _context.Messages
        .Where(m => m.ConversationId == conversationId)
        .OrderBy(m => m.CreatedAt)
        .ToListAsync();

    var result = messages.Select(m => new Message
    {
        Id = m.Id,
        ConversationId = m.ConversationId,
        SenderId = m.SenderId,
        SenderName = m.SenderName,
        SenderAvatar = m.SenderAvatar,
        SenderRole = m.SenderRole,
        Content = m.Content,
        Attachments = m.Attachments,  // برای backward compatibility
        AttachmentDetails = m.Attachments?.Select(url => new AttachmentDetail
        {
            DisplayName = ExtractFileName(url),  // نام فایل را از URL استخراج کنید
            DownloadUrl = url,
            FileType = GetFileType(url),
            FileSize = null  // اگر دارید می‌توانید از دیتابیس بگیرید
        }).ToList(),
        CreatedAt = m.CreatedAt,
        IsRead = m.IsRead,
        ReadAt = m.ReadAt
    }).ToList();

    return Ok(result);
}

// helper function برای استخراج نام فایل از URL
private string ExtractFileName(string url)
{
    if (string.IsNullOrEmpty(url)) return "Attachment";

    // URL را پارس کنید و نام فایل را استخراج کنید
    // مثال: https://.../9927aca766ee47328086a6644cdb5a63__addons.png?token=...
    // نتیجه: "addons.png"

    try
    {
        var uri = new Uri(url);
        var path = uri.AbsolutePath;
        var fileName = Path.GetFileName(path);

        // اگر fileName شامل __ است، بخش بعد از __ را بگیرید
        if (fileName.Contains("__"))
        {
            fileName = fileName.Split("__").Last();
        }

        // اگر fileName شامل ? است، بخش قبل از ? را بگیرید
        if (fileName.Contains("?"))
        {
            fileName = fileName.Split("?").First();
        }

        return string.IsNullOrEmpty(fileName) ? "Attachment" : fileName;
    }
    catch
    {
        return "Attachment";
    }
}

private string? GetFileType(string url)
{
    if (string.IsNullOrEmpty(url)) return null;

    try
    {
        var uri = new Uri(url);
        var path = uri.AbsolutePath;
        var extension = Path.GetExtension(path).ToLower();

        return extension switch
        {
            ".pdf" => "pdf",
            ".png" => "image",
            ".jpg" or ".jpeg" => "image",
            ".gif" => "image",
            ".webp" => "image",
            ".doc" or ".docx" => "document",
            ".xls" or ".xlsx" => "spreadsheet",
            ".ppt" or ".pptx" => "presentation",
            ".txt" => "text",
            ".mp3" or ".m4a" or ".wav" => "audio",
            ".mp4" => "video",
            ".zip" => "archive",
            _ => null
        };
    }
    catch
    {
        return null;
    }
}
```

---

### 3. endpoint POST `/api/conversations/{conversationId}/messages/{messageId}/upload` را بررسی کنید

این endpoint باید URL فایل آپلود شده را برگرداند:

```csharp
[HttpPost("api/conversations/{conversationId}/messages/{messageId}/upload")]
[Authorize]
public async Task<ActionResult<{ fileUrl: string }>> UploadAttachment(
    string conversationId,
    string messageId,
    IFormFile attachment)
{
    // آپلود فایل به Supabase یا سرویس ذخیره‌سازی دیگر
    var fileUrl = await _storageService.UploadFileAsync(attachment);

    // URL را به لیست attachments پیام اضافه کنید
    var message = await _context.Messages.FindAsync(messageId);
    if (message == null) return NotFound();

    if (message.Attachments == null)
        message.Attachments = new List<string>();

    message.Attachments.Add(fileUrl);
    await _context.SaveChangesAsync();

    return Ok(new { fileUrl });
}
```

---

### 4. نمونه پاسخ

پس از اعمال تغییرات، پاسخ endpoint `/api/conversations/{conversationId}/messages` باید به این صورت باشد:

```json
[
  {
    "id": "message-1",
    "conversationId": "conv-1",
    "senderId": "user-1",
    "senderName": "teacher teacherian",
    "senderAvatar": null,
    "senderRole": "teacher",
    "content": "Here is the file",
    "attachments": [
      "https://ilhqjgptwlbxeyipzchq.supabase.co/storage/v1/object/sign/seone-messaging-private/private-messaging/ef37c3cd-a83c-48af-9cf7-e40aa56e6caf/ba27a254-32ce-4823-82f7-6a8128ee17e6/9927aca766ee47328086a6644cdb5a63__addons.png?token=..."
    ],
    "attachmentDetails": [
      {
        "displayName": "addons.png",
        "downloadUrl": "https://ilhqjgptwlbxeyipzchq.supabase.co/storage/v1/object/sign/seone-messaging-private/private-messaging/ef37c3cd-a83c-48af-9cf7-e40aa56e6caf/ba27a254-32ce-4823-82f7-6a8128ee17e6/9927aca766ee47328086a6644cdb5a63__addons.png?token=...",
        "fileType": "image",
        "fileSize": null
      }
    ],
    "createdAt": "2026-10-31T07:45:00Z",
    "isRead": false,
    "readAt": null
  }
]
```

---

## نکات مهم

1. **فیلد `attachments` را نگه دارید**: برای backward compatibility، فیلد `attachments` را نگه دارید و فقط `attachmentDetails` را اضافه کنید.

2. **استخراج نام فایل**: تابع `ExtractFileName` باید نام فایل را از URL استخراج کند. اگر URL شامل `__` است، بخش بعد از آن را بگیرید (مثلاً `9927aca766ee47328086a6644cdb5a63__addons.png` → `addons.png`).

3. **حذف query parameters**: نام فایل نباید شامل query parameters باشد (مثلاً `?token=...` را حذف کنید).

4. **فیلد `displayName`**: این فیلد همان چیزی است که در frontend نمایش داده می‌شود.

5. **فیلد `downloadUrl`**: این فیلد لینک کامل است که وقتی کاربر روی فایل کلیک می‌کند، باز می‌شود.

---

## تست کردن

پس از اعمال تغییرات:

1. با یک اکانت وارد شوید
2. یک گفت‌وگو باز کنید
3. یک فایل آپلود کنید
4. بررسی کنید که در پاسخ API، `attachmentDetails` با `displayName` صحیح وجود دارد
5. در frontend، به جای لینک طولانی، فقط نام فایل باید نمایش داده شود

---

## endpointهای مرتبط

- `GET /api/conversations/{conversationId}/messages` - لیست پیام‌ها با attachmentDetails
- `POST /api/conversations/{conversationId}/messages/{messageId}/upload` - آپلود فایل
