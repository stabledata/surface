import { expect, describe, mock, it } from "bun:test";

import { app } from "../surface.app";
import { logger } from "../logger/logger";
import { cookies } from "../cookies/cookies";
import { memberServiceClient } from "../services/members.service";

describe("members service tests", () => {
  const mockLogger = {
    log: mock(() => null),
    error: mock(() => null),
  } as unknown as typeof logger;

  const mockCookies = {
    get: mock(() => "fake-session"),
  } as unknown as ReturnType<typeof cookies>;

  const mockMembersClient = {
    getMembers: mock(() => {
      return [{ name: "Alice" }, { name: "Bob" }];
    }),
  } as unknown as typeof memberServiceClient;

  it("returns members from api", async () => {
    // the mock service method delays for a second for UI, skipping this.
    const response = await app({
      // logger: mockLogger,
      cookies: mockCookies,
      memberServiceClient: mockMembersClient,
    }).request("/api/members");
    const body = await response.json();
    expect(body.members.length).toBeGreaterThan(0);
  });

  // NOTE: For end to end HTML assertions SSR tests,
  // you have to have run
  // "docker compose test up"
  it("renders members in HTML", async () => {
    const response = await app({
      logger: mockLogger,
      cookies: mockCookies,
      memberServiceClient: mockMembersClient,
    }).request("/members");
    const body = await response.text();
    expect(body).toInclude("Bob");
    expect(body).toInclude("Alice");
  });

  it("renders members in HTML", async () => {
    const sadMembersService = {
      getMembers: mock(() => {
        throw new Error("sad");
      }),
    } as unknown as typeof memberServiceClient;

    const response = await app({
      logger: mockLogger,
      cookies: mockCookies,
      memberServiceClient: sadMembersService,
    }).request("/members");
    const body = await response.text();
    expect(body).toInclude("Error");
  });
});
