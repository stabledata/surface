import { Hono } from "hono";
import { SurfaceEnv } from "../../surface.app.ctx";
import { env } from "../../env";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { z } from "zod";
import { AuthError } from "../../handlers/error.handler";

export type User = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  profilePicture?: string;
};

// Zod schemas for OpenAPI documentation
const loginRedirectResponse = z.object({
  redirectUrl: z.string().url(),
});

const logoutResponse = z.object({
  message: z.string(),
});

export const sessions = new Hono<SurfaceEnv>()
  .get(
    "/login",
    describeRoute({
      description: "Initiate WorkOS OAuth login flow",
      responses: {
        302: {
          description: "Redirect to WorkOS authorization URL",
        },
        200: {
          description: "Authorization URL (for testing)",
          content: {
            "application/json": { schema: resolver(loginRedirectResponse) },
          },
        },
      },
    }),
    async (c) => {
      const { workos, logger } = c.var;

      try {
        const redirectTo = c.req.query("return") ?? "/";

        // Create authorization URL with WorkOS
        const authorizationUrl = workos.userManagement.getAuthorizationUrl({
          provider: "authkit",
          redirectUri: env("WORKOS_REDIRECT_URI"),
          clientId: env("WORKOS_CLIENT_ID"),
          state: redirectTo, // Pass the return URL in state
        });

        logger.info("Redirecting to WorkOS authorization URL");

        // For testing purposes, if test=true query param is present, return JSON instead of redirecting
        if (c.req.query("test") === "true") {
          return c.json({ redirectUrl: authorizationUrl });
        }

        return c.redirect(authorizationUrl);
      } catch (error) {
        logger.error("Failed to create WorkOS authorization URL", error);
        throw new AuthError(
          "Authentication initialization failed",
          "INIT_FAILED",
        );
      }
    },
  )
  .get(
    "/callback",
    describeRoute({
      description: "Handle WorkOS OAuth callback and create user session",
      responses: {
        302: {
          description: "Redirect to original destination or home page",
        },
        400: {
          description: "Missing or invalid authorization code",
        },
      },
    }),
    async (c) => {
      const { workos, cookies, jwt, logger } = c.var;

      try {
        const code = c.req.query("code");
        const state = c.req.query("state");

        if (!code) {
          logger.error("No authorization code provided in callback");
          throw new AuthError("Missing authorization code", "MISSING_CODE");
        }

        logger.info("Processing WorkOS callback with authorization code");

        // Exchange code for user information
        const { user } = await workos.userManagement.authenticateWithCode({
          code,
          clientId: env("WORKOS_CLIENT_ID"),
        });

        // Create our user object from WorkOS user
        const surfaceUser: User = {
          id: user.id,
          name:
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            user.email,
          email: user.email,
          roles: [], // You might want to fetch roles from WorkOS organizations
          profilePicture: user.profilePictureUrl ?? undefined,
        };

        // Store user ID in cookie
        cookies.set("user_id", surfaceUser.id, {
          path: "/",
          httpOnly: true,
          secure: env("NODE_ENV") === "production",
          sameSite: "lax",
        });

        // Generate JWT session token
        const now = Math.floor(Date.now() / 1000);
        const payload = {
          sub: surfaceUser.id,
          email: surfaceUser.email,
          name: surfaceUser.name,
          iat: now,
          exp: now + 60 * 60 * 24, // 24 hours
        };

        const token = await jwt.sign(payload, env("JWT_SECRET"));
        cookies.set("session", token, {
          path: "/",
          httpOnly: true,
          secure: env("NODE_ENV") === "production",
          sameSite: "lax",
        });

        logger.info(`User ${surfaceUser.email} authenticated successfully`);

        // Redirect to original destination or home page
        const redirectTo = state || "/";
        return c.redirect(redirectTo);
      } catch (error) {
        logger.error("WorkOS authentication failed", error);

        if (error instanceof AuthError) {
          throw error; // Re-throw AuthError to be handled by error handler
        }

        // Wrap other errors as AuthError
        throw new AuthError("Authentication failed", "AUTH_FAILED");
      }
    },
  )
  .get(
    "/logout",
    describeRoute({
      description: "Clear user session and logout",
      responses: {
        302: {
          description: "Redirect to specified location or home page",
        },
        200: {
          description: "Logout confirmation (for testing)",
          content: {
            "application/json": { schema: resolver(logoutResponse) },
          },
        },
      },
    }),
    async (c) => {
      const { cookies, logger } = c.var;

      logger.info("User logging out");

      // Clear all auth cookies
      cookies.set("user_id", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0),
      });

      cookies.set("session", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0),
      });

      const redirectTo = c.req.query("return") ?? "/";

      // For testing purposes, if test=true query param is present, return JSON
      if (c.req.query("test") === "true") {
        return c.json({ message: "Logged out successfully" });
      }

      return c.redirect(redirectTo);
    },
  );
