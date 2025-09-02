import { JWTPayload } from "hono/utils/jwt/types";
import { SurfaceContext } from "../../surface.app.ctx";
import { User } from "./auth.endpoints";
import { env } from "../../env";
import * as jose from "jose";

/**
 * Get the current user from WorkOS session tokens
 * @param c Surface context
 * @returns User object or undefined if not authenticated
 */
export async function getUser(c: SurfaceContext): Promise<User | undefined> {
  try {
    const accessToken = c.var.cookies.get("wos_access_token");

    if (!accessToken) {
      // Try to refresh the token
      return await refreshAndGetUser(c);
    }

    // Validate the WorkOS JWT using their JWKS
    const JWKS = jose.createRemoteJWKSet(
      new URL(`https://api.workos.com/sso/jwks/${env("WORKOS_CLIENT_ID")}`),
    );

    try {
      const { payload } = await jose.jwtVerify(accessToken, JWKS, {
        issuer: "https://api.workos.com",
      });

      // Extract user info from WorkOS JWT claims
      // Try different possible field names that WorkOS might use
      const email =
        (payload.email as string) || ((payload as any).user_email as string);
      const name =
        (payload.name as string) ||
        ((payload as any).user_name as string) ||
        ((payload as any).given_name as string) ||
        ((payload as any).first_name as string) ||
        email;

      const user: User = {
        id: payload.sub as string,
        name: name || email,
        email: email,
        roles: [], // Could be enhanced to derive from payload
        profilePicture:
          (payload.picture as string) ||
          ((payload as any).profile_picture_url as string),
        // Organization context from JWT
        organizationId:
          (payload.org_id as string) ||
          ((payload as any).organization_id as string),
        role:
          (payload.role as string) || ((payload as any).user_role as string),
        permissions:
          (payload.permissions as string[]) ||
          ((payload as any).user_permissions as string[]),
      };

      c.var.logger.debug(`User ${user.email} authenticated from WorkOS token`);
      return user;
    } catch (jwtError) {
      c.var.logger.debug("Access token validation failed, attempting refresh");
      // Token might be expired, try to refresh
      return await refreshAndGetUser(c);
    }
  } catch (error) {
    c.var.logger.error("Error getting user from WorkOS session", error);
    return undefined;
  }
}

/**
 * Attempt to refresh tokens and get user
 * @param c Surface context
 * @returns User object or undefined if refresh fails
 */
