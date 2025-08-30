# Surface

**Surface** is a modern work interface platform that connects three powerful downstream services: **Spire** (data schemas), **Silo** (asset management), and **Stencil** (templates & UI components). Built with TypeScript, Hono, Bun, React, and integrated with WorkOS for authentication and Anthropic for AI-powered interactions.

## 🏗️ Architecture

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Hono + Bun + TypeScript
- **Database**: PostgreSQL
- **Authentication**: WorkOS
- **AI Integration**: Anthropic Claude via MCP-like server
- **Deployment**: Docker containers

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0.0
- [PostgreSQL](https://postgresql.org/) >= 14
- [WorkOS](https://workos.com/) account and API keys
- [Anthropic](https://anthropic.com/) API key

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd surface
bun install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

```env
# Required
WORKOS_API_KEY=your_workos_api_key_here
WORKOS_CLIENT_ID=your_workos_client_id_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
DATABASE_URL=postgres://localhost:5432/surface
```

### 3. Database Setup

Create the database:
```bash
createdb surface
```

The application will automatically run migrations on startup.

### 4. Development

Start both frontend and backend in development mode:
```bash
bun run dev
```

This runs:
- Backend server at `http://localhost:3001`
- Frontend dev server at `http://localhost:5173`
- API proxy configured automatically

### 5. Visit the Application

Open `http://localhost:5173` in your browser.

## 🛠️ Development

### Project Structure

```
surface/
├── server/              # Hono backend server
│   ├── index.ts        # Server entry point
│   ├── routes/         # API route handlers
│   └── lib/            # Database and utilities
├── src/                # React frontend
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom hooks
│   └── lib/            # Frontend utilities
├── specs/              # Project specifications
└── dist/               # Build output
```

### Available Scripts

```bash
# Development
bun run dev              # Start both frontend and backend
bun run dev:server       # Start backend only
bun run dev:client       # Start frontend only

# Production
bun run build            # Build both frontend and backend
bun run start            # Start production server
bun run preview          # Preview production build

# Utilities
bun run typecheck        # Run TypeScript checks
```

### API Endpoints

#### Authentication
- `GET /api/auth/me` - Get current user
- `GET /api/auth/login` - Initiate OAuth flow
- `GET /api/auth/callback` - OAuth callback
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/organizations` - Get user organizations

#### Projects
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

#### Spaces (Silo, Spire, Stencil instances)
- `GET /api/projects/:id/spaces` - List project spaces
- `POST /api/projects/:id/spaces` - Create new space

#### AI Chat Interface
- `POST /api/chat` - Stream chat with Claude
- `GET /api/chat/tools` - Get available MCP tools
- `POST /api/chat/tools/:toolName` - Execute specific tool

## 🤖 AI Integration

Surface includes an MCP (Model Context Protocol)-like server that provides AI tools for interacting with your downstream services:

### Available Tools

- **`silo_upload_file`** - Upload files to Silo asset management
- **`silo_list_files`** - List files in Silo
- **`spire_create_schema`** - Create data schemas in Spire
- **`stencil_create_template`** - Create UI templates in Stencil

### Usage Example

```typescript
// Frontend chat integration
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-project-id': currentProjectId
  },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Upload a new document to our project' }
    ],
    tools: ['silo_upload_file']
  })
})
```

## 🔐 Authentication Flow

1. User visits protected route
2. Redirected to WorkOS OAuth if not authenticated
3. WorkOS handles authentication
4. User redirected back with session
5. Session stored in secure HTTP-only cookie
6. User context available throughout the application

## 📦 Deployment

### Docker

Build and run with Docker:

```bash
# Build the image
docker build -t surface .

# Run the container
docker run -p 3001:3001 --env-file .env surface
```

### Docker Compose

For development with PostgreSQL:

```bash
docker-compose up -d
```

### Environment Variables

See `.env.example` for all available environment variables. Required variables:

- `WORKOS_API_KEY` - WorkOS API key
- `WORKOS_CLIENT_ID` - WorkOS client ID  
- `ANTHROPIC_API_KEY` - Anthropic API key
- `DATABASE_URL` - PostgreSQL connection string

## 🎨 UI Components

Surface uses a custom design system built on Tailwind CSS with:

- Consistent color palette and spacing
- Accessible form components
- Responsive layouts
- Dark mode support (planned)
- Loading states and animations

### Key Components

- **Layout** - Main application shell with navigation
- **ProtectedRoute** - Authentication wrapper
- **ProjectCard** - Project overview display
- **ChatInterface** - AI conversation UI
- **SpaceBadges** - Service type indicators

## 🔧 Configuration

### Tailwind CSS

Custom configuration in `tailwind.config.js` includes:

- Extended color palette with CSS variables
- Custom animations and transitions
- Component utilities for common patterns
- Typography and form styling

### Vite Configuration

- API proxy to backend server
- Path aliases for clean imports
- Optimized build output
- Hot module replacement

## 🧪 Testing (Planned)

Future testing setup will include:

- **Vitest** for unit and integration tests
- **Testing Library** for React component tests
- **Playwright** for end-to-end tests
- **MSW** for API mocking

## 📚 Documentation

- [`/specs/OVERVIEW.md`](./specs/OVERVIEW.md) - Detailed project specifications
- API documentation available via OpenAPI (planned)
- Component Storybook (planned)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Database connection fails:**
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Verify database exists: `createdb surface`

**WorkOS authentication not working:**
- Verify API keys in `.env`
- Check redirect URI in WorkOS dashboard
- Ensure `WORKOS_REDIRECT_URI` matches your setup

**Frontend not loading:**
- Check if both servers are running (`bun run dev`)
- Verify proxy configuration in `vite.config.ts`
- Clear browser cache and try incognito mode

**Chat/AI features not working:**
- Verify `ANTHROPIC_API_KEY` in `.env`
- Check console for API errors
- Ensure user is authenticated and has project context

### Development Tips

- Use `bun run dev` to start both servers simultaneously
- Check browser developer tools for client-side errors
- Monitor server logs for backend issues
- Use PostgreSQL client to inspect database state

## 🌟 Roadmap

- [ ] Implement Spire, Silo, and Stencil service integrations
- [ ] Add comprehensive test coverage
- [ ] Dark mode support
- [ ] Advanced project templates
- [ ] Real-time collaboration features
- [ ] Enhanced AI tool capabilities
- [ ] Mobile-responsive improvements
- [ ] Performance optimizations