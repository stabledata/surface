import { expect, describe, mock, it } from "bun:test";
import {
  applyContext,
  cookies,
  Dependencies,
  SurfaceEnv,
} from "../surface.app.ctx";
import { logger } from "../logger/logger";
import { members } from "./members.handlers";
import { Hono } from "hono";
import { fakeUser, User } from "./auth.handlers";

describe("members handler tests", () => {
  const mockLogger = {
    log: mock(() => null),
    error: mock(() => null),
    info: mock(() => null),
  } as unknown as typeof logger;

  const mockCookies = {
    get: mock(() => "fake-session"),
  } as unknown as ReturnType<typeof cookies>;

  // Create mocks with correct return types to avoid type errors
  const getMembersMock = mock<() => Promise<User[] | Response>>();
  const getMemberMock = mock<() => Promise<User | null>>();

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
      })
    )
    .route("/api/members", members);

  it("returns members from api", async () => {
    // the mock service method delays for a second for UI, skipping this.
    const response = await testApp.request("/api/members");
    const body = await response.json();

    expect(body.members.length).toBeGreaterThan(0);
  });

  // TODO: These are SSR but put in the same test,
  // so, we should split them out or maybe always provide
  // the view route handler in tests tests
  it.skip("renders members in HTML", async () => {
    const mockMembers = { members: [{ name: "Charlie", id: "363" }] };
    getMembersMock.mockResolvedValue(new Response(JSON.stringify(mockMembers)));
    const response = await testApp.request("/members");
    const body = await response.text();
    expect(body).toInclude("Charlie");
  });

  it.skip("renders members in HTML", async () => {
    getMembersMock.mockRejectedValue(new Error("test"));

    const response = await testApp.request("/api/members");
    const body = await response.text();
    expect(body).toInclude("Error");
  });
});