async function refreshAndGetUser(c: SurfaceContext): Promise<User | undefined> {
  try {
    const refreshToken = c.var.cookies.get("wos_refresh_token");

    if (!refreshToken) {
      c.var.logger.debug("No refresh token available");
      return undefined;
    }

    c.var.logger.info("Attempting to refresh WorkOS tokens");

    // Use WorkOS refresh token endpoint
    const refreshResult =
      await c.var.workos.userManagement.authenticateWithRefreshToken({
        refreshToken,
        clientId: env("WORKOS_CLIENT_ID"),
      });

    const { user, accessToken, refreshToken: newRefreshToken } = refreshResult;

    // Store the new access token
    c.var.cookies.set("wos_access_token", accessToken, {
      path: "/",
      httpOnly: true,
      secure: env("NODE_ENV") === "production",
      sameSite: "lax",
    });

    // Update refresh token if it was rotated
    if (newRefreshToken) {
      c.var.cookies.set("wos_refresh_token", newRefreshToken, {
        path: "/",
        httpOnly: true,
        secure: env("NODE_ENV") === "production",
        sameSite: "lax",
      });
    }

    // Update user ID cookie
    c.var.cookies.set("user_id", user.id, {
      path: "/",
      httpOnly: true,
      secure: env("NODE_ENV") === "production",
      sameSite: "lax",
    });

    c.var.logger.info("Successfully refreshed WorkOS tokens");

    // Convert WorkOS user to our User type
    const surfaceUser: User = {
      id: user.id,
      name:
        `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
      email: user.email,
      roles: [],
      profilePicture: user.profilePictureUrl ?? undefined,
    };

    c.var.logger.info(
      `Successfully refreshed tokens for user ${surfaceUser.email}`,
    );
    return surfaceUser;
  } catch (error) {
    c.var.logger.error("Failed to refresh WorkOS tokens", error);
    return undefined;
  }
}

/**
 * Check if the current request has a valid WorkOS session
 * @param c Surface context
 * @returns JWT payload if valid session exists, false otherwise
 */
export const hasSession = async (
  c: SurfaceContext,
): Promise<boolean | JWTPayload> => {
  try {
    // Check for WorkOS access token first
    const accessToken = c.var.cookies.get("wos_access_token");
    if (accessToken) {
      const JWKS = jose.createRemoteJWKSet(
        new URL(`https://api.workos.com/sso/jwks/${env("WORKOS_CLIENT_ID")}`),
      );

      try {
        const { payload } = await jose.jwtVerify(accessToken, JWKS, {
          issuer: "https://api.workos.com",
        });
        return payload;
      } catch (jwtError) {
        c.var.logger.info("Access token validation failed, attempting refresh");
        // Try to refresh the token
        const user = await refreshAndGetUser(c);
        if (user) {
          // Get the new access token after refresh
          const newAccessToken = c.var.cookies.get("wos_access_token");
          if (newAccessToken) {
            const { payload } = await jose.jwtVerify(newAccessToken, JWKS, {
              issuer: "https://api.workos.com",
            });
            return payload;
          }
        }
        return false;
      }
    }

    // Fallback to Authorization header for API calls
    const authHeader = c.req.header("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const JWKS = jose.createRemoteJWKSet(
        new URL(`https://api.workos.com/sso/jwks/${env("WORKOS_CLIENT_ID")}`),
      );

      try {
        const { payload } = await jose.jwtVerify(token, JWKS, {
          issuer: "https://api.workos.com",
        });
        return payload;
      } catch (jwtError) {
        c.var.logger.error(
          "Authorization header token validation failed",
          jwtError,
        );
        return false;
      }
    }

    return false;
  } catch (error) {
    c.var.logger.error("No valid WorkOS session found", error);
    return false;
  }
};

/**
 * Middleware to require authentication for protected routes
 * @param c Surface context
 * @param next Next function
 */
export const requireAuth = async (
  c: SurfaceContext,
  next: () => Promise<void>,
) => {
  const session = await hasSession(c);

  if (!session) {
    return c.json({ error: "Authentication required" }, 401);
  }

  // Store the session data in context for use in handlers
  (c as any).session = session;
  await next();
};

/**
 * Get the current organization ID from the session
 * @param c Surface context
 * @returns Organization ID or undefined
 */
export async function getCurrentOrganizationId(
  c: SurfaceContext,
): Promise<string | undefined> {
  const session = await hasSession(c);
  if (session && typeof session === "object") {
    return session.org_id as string;
  }
  return undefined;
}

/**
 * Get user permissions from the current session
 * @param c Surface context
 * @returns Array of permissions or empty array
 */
export async function getUserPermissions(c: SurfaceContext): Promise<string[]> {
  const session = await hasSession(c);
  if (session && typeof session === "object") {
    return (session.permissions as string[]) || [];
  }
  return [];
}

/**
 * Check if user has a specific permission
 * @param c Surface context
 * @param permission Permission to check
 * @returns True if user has the permission
 */
export async function hasPermission(
  c: SurfaceContext,
  permission: string,
): Promise<boolean> {
  const permissions = await getUserPermissions(c);
  return permissions.includes(permission);
}

/**
 * Get user role in the current organization
 * @param c Surface context
 * @returns User role or undefined
 */
export async function getUserRole(
  c: SurfaceContext,
): Promise<string | undefined> {
  const session = await hasSession(c);
  if (session && typeof session === "object") {
    return session.role as string;
  }
  return undefined;
}
