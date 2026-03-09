# DocuFlow

DocuFlow is an automated document intelligence pipeline bootstrapped as an npm-workspaces monorepo.

## Workspaces

- `apps/web`: Nuxt dashboard that initiates uploads and subscribes to live status updates
- `apps/api`: Hono API for validation, signed local uploads, document retrieval, and SSE delivery
- `apps/worker`: background processor that extracts text and writes normalized output
- `shared`: Zod schemas and shared TypeScript contracts

## Getting Started

1. Copy `.env.example` to `.env` and update `DATABASE_URL` if needed.
2. Install dependencies with `npm install`.
3. Generate the Prisma client with `npm run prisma:generate`.
4. Apply the Prisma migration once PostgreSQL is running with `npm run prisma:migrate`.
5. Start the apps with `npm run dev`.

The Nuxt app runs on `http://localhost:3000`, the Hono API runs on `http://localhost:3001`, and the worker runs as a separate background process.

## Pipeline Flow

1. The frontend calls `POST /uploads/initiate` with file metadata.
2. The API validates the file, creates a `PENDING_UPLOAD` document, and returns a signed local upload target.
3. The browser uploads the file directly to the signed target, then calls `POST /uploads/:documentId/complete`.
4. The worker claims `UPLOADED` documents, extracts text, and stores normalized JSON plus raw extracted text.
5. The frontend receives `status_changed` events over SSE from `GET /documents/:id/events`.

## Required Environment

- `DATABASE_URL`: PostgreSQL connection string for Prisma
- `API_BASE_URL`: public API origin used when generating signed local upload targets
- `NUXT_PUBLIC_API_BASE`: frontend API base URL
- `LOCAL_STORAGE_DIR`: local file storage root for uploaded files
- `MAX_UPLOAD_SIZE_BYTES`: upload limit enforced during initiation
- `ALLOWED_UPLOAD_MIME_TYPES`: comma-separated MIME allowlist
- `UPLOAD_SIGNING_SECRET`: HMAC secret for local signed upload URLs
- `INTERNAL_EVENT_TOKEN`: shared token the worker uses to publish SSE events through the API
