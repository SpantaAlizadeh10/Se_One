# API Testing Examples

This document provides curl commands and examples for testing the backend API endpoints manually.

## Setup

Replace `http://localhost:5000` with your actual backend URL.

## Authentication Examples

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "Student"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' \
  -c cookies.txt
```

### Get Current User (with cookies)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -b cookies.txt
```

### Get Current User (with JWT token)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Logout
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -b cookies.txt
```

## Courses Examples

### Get All Courses
```bash
curl -X GET "http://localhost:5000/api/courses?lang=en"
```

## Enrollment Examples

### Enroll in Course
```bash
curl -X POST http://localhost:5000/api/enrollment/beginners \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### Get User Enrollments
```bash
curl -X GET http://localhost:5000/api/enrollment/user \
  -b cookies.txt
```

### Get Enrollment Progress
```bash
curl -X GET http://localhost:5000/api/enrollment/enr-123/progress \
  -b cookies.txt
```

## Modules Examples

### Get Course Modules
```bash
curl -X GET http://localhost:5000/api/courses/beginners/modules \
  -b cookies.txt
```

### Get Specific Module
```bash
curl -X GET http://localhost:5000/api/modules/mod-123 \
  -b cookies.txt
```

## Lessons Examples

### Get Module Lessons
```bash
curl -X GET http://localhost:5000/api/modules/mod-123/lessons \
  -b cookies.txt
```

### Get Specific Lesson
```bash
curl -X GET http://localhost:5000/api/lessons/lesson-123 \
  -b cookies.txt
```

### Complete Lesson
```bash
curl -X POST http://localhost:5000/api/lessons/lesson-123/complete \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### Update Lesson Progress
```bash
curl -X PATCH http://localhost:5000/api/lessons/lesson-123/progress \
  -H "Content-Type: application/json" \
  -d '{
    "timeSpent": 600,
    "lastPosition": 45
  }' \
  -b cookies.txt
```

## Progress Examples

### Get User Progress
```bash
curl -X GET http://localhost:5000/api/progress/user \
  -b cookies.txt
```

### Get Course Progress
```bash
curl -X GET http://localhost:5000/api/progress/course/beginners \
  -b cookies.txt
```

### Get Achievements
```bash
curl -X GET http://localhost:5000/api/progress/achievements \
  -b cookies.txt
```

### Claim Achievement
```bash
curl -X POST http://localhost:5000/api/progress/achievements/ach-123/claim \
  -b cookies.txt
```

## Learning Examples

### Get Current Learning State
```bash
curl -X GET http://localhost:5000/api/learning/current \
  -b cookies.txt
```

### Start Learning Session
```bash
curl -X POST http://localhost:5000/api/learning/start/beginners \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### Continue Learning Session
```bash
curl -X POST http://localhost:5000/api/learning/continue/lesson-123 \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### End Learning Session
```bash
curl -X POST http://localhost:5000/api/learning/session/session-123/end \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### Get Learning Recommendations
```bash
curl -X GET http://localhost:5000/api/learning/recommendations \
  -b cookies.txt
```

## Teachers Examples

### Get All Teachers
```bash
curl -X GET http://localhost:5000/api/teachers
```

## Blog Examples

### Get Blog Posts
```bash
curl -X GET "http://localhost:5000/api/blog?lang=en"
```

## Testing Script

Save this as `test-api.sh` and make it executable:

```bash
#!/bin/bash

API_URL="http://localhost:5000"
COOKIE_FILE="cookies.txt"

echo "🧪 Testing API at $API_URL"
echo "================================"

# Test 1: Register
echo "1. Testing Register..."
curl -X POST $API_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","password":"password123","role":"Student"}' \
  -c $COOKIE_FILE

echo -e "\n"

# Test 2: Login
echo "2. Testing Login..."
curl -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c $COOKIE_FILE

echo -e "\n"

# Test 3: Get Current User
echo "3. Testing Get Current User..."
curl -X GET $API_URL/api/auth/me \
  -b $COOKIE_FILE

echo -e "\n"

# Test 4: Get Courses
echo "4. Testing Get Courses..."
curl -X GET "$API_URL/api/courses?lang=en"

echo -e "\n"

# Test 5: Enroll in Course
echo "5. Testing Enroll in Course..."
curl -X POST $API_URL/api/enrollment/beginners \
  -b $COOKIE_FILE

echo -e "\n"

# Test 6: Get User Enrollments
echo "6. Testing Get User Enrollments..."
curl -X GET $API_URL/api/enrollment/user \
  -b $COOKIE_FILE

echo -e "\n"

# Test 7: Get Course Modules
echo "7. Testing Get Course Modules..."
curl -X GET $API_URL/api/courses/beginners/modules \
  -b $COOKIE_FILE

echo -e "\n"

# Test 8: Get User Progress
echo "8. Testing Get User Progress..."
curl -X GET $API_URL/api/progress/user \
  -b $COOKIE_FILE

echo -e "\n"

# Test 9: Get Teachers
echo "9. Testing Get Teachers..."
curl -X GET $API_URL/api/teachers

echo -e "\n"

# Test 10: Logout
echo "10. Testing Logout..."
curl -X POST $API_URL/api/auth/logout \
  -b $COOKIE_FILE

echo -e "\n"
echo "✅ Tests completed!"
```

Run it with:
```bash
chmod +x test-api.sh
./test-api.sh
```

## Postman Collection

You can import these endpoints into Postman:

1. Create a new collection
2. Add each endpoint with the corresponding method and URL
3. Set up environment variables:
   - `{{baseUrl}}` = `http://localhost:5000`
   - `{{token}}` = JWT token from login response
4. Use the cookie jar for cookie-based auth

## Common Issues

### CORS Errors
If you get CORS errors, ensure your backend allows requests from your frontend:
```csharp
services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});
```

### Authentication Issues
- Make sure cookies are being saved and sent
- Check that JWT token is being included in Authorization header
- Verify the user has the correct permissions

### 404 Errors
- Check that the endpoint path is correct
- Ensure the backend is running on the expected port
- Verify that the route is properly configured

### 500 Errors
- Check the backend logs for detailed error information
- Ensure the request body format is correct
- Verify that all required fields are included

## Response Format Expectations

The frontend expects responses in this format:

### Success Response
```json
{
  "data": { ... }
}
```

or directly:
```json
{
  "id": "123",
  "title": "Example"
}
```

### Error Response
```json
{
  "message": "Error message",
  "title": "Error title",
  "detail": "Detailed error information"
}
```

### Data Types
- Numbers should be actual numbers, not strings
- Booleans should be `true`/`false`, not strings
- Dates should be ISO 8601 format: `2026-09-15T10:00:00Z`

## Admin Examples (role Admin required)

Login as an admin user first (same as student login; user must have role `Admin`).

### Dashboard stats
```bash
curl -X GET http://localhost:5000/api/admin/dashboard/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### List students
```bash
curl -X GET "http://localhost:5000/api/admin/students?page=1&pageSize=20&status=active" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Suspend a student
```bash
curl -X PATCH http://localhost:5000/api/admin/students/{studentId}/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{ "status": "suspended" }'
```

### Approve a teacher
```bash
curl -X PATCH http://localhost:5000/api/admin/teachers/{teacherId}/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{ "status": "active" }'
```

### Update course discount
```bash
curl -X PATCH http://localhost:5000/api/admin/courses/{courseId}/pricing \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{ "basePrice": 990000, "discountPercent": 15, "currency": "IRR" }'
```

See **`ADMIN_API_SPECIFICATION.md`** for the complete admin API list.

---

Use these examples to verify your backend implementation matches the expected API specification.