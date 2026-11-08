# Backend requirements: student profile and placement test

The frontend uses the existing authenticated profile endpoints. The server must persist and return the fields below so profile updates, age, avatar, and placement results remain consistent after refresh or sign-in on another device.

## `GET /api/user/profile`

Return the current authenticated user's profile, including:

```json
{
  "id": "user-id",
  "fullName": "Student Name",
  "email": "student@example.com",
  "dateOfBirth": "2005-04-12",
  "avatarUrl": "https://example.com/avatar.jpg",
  "bio": "A short introduction",
  "level": "B1",
  "placementTestResult": {
    "score": 6,
    "maxScore": 10,
    "completedAt": "2025-01-15T12:00:00Z"
  }
}
```

`dateOfBirth` should be the birth date originally submitted during registration. The frontend calculates and displays age from it; the server should not store a separate, stale age value.

## `PATCH /api/user/profile`

Accept and persist profile fields, including:

```json
{
  "fullName": "Student Name",
  "bio": "A short introduction",
  "level": "B1",
  "placementTestResult": {
    "score": 6,
    "maxScore": 10,
    "completedAt": "2025-01-15T12:00:00Z"
  }
}
```

Return the updated profile (preferably with the same shape as `GET /api/user/profile`). The endpoint must authenticate the user and only update that user's own profile. The placement-test result and level must be stored together so the dashboard and profile display the same result.

The frontend assigns levels using this score mapping for its 10-question test: 0–2 `A1`, 3–4 `A2`, 5–6 `B1`, 7–8 `B2`, 9–10 `C1`. Validate score and max score server-side rather than trusting client input.

## `POST /api/user/profile/avatar`

Accept an authenticated `multipart/form-data` request with a `file` field. Validate image type and size (maximum 5 MB), store the image, associate it with the current user, and return:

```json
{
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

The response URL should be accessible to the signed-in user and remain valid after the request completes.
