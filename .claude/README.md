# Claude AI Configuration for Surface

This directory contains configuration files and templates to make the Surface project "Claude ready" for enhanced AI-assisted development.

## Directory Structure

```
.claude/
├── README.md              # This file
├── claude.md              # Main Claude configuration and project overview
├── project.md             # Detailed project architecture and philosophy
├── development.md         # Development guidelines and best practices
├── commands/              # Custom slash commands
│   ├── add_dependency.md  # Command to add new dependencies
│   └── add_endpoint.md    # Command to add new API endpoints
└── templates/             # Code templates for common patterns
    ├── api-endpoint.ts    # Template for Hono API endpoints
    └── react-component.tsx # Template for React components
```

## What This Enables

### Enhanced Context Understanding
- Claude has deep knowledge of the Surface architecture
- Understands the full-stack patterns and conventions
- Knows the relationships between client and server code
- Familiar with the tech stack and best practices

### Smart Code Generation
- Generates code that follows established patterns
- Maintains type safety across client-server boundaries
- Uses consistent naming conventions and file structure
- Integrates properly with existing authentication and routing

### Streamlined Development
- `/add_dependency` command handles package installation with proper integration
- `/add_endpoint` command scaffolds complete API endpoints with validation
- Templates ensure consistency across the codebase
- Automated updates to routing and type definitions

## How to Use

### General Development
Simply chat with Claude about your Surface project. Claude will:
- Understand your architecture without lengthy explanations
- Suggest improvements that fit your patterns
- Help debug issues across the full stack
- Provide guidance on best practices

### Using Slash Commands

#### Add a New Dependency
```
/add_dependency prisma --type=backend
/add_dependency react-hook-form --type=frontend
/add_dependency zod --type=shared
```

#### Add a New API Endpoint
```
/add_endpoint users GET /users
/add_endpoint users POST /users --auth
/add_endpoint orders DELETE /orders/{id} --auth --openapi
```

### Working with Templates
The templates in `/templates/` provide starting points for common patterns:
- Copy and customize for new components or endpoints
- Follow the established conventions and structure
- Maintain type safety and integration patterns

## Project-Specific Intelligence

Claude understands these Surface-specific concepts:

### Architecture Patterns
- **BFF Pattern**: Single service for both client and server
- **Type Sharing**: End-to-end TypeScript between boundaries
- **SSR Integration**: Server-side rendering with client hydration
- **Flexible Routing**: Hono backend routes with TanStack Router fallback

### Technology Integration
- **Hono + Vite**: Development server and production deployment
- **OpenAPI**: Automatic documentation generation with Zod
- **TanStack Router**: File-based routing with loaders
- **Zustand**: State management patterns

### Development Workflow
- **Dual Runtime**: Node.js and Bun compatibility
- **Hot Reload**: Seamless development experience
- **Docker Deployment**: Container-ready with proper builds

## Benefits

1. **Faster Development**: Skip setup and boilerplate with smart generation
2. **Consistency**: All generated code follows established patterns
3. **Type Safety**: Maintained across all boundaries automatically
4. **Best Practices**: Built-in adherence to Surface conventions
5. **Documentation**: Self-documenting code with OpenAPI integration

## Customization

Feel free to modify these files to better match your team's specific needs:
- Update templates with your preferred patterns
- Add new slash commands for common tasks
- Extend the documentation with project-specific details
- Add additional context about your domain or business logic

## Getting Started

1. Make sure you're using Claude with access to this `.claude` directory
2. Try asking Claude about your Surface project architecture
3. Use the slash commands to add new features
4. Extend and customize as your project grows

The configuration will continuously improve your development experience as Claude learns more about your specific implementation patterns and preferences.