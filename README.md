# Webgent

The marketing site, admin panel and AI sales consultant for Webgent, a web development studio.

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Prisma + PostgreSQL, NextAuth v5, Upstash Redis, Gemini, Supabase Storage, Resend.

## Getting started

Requires Node.js 20 or newer and PostgreSQL.

```bash
npm install
cp .env.example .env        # then fill in the values
npm run db:deploy           # create the database tables
npm run db:seed             # create the admin user (needs SEED_ADMIN_PASSWORD)
npm run dev
```

The site runs at http://localhost:3000 and the admin panel at `/admin`.

`DATABASE_URL`, `DIRECT_URL` and `AUTH_SECRET` are required. Generate the secret with `openssl rand -base64 48`. Other integrations are optional: without a Gemini key the chat uses built-in replies, and without notification credentials alerts are skipped.

## Project layout

| Path | Contents |
| --- | --- |
| `src/app` | Pages and API routes. Admin APIs live under `src/app/api/admin`. |
| `src/proxy.ts` | First-line check on `/admin` and `/api/admin` requests. |
| `src/lib/auth-credentials.ts` | Login, rate limiting and live session checks. |
| `src/lib/services/ai-consultant` | Chat intent detection, price calculator, prompts and fallback replies. |
| `src/lib/services/cms*.ts` | Site content stored as `SiteSetting` JSON, with caching. |
| `src/lib/pricing.config.ts` | Default prices. Admin changes are stored in the database and take priority. |
| `prisma` | Schema, migrations and seed data. |

## Conventions

- **Prices:** never write a price into chat copy. Use the calculator or the pricing data, so admin changes apply everywhere.
- **Authorization:** every admin route must call `verifyAdminApiAccess` or `verifyStrictAdminApiAccess`. `src/proxy.ts` alone is not enough, because it can't see account changes.
- **Database changes:** always add a migration with `npm run db:migrate`, not `db:push`, so fresh databases stay correct.
- **Blog and case-study content:** written in Markdown. Raw HTML is not rendered.

## Testing

Tests create and delete rows, so they run against a separate local database and refuse to run on any other host.

```bash
createdb webgent_test
cp .env.test.example .env.test   # adjust the connection details if needed
npm run test:db                  # apply migrations to the test database
npm run test:unit
npm run typecheck
npm run lint
```

`npm test` runs older end-to-end scripts in `scripts/test-phase*.ts`, some of which expect a running app. GitHub Actions runs type checks, lint, unit tests and a build on every push and pull request.

## Deploying

The site is designed for Vercel. For each deployment:

1. Set the environment variables, using a private `AUTH_SECRET`. The app refuses to start in production with the value that was once published in this repository.
2. Run `npm run db:deploy` against the production database when there are new migrations.
