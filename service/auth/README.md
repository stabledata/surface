# Authentication Service - WorkOS Sessions

This authentication service uses WorkOS sessions for secure, managed authentication instead of self-signed JWT tokens. This provides enterprise-grade session management, automatic token refresh, and comprehensive session controls.

## Overview

The authentication flow leverages WorkOS's session management system:

1. **OAuth Flow**: Users authenticate via WorkOS OAuth providers
2. **Session Creation**: WorkOS creates and manages the user session
3. **Token Management**: WorkOS provides access tokens (JWTs) and refresh tokens
4. **Automatic Refresh**: Tokens are automatically refreshed as needed
5. **Session Controls**: Configure session behavior via WorkOS Dashboard

## Files

- `auth.endpoints.ts` - Authentication endpoints using WorkOS sessions
- `auth.helpers.ts` - Helper functions for session validation and user management
- `auth.endpoint.test.ts` - Comprehensive tests for auth endpoints
- `auth.helpers.test.ts` - Tests for auth helper functions

## Environment Variables

Required environment variables for WorkOS integration:

```bash
WORKOS_API_KEY=sk_test_...
WORKOS_CLIENT_ID=client_...
WORKOS_REDIRECT_URI=http://localhost:4000/api/auth/callback
JWT_SECRET=your_jwt_secret_here  # Used for any additional signing if needed
```

## Authentication Flow

### 1. Login Process

```
User → /api/auth/login 
     → WorkOS Authorization URL 
     → User authenticates 
     → WorkOS callback → /api/auth/callback
     → Store WorkOS tokens → Redirect to app
```

#### `GET /api/auth/login`
Initiates WorkOS OAuth flow.

**Query Parameters:**
- `return` (optional): URL to redirect to after successful authentication
- `test` (optional): When set to "true", returns JSON with authorization URL instead of redirecting

**Response:**
- `302` - Redirects to WorkOS authorization URL
- `200` - Returns JSON with authorization URL (when `test=true`)

### 2. Callback Handling

#### `GET /api/auth/callback`
Handles OAuth callback from WorkOS and establishes session.

**Query Parameters:**
- `code` (required): Authorization code from WorkOS
- `state` (optional): Original redirect destination

**Process:**
1. Exchange authorization code for WorkOS tokens
2. Store access token and refresh token as secure HTTP-only cookies
3. Redirect to original destination or home page

**Cookies Set:**
- `wos_access_token`: Short-lived WorkOS JWT (configurable duration)
- `wos_refresh_token`: Long-lived refresh token
- `user_id`: User ID for quick reference

### 3. Session Validation

The system validates sessions using WorkOS-signed JWTs:

```typescript
// Validate WorkOS JWT using their JWKS endpoint
const JWKS = jose.createRemoteJWKSet(
  new URL(`https://api.workos.com/sso/jwks/${env("WORKOS_CLIENT_ID")}`)
);

const { payload } = await jose.jwtVerify(accessToken, JWKS, {
  issuer: "https://api.workos.com",
});
```

### 4. Automatic Token Refresh

When an access token expires, the system automatically attempts to refresh it using the refresh token:

```typescript
const { user, accessToken, refreshToken: newRefreshToken } = 
  await workos.userManagement.authenticateWithRefreshToken({
    refreshToken,
    clientId: env("WORKOS_CLIENT_ID"),
  });
