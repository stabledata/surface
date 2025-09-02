import { expect, it, mock, describe, beforeEach } from "bun:test";
import { getUser, hasSession, requireAuth } from "./auth.helpers";
import { SurfaceContext } from "../../surface.app.ctx";

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

  const createMockContext = (overrides = {}): SurfaceContext => {
    return {
      var: {
        logger: mockLogger,
        cookies: mockCookies,
        jwt: mockJwt,
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
    mockLogger.error.mockClear();
    mockLogger.info.mockClear();
    mockCookies.get.mockClear();
    mockCookies.set.mockClear();
    mockJwt.verify.mockClear();
    mockJwt.sign.mockClear();
  });

  describe("getUser", () => {
    it("should return user from valid session token", async () => {
      const mockPayload = {
        sub: "user_123",
        email: "john@example.com",
        name: "John Doe",
        iat: 1234567890,
        exp: 1234567990,
      };

      mockCookies.get.mockReturnValue("valid.jwt.token");
      mockJwt.verify.mockResolvedValue(mockPayload);

      const context = createMockContext();
      const user = await getUser(context);

      expect(user).toEqual({
        id: "user_123",
        name: "John Doe",
        email: "john@example.com",
        roles: [],
        profilePicture: undefined,
      });

      expect(mockCookies.get).toHaveBeenCalledWith("session");
      expect(mockJwt.verify).toHaveBeenCalledWith(
        "valid.jwt.token",
        "sup4h.secr1t.jwt.🔑",
      );
    });

    it("should return undefined when no session token", async () => {
      mockCookies.get.mockReturnValue(undefined);

      const context = createMockContext();
      const user = await getUser(context);

      expect(user).toBeUndefined();
      expect(mockJwt.verify).not.toHaveBeenCalled();
    });

    it("should return undefined when JWT verification fails", async () => {
      mockCookies.get.mockReturnValue("invalid.jwt.token");
      mockJwt.verify.mockRejectedValue(new Error("Invalid token"));

      const context = createMockContext();
      const user = await getUser(context);

      expect(user).toBeUndefined();
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to get user from session",
        expect.any(Error),
      );
    });
  });

  describe("hasSession", () => {
    it("should return JWT payload for valid session cookie", async () => {
      const mockPayload = {
        sub: "user_123",
        email: "john@example.com",
        name: "John Doe",
        iat: 1234567890,
        exp: 1234567990,
      };

      mockCookies.get.mockReturnValue("valid.jwt.token");
      mockJwt.verify.mockResolvedValue(mockPayload);

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

      mockCookies.get.mockReturnValue(undefined);

      const context = createMockContext();
      context.req.header = mock().mockReturnValue("Bearer valid.jwt.token");

      mockJwt.verify.mockResolvedValue(mockPayload);

      const session = await hasSession(context);

      expect(session).toEqual(mockPayload);
      expect(context.req.header).toHaveBeenCalledWith("Authorization");
    });

    it("should return false when no token available", async () => {
      mockCookies.get.mockReturnValue(undefined);

      const context = createMockContext();
      context.req.header = mock().mockReturnValue(undefined);

      const session = await hasSession(context);

      expect(session).toBe(false);
    });

    it("should return false when JWT verification fails", async () => {
      mockCookies.get.mockReturnValue("invalid.token");
      mockJwt.verify.mockRejectedValue(new Error("Invalid token"));

      const context = createMockContext();
      const session = await hasSession(context);

      expect(session).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        "No valid session was found",
        expect.any(Error),
      );
    });
  });

  describe("requireAuth", () => {
    it("should call next() for authenticated requests", async () => {
      const mockPayload = { sub: "user_123" };
      mockCookies.get.mockReturnValue("valid.token");
      mockJwt.verify.mockResolvedValue(mockPayload);

      const context = createMockContext();
      const next = mock();

      await requireAuth(context, next);

      expect(next).toHaveBeenCalled();
      expect((context as any).session).toEqual(mockPayload);
    });

    it("should return 401 for unauthenticated requests", async () => {
      mockCookies.get.mockReturnValue(undefined);

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
