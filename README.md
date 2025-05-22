# LegacyCore - Life Insurance Management System

LegacyCore is a modern web application designed to streamline life insurance sales management for agents and agencies. It provides role-based access for managers and agents with specific features for each role.

## Features

### Manager Features
- Dashboard with organization-wide analytics
- Agent performance monitoring
- All applications view and management
- Carrier performance tracking
- Commission management and reporting

### Agent Features
- Personal dashboard with performance metrics
- Application submission and tracking
- Commission tracking with upline split visibility
- Carrier information access

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Automation**: n8n for workflows
- **UI Components**: Custom components with Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/legacy-core.git
cd legacy-core
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
N8N_WEBHOOK_URL=your-n8n-webhook-url
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

The database consists of the following tables:
- `profiles`: User profiles with role information
- `applications`: Insurance applications
- `carriers`: Insurance carrier information
- `commissions`: Commission tracking and calculations

## Workflow Automation

The application uses n8n for automation of the following workflows:
1. Application Status Change Notifications
2. Commission Approval Alerts
3. Upline Payment Notifications
4. Monthly Performance Reports

## Authentication and Authorization

- Authentication is handled through Supabase Auth
- Role-based authorization is implemented through middleware
- User roles: `manager` and `agent`

## Test Accounts

For testing, you can use the following credentials:
- Manager: `manager@legacycore.io` / `password`
- Agent: `agent@legacycore.io` / `password`

## Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy with automatic builds

## Project Structure

```
src/
├── app/             # Next.js pages and routes
├── components/      # Reusable UI components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and libraries
└── types/           # TypeScript type definitions
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.io)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://radix-ui.com)
- [n8n](https://n8n.io)

## Running in Production Mode

For running the application in production mode locally, we've created several scripts to simplify the process and ensure all static assets are properly loaded.

### On Windows

To run the application in production mode on Windows:

```powershell
# From PowerShell
.\run-production.ps1

# Or using the batch file
start-production.bat
```

### On macOS/Linux

To run the application in production mode on macOS or Linux:

```bash
# Make the script executable first
chmod +x run-production.js

# Then run it
./run-production.js

# Or using Node directly
node run-production.js
```

### What the Production Scripts Do

Our production scripts handle several important steps:

1. Build the Next.js application with `next build`
2. Copy all static assets from the `public` directory to the standalone output
3. Create alternate versions of logo files to support both hyphenated and space-containing filenames
4. Copy the `.next/static` directory to ensure CSS and JavaScript files load properly
5. Verify that all critical directories exist before starting the server
6. Start the production server

### Troubleshooting Production Mode

If you encounter any issues with missing assets:

1. Make sure you're using one of the production scripts rather than running `next build` and `next start` directly
2. Check the error logs for any missing file paths
3. Verify that the static assets exist in both the source directories and the `.next/standalone` output
4. You can manually copy assets using the individual scripts:
   - `node copy-public.js` - Copies public assets
   - `node copy-static.js` - Copies static JS/CSS files

# LegacyCore Nested Project

This is the main application directory for the LegacyCore project. This README contains important information about the deployment process on Vercel.

## Vercel Deployment

This project is configured to deploy on Vercel with a nested directory structure. The main application code is located in this `legacy-core` directory, but the deployment is managed from the parent directory.

### Important Configuration Files

- `vercel.json` (in parent directory): Configures Vercel to build from this nested directory
- `next.config.js`: Contains Next.js configuration optimized for Vercel deployment
- `.vercelignore` (in parent directory): Excludes unnecessary files from deployment

### Environment Variables Required

Make sure these environment variables are set in your Vercel project:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

### Deployment Process

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure the environment variables in the Vercel dashboard
4. Deploy the project

### Manual Deployment with Vercel CLI

If you prefer manual deployment:

```bash
# From the parent directory
vercel login
vercel
```

For production deployment:

```bash
vercel --prod
```

## Local Development

To run this project locally:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Output Mode

This project uses Next.js `output: 'standalone'` mode, which creates a standalone build in `.next/standalone` that includes all dependencies needed to run the application.
