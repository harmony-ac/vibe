# Harmony Vibe API

REST API for requirement analysis and test design.

## Base URLs

| Environment | URL |
|---|---|
| Production | `https://cloud.harmony.ac` |
| Development | `https://dev.harmony.ac` |
| Local | `http://localhost:5173` |

All endpoints are prefixed with `/api/vibe`.

The CLI and agent pick the base URL from the `HARMONY_API_URL` environment variable and fall back to production.

## Authentication

All endpoints except `/auth/*` and `/health` require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are obtained via the device-authorization flow (see `POST /auth/device`).

## Endpoints

---

### `POST /auth/device`

Initiates an OAuth2 device-authorization flow. Returns a `user_code` and `verification_uri`.

**Request body**
```json
{
  "client_id": "harmony-cli"
}
```

**Response `200`**
```json
{
  "device_code": "abc123",
  "user_code": "DEF-GHI",
  "verification_uri": "https://cloud.harmony.ac/activate",
  "expires_in": 600,
  "interval": 5
}
```

**Response `429`** – rate limit exceeded.

---

### `POST /auth/token`

Polls for an access token after the user has authorized the device.

**Request body**
```json
{
  "device_code": "abc123"
}
```

**Response `200`** (success)
```json
{
  "access_token": "hny_...",
  "token_type": "Bearer"
}
```

**Response `202`** (still pending)
```json
{
  "error": "authorization_pending"
}
```

**Response `400`** (expired or invalid device code)
```json
{
  "error": "expired_token"
}
```

---

### `GET /health`

Health check. Does **not** require authentication.

**Response `200`**
```json
{
  "status": "ok",
  "version": "1.2.3"
}
```

---

### `POST /analyze`

Analyzes a requirements text for anomalies (ambiguities, missing cases, assumptions, inconsistencies).

**Request headers**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request body**
```json
{
  "requirements": "# Feature: ...",
  "feature_id": "optional-stable-id",
  "context": {
    "file_path": "harmony/features/auth/requirements.md",
    "project_type": "nextjs"
  }
}
```

**Response `200`**
```json
{
  "feature_id": "auth",
  "anomalies": [
    {
      "id": "a1",
      "severity": "critical",
      "category": "ambiguity",
      "description": "It is unclear what happens when an unconfirmed user tries to log in.",
      "location": "Section 2",
      "suggested_fixes": [
        "Add a step that describes the unconfirmed-user path.",
        "Explicitly state that only confirmed users may log in."
      ]
    }
  ],
  "summary": "2 critical anomalies and 1 warning found."
}
```

---

### `POST /test-design`

Generates a high-level test design in `.harmony.md` format from the requirements.

**Request headers**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request body**
```json
{
  "requirements": "# Feature: ...",
  "feature_id": "optional-stable-id",
  "context": {
    "file_path": "harmony/features/auth/requirements.md",
    "test_framework": "vitest",
    "existing_tests": "path/to/existing.harmony.md"
  }
}
```

**Response `200`**
```json
{
  "feature_id": "auth",
  "test_design": "+ Log in:\\n  - valid credentials => dashboard loads\\n  - invalid password => !! \\\"Invalid credentials\\\"\\n",
  "metadata": {
    "test_count": 4,
    "sections": ["Log in", "Sign up"]
  }
}
```

The `test_design` string is valid `.harmony.md` content. The caller is responsible for writing it to disk.

---

## Errors

Any non-2xx response returns a JSON body:

```json
{
  "error": "invalid_token",
  "message": "The provided token is invalid or expired."
}
```

Common error codes:

| HTTP | `error` | Meaning |
|---|---|---|
| 400 | `bad_request` | Malformed request body. |
| 401 | `invalid_token` | Missing or invalid Bearer token. |
| 429 | `rate_limited` | Too many requests. Retry after some time. |
| 500 | `server_error` | Internal server error. |

## Rate limits

- **Analyze** – 10 requests / minute
- **Test-design** – 10 requests / minute
- **Auth** – 5 requests / minute

## Idempotency

If `feature_id` is provided, the server may cache or correlate the request with previous analysis or test-design results for the same feature. Callers should reuse the same `feature_id` across the analysis and test-design steps so the server can maintain consistency.
