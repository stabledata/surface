# Surface Project Overview

Surface is a modern full-stack web application that seamlessly combines client and server development in a single deployable service. Built on top of industry-leading technologies like Vite, React, Hono, and TanStack Router, it provides developers with a powerful foundation for building type-safe web applications.

## What Makes Surface Special

### Unified Development Experience
- **Single Codebase**: Client and server code live together with shared types and utilities
- **Hot Reload**: Development changes are instantly reflected across both frontend and backend
- **Type Safety**: End-to-end TypeScript ensures reliability from database to UI
- **No Build Complexity**: Simple development workflow without complex orchestration

### Production Ready Architecture
- **SSR by Default**: Server-side rendering for better SEO and initial load performance
- **Flexible Routing**: Routes can be handled by either the backend API or client router
- **Authentication**: Built-in session management with HTTP-only cookies
- **OpenAPI Integration**: Automatic API documentation generation

### Runtime Flexibility
- **Node.js Support**: Traditional Node.js runtime for maximum compatibility
- **Bun Support**: Modern Bun runtime for enhanced performance
- **Docker Ready**: Production containers for both runtimes included

## Core Technologies

### Frontend Stack
- **React 18**: Modern React with hooks and concurrent features
- **TanStack Router**: File-based routing with type-safe navigation
- **Vite**: Lightning-fast development server and build tool
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Radix UI**: Accessible, unstyled UI primitives

### Backend Stack
- **Hono**: Lightweight, fast web framework for modern JavaScript runtimes
- **Zod**: TypeScript-first schema validation and type inference
- **OpenAPI**: API specification and documentation generation
- **Bunyan/TSLog**: Structured logging for debugging and monitoring

### State & Data Management
- **Zustand**: Lightweight state management without boilerplate
- **TanStack Router Loaders**: Server-side data loading with client hydration
- **HTTP-only Cookies**: Secure session management

## Project Philosophy

### No Magic Principle
Surface doesn't hide complexity behind abstractions. Every piece of functionality is explicit and understandable. You can see exactly how routing works, how authentication is handled, and how data flows between client and server.

### Developer Experience First
The development workflow is optimized for productivity:
- Changes are reflected instantly without manual rebuilds
- Types are shared automatically between client and server
- API routes are discoverable and well-documented
- Error messages are clear and actionable

### Production Considerations
While optimized for development, Surface doesn't compromise on production requirements:
- Efficient bundling and code splitting
- Proper error handling and logging
- Security best practices by default
- Scalable deployment patterns

## Use Cases

Surface is ideal for:
- **Web Applications**: Full-featured web apps with complex user interactions
- **API-First Development**: Services that need both API endpoints and web interfaces  
- **Rapid Prototyping**: Quick iteration on full-stack features
- **Team Projects**: Shared types reduce integration issues between frontend/backend developers
- **Learning Projects**: Clear architecture makes it easy to understand full-stack concepts

## Getting Started

1. **Development**: `npm run dev` starts the development server with hot reload
2. **Building**: `npm run build` creates optimized production bundles
3. **Deployment**: Use provided Dockerfiles for containerized deployment
4. **Customization**: Extend the patterns to add new features and endpoints

The codebase serves as both a starting point and a reference implementation of modern full-stack development practices.