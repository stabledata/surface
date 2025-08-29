# Add Dependency Command

Add a new dependency to the Surface project with proper integration patterns.

## Usage
```
/add_dependency <package_name> [--dev] [--type=frontend|backend|shared]
```

## Parameters
- `package_name`: The npm package to install
- `--dev`: Install as development dependency (optional)
- `--type`: Specify where the dependency will be used (optional)
  - `frontend`: Client-side only dependency
  - `backend`: Server-side only dependency  
  - `shared`: Used by both client and server (default)

## Examples
```
/add_dependency axios
/add_dependency @types/node --dev
/add_dependency react-hook-form --type=frontend
/add_dependency @hono/cors --type=backend
```

## What This Command Does

1. **Install Package**: Adds the package to `package.json` using npm or bun
2. **Update Lock Files**: Ensures both `package-lock.json` and `bun.lockb` are updated
3. **Type Safety**: Installs corresponding `@types/*` packages when needed
4. **Integration Guide**: Provides usage examples specific to Surface architecture
5. **Compatibility Check**: Verifies the package works with both Node.js and Bun runtimes

## Surface-Specific Integration

### Frontend Dependencies
- Automatically configures Vite imports if needed
- Updates `tsconfig.json` paths for better resolution
- Provides React/TanStack Router integration examples

### Backend Dependencies
- Configures Hono middleware integration
- Updates OpenAPI schema definitions if applicable
- Provides server context integration examples

### Shared Dependencies
- Ensures proper export/import patterns
- Configures both client and server usage
- Updates type definitions for cross-boundary usage

## Post-Installation Tasks

The command will provide specific guidance for:

### State Management Libraries
```typescript
// For Zustand stores
export const useExampleStore = create<ExampleState>((set) => ({
  // store implementation
}))
```

### API Client Libraries
```typescript
// Integration with Hono RPC pattern
import { hc } from 'hono/client'
import type { Api } from '../surface.app'

const client = hc<Api>('/api')
```

### UI Component Libraries
```typescript
// Integration with existing Radix UI setup
import { Button } from '@/components/ui/button'
import { NewComponent } from 'new-library'
```

### Validation Libraries
```typescript
// Integration with existing Zod patterns
import { z } from 'zod'
import { validator } from '@hono/zod-validator'
```

## Runtime Compatibility

The command checks for:
- **Node.js compatibility**: Verifies package works with Node.js runtime
- **Bun compatibility**: Ensures package works with Bun runtime
- **ESM support**: Confirms ES modules are supported
- **TypeScript support**: Verifies TypeScript definitions exist

## Best Practices Applied

1. **Version Pinning**: Uses exact versions for stability
2. **Peer Dependencies**: Handles peer dependency conflicts
3. **Bundle Analysis**: Warns about large dependencies
4. **Security Audit**: Runs security check on new packages
5. **License Compliance**: Checks license compatibility

## Integration Examples

### Adding a Database Client
```bash
/add_dependency prisma --type=backend
```
Provides setup for:
- Database schema configuration
- Hono context integration
- Type-safe query patterns

### Adding a UI Library
```bash
/add_dependency framer-motion --type=frontend
```
Provides setup for:
- Vite configuration updates
- SSR compatibility checks
- Animation integration patterns

### Adding Middleware
```bash
/add_dependency @hono/cors --type=backend
```
Provides setup for:
- Middleware registration in `surface.app.ts`
- Configuration examples
- Type safety integration

## Troubleshooting

Common issues and solutions:
- **Dual Runtime Conflicts**: Guidance for packages that don't support both Node.js and Bun
- **ESM/CJS Issues**: Solutions for module format conflicts
- **Type Definition Problems**: Steps to add manual type definitions
- **Bundle Size Concerns**: Recommendations for code splitting and tree shaking