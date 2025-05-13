# LegacyCore Application Architecture

## Core Structure
- **Framework**: Next.js with both App Router and Pages Router
- **Language**: TypeScript/JavaScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase for database and authentication
- **Deployment**: Vercel-compatible

## Directory Organization

1. **App Router (`/app`)**:
   - Main application components organized by route
   - Authentication routes under `/app/(auth)`
   - Role-based sections (admin, agent, manager)
   - API routes under `/app/api`

2. **Components (`/components`)**:
   - Shared UI components
   - Layout components (`/components/layout`)
   - UI primitives (`/components/ui`)

3. **Utility Code**:
   - Hooks (`/hooks`) - Custom React hooks including authentication
   - Library code (`/lib`) - Utility functions and services
   - Supabase client (`/lib/supabase`) - Database connection

4. **Configuration**:
   - `next.config.js` - Next.js configuration
   - `tailwind.config.js` - Design system settings
   - `middleware.ts` - Authentication and routing middleware
   - `.env` and `.env.local` - Environment variables

## Authentication Flow
- Uses Supabase authentication
- Role-based access (admin, agent, manager)
- Protected routes via middleware.ts
- Login/signup flows under `/app/(auth)`

## Role-Based Access

1. **Admin**:
   - User management
   - Analytics dashboard
   - Application oversight
   - Carrier management
   - System settings

2. **Agent**:
   - Client applications
   - AI chat assistance
   - Commissions tracking
   - Calendar management
   - Document attachments

3. **Manager**:
   - Agent oversight
   - Analytics
   - Application approval
   - Performance monitoring

## Running Process

1. **Build Phase**:
   - TypeScript compilation
   - Next.js optimization
   - Static asset processing
   - Output goes to `.next` directory

2. **Runtime**:
   - Server-side rendering for dynamic routes
   - Static serving for optimized pages
   - API routes handle server operations
   - Middleware manages authentication and redirects

3. **Production Execution**:
   - `run-prod-local.js` is the main script
   - Builds the application with `npm run build`
   - Starts production server with `npm run start`
   - Serves from port 3000

## Database Integration
- Supabase client connection
- Server-side queries via server components
- Client-side data fetching with authentication
- Data models include users, applications, carriers, and commissions

## Environment Configuration
Key environment variables required:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - For privileged operations (server-side only)
- `NODE_ENV` - Environment setting (development/production)

## Development Workflow
- Development mode: `npm run dev`
- Build: `npm run build`
- Production mode: `npm run start` or `node run-prod-local.js`
- Environment switching via `.env` files

## Troubleshooting
Common issues:
- Authentication errors: Check Supabase configuration and keys
- Build errors: May indicate TypeScript or dependency issues
- Production errors: Check server logs and `.next/` directory integrity

## Command to Run
```
node run-prod-local.js
```

The application serves different role-based UIs (admin, agent, manager) with shared components, using Supabase for database operations, all within a Next.js framework optimized for both client and server rendering. 