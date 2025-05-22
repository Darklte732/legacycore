Project Architecture
Overall Structure
Frontend and backend are tightly integrated in a Next.js application
Uses the Next.js App Router architecture with server and client components
Follows role-based routing with dedicated sections for agents, managers, and admins
Frameworks & Technologies
Frontend: Next.js 14, React 18, Tailwind CSS
UI Components: Mix of custom components and Radix UI primitives
State Management: React Query (TanStack Query)
Forms: React Hook Form with Zod validation
Directory Organization
/src/app - Main application code using Next.js App Router
/src/components - Reusable UI components
/src/lib - Utility libraries and integrations
/src/hooks - Custom React hooks
/supabase - Database migrations and configuration
Deployment Configuration
Deployed on Vercel (evident from vercel.json configuration)
Uses standalone Next.js output for serverless deployment
Custom handling for static assets in production builds
Database & Data Models
Database Technology
Supabase (PostgreSQL-based) with real-time capabilities
Row-Level Security (RLS) policies for access control
Schema & Main Tables
profiles - User profiles linked to auth.users with role-based access
applications - Insurance applications with carrier and financial data
application_payments - Monthly payment tracking for each application
chats - AI chat sessions for agents
chat_messages - Individual messages in chat sessions
calendar_events - Calendar functionality with attendee management
Entity Relationships
Users (auth.users) → Profiles (one-to-one)
Agents → Applications (one-to-many)
Applications → Payments (one-to-many)
Users → Chats (one-to-many)
Chats → Messages (one-to-many)
Organizations → Users (one-to-many)
Data Flow
Client-side data fetching using Supabase client
Server-side data access through server components and API routes
Real-time updates possible through Supabase subscriptions
API Structure
API Implementation
REST API endpoints in /src/app/api/ using Next.js Route Handlers
Authentication handled via Supabase Auth
Server-side functions with direct database access
Authentication
JWT-based authentication through Supabase Auth
Cookie-based session storage
Role-based access control (admin, manager, agent)
Development mode shortcuts for testing different roles
Integration Points
Supabase for database and auth
Appears to have carrier-specific integrations (indicated by carrier logo handling)
Core Features Implementation
Application Management
CRUD operations for insurance applications
Status tracking from submission to completion
Monthly payment tracking with health status indicators
Policy health monitoring
Commissions Tracking
Basic commission calculation and storage
Premium and face amount tracking
No evidence of complex commission rules engine yet
User Role Management
Three main roles: admin, manager, agent
Hierarchical access control
Organization-based grouping of users
Calendar & Scheduling
Calendar events with attendee management
Organization-scoped events
All-day event support
Frontend Components
UI Component Organization
Role-specific layouts and components
Heavy use of Tailwind CSS for styling
Responsive design patterns
Dashboard Implementation
Role-specific dashboards
Health indicators for application status
Data visualization with Recharts
Form Handling
React Hook Form for form state management
Zod schema validation
File uploads via React Dropzone
Data Display
TanStack Table for data grids
Custom filtering and sorting
Pagination support
Integration Points
External Services
Supabase for database, auth, and storage
Email integration (implied but not detailed in code)
Image handling with Next.js Image optimization
Authentication Providers
Email/password authentication
Magic link authentication (implied by route structure)
Role-based redirects after login
Code Quality Assessment
Code Organization
Good separation of concerns with dedicated folders for features
Component-based architecture
Utility functions separated from components
State Management
Mix of React Query for server state
Local component state with useState
Custom hooks for shared logic
Error Handling
Try/catch blocks in API routes
Error state management in forms
Toast notifications for user feedback
Testing
No visible testing infrastructure in the files examined
Specific Feature Areas
Commission Tracking
Basic tracking of commission amounts on applications
No complex rules engine or hierarchy visible yet
Simple calculation based on premium amounts
Cross-Selling Potential
Application data structure allows for client information storage
No visible recommendation engine implementation yet
Underwriting Logic
Application status tracking
Policy health indicators
Monthly payment tracking to monitor policy status
Technical Implementation
Modern React patterns with hooks and functional components
TypeScript for type safety
RESTful API design with Next.js Route Handlers
Serverless deployment architecture