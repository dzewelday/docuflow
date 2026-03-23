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
3. Ensure the parent directory for your SQLite file exists, for example `mkdir -p /tmp/docuflow`.
4. Apply the Prisma migration with `npm run prisma:migrate`.
5. Generate the Prisma client with `npm run prisma:generate`.
6. Start the apps with `npm run dev`.

The Nuxt app runs on `http://localhost:3000`, the Hono API runs on `http://localhost:3001`, and the worker runs as a separate background process.

## Pipeline Flow

1. The frontend calls `POST /uploads/initiate` with file metadata.
2. The API validates the file, creates a `PENDING_UPLOAD` document, and returns a signed local upload target.
3. The browser uploads the file directly to the signed target, then calls `POST /uploads/:documentId/complete`.
4. The worker claims `UPLOADED` documents, extracts text, and stores normalized JSON plus raw extracted text.
5. The frontend receives `status_changed` events over SSE from `GET /documents/:id/events`.

## Required Environment

- `DATABASE_URL`: absolute SQLite file URL for Prisma, for example `file:/tmp/docuflow/docuflow.db`
- `API_BASE_URL`: public API origin used when generating signed local upload targets
- `NUXT_PUBLIC_API_BASE`: frontend API base URL
- `LOCAL_STORAGE_DIR`: local file storage root for uploaded files
- `MAX_UPLOAD_SIZE_BYTES`: upload limit enforced during initiation
- `ALLOWED_UPLOAD_MIME_TYPES`: comma-separated MIME allowlist
- `UPLOAD_SIGNING_SECRET`: HMAC secret for local signed upload URLs
- `INTERNAL_EVENT_TOKEN`: shared token the worker uses to publish SSE events through the API

The API and worker must point at the same SQLite file and are intended to run on the same machine or a shared filesystem. This configuration supports a single worker process.

Chase Sapphire Preferred® Card
Chase Freedom Flex®
Amazon Prime Store Card by Synchrony
American Express® Gold Card
Apple Card
Discover it® Cash Back
Capital One Quicksilver Cash Rewards Credit Card


- Design and develop full-stack web applications using Java (Spring Boot) and Vue.js with TypeScript, including leading the modernization of a legacy Visual Basic desktop system into a cloud-native web platform with RESTful APIs
- Build and maintain scalable backend services and APIs integrating with enterprise data platforms including SQL Server, MarkLogic, Elasticsearch, and Snowflake, leveraging Redis caching to improve application performance and response times
- Contribute to system architecture, API design, and technical decision-making while collaborating with engineers, product teams, and stakeholders to deliver reliable production systems
- Work in a trunk-based development environment with pair programming, automated testing, and CI/CD pipelines using GitHub Actions and Concourse, deploying to VMware Tanzu with a migration toward Kubernetes-based infrastructure
