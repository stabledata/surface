import { expect, describe, mock, it } from "bun:test";

import { app } from "../surface.app";
import { logger } from "../logger/logger";

describe("members service tests", () => {
  const mockLogger = {
    log: mock(() => null),
    error: mock(() => null),
  } as unknown as typeof logger;

  it("returns members", async () => {
    const response = await app({ logger: mockLogger }).request("/members");
    const body = await response.json();
    expect(response.status).toEqual(200);
    expect(body.members.length).toBeGreaterThan(0);
  });
});
