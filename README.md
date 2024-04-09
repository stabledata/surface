# Surface: Built on Vite, React, Hono, and Tanstack.

This serves as a starting point for applications that wish to combine clients and their gateways to seamlessly share types and the necessary contexts, cookies, auth, roles etc.

## History

After using Hono and Vite separately in docker compose with some hacky type sharing, the search began for ways to combine them into one client + backend service. A BFF-like pattern that Next.js' /api folder provides, but Vite on the front end.

Lots of credit is due to this [really great post](https://ayon.li/full-stack-development-with-vite-and-hono) was created by A-yon on how to accomplish this. From there, basic SSR was implemented with Tanstack Router.

## Bun or Node?

You might notice both package-lock.json and bun.lockb. This is intentional as we intend to keep this code compatible with both run times for as long as necessary. Dockerfile examples for both will be included soon.
