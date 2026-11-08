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
    "score": 18,
    "maxScore": 25,
    "completedAt": "2026-11-09T00:00:00Z",
    "assessmentVersion": "cefr-written-v2"
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
    "score": 18,
    "maxScore": 25,
    "completedAt": "2026-11-09T00:00:00Z",
    "assessmentVersion": "cefr-written-v2"
  }
}
```

Return the updated profile (preferably with the same shape as `GET /api/user/profile`). The endpoint must authenticate the user and only update that user's own profile. The placement-test result and level must be stored together so the dashboard and profile display the same result. Preserve `assessmentVersion` with the result.

The current frontend test version, `cefr-written-v2`, has 25 questions: five questions at each CEFR band from A1 through C1, covering grammar, vocabulary, and reading. A band is passed at 3/5 correct; recommend the highest consecutive band passed. Validate that `0 <= score <= maxScore` and that the version/max score are supported server-side rather than trusting client input. This is a written placement estimate, not a certified assessment of speaking or listening.

## `POST /api/user/profile/avatar`

Accept an authenticated `multipart/form-data` request with a `file` field. Validate image type and size (maximum 5 MB), store the image, associate it with the current user, and return:

```json
{
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

The response URL should be accessible to the signed-in user and remain valid after the request completes.
