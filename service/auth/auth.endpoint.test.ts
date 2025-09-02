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
    info: mock().mockImplementation(() => null),
    error: mock().mockImplementation(() => null),
  } as unknown as typeof logger;

  // Mock WorkOS
  const mockWorkOS = {
    userManagement: {
      getAuthorizationUrl: mock(),
      authenticateWithCode: mock(),
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
    // Reset all mocks without restoring them
    mockLogger.info.mockClear();
    mockLogger.error.mockClear();
    mockCookies.get.mockClear();
    mockCookies.set.mockClear();
    mockWorkOS.userManagement.getAuthorizationUrl.mockClear();
    mockWorkOS.userManagement.authenticateWithCode.mockClear();
    mockJwt.sign.mockClear();
    mockJwt.verify.mockClear();

    testApp = new Hono<SurfaceEnv>()
      .use(
        applyContext({
          logger: mockLogger,
          cookies: mockCookies,
          workos: mockWorkOS,
          jwt: mockJwt,
        }),
      )
      .route("/", sessions)
      .onError(errorHandler);
  });

  describe("GET /login", () => {
    it("should redirect to WorkOS authorization URL", async () => {
      const mockAuthUrl =
        "https://api.workos.com/sso/authorize?response_type=code&client_id=test&redirect_uri=http://localhost:4000/api/auth/callback";

      mockWorkOS.userManagement.getAuthorizationUrl.mockReturnValue(
        mockAuthUrl,
      );

      const response = await testApp.request("/login");

      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe(mockAuthUrl);
      expect(
        mockWorkOS.userManagement.getAuthorizationUrl,
      ).toHaveBeenCalledWith({
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
      mockWorkOS.userManagement.getAuthorizationUrl.mockReturnValue(
        mockAuthUrl,
      );

      await testApp.request("/login?return=/dashboard");

      expect(
        mockWorkOS.userManagement.getAuthorizationUrl,
      ).toHaveBeenCalledWith({
        provider: "authkit",
        redirectUri: "http://localhost:4000/api/auth/callback",
        clientId: "client_01HRQ08WC5PECTJJFEVW410MC5",
        state: "/dashboard",
      });
    });

    it("should return JSON for test requests", async () => {
      const mockAuthUrl = "https://api.workos.com/sso/authorize";
      mockWorkOS.userManagement.getAuthorizationUrl.mockReturnValue(
        mockAuthUrl,
      );

      const response = await testApp.request("/login?test=true");
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({ redirectUrl: mockAuthUrl });
    });

    it("should handle WorkOS errors", async () => {
      mockWorkOS.userManagement.getAuthorizationUrl.mockImplementation(() => {
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
      mockWorkOS.userManagement.authenticateWithCode.mockResolvedValue({
        user: mockUser,
      });
      mockJwt.sign.mockResolvedValue("mock.jwt.token");
    });

    it("should authenticate user and create session", async () => {
      const response = await testApp.request(
        "/callback?code=auth_code_123&state=/dashboard",
      );

      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe("/dashboard");

      expect(
        mockWorkOS.userManagement.authenticateWithCode,
      ).toHaveBeenCalledWith({
        code: "auth_code_123",
        clientId: "client_01HRQ08WC5PECTJJFEVW410MC5",
      });

      expect(mockCookies.set).toHaveBeenCalledWith("user_id", "user_123", {
        path: "/",
        httpOnly: true,
        secure: false, // development mode
        sameSite: "lax",
      });

      expect(mockJwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: "user_123",
          email: "john.doe@example.com",
          name: "John Doe",
        }),
        "sup4h.secr1t.jwt.🔑",
      );

      expect(mockCookies.set).toHaveBeenCalledWith(
        "session",
        "mock.jwt.token",
        {
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "lax",
        },
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        "User john.doe@example.com authenticated successfully",
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
      mockWorkOS.userManagement.authenticateWithCode.mockRejectedValue(
        new Error("Invalid code"),
      );

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

      mockWorkOS.userManagement.authenticateWithCode.mockResolvedValue({
        user: userWithoutName,
      });

      const response = await testApp.request("/callback?code=auth_code_123");

      expect(mockJwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "john.doe@example.com", // Should fallback to email
        }),
        expect.any(String),
      );
    });
  });

  describe("GET /logout", () => {
    it("should clear cookies and redirect", async () => {
      const response = await testApp.request("/logout?return=/login");

      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe("/login");

      expect(mockCookies.set).toHaveBeenCalledWith("user_id", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0),
      });

      expect(mockCookies.set).toHaveBeenCalledWith("session", "", {
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
  });
});
