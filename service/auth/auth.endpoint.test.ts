import { expect, it, mock, describe, beforeEach } from "bun:test";
import { Hono } from "hono";
import { sessions } from "./auth.endpoints";
import { applyContext, SurfaceEnv } from "../../surface.app.ctx";
import { logger } from "../../logger/logger";
import { WorkOS } from "@workos-inc/node";
import { errorHandler } from "../../handlers/error.handler";

describe("auth endpoints", () => {
  // Mock logger
  const mockLogger = {
    ...logger,
    info: mock(() => null),
    error: mock(() => null),
  } as unknown as typeof logger;

  // Mock functions for WorkOS
  const mockGetAuthorizationURL = mock();
  const mockAuthenticateWithCode = mock();
  const mockAuthenticateWithRefreshToken = mock();
  const mockGetLogoutUrl = mock();

  // Mock WorkOS
  const mockWorkOS = {
    userManagement: {
      getAuthorizationUrl: mockGetAuthorizationURL,
      authenticateWithCode: mockAuthenticateWithCode,
      authenticateWithRefreshToken: mockAuthenticateWithRefreshToken,
      getLogoutUrl: mockGetLogoutUrl,
    },
  } as unknown as WorkOS;

  // Mock cookies
  const mockCookies = {
    get: mock(),
    set: mock(),
  };

  // Mock JWT
  const mockJwt = {
    sign: mock(),
    verify: mock(),
  };

  let testApp: Hono<SurfaceEnv>;

  beforeEach(() => {
    // Reset all mocks
    (mockLogger.info as any).mockClear?.();
    (mockLogger.error as any).mockClear?.();
    (mockCookies.get as any).mockClear?.();
    (mockCookies.set as any).mockClear?.();
    mockGetAuthorizationURL.mockClear?.();
    mockAuthenticateWithCode.mockClear?.();
    mockAuthenticateWithRefreshToken.mockClear?.();
    mockGetLogoutUrl.mockClear?.();
    (mockJwt.sign as any).mockClear?.();
    (mockJwt.verify as any).mockClear?.();

    testApp = new Hono<SurfaceEnv>()
      .use(
        applyContext({
          logger: mockLogger,
          cookies: mockCookies,
          workos: mockWorkOS,
          jwt: mockJwt as any,
        }),
      )
      .route("/", sessions)
      .onError(errorHandler);
  });

  describe("GET /login", () => {
    it("should redirect to WorkOS authorization URL", async () => {
      const mockAuthUrl =
        "https://api.workos.com/sso/authorize?response_type=code&client_id=test&redirect_uri=http://localhost:4000/api/auth/callback";

      mockGetAuthorizationURL.mockReturnValue(mockAuthUrl);

      const response = await testApp.request("/login");

      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe(mockAuthUrl);
      expect(mockGetAuthorizationURL).toHaveBeenCalledWith({
        provider: "authkit",
        redirectUri: "http://localhost:4000/api/auth/callback",
        clientId: "client_01HRQ08WC5PECTJJFEVW410MC5",
        state: "/",
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Redirecting to WorkOS authorization URL",
      );
    });

    it("should use return query parameter as state", async () => {
      const mockAuthUrl = "https://api.workos.com/sso/authorize";
      mockGetAuthorizationURL.mockReturnValue(mockAuthUrl);

      await testApp.request("/login?return=/dashboard");

      expect(mockGetAuthorizationURL).toHaveBeenCalledWith({
        provider: "authkit",
        redirectUri: "http://localhost:4000/api/auth/callback",
        clientId: "client_01HRQ08WC5PECTJJFEVW410MC5",
        state: "/dashboard",
      });
    });

    it("should return JSON for test requests", async () => {
      const mockAuthUrl = "https://api.workos.com/sso/authorize";
      mockGetAuthorizationURL.mockReturnValue(mockAuthUrl);

      const response = await testApp.request("/login?test=true");
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({ redirectUrl: mockAuthUrl });
    });

    it("should handle WorkOS errors", async () => {
      mockGetAuthorizationURL.mockImplementation(() => {
        throw new Error("WorkOS error");
      });

      const response = await testApp.request("/login");

      expect(response.status).toBe(401);
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to create WorkOS authorization URL",
        expect.any(Error),
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Authentication error: Authentication initialization failed",
        expect.any(Error),
      );
    });
  });

  describe("GET /callback", () => {
    const mockUser = {
      id: "user_123",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      profilePictureUrl: "https://example.com/avatar.jpg",
    };

    beforeEach(() => {
      mockAuthenticateWithCode.mockResolvedValue({
        user: mockUser,
        accessToken: "mock.workos.access.token",
        refreshToken: "mock.workos.refresh.token",
      });
    });

    it("should authenticate user and create session", async () => {
      const response = await testApp.request(
        "/callback?code=auth_code_123&state=/dashboard",
      );

      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe("/dashboard");

      expect(mockAuthenticateWithCode).toHaveBeenCalledWith({
        code: "auth_code_123",
        clientId: "client_01HRQ08WC5PECTJJFEVW410MC5",
      });

      expect(mockCookies.set).toHaveBeenCalledWith(
        "wos_access_token",
        "mock.workos.access.token",
        {
          path: "/",
          httpOnly: true,
          secure: false, // development mode
          sameSite: "lax",
        },
      );

      expect(mockCookies.set).toHaveBeenCalledWith(
        "wos_refresh_token",
        "mock.workos.refresh.token",
        {
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "lax",
        },
      );

      expect(mockCookies.set).toHaveBeenCalledWith("user_id", "user_123", {
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        "User john.doe@example.com authenticated successfully with WorkOS session",
      );
    });

    it("should redirect to home page when no state provided", async () => {
      const response = await testApp.request("/callback?code=auth_code_123");

      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe("/");
    });

    it("should handle missing authorization code", async () => {
      const response = await testApp.request("/callback");

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe("Authentication failed");
      expect(body.code).toBe("MISSING_CODE");
      expect(mockLogger.error).toHaveBeenCalledWith(
        "No authorization code provided in callback",
      );
    });

    it("should handle WorkOS authentication failure", async () => {
      mockAuthenticateWithCode.mockRejectedValue(new Error("Invalid code"));

      const response = await testApp.request("/callback?code=invalid_code");

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe("Authentication failed");
      expect(body.code).toBe("AUTH_FAILED");
      expect(mockLogger.error).toHaveBeenCalledWith(
        "WorkOS authentication failed",
        expect.any(Error),
      );
    });

    it("should handle user with only email (no first/last name)", async () => {
      const userWithoutName = {
        ...mockUser,
        firstName: null,
        lastName: null,
      };

      mockAuthenticateWithCode.mockResolvedValue({
        user: userWithoutName,
        accessToken: "mock.workos.access.token",
        refreshToken: "mock.workos.refresh.token",
      });

      const response = await testApp.request("/callback?code=auth_code_123");

      expect(response.status).toBe(302);
      expect(mockCookies.set).toHaveBeenCalledWith(
        "wos_access_token",
        "mock.workos.access.token",
        {
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "lax",
        },
      );
    });
  });

  describe("GET /logout", () => {
    it("should clear cookies and redirect", async () => {
      const response = await testApp.request("/logout?return=/login");

      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe("/login");

      expect(mockCookies.set).toHaveBeenCalledWith("wos_access_token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0),
      });

      expect(mockCookies.set).toHaveBeenCalledWith("wos_refresh_token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0),
      });

      expect(mockCookies.set).toHaveBeenCalledWith("user_id", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0),
      });

      expect(mockLogger.info).toHaveBeenCalledWith("User logging out");
    });

    it("should redirect to home page by default", async () => {
      const response = await testApp.request("/logout");

      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe("/");
    });

    it("should return JSON for test requests", async () => {
      const response = await testApp.request("/logout?test=true");
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({ message: "Logged out successfully" });
    });

    it("should redirect to WorkOS logout URL when access token is present", async () => {
      // Mock getting an access token
      (mockCookies.get as any).mockReturnValueOnce("mock.workos.access.token");

      // Mock WorkOS getLogoutUrl
      mockGetLogoutUrl.mockReturnValue(
        "https://api.workos.com/sso/logout?session_id=test_session",
      );

      const response = await testApp.request("/logout");

      expect(response.status).toBe(302);
    });
  });

  describe("POST /switch-organization", () => {
    beforeEach(() => {
      const updatedMockUser = {
        id: "user_123",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        profilePictureURL: "https://example.com/avatar.jpg",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
        emailVerified: true,
      };

      mockAuthenticateWithRefreshToken.mockResolvedValue({
        user: updatedMockUser,
        organizationId: "org_123",
        accessToken: "new_access_token_123",
        refreshToken: "new_refresh_token_123",
      });
    });

    it("should switch organization successfully", async () => {
      (mockCookies.get as any).mockReturnValueOnce("valid.refresh.token");

      const response = await testApp.request("/switch-organization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: "org_123" }),
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({ success: true, organizationId: "org_123" });

      expect(mockAuthenticateWithRefreshToken).toHaveBeenCalledWith({
        refreshToken: "valid.refresh.token",
        clientId: "client_01HRQ08WC5PECTJJFEVW410MC5",
        organizationId: "org_123",
      });
    });

    it("should return 401 when no refresh token", async () => {
      (mockCookies.get as any).mockReturnValueOnce(undefined);

      const response = await testApp.request("/switch-organization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: "org_123" }),
      });

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe("No active session");
    });

    it("should handle WorkOS errors", async () => {
      (mockCookies.get as any).mockReturnValueOnce("valid.refresh.token");
      mockAuthenticateWithRefreshToken.mockRejectedValue(
        new Error("Organization not accessible"),
      );

      const response = await testApp.request("/switch-organization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: "invalid_org" }),
      });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("Failed to switch organization");
    });
  });
});
