# Surface: Hono BFF + Vite Client

After using Hono and Vite separately in docker compose with some hacky type sharing, the search began for ways to combine them into one client + backend service. A BFF-like pattern that Next.js' /api folder provides, but Vite on the front end.

Lots of credit is due to this [really great post](https://ayon.li/full-stack-development-with-vite-and-hono) was created by A-yon on how to accomplish this. work upon which this is based.

This is just a starting point for future projects, it has very few opinions at the moment about Vite client flavors (React, Solid, etc.) frameworks nor how you organize your BFF (RPC, Rest etc.) routers etc.

That is likely to change as this evolves. **Stay tuned**.

## Bun or Node?

You might notice both package-lock.json and bun.lockb. This is intentional as we intend to keep this code compatible with both run times for as long as necessary. Dockerfile examples for both will be included soon.
