import { expect, it, mock, describe } from "bun:test";

import { ping } from "../handlers/ping.handler";
import { logger } from "../logger/logger";
import { Hono } from "hono";
import { applyContext, Env } from "../surface.app.ctx";

describe("ping handler", () => {
  // Create a proper mock logger that extends the real logger
  const mockLogger = {
    ...logger, // Include all properties from the original logger
    info: mock().mockImplementation(() => null),
    error: mock().mockImplementation(() => null),
  } as unknown as typeof logger;

  const test = new Hono<Env>()
    .use(applyContext({ logger: mockLogger }))
    .route("/", ping);
  it("pings", async () => {
    // Create test app with the MOCK logger, not the real one

    const response = await test.request("/");
    const body = await response.json();
    expect(response.status).toEqual(200);
    expect(body.message).toEqual("pong");

    // Verify the mock was called
    expect(mockLogger.info).toHaveBeenCalled();
  });

  it("custom errors", async () => {
    const response = await test.request("/err");
    expect(response.status).toEqual(418);
    expect(await response.text()).toBe("oh noes");
    expect(mockLogger.error).toHaveBeenCalled();
  });
});
