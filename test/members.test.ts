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
      return { members: [{ name: "Alice" }, { name: "Bob" }] };
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

  // these are the types of tests we _want_ to run
  // ... but more setup is needed for fake auth etc.
  // alas, we cannot do this yet... maybe in the future.
  // we can still test api endpoints and markup though
  it.skip("responds with error status", async () => {
    const noUserCookies = {
      get: mock(() => ""),
    } as unknown as ReturnType<typeof cookies>;

    const response = await app({
      //logger: mockLogger,
      cookies: noUserCookies,
    }).request("/members");
    expect(response.status).not.toBe(200);
  });

  it.skip("returns members in HTML", async () => {
    const response = await app({
      logger: mockLogger,
      cookies: mockCookies,
      memberServiceClient: mockMembersClient,
    }).request("/members");
    const body = await response.text();
    expect(body).toInclude("Bob");
    expect(body).toInclude("Alice");
  });
});
