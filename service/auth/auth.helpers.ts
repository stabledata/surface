import { JWTPayload } from "hono/utils/jwt/types";
import { SurfaceContext } from "../../surface.app.ctx";
import { User } from "./auth.endpoints";
import { env } from "../../env";

/**
 * Get the current user from session or JWT token
 * @param c Surface context
 * @returns User object or undefined if not authenticated
 */
export async function getUser(c: SurfaceContext): Promise<User | undefined> {
  try {
    const sessionToken = c.var.cookies.get("session");

    if (!sessionToken) {
      return undefined;
    }

    const decoded = (await c.var.jwt.verify(
      sessionToken,
      env("JWT_SECRET"),
    )) as JWTPayload & {
      email: string;
      name: string;
    };

    // Construct user from JWT payload
    const user: User = {
      id: decoded.sub as string,
      name: decoded.name,
      email: decoded.email,
      roles: [], // TODO: Add role management
      profilePicture: undefined, // Could be added to JWT payload if needed
    };

    return user;
  } catch (error) {
    c.var.logger.error("Failed to get user from session", error);
    return undefined;
  }
}

/**
 * Check if the current request has a valid session
 * @param c Surface context
 * @returns JWT payload if valid session exists, false otherwise
 */
export const hasSession = async (
  c: SurfaceContext,
): Promise<boolean | JWTPayload> => {
  try {
    // Check for session cookie first
    const sessionToken = c.var.cookies.get("session");
    if (sessionToken) {
      const decoded = await c.var.jwt.verify(sessionToken, env("JWT_SECRET"));
      return decoded;
    }

    // Fallback to Authorization header for API calls
    const authHeader = c.req.header("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const decoded = await c.var.jwt.verify(token, env("JWT_SECRET"));
      return decoded;
    }

    return false;
  } catch (error) {
    c.var.logger.error("No valid session was found", error);
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
  // Note: Using a custom context extension since "session" is not in Dependencies
  (c as any).session = session;
  await next();
};
