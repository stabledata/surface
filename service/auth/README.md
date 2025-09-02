# Authentication Service

This authentication service has been updated to use WorkOS for OAuth authentication, replacing the previous fake user implementation.

## Overview

The authentication flow uses WorkOS AuthKit to handle user authentication via OAuth providers. Users are redirected to WorkOS for authentication, and upon successful authentication, a JWT session token is created and stored as an HTTP-only cookie.

## Flow

1. **Login (`/auth/login`)**: Redirects user to WorkOS authorization URL
2. **Callback (`/auth/callback`)**: Handles OAuth callback, exchanges code for user info, creates session
3. **Logout (`/auth/logout`)**: Clears session cookies and redirects

## Files

- `auth.endpoints.ts` - Main authentication endpoints
- `auth.helpers.ts` - Helper functions for session management and authentication middleware
- `auth.endpoint.test.ts` - Comprehensive tests for auth endpoints
- `auth.helpers.test.ts` - Tests for auth helper functions

## Environment Variables

Required environment variables for WorkOS integration:

```bash
WORKOS_API_KEY=sk_test_...
WORKOS_CLIENT_ID=client_...
WORKOS_REDIRECT_URI=http://localhost:4000/api/auth/callback
JWT_SECRET=your_jwt_secret_here
```

## Usage

### Authentication Endpoints

#### `GET /auth/login`
Initiates WorkOS OAuth flow. Optionally accepts a `return` query parameter to specify redirect destination after successful authentication.

**Query Parameters:**
- `return` (optional): URL to redirect to after successful authentication
- `test` (optional): When set to "true", returns JSON with authorization URL instead of redirecting

**Response:**
- `302` - Redirects to WorkOS authorization URL
- `200` - Returns JSON with authorization URL (when `test=true`)

#### `GET /auth/callback`
Handles OAuth callback from WorkOS. Exchanges authorization code for user information and creates session.

**Query Parameters:**
- `code` (required): Authorization code from WorkOS
- `state` (optional): Original redirect destination

**Response:**
- `302` - Redirects to original destination or home page
- `401` - Authentication failed

#### `GET /auth/logout`
Clears user session and redirects.

**Query Parameters:**
- `return` (optional): URL to redirect to after logout
- `test` (optional): When set to "true", returns JSON confirmation instead of redirecting

**Response:**
- `302` - Redirects to specified location or home page
- `200` - Returns JSON confirmation (when `test=true`)

### Helper Functions

#### `getUser(c: SurfaceContext): Promise<User | undefined>`
Extracts user information from the current session JWT token.

#### `hasSession(c: SurfaceContext): Promise<boolean | JWTPayload>`
Checks if the current request has a valid session (via cookie or Authorization header).

#### `requireAuth(c: SurfaceContext, next: Function): Promise<void>`
Middleware to require authentication for protected routes. Returns 401 if no valid session exists.

### Usage Examples

#### Protecting a Route
```typescript
export const protectedRoute = new Hono<SurfaceEnv>()
  .use(requireAuth)
  .get("/protected", async (c) => {
    const user = await getUser(c);
    return c.json({ message: `Hello ${user?.name}` });
  });
```

#### Manual Session Check
```typescript
export const optionalAuth = new Hono<SurfaceEnv>()
  .get("/optional", async (c) => {
    const session = await hasSession(c);
    if (session) {
      const user = await getUser(c);
      return c.json({ message: `Welcome back ${user?.name}` });
    } else {
      return c.json({ message: "Hello anonymous user" });
    }
  });
```

## User Type

```typescript
export type User = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  profilePicture?: string;
};
```

## JWT Payload

Session tokens contain the following claims:
- `sub`: User ID
- `email`: User email address
- `name`: User display name
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp (24 hours from issue)

## Testing

The authentication system includes comprehensive tests covering:
- All authentication endpoints (login, callback, logout)
- Error handling for various failure scenarios
- Helper functions for session management
- Mock WorkOS integration

Run tests with:
```bash
bun test ./service/auth/
```

## Security Considerations

- JWT tokens are stored as HTTP-only cookies to prevent XSS attacks
- Cookies use `sameSite: "lax"` and `secure` flag in production
- Session tokens expire after 24 hours
- All authentication errors are properly handled and logged
- WorkOS handles the actual OAuth flow, reducing attack surface

## Migration from Fake User

The following changes were made during the WorkOS migration:
1. Removed `fakeUser` from auth helpers
2. Updated authentication flow to use WorkOS OAuth
3. Added proper JWT session management
4. Updated error handling with `AuthError` class
5. Fixed dependency injection to support JWT mocking in tests
6. Updated member service client and tests to work with real authentication