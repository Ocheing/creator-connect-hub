# MicroMatch Backend — Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                  │
│  ┌──────────┐ ┌──────────┐ ┌─────────────────────┐ │
│  │ AuthCtx  │ │ Services │ │  React Query Hooks  │ │
│  └────┬─────┘ └────┬─────┘ └──────────┬──────────┘ │
│       │             │                  │            │
│       ▼             ▼                  ▼            │
│  ┌─────────────────────────────────────────────────┐│
│  │           Supabase Client (supabase-js)         ││
│  └─────────────────────┬───────────────────────────┘│
└────────────────────────┼────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│                   Supabase Backend                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │   Auth   │ │ Database │ │ Storage  │ │  Edge Fn │ │
│  │          │ │ (Postgres)│ │ (S3)    │ │          │ │
│  │• Sign up │ │• 17 tables│ │• avatars│ │• webhook │ │
│  │• Sign in │ │• RLS     │ │• logos  │ │• leads   │ │
│  │• Reset   │ │• Triggers│ │• media  │ │          │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
└────────────────────────────────────────────────────────┘
```

---

## 1. Supabase Project Setup

### Create a New Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Save your project URL and anon key

### Run Migrations
In the Supabase SQL Editor, execute the following files **in sequence**:

```
1. supabase/migrations/001_schema.sql    ← Tables, enums, functions, triggers
2. supabase/migrations/002_rls_policies.sql  ← Row-Level Security
3. supabase/migrations/003_storage.sql   ← Storage buckets & policies
```

---

## 2. Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_APP_URL=http://localhost:5173
```

---

## 3. Edge Functions

### Deploy Edge Functions

```bash
# Install Supabase CLI (if not installed)
npm i -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy payment-webhook
supabase functions deploy submit-lead
```

### Set Edge Function Secrets

```bash
supabase secrets set PAYMENT_WEBHOOK_SECRET=your-secret
supabase secrets set PAYSTACK_SECRET_KEY=sk_test_xxx
```

---

## 4. Supabase Auth Configuration

In your Supabase Dashboard → Authentication → Settings:

1. **Site URL**: Set to your production URL (e.g., `https://micromatch.co`)
2. **Redirect URLs**: Add allowed redirect URLs:
   - `http://localhost:5173/sign-in`
   - `https://yourdomain.com/sign-in`
   - `https://yourdomain.com/reset-password`
3. **Email Templates**: Customize the confirmation and reset email templates
4. **Disable "Confirm email"** in development (re-enable in production!)
5. **Password settings**: Min 8 characters (already enforced in frontend)

---

## 5. File Structure

```
src/
├── App.tsx                        # Root with AuthProvider + route guards
├── contexts/
│   └── AuthContext.tsx            # Auth state, sign up/in/out, role checks
├── components/
│   └── auth/
│       └── ProtectedRoute.tsx     # Route guards (role-based)
├── hooks/
│   └── useSupabase.ts            # React Query hooks for all services
├── lib/
│   └── supabase.ts               # Typed Supabase client
├── services/
│   └── api.ts                     # Service layer (all CRUD operations)
├── types/
│   └── database.types.ts          # TypeScript types from schema
└── pages/
    ├── SignUp.tsx                  # Real Supabase sign up
    ├── SignIn.tsx                  # Real Supabase sign in
    ├── dashboard/
    │   ├── InfluencerDashboard.tsx
    │   └── BrandDashboard.tsx
    └── admin/
        ├── AdminDashboard.tsx
        └── ContentManagement.tsx

supabase/
├── migrations/
│   ├── 001_schema.sql             # Full database schema
│   ├── 002_rls_policies.sql       # Row-Level Security
│   └── 003_storage.sql            # Storage buckets & policies
└── functions/
    ├── payment-webhook/
    │   └── index.ts               # Payment webhook handler
    └── submit-lead/
        └── index.ts               # Lead submission with rate limiting
```

---

## 6. Database Tables

| Table | Description | RLS |
|-------|-------------|-----|
| `profiles` | Core user profiles | ✅ |
| `influencer_profiles` | Influencer-specific data | ✅ |
| `brand_profiles` | Brand-specific data | ✅ |
| `campaigns` | Marketing campaigns | ✅ |
| `campaign_applications` | Influencer applications | ✅ |
| `campaign_matches` | Admin-matched pairs | ✅ |
| `payments` | Brand payments | ✅ |
| `payouts` | Influencer payouts | ✅ |
| `transaction_log` | Financial audit trail | ✅ |
| `messages` | Direct messages | ✅ |
| `notifications` | System notifications | ✅ |
| `blog_posts` | Blog content | ✅ |
| `testimonials` | Social proof | ✅ |
| `pricing_packages` | Service packages | ✅ |
| `platform_settings` | Global config | ✅ |
| `leads` | Lead capture | ✅ |
| `rate_limit_tracker` | Anti-spam tracking | ✅ |

---

## 7. Security Checklist

- [x] RLS enabled on **all 17 tables**
- [x] `SECURITY DEFINER` functions for financial operations
- [x] Idempotency keys on payments/payouts
- [x] Rate limiting on lead submissions
- [x] Spam detection heuristics
- [x] Webhook signature verification
- [x] No client-side trust (all validation server-side)
- [x] Computed columns for commission (cannot be manipulated)
- [x] Cascade deletes with `RESTRICT` on financial records
- [x] Transaction logging for audit trail
- [x] Storage file size & MIME type restrictions
- [x] Ownership-based storage access policies

---

## 8. Quick Start (Development)

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.example .env

# 3. Add your Supabase credentials to .env

# 4. Run migrations in Supabase SQL Editor (001, 002, 003)

# 5. Start development server
npm run dev
```

---

## 9. Production Checklist

- [ ] Enable email confirmation in Supabase Auth
- [ ] Set production URLs in Auth redirect settings
- [ ] Deploy Edge Functions
- [ ] Set Edge Function secrets
- [ ] Configure payment webhook URLs in payment provider
- [ ] Set up Supabase project for a paid plan (for production limits)
- [ ] Enable Point-in-Time Recovery (PITR) for database backups
- [ ] Configure custom SMTP for transactional emails
- [ ] Set up monitoring and alerting
- [ ] Test all RLS policies with different user roles
