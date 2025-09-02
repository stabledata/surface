import { expect, describe, mock, it, beforeEach } from "bun:test";
import {
  applyContext,
  cookies,
  Dependencies,
  SurfaceEnv,
} from "../../surface.app.ctx";
import { logger } from "../../logger/logger";
import { members } from "./members.endpoints";
import { Hono } from "hono";
import { User } from "../auth/auth.endpoints";
import * as jose from "jose";

describe("members endpoint tests", () => {
  const mockLogger = {
    log: mock(() => null),
    error: mock(() => null),
    info: mock(() => null),
  } as unknown as typeof logger;

  const mockCookies = {
    get: mock(() => "valid.workos.access.token"),
    set: mock(),
  } as unknown as ReturnType<typeof cookies>;

  const mockJwt = {
    verify: mock(() =>
      Promise.resolve({ sub: "user_123", email: "test@example.com" }),
    ),
    sign: mock(() => Promise.resolve("token")),
  };

  const mockWorkOS = {
    userManagement: {
      authenticateWithRefreshToken: mock(),
    },
  };

  // Create mocks with correct return types to avoid type errors
  const getMembersMock = mock<() => Promise<User[] | Response>>();
  const getMemberMock = mock<() => Promise<User | null>>();

  const fakeUser: User = {
    id: "123",
    name: "Alice",
    email: "alice@domain.com",
    roles: ["admin"],
    profilePicture:
      "https://plus.unsplash.com/premium_photo-1672201106204-58e9af7a2888?q=80&w=80",
  };

  // Set default implementation
  getMembersMock.mockImplementation(() => Promise.resolve([fakeUser]));
  getMemberMock.mockImplementation(() => Promise.resolve(fakeUser));

  const mockMemberServiceClient = {
    getMembers: getMembersMock,
    getMember: getMemberMock,
  } as unknown as Dependencies["memberServiceClient"];

  const testApp = new Hono<SurfaceEnv>()
    .use(
      applyContext({
        logger: mockLogger,
        memberServiceClient: mockMemberServiceClient,
        cookies: mockCookies,
        jwt: mockJwt as any,
        workos: mockWorkOS as any,
      }),
    )
    .route("/api/members", members);

  beforeEach(() => {
    // Mock jose.jwtVerify to simulate valid WorkOS token
    const mockPayload = {
      sub: "user_123",
      email: "test@example.com",
      name: "Test User",
      iat: Date.now() / 1000,
      exp: Date.now() / 1000 + 3600,
    };

    (jose as any).jwtVerify = mock(() =>
      Promise.resolve({ payload: mockPayload }),
    );
  });

  it("returns members from api", async () => {
    // the mock service method delays for a second for UI, skipping this.
    const response = await testApp.request("/api/members");
    const body = await response.json();

    expect(body.members.length).toBeGreaterThan(0);
  });
});
