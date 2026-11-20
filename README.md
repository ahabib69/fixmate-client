# FixMate Client

FixMate is a repair service booking platform for Bangladesh. Customers book repairs for devices and home appliances, technicians manage jobs, and admins approve services and monitor payments. Prices are in USD and payments use Stripe (test mode).

## Live Links
- Live site: https://fixmate-asad.vercel.app
- Server API: https://fixmate-server.vercel.app/api
- Client repo: https://github.com/ahabib69/fixmate-client
- Server repo: https://github.com/ahabib69/fixmate-server

## Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fixmate.com | Admin123 |
| Technician | rahim@fixmate.com | Rahim123 |
| Customer | customer@fixmate.com | Customer123 |

Stripe test card: `4242 4242 4242 4242`, any future expiry date, any CVC.

## Features
- Public pages: home, services list, service details, about
- Server-side category filter, price sort and pagination
- Sign up and sign in with BetterAuth, session stays after reload
- Role based dashboards: customer, technician, admin (protected routes)
- Customer: request a repair, track bookings, cancel a request, pay after completion with Stripe, payment history
- Technician: add and edit services (image upload via ImgBB), manage incoming requests through the status pipeline (requested, accepted, in-progress, completed) and set the final amount
- Admin: approve or reject services, view users, transactions and revenue stats
- Dark and light theme, responsive layout, mobile menu with keyboard support
- Loading, empty and error states, toast notifications

## Tech Stack and npm Packages
**Dependencies**
- next (App Router), react, react-dom
- better-auth (authentication)
- mongodb (BetterAuth data adapter)
- jsonwebtoken (JWT for the Express API)
- @radix-ui/react-avatar, react-dialog, react-dropdown-menu, react-label, react-select, react-separator, react-slot, react-switch, react-tabs (accessible UI primitives)
- class-variance-authority, clsx, tailwind-merge (styling helpers)
- lucide-react (icons)
- next-themes (dark and light mode)
- recharts (admin charts)
- sonner (toast notifications)

**Dev dependencies**
- typescript, tsx, @types/node, @types/react, @types/react-dom, @types/jsonwebtoken
- tailwindcss, tailwindcss-animate, postcss, autoprefixer
- prettier, mongodb-memory-server

See `package.json` for exact versions.

## Run Locally
```bash
npm install
cp .env.example .env.local
npm run dev
```
The app runs on http://localhost:3000 and needs the server running on port 5000.

## Environment Variables
Create `.env.local` (never commit it):

| Name | Purpose |
|------|---------|
| BETTER_AUTH_SECRET | BetterAuth signing secret |
| BETTER_AUTH_URL | Public URL of this client |
| MONGODB_URI | MongoDB connection string (database `fixmate`) |
| JWT_SECRET | Must be identical to the server value |
| NEXT_PUBLIC_API_URL | Base URL of the Express server |
| NEXT_PUBLIC_IMGBB_API_KEY | ImgBB key for image uploads |

## Deployment
Deployed on Vercel. Environment variables are set in the Vercel project settings. Stripe runs in test mode and no real money is used.