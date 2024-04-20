import { expect, describe, mock, it } from "bun:test";
import { app } from "../surface.app";
import { logger } from "../logger/logger";
import { cookies } from "../cookies/cookies";
import { ServiceContext } from "../surface.app.ctx";

describe("members service tests", () => {
  const mockLogger = {
    log: mock(() => null),
    error: mock(() => null),
  } as unknown as typeof logger;

  const mockCookies = {
    get: mock(() => "fake-session"),
  } as unknown as ReturnType<typeof cookies>;

  const mockRpcClient = {
    api: {
      members: {
        ":id": {
          $get: mock(),
        },
        $get: mock(),
      },
    },
  };

  it("returns members from api", async () => {
    // the mock service method delays for a second for UI, skipping this.
    const response = await app({
      // logger: mockLogger,
      cookies: mockCookies,
    }).request("/api/members");
    const body = await response.json();
    expect(body.members.length).toBeGreaterThan(0);
  });

  it("renders members in HTML", async () => {
    const mockMembers = { members: [{ name: "Charlie", id: "363" }] };
    mockRpcClient.api.members.$get.mockResolvedValue(
      new Response(JSON.stringify(mockMembers))
    );
    const response = await app({
      logger: mockLogger,
      cookies: mockCookies,
      rpcClientMock:
        mockRpcClient as unknown as ServiceContext["rpcClientMock"],
    }).request("/members");
    const body = await response.text();
    expect(body).toInclude("Charlie");
  });

  it("renders members in HTML", async () => {
    mockRpcClient.api.members.$get.mockRejectedValue(new Error("test"));

    const response = await app({
      logger: mockLogger,
      cookies: mockCookies,
      rpcClientMock:
        mockRpcClient as unknown as ServiceContext["rpcClientMock"],
    }).request("/members");
    const body = await response.text();
    expect(body).toInclude("Error");
  });
});
