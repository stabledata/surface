import { expect, it, mock } from "bun:test";

import { pingRouteHandler as app } from "../handlers/ping.handler";
import { logger } from "../logger/logger";

it("pings", async () => {
  const mockLogger = {
    ...logger,
    log: mock().mockImplementation((m) =>
      console.log(`mock override capture log ${m}`)
    ),
  } as unknown as typeof logger;

  const response = await app({ logger: mockLogger }).request("/");
  const body = await response.json();
  expect(response.status).toEqual(200);
  expect(body.message).toEqual("pong");
  expect(mockLogger.log).toHaveBeenCalled();
});
