import { createRoute, z } from '@hono/zod-openapi'
import { Hono } from 'hono'
import type { SurfaceEnv } from '../../surface.app.ctx'

// Define your schemas
const {{ResourceName}}Schema = z.object({
  id: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  // Add your properties here
})

const Create{{ResourceName}}Schema = z.object({
  // Add creation properties here
})

const Update{{ResourceName}}Schema = z.object({
  // Add update properties here
})

// GET /:id - Retrieve single resource
const get{{ResourceName}}Route = createRoute({
  method: 'get',
  path: '/{id}',
  request: {
    params: z.object({
      id: z.string().min(1, 'ID is required')
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: {{ResourceName}}Schema
        }
      },
      description: 'Retrieve {{resourceName}} by ID'
    },
    404: {
      content: {
        'application/json': {
          schema: z.object({
            error: z.string()
          })
        }
      },
      description: '{{ResourceName}} not found'
    }
  },
  tags: ['{{resourceName}}']
})

// GET / - List resources
const list{{ResourceName}}sRoute = createRoute({
  method: 'get',
  path: '/',
  request: {
    query: z.object({
      page: z.string().optional().default('1'),
      limit: z.string().optional().default('20'),
      search: z.string().optional()
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            data: z.array({{ResourceName}}Schema),
            total: z.number(),
            page: z.number(),
            limit: z.number()
          })
        }
      },
      description: 'List {{resourceName}}s with pagination'
    }
  },
  tags: ['{{resourceName}}']
})

// POST / - Create resource
const create{{ResourceName}}Route = createRoute({
  method: 'post',
  path: '/',
  request: {
    body: {
      content: {
        'application/json': {
          schema: Create{{ResourceName}}Schema
        }
      }
    }
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: {{ResourceName}}Schema
        }
      },
      description: '{{ResourceName}} created successfully'
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
            details: z.array(z.string()).optional()
          })
        }
      },
      description: 'Invalid request data'
    }
  },
  tags: ['{{resourceName}}']
})

// PUT /:id - Update resource
const update{{ResourceName}}Route = createRoute({
  method: 'put',
  path: '/{id}',
  request: {
    params: z.object({
      id: z.string().min(1, 'ID is required')
    }),
    body: {
      content: {
        'application/json': {
          schema: Update{{ResourceName}}Schema
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: {{ResourceName}}Schema
        }
      },
      description: '{{ResourceName}} updated successfully'
    },
    404: {
      content: {
        'application/json': {
          schema: z.object({
            error: z.string()
          })
        }
      },
      description: '{{ResourceName}} not found'
    }
  },
  tags: ['{{resourceName}}']
})

// DELETE /:id - Delete resource
const delete{{ResourceName}}Route = createRoute({
  method: 'delete',
  path: '/{id}',
  request: {
    params: z.object({
      id: z.string().min(1, 'ID is required')
    })
  },
  responses: {
    204: {
      description: '{{ResourceName}} deleted successfully'
    },
    404: {
      content: {
        'application/json': {
          schema: z.object({
            error: z.string()
          })
        }
      },
      description: '{{ResourceName}} not found'
    }
  },
  tags: ['{{resourceName}}']
})

// Export the Hono app with all routes
export const {{resourceName}}s = new Hono<SurfaceEnv>()
  // GET /:id
  .openapi(get{{ResourceName}}Route, async (c) => {
    const { id } = c.req.valid('param')

    try {
      // TODO: Implement your data fetching logic here
      const {{resourceName}} = await find{{ResourceName}}ById(id)

      if (!{{resourceName}}) {
        return c.json({ error: '{{ResourceName}} not found' }, 404)
      }

      return c.json({{resourceName}})
    } catch (error) {
      console.error('Error fetching {{resourceName}}:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  })

  // GET /
  .openapi(list{{ResourceName}}sRoute, async (c) => {
    const { page, limit, search } = c.req.valid('query')

    try {
      // TODO: Implement your data fetching logic here
      const pageNum = parseInt(page)
      const limitNum = parseInt(limit)

      const { data, total } = await find{{ResourceName}}s({
        page: pageNum,
        limit: limitNum,
        search
      })

      return c.json({
        data,
        total,
        page: pageNum,
        limit: limitNum
      })
    } catch (error) {
      console.error('Error listing {{resourceName}}s:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  })

  // POST /
  .openapi(create{{ResourceName}}Route, async (c) => {
    const body = c.req.valid('json')

    try {
      // TODO: Implement your creation logic here
      const new{{ResourceName}} = await create{{ResourceName}}(body)

      return c.json(new{{ResourceName}}, 201)
    } catch (error) {
      console.error('Error creating {{resourceName}}:', error)

      // Handle validation errors
      if (error instanceof ValidationError) {
        return c.json({
          error: 'Validation failed',
          details: error.details
        }, 400)
      }

      return c.json({ error: 'Internal server error' }, 500)
    }
  })

  // PUT /:id
  .openapi(update{{ResourceName}}Route, async (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')

    try {
      // TODO: Implement your update logic here
      const updated{{ResourceName}} = await update{{ResourceName}}(id, body)

      if (!updated{{ResourceName}}) {
        return c.json({ error: '{{ResourceName}} not found' }, 404)
      }

      return c.json(updated{{ResourceName}})
    } catch (error) {
      console.error('Error updating {{resourceName}}:', error)

      if (error instanceof NotFoundError) {
        return c.json({ error: '{{ResourceName}} not found' }, 404)
      }

      if (error instanceof ValidationError) {
        return c.json({
          error: 'Validation failed',
          details: error.details
        }, 400)
      }

      return c.json({ error: 'Internal server error' }, 500)
    }
  })

  // DELETE /:id
  .openapi(delete{{ResourceName}}Route, async (c) => {
    const { id } = c.req.valid('param')

    try {
      // TODO: Implement your deletion logic here
      const deleted = await delete{{ResourceName}}(id)

      if (!deleted) {
        return c.json({ error: '{{ResourceName}} not found' }, 404)
      }

      return c.body(null, 204)
    } catch (error) {
      console.error('Error deleting {{resourceName}}:', error)

      if (error instanceof NotFoundError) {
        return c.json({ error: '{{ResourceName}} not found' }, 404)
      }

      return c.json({ error: 'Internal server error' }, 500)
    }
  })

// TODO: Implement these helper functions based on your data layer
async function find{{ResourceName}}ById(id: string) {
  // Implement your data fetching logic
  throw new Error('Not implemented')
}

async function find{{ResourceName}}s(options: { page: number; limit: number; search?: string }) {
  // Implement your data fetching logic
  throw new Error('Not implemented')
}

async function create{{ResourceName}}(data: any) {
  // Implement your creation logic
  throw new Error('Not implemented')
}

async function update{{ResourceName}}(id: string, data: any) {
  // Implement your update logic
  throw new Error('Not implemented')
}

async function delete{{ResourceName}}(id: string) {
  // Implement your deletion logic
  throw new Error('Not implemented')
}

// Custom error classes
class ValidationError extends Error {
  constructor(public details: string[]) {
    super('Validation failed')
    this.name = 'ValidationError'
  }
}

class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}

// Export types for client consumption
export type {{ResourceName}} = z.infer<typeof {{ResourceName}}Schema>
export type Create{{ResourceName}}Request = z.infer<typeof Create{{ResourceName}}Schema>
export type Update{{ResourceName}}Request = z.infer<typeof Update{{ResourceName}}Schema>