```

## API Endpoints

### Authentication Endpoints

#### `GET /api/auth/login`
Initiate WorkOS OAuth flow.

#### `GET /api/auth/callback`
Handle OAuth callback and create session.

#### `GET /api/auth/logout`
Clear session and logout from WorkOS.

**Process:**
1. Extract session ID from access token
2. Clear all auth cookies
3. Redirect to WorkOS logout URL to invalidate session
4. User redirected back to configured logout URL

#### `POST /api/auth/switch-organization`
Switch to a different organization context within the same session.

**Request Body:**
```json
{
  "organizationId": "org_123"
}
```

**Response:**
```json
{
  "success": true,
  "organizationId": "org_123"
}
```

#### `GET /api/auth/me`
Get current user information from WorkOS session.

**Response:**
```json
{
  "id": "user_123",
  "name": "John Doe",
  "email": "john@example.com",
  "roles": [],
  "profilePicture": "https://...",
  "organizationId": "org_123",
  "role": "admin",
  "permissions": ["read", "write"]
}
```

## Helper Functions

### `getUser(c: SurfaceContext): Promise<User | undefined>`
Extracts user information from the current WorkOS session. Automatically handles token refresh if needed.

### `hasSession(c: SurfaceContext): Promise<boolean | JWTPayload>`
Checks if the current request has a valid WorkOS session. Returns JWT payload if valid.

### `requireAuth(c: SurfaceContext, next: Function)`
Middleware to require authentication for protected routes. Returns 401 if no valid session exists.

### Organization & Permission Helpers

- `getCurrentOrganizationId(c)`: Get current organization ID from session
- `getUserPermissions(c)`: Get user permissions array
- `hasPermission(c, permission)`: Check if user has specific permission  
- `getUserRole(c)`: Get user's role in current organization

## Usage Examples

### Protecting a Route
```typescript
export const protectedRoute = new Hono<SurfaceEnv>()
  .use(requireAuth)
  .get("/protected", async (c) => {
    const user = await getUser(c);
    return c.json({ message: `Hello ${user?.name}` });
  });
```

### Manual Session Check
```typescript
export const optionalAuth = new Hono<SurfaceEnv>()
  .get("/optional", async (c) => {
    const user = await getUser(c);
    if (user) {
      return c.json({ message: `Welcome back ${user.name}` });
    } else {
      return c.json({ message: "Hello anonymous user" });
    }
  });
```

### Permission-Based Access
```typescript
export const adminRoute = new Hono<SurfaceEnv>()
  .use(requireAuth)
  .get("/admin", async (c) => {
    if (await hasPermission(c, "admin:write")) {
      return c.json({ message: "Admin access granted" });
    }
    return c.json({ error: "Insufficient permissions" }, 403);
  });
```

## WorkOS Dashboard Configuration

Configure session behavior in the WorkOS Dashboard under Authentication settings:

- **Maximum session length**: How long before user must re-authenticate
- **Access token duration**: How often tokens are refreshed (recommended: 15-60 minutes)
- **Inactivity timeout**: Session ends if no activity for this period
- **Logout redirect**: Where users go after logout

## JWT Token Claims

WorkOS access tokens contain the following claims:

- `sub`: WorkOS user ID
- `sid`: Session ID (used for logout)
- `iss`: `https://api.workos.com` (or custom domain)
- `org_id`: Selected organization ID (if applicable)
- `role`: User's role in the organization
- `permissions`: Array of permissions assigned to the role
- `exp`: Token expiration timestamp
- `iat`: Token issued timestamp
- `email`: User's email address
- `name`: User's display name

## Testing

The authentication system includes comprehensive tests covering:
- All authentication endpoints (login, callback, logout, organization switching)
- Token validation and refresh logic
- Error handling for various failure scenarios
- Helper functions for session management
- Mock WorkOS integration

Run tests with:
```bash
bun test ./service/auth/
```

## Security Features

- **HTTP-Only Cookies**: Tokens stored as secure, HTTP-only cookies
- **Automatic Refresh**: Seamless token refresh without user interaction
- **Session Invalidation**: Proper logout that clears WorkOS session
- **JWKS Validation**: Tokens validated using WorkOS's public keys
- **Token Rotation**: Refresh tokens may be rotated for security
- **Organization Context**: Built-in multi-organization support
- **Permission Management**: Fine-grained permission checking

## Migration from Self-Signed JWT

Key differences from the previous self-signed JWT approach:

1. **Token Source**: WorkOS manages token creation and signing
2. **Validation**: Uses WorkOS JWKS instead of local JWT secret
3. **Refresh Logic**: Built-in refresh token rotation
4. **Session Management**: WorkOS tracks and manages session state
5. **Dashboard Controls**: Configure session behavior via WorkOS UI
6. **Organization Support**: Native multi-organization context switching

## Benefits

- **Enterprise Security**: Leverages WorkOS's security infrastructure
- **Reduced Complexity**: No need to implement session management
- **Automatic Refresh**: Built-in token refresh and rotation
- **Session Monitoring**: View and manage sessions from WorkOS dashboard
- **Compliance**: Built-in compliance and security features
- **Scalability**: Handles enterprise-scale session management