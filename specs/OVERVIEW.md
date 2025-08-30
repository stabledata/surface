# Surface

Surface is a work "surface" (user interface) that uses three downstream services:

 * Spire: A service which manages data schemas
 * Silo: A service that manages file assets (documents, photos, videos etc)
 * Stencil: A service that manages templates and interface components and collectively an "app user experience"


Collectively, these three pillars allow surface users to build simple and complex experiences for end users via LLM tool calls and an API proxy.

- Authentication is handled by surface using WorkOS integration for a "project" collectively, projects can have as many spire, silo, and stencil spaces as needed.
- Authorization is handled by each of the downstream services, meaning they must determine what resources an x-spire-user-id, x-silo-user-id, and x-stencil-user-id can access.


# Architecture

Frontend**: React + Vite + TypeScript + Tailwind
**Backend**: Hono + Bun + TypeScript
**Database**: SQLite (with Bun's built-in SQLite) or PostgreSQL for production
**Auth**: WorkOS
**Deployment**: Docker (as specified) or Cloudflare Workers

Session management is delegated to WorkOS.

We will probably need a master db (postgres) used to track user projects (workos orgs), and the spaces (silo, spire, stencil) they contain. we should probably also log user activity for auditing and analytics purposes.

The deployment target for the application is a docker image for long term flexibility and future stateless scaling.


## Phase One

As a user, I should be able to see the landing page hit the create project button and be prompted to login via work OS. '

If I am logged in, I land on the projects page.

# User Experience

### Landing Page

For now, a temporary landing page is rendered with a simple logo and a button that links to /start that says "Start a new project"

<svg viewBox="-4.466 116.828 61.577 61.138" xmlns="http://www.w3.org/2000/svg" class="w-22 h-22" width="80" height="80"><rect x="166.216" y="102.242" width="155.193" height="166.573" style="fill:none;stroke-linejoin:round;stroke-width:15.283px;stroke:currentColor" rx="77.596" ry="77.596" transform="matrix(0.3396560251712799, 0, 0, 0.3146670162677765, -56.51739501953126, 88.97167205810547)"></rect><path style="fill:none;stroke-width:18.8345px;stroke:currentColor;transform-box:fill-box;transform-origin:50% 50%" d="M 166.62 185.639 C 186.639 185.382 192.877 175.819 215.3 175.819 C 243.873 175.819 250.051 184.723 270.616 184.723 C 300.248 184.723 308.107 174.724 319.324 174.695" transform="matrix(0.339656054974, 0, 0, 0.314667016268, -216.962484111094, -34.502720725166)"></path><path style="fill:currentColor;stroke:currentColor;transform-box:fill-box;transform-origin:50% 50%" d="M 9.508 144.43 L 16.562 143.888 L 16.566 172.932 L 9.963 169.683 L 9.508 144.43 Z"></path><path style="fill:currentColor;stroke:currentColor;transform-box:fill-box;transform-origin:50% 50%" d="M 22.996 145.384 L 30.198 146.246 L 29.995 173.083 L 22.996 173.083 L 22.996 145.384 Z"></path><path style="fill:currentColor;stroke:currentColor;transform-box:fill-box;transform-origin:50% 50%" d="M 36.771 146.713 L 43.888 147.532 L 43.501 168.605 L 36.771 173.012 L 36.771 146.713 Z"></path></svg>

### Login

No matter where in the app someone logs in, they should be redirected to the same place they came from after the flow.



## Phase Two

### Starting a new project

The default `/start` route checks for an active session.

If there is not an active session, the user is prompted to login with WorkOS.

Once a session is established, user is then prompted to create a new project with a single name for the project.

A new project creates a new organization in WorkOS, adds the current user to that organization.

We should also have a /home route that shows you what organizations you're a member of (work os API call)

The user can now add instances of the three pillars as needed to the space.


## Phase Three

Create a silo space and create UI for a "photo/asset management library".


## Phase Four

### LLM Chat

We also want to make sure you can chat with suface, so a hono endpoint `/chat` capable of a set of tool calls and system prompt should be added as a route.
