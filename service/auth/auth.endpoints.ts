import { Hono } from "hono";
import { SurfaceEnv } from "../../surface.app.ctx";
import { env } from "../../env";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { z } from "zod";
import { AuthError } from "../../handlers/error.handler";

export type User = {
  id: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  picture?: string;
  org_id?: string;
  role?: string;
  permissions?: string[];
  // Legacy fields for backward compatibility
  profilePicture?: string;
  organizationId?: string;
  roles?: string[];
};

// Zod schemas for OpenAPI documentation
const loginRedirectResponse = z.object({
  redirectUrl: z.string().url(),
});

const logoutResponse = z.object({
  message: z.string(),
});

const switchOrganizationRequest = z.object({
  organizationId: z.string(),
});

const switchOrganizationResponse = z.object({
  success: z.boolean(),
  organizationId: z.string(),
});

const userResponse = z.object({
  id: z.string(),
  email: z.string().optional(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  name: z.string().optional(),
  picture: z.string().optional(),
  org_id: z.string().optional(),
  role: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  // Legacy fields for backward compatibility
  profilePicture: z.string().optional(),
  organizationId: z.string().optional(),
  roles: z.array(z.string()).optional(),
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
      const { workos, cookies, logger } = c.var;

      try {
        const code = c.req.query("code");
        const state = c.req.query("state");

        if (!code) {
          logger.error("No authorization code provided in callback");
          throw new AuthError("Missing authorization code", "MISSING_CODE");
        }

        logger.info("Processing WorkOS callback with authorization code");

        // Exchange code for WorkOS tokens and user information
        const { user, accessToken, refreshToken } =
          await workos.userManagement.authenticateWithCode({
            code,
            clientId: env("WORKOS_CLIENT_ID"),
          });

        // Store WorkOS access token (short-lived JWT)
        cookies.set("wos_access_token", accessToken, {
          path: "/",
          httpOnly: true,
          secure: env("NODE_ENV") === "production",
          sameSite: "lax",
        });

        // Store WorkOS refresh token (longer-lived)
        cookies.set("wos_refresh_token", refreshToken, {
          path: "/",
          httpOnly: true,
          secure: env("NODE_ENV") === "production",
          sameSite: "lax",
        });

        // Also store user ID for quick reference (optional)
        cookies.set("user_id", user.id, {
          path: "/",
          httpOnly: true,
          secure: env("NODE_ENV") === "production",
          sameSite: "lax",
        });

        logger.info(
          `User ${user.email} authenticated successfully with WorkOS session`,
        );

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
      description: "Clear user session and logout from WorkOS",
      responses: {
        302: {
          description: "Redirect to WorkOS logout URL or specified location",
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

      try {
        // Clear all auth cookies first
        cookies.set("wos_access_token", "", {
          path: "/",
          httpOnly: true,
          expires: new Date(0),
        });

        cookies.set("wos_refresh_token", "", {
          path: "/",
          httpOnly: true,
          expires: new Date(0),
        });

        cookies.set("user_id", "", {
          path: "/",
          httpOnly: true,
          expires: new Date(0),
        });

        // For testing purposes, if test=true query param is present, return JSON
        if (c.req.query("test") === "true") {
          return c.json({ message: "Logged out successfully" });
        }

        // Simple logout: just clear cookies and redirect
        // Note: This doesn't invalidate the WorkOS session, but clears our local session
        logger.info("Performing local logout - clearing session cookies");
        const redirectTo = c.req.query("return") ?? "/";
        return c.redirect(redirectTo);
      } catch (error) {
        logger.error("Error during logout", error);

        // Always redirect somewhere even if logout fails
        const redirectTo = c.req.query("return") ?? "/";
        return c.redirect(redirectTo);
      }
    },
  )
  .post(
    "/switch-organization",
    describeRoute({
      description:
        "Switch to a different organization context within the same session",
      requestBody: {
        content: {
          "application/json": { schema: resolver(switchOrganizationRequest) },
        },
      },
      responses: {
        200: {
          description: "Successfully switched organization",
          content: {
            "application/json": {
              schema: resolver(switchOrganizationResponse),
            },
          },
        },
        401: {
          description: "No active session",
        },
        400: {
          description: "Failed to switch organization",
        },
      },
    }),
    async (c) => {
      const { workos, cookies, logger } = c.var;

      try {
        const { organizationId } = await c.req.json();
        const refreshToken = cookies.get("wos_refresh_token");

        if (!refreshToken) {
          return c.json({ error: "No active session" }, 401);
        }

        logger.info(`Switching to organization: ${organizationId}`);

        // Get new access token for the specific organization
        const { accessToken, refreshToken: newRefreshToken } =
          await workos.userManagement.authenticateWithRefreshToken({
            refreshToken,
            clientId: env("WORKOS_CLIENT_ID"),
            organizationId, // This will set the org context in the new token
          });

        // Update stored access token
        cookies.set("wos_access_token", accessToken, {
          path: "/",
          httpOnly: true,
          secure: env("NODE_ENV") === "production",
          sameSite: "lax",
        });

        // Update refresh token if it was rotated
        if (newRefreshToken) {
          cookies.set("wos_refresh_token", newRefreshToken, {
            path: "/",
            httpOnly: true,
            secure: env("NODE_ENV") === "production",
            sameSite: "lax",
          });
        }

        logger.info(`Successfully switched to organization: ${organizationId}`);
        return c.json({ success: true, organizationId });
      } catch (error) {
        logger.error("Failed to switch organization", error);
        return c.json(
          {
            error: "Failed to switch organization",
            message: error instanceof Error ? error.message : "Unknown error",
          },
          400,
        );
      }
    },
  )
  .get(
    "/me",
    describeRoute({
      description: "Get current user information from WorkOS session",
      responses: {
        200: {
          description: "Current user information",
          content: {
            "application/json": { schema: resolver(userResponse) },
          },
        },
        401: {
          description: "Not authenticated",
        },
      },
    }),
    async (c) => {
      const { logger } = c.var;

      try {
        // Use the getUser helper to get current user from WorkOS session
        const { getUser } = await import("./auth.helpers");
        const user = await getUser(c);

        if (!user) {
          return c.json({ error: "Not authenticated" }, 401);
        }

        logger.info(`Retrieved user info for: ${user.email}`);
        return c.json(user);
      } catch (error) {
        logger.error("Failed to get current user", error);
        return c.json({ error: "Failed to get user information" }, 500);
      }
    },
  );
