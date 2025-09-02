import { expect, it, mock, describe, beforeEach } from "bun:test";
import { getUser, hasSession, requireAuth } from "./auth.helpers";
import { SurfaceContext } from "../../surface.app.ctx";
import { WorkOS } from "@workos-inc/node";
import * as jose from "jose";

describe("auth helpers", () => {
  const mockLogger = {
    error: mock(),
    info: mock(),
  };

  const mockCookies = {
    get: mock(),
    set: mock(),
  };

  const mockJwt = {
    verify: mock(),
    sign: mock(),
  };

  const mockWorkOS = {
    userManagement: {
      authenticateWithRefreshToken: mock(),
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

  beforeEach(() => {
    // Reset all mocks without restoring them
    (mockLogger.error as any).mockClear?.();
    (mockLogger.info as any).mockClear?.();
    (mockCookies.get as any).mockClear?.();
    (mockCookies.set as any).mockClear?.();
    (mockJwt.verify as any).mockClear?.();
    (mockJwt.sign as any).mockClear?.();
  });

  describe("getUser", () => {
    it("should return user from valid WorkOS access token", async () => {
      const mockPayload = {
        sub: "user_123",
        email: "john@example.com",
        name: "John Doe",
        iat: 1234567890,
        exp: 1234567990,
        org_id: "org_123",
        role: "admin",
        permissions: ["read", "write"],
      };

      (mockCookies.get as any).mockReturnValue("valid.workos.access.token");

      // Mock jose.jwtVerify
      const mockJwtVerify = mock(() =>
        Promise.resolve({ payload: mockPayload }),
      );
      (jose as any).jwtVerify = mockJwtVerify;

      const context = createMockContext();
      const user = await getUser(context);

      expect(user).toEqual({
        id: "user_123",
        name: "John Doe",
        email: "john@example.com",
        roles: [],
        profilePicture: undefined,
        organizationId: "org_123",
        role: "admin",
        permissions: ["read", "write"],
      });

      expect(mockCookies.get).toHaveBeenCalledWith("wos_access_token");
    });

    it("should return undefined when no access token and refresh fails", async () => {
      (mockCookies.get as any).mockReturnValue(undefined);

      const context = createMockContext();
      const user = await getUser(context);

      expect(user).toBeUndefined();
    });

    it("should attempt refresh when JWT verification fails", async () => {
      (mockCookies.get as any)
        .mockReturnValueOnce("invalid.access.token")
        .mockReturnValueOnce("valid.refresh.token")
        .mockReturnValueOnce(undefined); // No new access token after failed refresh

      const mockJwtVerify = mock(() =>
        Promise.reject(new Error("Invalid token")),
      );
      (jose as any).jwtVerify = mockJwtVerify;

      (
        mockWorkOS.userManagement.authenticateWithRefreshToken as any
      ).mockRejectedValue(new Error("Refresh failed"));

      const context = createMockContext();
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

      (mockCookies.get as any).mockReturnValue("valid.workos.access.token");

      const mockJwtVerify = mock(() =>
        Promise.resolve({ payload: mockPayload }),
      );
      (jose as any).jwtVerify = mockJwtVerify;

      const context = createMockContext();
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

      (mockCookies.get as any).mockReturnValue(undefined);

      const context = createMockContext();
      context.req.header = mock().mockReturnValue(
        "Bearer valid.workos.access.token",
      );

      const mockJwtVerify = mock(() =>
        Promise.resolve({ payload: mockPayload }),
      );
      (jose as any).jwtVerify = mockJwtVerify;

      const session = await hasSession(context);

      expect(session).toEqual(mockPayload);
      expect(context.req.header).toHaveBeenCalledWith("Authorization");
    });

    it("should return false when no token available", async () => {
      (mockCookies.get as any).mockReturnValue(undefined);

      const context = createMockContext();
      context.req.header = mock().mockReturnValue(undefined);

      const session = await hasSession(context);

      expect(session).toBe(false);
    });

    it("should return false when JWT verification fails and refresh fails", async () => {
      (mockCookies.get as any)
        .mockReturnValueOnce("invalid.token")
        .mockReturnValueOnce("valid.refresh.token")
        .mockReturnValueOnce(undefined); // No new access token

      const mockJwtVerify = mock(() =>
        Promise.reject(new Error("Invalid token")),
      );
      (jose as any).jwtVerify = mockJwtVerify;

      (
        mockWorkOS.userManagement.authenticateWithRefreshToken as any
      ).mockRejectedValue(new Error("Refresh failed"));

      const context = createMockContext();
      const session = await hasSession(context);

      expect(session).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        "No valid WorkOS session found",
        expect.any(Error),
      );
    });
  });

  describe("requireAuth", () => {
    it("should call next() for authenticated requests", async () => {
      const mockPayload = { sub: "user_123" };
      (mockCookies.get as any).mockReturnValue("valid.workos.access.token");

      const mockJwtVerify = mock(() =>
        Promise.resolve({ payload: mockPayload }),
      );
      (jose as any).jwtVerify = mockJwtVerify;

      const context = createMockContext();
      const next = mock();

      await requireAuth(context, next);

      expect(next).toHaveBeenCalled();
      expect((context as any).session).toEqual(mockPayload);
    });

    it("should return 401 for unauthenticated requests", async () => {
      (mockCookies.get as any).mockReturnValue(undefined);

      const context = createMockContext();
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
