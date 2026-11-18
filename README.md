# FixMate Client

A repair marketplace for Bangladesh. Customers find approved services and track repairs; technicians manage their work; administrators review listings and monitor the platform. Prices are in USD and checkout uses Stripe test mode.

## Stack

Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, shadcn-style Radix primitives, BetterAuth with its MongoDB adapter, sonner, Recharts, lucide-react, and next-themes. The separate Express project provides the application API; this Next.js project hosts authentication and the short-lived JWT bridge.

## Quick start

Use Node.js 22 LTS and MongoDB 7 or later. Atlas is recommended; authentication uses MongoDB transactions, so a local deployment must be a replica set.

```bash
npm ci
cp .env.example .env.local
# Configure the environment values listed below.
npm run dev
```

Start `fixmate-server` in another terminal. Both projects use the database named `fixmate`, regardless of the database path in the connection string. See `RUNBOOK.md` in the final archive for seed, deployment and webhook instructions.

## Environment

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | Same MongoDB cluster as the Express API; server-only |
| `BETTER_AUTH_SECRET` | Random secret of at least 32 characters; server-only |
| `BETTER_AUTH_URL` | Exact client origin, e.g. `http://localhost:3000`; no trailing slash |
| `JWT_SECRET` | Shared with the Express API; keep it server-only |
| `NEXT_PUBLIC_API_URL` | Express origin, e.g. `http://localhost:5000`; no trailing slash |
| `NEXT_PUBLIC_IMGBB_API_KEY` | ImgBB upload key used by the browser |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Optional BetterAuth provider configuration; the included sign-in forms use email/password |

`NEXT_PUBLIC_*` values are embedded at build time. Changing them on a deployed app requires a rebuild. The ImgBB browser key is inherently public; never put JWT, Stripe or database secrets in a public variable.

## Routes

- Public: `/`, `/services`, `/services/[id]`, `/about`, `/sign-in`, `/sign-up`.
- Customer: `/dashboard/customer`, `/dashboard/customer/bookings`, `/dashboard/customer/payments`.
- Technician: `/dashboard/technician`, `/dashboard/technician/add-service`, `/dashboard/technician/my-services`, `/dashboard/technician/requests`.
- Admin: `/dashboard/admin`, `/dashboard/admin/users`, `/dashboard/admin/services`, `/dashboard/admin/bookings`, `/dashboard/admin/transactions`.
- Shared profile: `/dashboard/profile`. `/dashboard` redirects to the appropriate overview.
- Stripe returns: `/payment/success?session_id=…`, `/payment/cancel`.
- Authentication: `/api/auth/[...all]`, `/api/auth/token`.

## How it fits together

1. BetterAuth stores users, credential accounts and sessions in MongoDB. Signup accepts customer or technician; an admin cannot register through signup. The user-update hook rejects attempts to change a role through BetterAuth.
2. `/api/auth/token` reads the authenticated session and signs a 15-minute JWT. The browser caches it for 14 minutes and clears it on sign-out/sign-in.
3. API calls send `Authorization: Bearer …` to Express. Express re-reads the user's role from MongoDB, so the token's role is never authoritative.
4. Dashboard guards wait for session loading and redirect to the right role. The API independently enforces permissions and ownership.
5. Checkout creation sends only a booking ID. The server calculates the amount from the stored final amount. The success page and signed webhook share an idempotent recorder.

## Design and components

- Deep navy for structure, orange for primary actions; light and dark modes use CSS variables.
- Booking status colors: Requested blue, Accepted indigo, In Progress amber, Completed green, Rejected red, Cancelled gray.
- `components/ui`: reusable Radix-based controls and Tailwind variants.
- `components/services`, `components/dashboard`, `components/admin`: focused feature components.
- `hooks/useResource`: cancellable-effect data loading with retry; `lib/api.ts`: API and token bridge helpers.
- Uploaded images use ImgBB. Supported sources for Next Image are ImgBB, Unsplash, and pravatar.
- Social controls share the current configured site on X, Facebook and LinkedIn; no fictional company profiles are linked.

## Checks

```bash
npm run typecheck
npm run build
npm run test:integration
```

The integration suite requires the sibling `fixmate-server` folder with dependencies installed. It starts its own temporary MongoDB 7 replica set, seeds that temporary database, tests BetterAuth and the Express API, then shuts everything down. The first run downloads a MongoDB binary and needs internet access. It does not use your `.env.local`, Stripe account, or production database. Do not run against a custom database: the test creates and resets its own database by design.

`npm run lint` is a TypeScript check, not an ESLint ruleset. `npm run format` formats the maintained source and documentation.

## Test logins

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@fixmate.com | Admin123 |
| Technician | rahim@fixmate.com | Rahim123 |
| Technician | sara@fixmate.com | Sara123 |
| Technician | tanvir@fixmate.com | Tanvir123 |
| Customer | customer@fixmate.com | Customer123 |
| Customer | nusrat@fixmate.com | Nusrat123 |
| Customer | mehedi@fixmate.com | Mehedi123 |

These accounts exist after the server seed command. Use a disposable database for demonstrations, and never retain these public credentials on a real service.

## Deployment

Deploy this folder as a Next.js project on Vercel, add the environment variables, and set `BETTER_AUTH_URL` to its exact HTTPS origin. Deploy the Express project separately, set its `CLIENT_URL` to this client origin, then rebuild this client with the deployed API URL. The authentication routes need Node.js, not an Edge runtime. Do not seed during builds.

This project is delivered as source, not a deployed service. External imagery needs network access. Real Stripe checkout and ImgBB uploads require your own test credentials; payment-provider business eligibility must be reviewed before any real-money launch.
