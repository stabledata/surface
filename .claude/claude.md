# Surface - Claude AI Assistant Configuration

This is a full-stack web application built with **Vite**, **React**, **Hono**, and **TanStack Router**. It provides a seamless integration between client and server with shared types, authentication, and SSR capabilities.

## Project Overview

Surface is a BFF (Backend for Frontend) pattern implementation that combines a Hono backend with a Vite/React frontend in a single deployable service. It supports both Node.js and Bun runtimes.

### Key Technologies
- **Frontend**: React 18, TanStack Router, Vite, Tailwind CSS
- **Backend**: Hono, OpenAPI, Zod validation
- **State Management**: Zustand
- **Authentication**: HTTP-only cookies with session management
- **UI Components**: Radix UI primitives
- **Development**: TypeScript, ESLint, Hot reload

### Architecture Principles
1. **No Magic** - Everything is explicit and transparent
2. **Single Service** - One deployable container for both client and server
3. **Flexible Routing** - Routes can be handled by either Hono or TanStack Router
4. **Server-Side Rendering** - Initial requests rendered on server, client navigation handled by router
5. **Type Safety** - End-to-end type sharing between client and server

## Project Structure

```
surface/
├── .claude/                 # Claude AI configuration
├── clients/                 # Client-side React components and pages
├── handlers/                # Hono request handlers
│   ├── assets.handler.ts    # Static asset serving
│   ├── error.handler.ts     # Error handling
│   ├── openapi.handler.ts   # OpenAPI documentation
│   └── view.handler.ts      # SSR and client routing
├── service/                 # Backend API services
│   ├── auth/               # Authentication endpoints
│   ├── members/            # Member management (example)
│   └── ping/               # Health check endpoints
├── state/                  # Shared state management
├── views/                  # Static assets and templates
├── surface.app.ts          # Main Hono application setup
├── surface.server.bun.ts   # Bun runtime server
├── surface.server.node.ts  # Node.js runtime server
└── package.json            # Dependencies and scripts
```

## Development Workflow

### Running the Application
- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production
- `npm run start:node` - Start production server with Node.js
- `npm run start:bun` - Start production server with Bun

### Key Files to Know
- `surface.app.ts` - Main application routing and middleware setup
- `surface.app.ctx.ts` - Application context and environment types
- `clients/` - All React components and client-side logic
- `service/*/` - Backend API endpoints organized by domain
- `handlers/` - Request handling logic for different concerns

## API Patterns

### Adding New Endpoints
1. Create service directory under `service/`
2. Define endpoints with Hono and Zod validation
3. Add OpenAPI documentation
4. Register routes in `surface.app.ts`
5. Export types for client consumption

### Client-Server Integration
- Types are shared between client and server
- API calls use Hono's RPC client pattern
- Authentication handled via HTTP-only cookies
- State hydration/dehydration for SSR

## Authentication & State
- Session-based auth with HTTP-only cookies
- Zustand for client state management
- TanStack Router for route-level data loading
- Server-side rendering with state injection

## Deployment
- Docker support for both Node.js and Bun
- Single container deployment
- Static assets served by the application
- Production builds optimize both client and server code

## Best Practices
- Keep API routes RESTful and well-documented
- Use TypeScript strictly throughout
- Validate all inputs with Zod schemas
- Handle errors gracefully with proper status codes
- Maintain type safety between client and server