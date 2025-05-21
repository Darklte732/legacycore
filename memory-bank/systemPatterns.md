# System Patterns

## Architecture Overview
Based on the project structure, Legacy Core appears to be built with:
- Next.js framework with App Router
- Supabase for backend database and authentication
- Role-based access control system (Admin, Agent, Manager)
- Component-based frontend architecture

## Key Design Patterns
- **Route-based Feature Organization**: Features are organized by user role and functionality in the app directory
- **Role Segregation**: Distinct areas for different user roles (admin, agent, manager)
- **Shared Components**: Common UI elements in the components directory
- **API Route Pattern**: API endpoints organized by feature
- **Authentication Flow**: Dedicated authentication paths with multiple options (login, signup, magic link, password reset)

## Component Relationships
- Core layout components that likely provide the application shell
- UI components that implement the design system
- Feature-specific components within respective directories
- Utility functions and hooks for shared functionality

## Data Flow
- Likely using Supabase for data storage and retrieval
- API routes for server-side operations
- Client-side state management (specific implementation unknown)

## Routing Structure
- App router with nested routes for feature organization
- Role-based routing with dedicated sections for each user type
- Dynamic routes for specific resources (e.g., applications/[id])

## Security Model
- Authentication handled through dedicated auth routes
- Role-based access control
- Supabase integration for secure data access

## Integration Patterns
- Supabase for database and authentication
- Potential API integrations with insurance carriers
- AI services for chat and script assistance features 