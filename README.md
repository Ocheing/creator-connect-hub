# Creator Connect Hub (MicroMatch)

A micro-influencer marketing platform that connects brands with authentic creators (1K–10K followers) for impactful marketing campaigns.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, shadcn/ui components
- **Backend:** Supabase (Auth, Database, Storage, Real-time)
- **State Management:** TanStack React Query
- **Routing:** React Router v6
- **Animation:** Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com) project with the migrations applied

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd creator-connect-hub

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase URL and anon key

# Start the development server
npm run dev
```

### Database Setup

Run the SQL migrations in order against your Supabase instance:

```
supabase/migrations/001_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_storage.sql
supabase/migrations/005_categories.sql
supabase/migrations/006_success_stories.sql
```

## Available Scripts

| Command          | Description                        |
| ---------------- | ---------------------------------- |
| `npm run dev`    | Start the dev server (port 8080)   |
| `npm run build`  | Production build                   |
| `npm run preview`| Preview the production build       |
| `npm run lint`   | Lint with ESLint                   |
| `npm run test`   | Run tests with Vitest              |

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── auth/       # Auth guards (ProtectedRoute, etc.)
│   ├── dashboard/  # Dashboard layout & widgets
│   ├── home/       # Landing page sections
│   ├── layout/     # Global layout (Header, Footer)
│   └── ui/         # shadcn/ui primitives
├── contexts/       # React context providers (Auth)
├── hooks/          # Custom hooks
├── lib/            # Utilities (supabase client, utils)
├── pages/          # Route pages
│   ├── admin/      # Admin panel pages
│   └── dashboard/  # User dashboard pages
├── services/       # API service layer (Supabase queries)
└── types/          # TypeScript type definitions
```

## Deployment

Build the production bundle and deploy to any static hosting provider:

```sh
npm run build
# Deploy the `dist/` directory
```

Compatible with Vercel, Netlify, Cloudflare Pages, or any static host.

## License

Private — All rights reserved.
