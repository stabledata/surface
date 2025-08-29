# Development Guidelines

This document outlines best practices and conventions for developing with the Surface framework.

## Code Organization

### Directory Structure
- `clients/` - All React components, pages, and client-side logic
- `service/` - Backend API endpoints organized by domain (auth, members, etc.)
- `handlers/` - Request handling logic (assets, errors, views, OpenAPI)
- `state/` - Shared state management and Zustand stores
- `views/` - Static assets and HTML templates

### File Naming Conventions
- Use kebab-case for directories: `service/user-management/`
- Use camelCase for TypeScript files: `userService.ts`
- Use PascalCase for React components: `UserProfile.tsx`
- End handler files with `.handler.ts`
- End endpoint files with `.endpoints.ts`

## API Development

### Creating New Endpoints
1. Create a new directory under `service/` for your domain
2. Define your endpoints in a `.endpoints.ts` file
3. Use Zod schemas for request/response validation
4. Add OpenAPI documentation with `@hono/zod-openapi`
5. Register your routes in `surface.app.ts`

### Example Endpoint Structure
```typescript
// service/users/users.endpoints.ts
import { createRoute, z } from '@hono/zod-openapi'
import { Hono } from 'hono'

const getUserSchema = createRoute({
  method: 'get',
  path: '/{id}',
  request: {
    params: z.object({
      id: z.string().uuid()
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            id: z.string(),
            name: z.string(),
            email: z.string().email()
          })
        }
      }
    }
  }
})

export const users = new Hono()
  .openapi(getUserSchema, async (c) => {
    const { id } = c.req.valid('param')
    // Implementation here
    return c.json({ id, name: 'John', email: 'john@example.com' })
  })
```

### Validation Rules
- Always use Zod schemas for input validation
- Validate path parameters, query parameters, and request bodies
- Return appropriate HTTP status codes
- Include meaningful error messages

## Frontend Development

### Component Guidelines
- Use functional components with hooks
- Keep components small and focused
- Co-locate related components in feature directories
- Use TypeScript interfaces for props

### State Management
- Use Zustand for global state
- Keep local state in components when possible
- Use TanStack Router loaders for route-level data

### Styling
- Use Tailwind CSS classes for styling
- Create reusable components for common UI patterns
- Use Radix UI primitives for accessible components
- Follow responsive design principles

## Type Safety

### Shared Types
- Define API types in service files
- Export types for client consumption
- Use the `Api` type export for RPC-style calls
- Keep types DRY between client and server

### Example Type Sharing
```typescript
// service/users/users.types.ts
export interface User {
  id: string
  name: string
  email: string
}

// clients/pages/users.tsx
import type { Api } from '../../surface.app'
import type { User } from '../../service/users/users.types'
```

## Authentication & Security

### Session Management
- Use HTTP-only cookies for session storage
- Implement proper CSRF protection
- Validate sessions on protected routes
- Handle logout properly by clearing cookies

### API Security
- Validate all inputs with Zod
- Use proper HTTP status codes
- Don't expose internal errors to clients
- Implement rate limiting for production

## Testing Strategy

### Unit Tests
- Test business logic in isolation
- Mock external dependencies
- Use descriptive test names
- Test both happy path and error cases

### Integration Tests
- Test API endpoints end-to-end
- Test client-server integration
- Verify authentication flows
- Test error handling

## Performance

### Backend Optimization
- Use appropriate caching strategies
- Optimize database queries
- Implement proper error handling
- Monitor response times

### Frontend Optimization
- Use code splitting for large components
- Implement proper loading states
- Optimize image assets
- Minimize bundle size

## Error Handling

### Backend Errors
- Use consistent error response format
- Log errors with appropriate detail
- Don't expose sensitive information
- Return meaningful error messages

### Frontend Errors
- Implement error boundaries
- Show user-friendly error messages
- Provide fallback UI states
- Log errors for debugging

## Development Workflow

### Local Development
1. Run `npm run dev` for development server
2. Use browser dev tools for debugging
3. Check logs in terminal for backend errors
4. Use TanStack Router devtools for routing debug

### Code Quality
- Run ESLint before committing
- Use TypeScript strict mode
- Write meaningful commit messages
- Keep functions small and focused

### Debugging Tips
- Use `debug` package for structured logging
- Add console.log statements strategically
- Use browser network tab to inspect API calls
- Check server logs for backend issues

## Deployment

### Production Build
- Run `npm run build` to create optimized bundles
- Test production build locally before deployment
- Verify all environment variables are set
- Check that static assets are served correctly

### Docker Deployment
- Use provided Dockerfiles for Node.js or Bun
- Set appropriate environment variables
- Configure health checks
- Monitor application logs

## Common Patterns

### Data Loading
```typescript
// Use TanStack Router loaders for route-level data
export const Route = createFileRoute('/users')({
  loader: async () => {
    // Fetch data here
    return { users: await fetchUsers() }
  },
  component: UsersPage
})
```

### Error Boundaries
```typescript
// Wrap components with error boundaries
<ErrorBoundary fallback={<ErrorFallback />}>
  <UserProfile />
</ErrorBoundary>
```

### API Calls
```typescript
// Use Hono RPC pattern for type-safe API calls
const response = await client.api.users.$get({
  param: { id: userId }
})
```

Remember: The goal is to maintain type safety, developer productivity, and production reliability throughout the development process.