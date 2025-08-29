# Add Endpoint Command

Add a new API endpoint to the Surface project following established patterns and conventions.

## Usage
```
/add_endpoint <domain> <method> <path> [--auth] [--openapi]
```

## Parameters
- `domain`: The service domain (e.g., users, orders, auth)
- `method`: HTTP method (GET, POST, PUT, DELETE, PATCH)
- `path`: The endpoint path (e.g., /users/{id}, /search)
- `--auth`: Require authentication for this endpoint (optional)
- `--openapi`: Generate OpenAPI documentation (default: true)

## Examples
```
/add_endpoint users GET /users
/add_endpoint users POST /users --auth
/add_endpoint users GET /users/{id} --auth --openapi
/add_endpoint orders DELETE /orders/{id} --auth
```

## What This Command Does

1. **Creates Service Structure**: Sets up the domain directory under `service/`
2. **Generates Endpoint File**: Creates `.endpoints.ts` with Hono route definitions
3. **Adds Type Definitions**: Creates `.types.ts` for request/response interfaces
4. **Updates Main App**: Registers the new routes in `surface.app.ts`
5. **Generates OpenAPI Schema**: Adds API documentation with Zod validation
6. **Creates Client Types**: Exports types for frontend consumption

## Generated File Structure

### Service Directory
```
service/
└── {domain}/
    ├── {domain}.endpoints.ts
    ├── {domain}.types.ts
    └── {domain}.schemas.ts
```

### Endpoint Template
```typescript
// service/{domain}/{domain}.endpoints.ts
import { createRoute, z } from '@hono/zod-openapi'
import { Hono } from 'hono'
import type { SurfaceEnv } from '../../surface.app.ctx'

const get{Domain}Route = createRoute({
  method: 'get',
  path: '/{id}',
  request: {
    params: z.object({
      id: z.string().min(1)
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: {Domain}Schema
        }
      },
      description: 'Retrieve {domain} by ID'
    },
    404: {
      content: {
        'application/json': {
          schema: z.object({
            error: z.string()
          })
        }
      },
      description: '{Domain} not found'
    }
  },
  tags: ['{domain}']
})

export const {domain} = new Hono<SurfaceEnv>()
  .openapi(get{Domain}Route, async (c) => {
    const { id } = c.req.valid('param')
    
    try {
      // Implementation here
      const result = await find{Domain}ById(id)
      return c.json(result)
    } catch (error) {
      return c.json({ error: '{Domain} not found' }, 404)
    }
  })
```

### Type Definitions Template
```typescript
// service/{domain}/{domain}.types.ts
export interface {Domain} {
  id: string
  createdAt: string
  updatedAt: string
  // Add your properties here
}

export interface Create{Domain}Request {
  // Add request properties here
}

export interface Update{Domain}Request {
  // Add request properties here
}

export type {Domain}Response = {Domain}
export type {Domain}ListResponse = {
  data: {Domain}[]
  total: number
  page: number
  limit: number
}
```

### Schema Definitions Template
```typescript
// service/{domain}/{domain}.schemas.ts
import { z } from 'zod'

export const {Domain}Schema = z.object({
  id: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  // Add your schema properties here
})

export const Create{Domain}Schema = z.object({
  // Add creation schema properties here
})

export const Update{Domain}Schema = z.object({
  // Add update schema properties here
})
```

## HTTP Method Templates

### GET Endpoints
- Single resource: `GET /{domain}/{id}`
- List resources: `GET /{domain}`
- Search: `GET /{domain}/search`

### POST Endpoints
- Create resource: `POST /{domain}`
- Custom actions: `POST /{domain}/{id}/action`

### PUT/PATCH Endpoints
- Full update: `PUT /{domain}/{id}`
- Partial update: `PATCH /{domain}/{id}`

### DELETE Endpoints
- Delete resource: `DELETE /{domain}/{id}`
- Bulk delete: `DELETE /{domain}/bulk`

## Authentication Integration

When `--auth` is specified, the command adds:

```typescript
import { requireAuth } from '../../middleware/auth.middleware'

export const {domain} = new Hono<SurfaceEnv>()
  .use(requireAuth) // Add auth middleware
  .openapi(get{Domain}Route, async (c) => {
    const user = c.get('user') // Access authenticated user
    // Implementation with user context
  })
```

## OpenAPI Documentation

Generated endpoints include:
- Request/response schemas
- Parameter validation
- Error response definitions
- Example values
- Tags for organization
- Security requirements (when auth enabled)

## Surface App Integration

The command automatically updates `surface.app.ts`:

```typescript
import { {domain} } from './service/{domain}/{domain}.endpoints'

const api = app
  // ... existing routes
  .route('/api/{domain}', {domain})
  // ... rest of routes
```

## Client Integration Examples

### React Hook Usage
```typescript
// clients/hooks/use{Domain}.ts
import { useState, useEffect } from 'react'
import type { {Domain} } from '../../service/{domain}/{domain}.types'
import { api } from '../lib/api'

export function use{Domain}(id: string) {
  const [data, setData] = useState<{Domain} | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    api.{domain}[':id'].$get({ param: { id } })
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [id])
  
  return { data, loading }
}
```

### TanStack Router Loader
```typescript
// clients/routes/{domain}/$id.tsx
import { createFileRoute } from '@tanstack/react-router'
import type { {Domain} } from '../../../service/{domain}/{domain}.types'

export const Route = createFileRoute('/{domain}/$id')({
  loader: async ({ params }) => {
    const response = await fetch(`/api/{domain}/${params.id}`)
    return response.json() as {Domain}
  },
  component: {Domain}Detail
})
```

## Error Handling Patterns

Generated endpoints include:
- Input validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Server errors (500)

## Testing Templates

The command can optionally generate test files:

```typescript
// service/{domain}/{domain}.test.ts
import { describe, it, expect } from 'bun:test'
import { testClient } from 'hono/testing'
import { {domain} } from './{domain}.endpoints'

describe('{Domain} Endpoints', () => {
  it('should get {domain} by id', async () => {
    const app = testClient({domain})
    const res = await app.index.$get()
    expect(res.status).toBe(200)
  })
})
```

## Best Practices Applied

1. **RESTful Design**: Follows REST conventions for resource operations
2. **Type Safety**: End-to-end TypeScript types from API to client
3. **Input Validation**: Zod schemas for request validation
4. **Error Handling**: Consistent error response format
5. **Documentation**: OpenAPI specs for API documentation
6. **Authentication**: Seamless auth integration when needed
7. **Testing**: Test templates for endpoint verification