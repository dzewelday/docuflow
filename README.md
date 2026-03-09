# DocuFlow

DocuFlow is an automated document intelligence platform bootstrapped as an npm-workspaces monorepo.

## Workspaces

- `apps/web`: Nuxt 3 dashboard with a drag-and-drop upload flow
- `apps/api`: Hono API with Prisma-backed document creation
- `shared`: Zod schemas and shared TypeScript contracts

## Getting Started

1. Copy `.env.example` to `.env` and update `DATABASE_URL` if needed.
2. Install dependencies with `npm install`.
3. Generate the Prisma client with `npm run prisma:generate`.
4. Start the apps with `npm run dev`.

The Nuxt app runs on `http://localhost:3000` and the Hono API runs on `http://localhost:3001`.
