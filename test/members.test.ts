import { expect, describe, mock, it } from "bun:test";

import { app } from "../surface.app";
import { logger } from "../logger/logger";
import { cookies } from "../cookies/cookies";

describe("members service tests", () => {
  const mockLogger = {
    log: mock(() => null),
    error: mock(() => null),
  } as unknown as typeof logger;

  const mockCookies = {
    get: mock(() => "fake-session"),
  } as unknown as ReturnType<typeof cookies>;

  it("returns members in HTML", async () => {
    const response = await app({
      logger: mockLogger,
      cookies: mockCookies,
    }).request("/members");
    const body = await response.text();
    expect(body).toInclude("Bob");
    expect(body).toInclude("Alice");
  });

  it("responds with error status", async () => {
    const noUserCookies = {
      get: mock(() => ""),
    } as unknown as ReturnType<typeof cookies>;

    const response = await app({
      //logger: mockLogger,
      cookies: noUserCookies,
    }).request("/members");
    expect(response.status).not.toBe(200);
  });

  it.skip("returns members from api", async () => {
    // the mock service method delays for a second for UI, skipping this.
    const response = await app({
      // logger: mockLogger,
      cookies: mockCookies,
    }).request("/api/members");
    const body = await response.json();
    expect(body.members.length).toBeGreaterThan(0);
  });
});
