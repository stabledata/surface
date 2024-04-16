# Surface: Built on Vite, React, Hono, and Tanstack.

This serves as a starting point for applications that wish to combine clients and their gateways to seamlessly share types and the necessary contexts, cookies, auth, roles etc.

## History

After using Hono and Vite separately in docker compose with some hacky type sharing, the search began for ways to combine them into one client + backend service. A BFF-like pattern that Next.js' /api folder provides, but Vite on the front end.

Lots of credit is due to this [really great post](https://ayon.li/full-stack-development-with-vite-and-hono) was created by A-yon on how to accomplish this. From there, basic SSR was implemented with Tanstack Router.

## Bun or Node?

You might notice both package-lock.json and bun.lockb. This is intentional as we intend to keep this code compatible with both run times for as long as necessary. Dockerfile examples for both will be included soon.

# Principals

Consciously working to reduce complexity is paramount to any software project, but perhaps even more so when we begin to blur the lines between client and server. Javascript has afforded us this ability, but we must wield the power responsibly.

#### No Magic

Nothing is abstracted away. This is a pattern for building web clients. There is no library, SDK, framework or anything more than a starting point. You can use it as a reference or a head start on your next project.

#### Context Injection

Surface wraps both Hono and Tanstack routers with a dead simple injection pattern that makes testing a breeze and the nuances between client and server easier to reason about.

#### Single Service BFF and Client

Surface is deployed as a NodeJS (or Bun) app container with a [Hono](https://hono.dev/) backend. Routes are first matched by Hono and the catch all is delegated to [Tanstack Router](https://tanstack.com/router/latest) and renders a client that builds and runs a dev server on [Vite](https://vitejs.dev/).

#### Flexible Routing

Routes are entirely flexible. You don't have to prefix a backend request with `/api`, unless of course you want to. If Hono matches a route, say to `/auth` it will handle it on the server. If it doesn't match, it will delegate to the client router. The client router is Tanstack's relatively new but very full featured and production ready router, the example here uses a new but familiar [file system based pattern](https://tanstack.com/router/v1/docs/framework/react/guide/file-based-routing).

#### Loaders

The loader paradigm follows the render as you fetch pattern. Newer frameworks like Remix, Astro, Modern and more have elected to pursue this way, for good reason. Loaders in our case are [provided by Tanstack Router](https://tanstack.com/router/v1/docs/framework/react/guide/data-loading) and are run on the server during an initial request the client after subsequent route navigation.

We could inject the server context into our router context and run loaders in a forked manner, calling services directly on the service and using RPC on the client but ultimately the decision to keep this simple as possible made sense and we treat loaders as a single code path that works well on both.

#### Application State and SSR

One of the biggest benefits of the surface pattern, is that we can store auth in httpOnly cookies for quick session lookups and _somewhat_ seamlessly pass state between the client and server.

Several patterns were explored here, but ultimately the one that made the most sense was to take advantage of the Tanstack router's ability to dehydrate and rehydrate state while injecting session data directly through the router.
