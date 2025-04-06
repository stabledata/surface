import { expect, test, describe, mock } from "bun:test";

import { app } from "../surface.app";
import { logger } from "../logger/logger";

describe("surface app tests", () => {
  const mockLogger = {
    ...logger,
    info: mock(() => null),
  } as unknown as typeof logger;

  test("assets resolve", async () => {
    const response = await app({ logger: mockLogger }).request(
      "/assets/surface.svg"
    );

    expect(response.status).toEqual(200);
  });

  test("assets may not resolve", async () => {
    const response = await app({ logger: mockLogger }).request(
      "/assets/not-found-1232.svg"
    );

    expect(response.status).toEqual(404);
  });

  test("renders html", async () => {
    const response = await app({ logger: mockLogger }).request("/");

    expect(response.status).toEqual(200);
    expect(response.headers.get("content-type")).toInclude("text/html");
  });

  test("redirects and sets cookie in auth", async () => {
    const response = await app({ logger: mockLogger }).request("/auth/login");
    expect(response.headers.getSetCookie()[0]).toBeDefined();
    expect(response.status).toEqual(302);
  });
});
