# Surface

This is a hono service that can serve React based front end code and provides a development environment via `@hono/vite-dev-server`.

Front-end routes are handled with Tanstack Router. Back-end routes are handled by Hono.

## Context, Dependnecies & Injection

App context `surface.app.ctx.ts` provides a simple injection pattern using hono's `var` which is typed by adding the library to `Dependencies`. Endpoints can then consume dependnecies like this:

```ts
new Hono<SurfaceEnv>()
  .get("/some-route", , async (c) => {
    const { cookies, jwt, someInjectedLibrary } = c.var;
    // .. do stuff

  })
```

The `applyContext` can be re-used in tests to inject mocks into the endpoints:

```ts

import { ping } from "./ping.endpoints";

const test = new Hono<SurfaceEnv>()
    .use(applyContext({ logger: mockLogger }))
    // .onError(errorHandler)
    .route("/", ping);

  it("pings", async () => {
    const response = await test.request("/");
    const body = await response.json();

    expect(response.status).toEqual(200);
    expect(body.message).toEqual("pong");
    expect(mockLogger.info).toHaveBeenCalled();
  });
```


## State, SSR Injection

Zustand is present on the client, but also used to inject state from the server into the client.

All routes that don't match hono routes are handled by views/ssr.ts `loadServerRouterContext` is a patter that looks for state modules who have registsered to recieve from `state/__registry.ts`. This allows modules to rehydrate a session indpendently, then provide it seamlessly to the client.


## General Architecture, Error Handling.

In terms of server side routing, the architecture is like any other application.

Errors should always be bubbled up to the central error handler in `surface.app.ts`, defined in `handers/errors.handler.ts` Central handling enables endpoint stacks to throw where convienient as well as type the error if a specific code and response should be sent.
