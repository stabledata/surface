import { expect, it, mock, describe } from "bun:test";

import { ping } from "../handlers/ping.handler";
import { logger } from "../logger/logger";
import { Hono } from "hono";
import { applyContext, SurfaceEnv } from "../surface.app.ctx";
import { errorHandler } from "./error.handlers";

describe("ping handler", () => {
  // Create a proper mock logger that extends the real logger
  const mockLogger = {
    ...logger, // Include all properties from the original logger
    info: mock().mockImplementation(() => null),
    error: mock().mockImplementation(() => null),
  } as unknown as typeof logger;

  const test = new Hono<SurfaceEnv>()
    .use(applyContext({ logger: mockLogger }))
    .onError(errorHandler)
    .route("/", ping);

  it("pings", async () => {
    const response = await test.request("/");
    const body = await response.json();

    expect(response.status).toEqual(200);
    expect(body.message).toEqual("pong");
    expect(mockLogger.info).toHaveBeenCalled();
  });

  it("custom errors", async () => {
    const response = await test.request("/err");

    expect(response.status).toEqual(418);
    expect(await response.text()).toBe("oh noes");
    expect(mockLogger.error).toHaveBeenCalled();
  });
});
