import { expect, it, mock, describe, beforeEach, spyOn } from "bun:test";
import { getUser, hasSession, requireAuth } from "./auth.helpers";
import { SurfaceContext } from "../../surface.app.ctx";
import { WorkOS } from "@workos-inc/node";
import * as jose from "jose";

describe("auth helpers", () => {
  // Set up test environment variables
  process.env.WORKOS_CLIENT_ID = "client_test_123";

  const mockLogger = {
    error: mock(),
    info: mock(),
    debug: mock(),
  };

  const mockCookies = {
    get: mock(),
    set: mock(),
  };

  const mockJwt = {
    verify: mock(),
    sign: mock(),
  };

  const mockGetUser = mock();

  const mockWorkOS = {
    userManagement: {
      authenticateWithRefreshToken: mock(),
      getUser: mockGetUser,
    },
  } as unknown as WorkOS;

  const createMockContext = (overrides = {}): SurfaceContext => {
    return {
      var: {
        logger: mockLogger,
        cookies: mockCookies,
        jwt: mockJwt,
        workos: mockWorkOS,
        ...overrides,
      },
      req: {
        header: mock(),
      },
      json: mock(),
      set: mock(),
    } as unknown as SurfaceContext;
  };

  let jwtVerifySpy: any;

  beforeEach(() => {
    // Reset existing spy or create new one
    if (jwtVerifySpy) {
      jwtVerifySpy.mockClear();
    } else {
      jwtVerifySpy = spyOn(jose, "jwtVerify");
    }

    // Reset WorkOS API mocks
    mockGetUser.mockClear();
  });

  describe("getUser", () => {
    it("should return user from valid WorkOS access token", async () => {
      const mockPayload = {
        sub: "user_123",
        email: "john@example.com",
        given_name: "John",
        family_name: "Doe",
        name: "John Doe",
        picture: undefined,
        iat: 1234567890,
        exp: 1234567990,
        org_id: "org_123",
        role: "admin",
        permissions: ["read", "write"],
      };

      const context = createMockContext({
        cookies: {
          get: mock().mockReturnValue("valid.workos.access.token"),
          set: mock(),
        },
      });

      jwtVerifySpy.mockResolvedValue({ payload: mockPayload });

      // Mock WorkOS User Management API response
      mockGetUser.mockResolvedValue({
        id: "user_123",
        email: "john@example.com",
        firstName: "John",
        lastName: "Doe",
        profilePictureUrl: null,
      });

      const user = await getUser(context);

      expect(user).toEqual({
        id: "user_123",
        email: "john@example.com",
        given_name: "John",
        family_name: "Doe",
        name: "John Doe",
        picture: null,
        org_id: "org_123",
        role: "admin",
        permissions: ["read", "write"],
        // Legacy compatibility
        profilePicture: null,
        organizationId: "org_123",
        roles: ["read", "write"],
      });

      expect(context.var.cookies.get).toHaveBeenCalledWith("wos_access_token");
      expect(mockGetUser).toHaveBeenCalledWith("user_123");
    });

    it("should return undefined when no access token and refresh fails", async () => {
      const context = createMockContext({
        cookies: {
          get: mock().mockReturnValue(undefined),
          set: mock(),
        },
      });
      const user = await getUser(context);

      expect(user).toBeUndefined();
    });

    it("should attempt refresh when JWT verification fails", async () => {
      const mockGet = mock()
        .mockReturnValueOnce("invalid.access.token")
        .mockReturnValueOnce("valid.refresh.token")
        .mockReturnValueOnce(undefined); // No new access token after failed refresh

      const context = createMockContext({
        cookies: {
          get: mockGet,
          set: mock(),
        },
      });

      jwtVerifySpy.mockRejectedValue(new Error("Invalid token"));

      (
        mockWorkOS.userManagement.authenticateWithRefreshToken as any
      ).mockRejectedValue(new Error("Refresh failed"));
      const user = await getUser(context);

      expect(user).toBeUndefined();
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to refresh WorkOS tokens",
        expect.any(Error),
      );
    });
  });

  describe("hasSession", () => {
    it("should return JWT payload for valid WorkOS access token", async () => {
      const mockPayload = {
        sub: "user_123",
        email: "john@example.com",
        name: "John Doe",
        iat: 1234567890,
        exp: 1234567990,
      };

      const context = createMockContext({
        cookies: {
          get: mock().mockReturnValue("valid.workos.access.token"),
          set: mock(),
        },
      });

      jwtVerifySpy.mockResolvedValue({ payload: mockPayload });

      const session = await hasSession(context);

      expect(session).toEqual(mockPayload);
    });

    it("should return JWT payload for valid Bearer token", async () => {
      const mockPayload = {
        sub: "user_123",
        email: "john@example.com",
        name: "John Doe",
        iat: 1234567890,
        exp: 1234567990,
      };

      const context = createMockContext({
        cookies: {
          get: mock().mockReturnValue(undefined),
          set: mock(),
        },
      });
      context.req.header = mock().mockReturnValue(
        "Bearer valid.workos.access.token",
      );

      jwtVerifySpy.mockResolvedValue({ payload: mockPayload });

      const session = await hasSession(context);

      expect(session).toEqual(mockPayload);
      expect(context.req.header).toHaveBeenCalledWith("Authorization");
    });

    it("should return false when no token available", async () => {
      const context = createMockContext({
        cookies: {
          get: mock().mockReturnValue(undefined),
          set: mock(),
        },
      });
      context.req.header = mock().mockReturnValue(undefined);

      const session = await hasSession(context);

      expect(session).toBe(false);
    });

    it("should return false when JWT verification fails and refresh fails", async () => {
      const mockGet = mock()
        .mockReturnValueOnce("invalid.token")
        .mockReturnValueOnce("valid.refresh.token")
        .mockReturnValueOnce(undefined); // No new access token

      const context = createMockContext({
        cookies: {
          get: mockGet,
          set: mock(),
        },
      });

      jwtVerifySpy.mockRejectedValue(new Error("Invalid token"));

      (
        mockWorkOS.userManagement.authenticateWithRefreshToken as any
      ).mockRejectedValue(new Error("Refresh failed"));
      const session = await hasSession(context);

      expect(session).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to refresh WorkOS tokens",
        expect.any(Error),
      );
    });
  });

  describe("requireAuth", () => {
    it("should call next() for authenticated requests", async () => {
      const mockPayload = { sub: "user_123" };

      const context = createMockContext({
        cookies: {
          get: mock().mockReturnValue("valid.workos.access.token"),
          set: mock(),
        },
      });

      jwtVerifySpy.mockResolvedValue({ payload: mockPayload });

      const next = mock();

      await requireAuth(context, next);

      expect(next).toHaveBeenCalled();
      expect((context as any).session).toEqual(mockPayload);
    });

    it("should return 401 for unauthenticated requests", async () => {
      const context = createMockContext({
        cookies: {
          get: mock().mockReturnValue(undefined),
          set: mock(),
        },
      });
      context.req.header = mock().mockReturnValue(undefined);
      context.json = mock().mockReturnValue(new Response());

      const next = mock();

      await requireAuth(context, next);

      expect(next).not.toHaveBeenCalled();
      expect(context.json).toHaveBeenCalledWith(
        { error: "Authentication required" },
        401,
      );
    });
  });
});
