# Technical Context

## Core Technologies
Based on the project structure, Legacy Core appears to use:
- **Next.js**: React framework for the frontend, using the App Router pattern
- **Supabase**: For database, authentication, and backend services
- **TypeScript**: Used for type-safe development
- **React**: Core UI library

## Development Environment
- Windows development support
- Likely uses npm or yarn for package management
- Possibly uses ESLint for code quality

## Frontend
- Component-based architecture
- Likely uses CSS modules or a CSS-in-JS solution
- UI component library in `components/ui`
- Layout components for page structure

## Backend
- Supabase for database and authentication
- Next.js API routes for server functions
- Database migrations managed through Supabase

## Authentication & Authorization
- Comprehensive authentication system with multiple options:
  - Standard login
  - Magic link authentication
  - Password reset functionality
- Role-based authorization (Admin, Agent, Manager)

## Data Storage
- PostgreSQL database (via Supabase)
- Supabase migrations for schema management

## External Integrations
- Likely integrates with external insurance carrier APIs
- Possible integration with AI services for chat and assistance features

## Deployment
- Unknown deployment platform (possibly Vercel given Next.js usage)
- Supabase for backend services

## Performance Considerations
- Client-side and server-side rendering options via Next.js
- Database query optimization

## Security
- Authentication handled via Supabase
- API routes for secure server operations
- Role-based access control 