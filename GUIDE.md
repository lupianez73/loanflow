# LoanFlow — Full-Stack Study Guide

> LoanFlow simulates what a direct-to-consumer mortgage lender runs in production:
> thousands of loan applications flowing through intake, review, and funding every day.
> Every feature in this project maps to a core full-stack skill
> (Vue/Nuxt, Node.js, TypeScript, MS SQL, Docker, CI/CD, cloud deployment).

---

## What This Project Teaches (Mapped to Core Skills)

| Skill | Where It Is in LoanFlow |
|---|---|
| Vue 3 | All pages and components in `app/` |
| Nuxt.js | `nuxt.config.ts`, layouts, routing, SSR, `useFetch` |
| Node.js backend | `server/api/` — Nitro IS Node.js |
| TypeScript | Every `.ts` and `.vue` file is fully typed |
| MS SQL experience | Prisma schema with MS SQL comments; `docker-compose.yml` has MS SQL 2022 |
| RESTful API design | `/api/loans` CRUD, `/api/auth/*`, `/api/dashboard/stats` |
| Docker | `Dockerfile` (multi-stage), `docker-compose.yml` with MS SQL |
| CI/CD pipelines | `.github/workflows/ci.yml` — type-check + build + schema validation |
| Azure deployment | This guide's Azure section + `docker-compose.yml` ready for Azure Container Apps |
| Database design | Prisma schema: indexes, foreign keys, transactions, audit trail |
| State management (Pinia) | `app/stores/auth.ts`, `app/stores/loans.ts` |
| Form validation | `app/pages/loans/new.vue` with VeeValidate + Zod |
| Security practices | HTTP-only cookies, bcrypt hashing, JWT auth, security headers |

---

## Nuxt 3 vs Plain Vue 3 — What's New

You already know Vue 3. Nuxt adds:

### 1. File-based routing
```
app/pages/index.vue          → /
app/pages/dashboard/index.vue → /dashboard
app/pages/loans/[id].vue     → /loans/:id   (dynamic route)
```
No `vue-router` setup. No route definitions. The filesystem IS the router.

### 2. Nitro server engine
```
server/api/loans/index.get.ts   → GET  /api/loans
server/api/loans/index.post.ts  → POST /api/loans
server/api/loans/[id].patch.ts  → PATCH /api/loans/:id
```
This IS Node.js. No Express. Just `defineEventHandler()`. Deploy on any Node.js host.

### 3. Auto-imports — no more import statements
```vue
<script setup>
// In plain Vue: import { ref, computed, watch } from 'vue'
// In Nuxt: just use them — Nuxt auto-imports everything
const count = ref(0)
const double = computed(() => count.value * 2)
</script>
```
Your composables in `app/composables/` and stores in `app/stores/` are ALSO auto-imported.

### 4. SSR/SSG/Hybrid rendering
```typescript
// Per-route rendering strategy in nuxt.config.ts:
routeRules: {
  '/':          { prerender: true },   // built to static HTML at build time
  '/dashboard': { ssr: true },         // always server-rendered
  '/api/**':    { cors: true },        // API routes, CORS enabled
}
```

### 5. `useFetch` vs `$fetch` vs `useAsyncData`
| API | When to use |
|---|---|
| `useFetch('/api/x')` | In templates — reactive, auto-refreshes, SSR-aware |
| `$fetch('/api/x')` | In store actions / event handlers — like axios |
| `useAsyncData('key', () => fetch())` | When you need a custom key for deduplication |

### 6. Layouts system
```
app/layouts/default.vue  → sidebar + topbar (authenticated pages)
app/layouts/auth.vue     → centered card (login page)
```
A page picks its layout: `definePageMeta({ layout: 'auth' })`

### 7. `nuxt.config.ts` = everything in one place
Replaces `vite.config.ts` + `main.ts` + router config + plugin registration.

---

## Nuxt vs Next.js — Side by Side

| Concept | Nuxt 3 (LoanFlow) | Next.js (NexDash) |
|---|---|---|
| Framework | Vue 3 | React 18 |
| File routing | `app/pages/` | `src/app/` |
| Layout | `app/layouts/default.vue` with `<slot>` | `src/app/(dashboard)/layout.tsx` with `{children}` |
| Data fetching | `useFetch()`, `$fetch()` | `fetch()` in Server Components, React Query |
| State | Pinia | Zustand |
| Forms | VeeValidate + Zod | React Hook Form + Zod |
| Auth | Manual JWT or nuxt-auth-utils | NextAuth v5 |
| Server | Nitro (H3 framework) | Next.js API routes (Node.js) |
| API handler | `defineEventHandler(event => ...)` | `export async function GET(req) {...}` |
| Middleware | `defineNuxtRouteMiddleware()` (client) | `middleware.ts` on Edge Runtime (server) |
| Plugin | `defineNuxtPlugin()` | Server Components, React Context |
| Auto-imports | Yes — ref, computed, useFetch, etc. | No — explicit imports required |
| SSR | Built-in, per-route configurable | Built-in, per-component (Server vs Client) |
| Deployment | Any Node.js / Vercel / Azure | Vercel-optimized / any Node.js |

---

## Node.js Backend Patterns (Nitro = Node.js)

Nitro is just an abstraction over Node.js. Everything you'd write in Express applies:

```typescript
// Express:
router.get('/loans', authenticate, async (req, res) => {
  const loans = await db.query('SELECT * FROM loans')
  res.json(loans)
})

// Nitro (LoanFlow's server/api/loans/index.get.ts):
export default defineEventHandler(async (event) => {
  const user  = await requireAuth(event)   // same as authenticate middleware
  const loans = await prisma.loanApplication.findMany()
  return loans  // auto-serialized to JSON
})
```

### Key H3 (Nitro's framework) helpers:
```typescript
readValidatedBody(event, schema.parse)  // read + validate request body
getValidatedQuery(event, schema.parse)  // read + validate query params
getRouterParam(event, 'id')             // URL params like :id
setCookie(event, 'name', value, opts)   // set response cookie
getCookie(event, 'name')                // read request cookie
setResponseStatus(event, 201)           // HTTP status code
createError({ statusCode: 404 })        // throw HTTP errors
```

---

## MS SQL Patterns via Prisma

### Why Prisma instead of raw SQL?
- Type-safe queries — TypeScript knows the shape of every result
- Parameterized queries by default — SQL injection impossible
- Schema-as-code — the `schema.prisma` file IS your database schema
- Switch databases without rewriting queries

### Switching from SQLite (dev) to MS SQL Server (production):
```prisma
// prisma/schema.prisma

// Development (SQLite):
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// Production (SQL Server):
datasource db {
  provider = "sqlserver"
  url      = env("DATABASE_URL")
}

// DATABASE_URL in production:
// sqlserver://server:1433;database=LoanFlow;user=sa;password=P@ssw0rd;trustServerCertificate=true
```

### Index design (SQL Server CREATE INDEX equivalent):
```prisma
model LoanApplication {
  @@index([status])          // CREATE INDEX idx_status ON loan_applications(status)
  @@index([submittedAt])     // speeds up ORDER BY submittedAt
  @@index([assignedOfficerId]) // speeds up WHERE assignedOfficerId = ?
}
```

### Transactions (BEGIN TRANSACTION / COMMIT):
```typescript
// server/api/loans/index.post.ts
const result = await prisma.$transaction(async (tx) => {
  const loan = await tx.loanApplication.create({ data: {...} })
  await tx.statusHistory.create({ data: { applicationId: loan.id, ... } })
  return loan
  // If EITHER write fails → both are rolled back automatically
})
```

### Aggregate queries (SQL GROUP BY, SUM, AVG):
```typescript
// server/api/dashboard/stats.get.ts
await prisma.loanApplication.groupBy({
  by:     ['status'],         // GROUP BY status
  _count: { id: true },       // COUNT(id)
})
// SQL equivalent: SELECT status, COUNT(id) FROM loan_applications GROUP BY status

await prisma.loanApplication.aggregate({
  _sum: { loanAmount: true }, // SUM(loanAmount)
  _avg: { loanAmount: true }, // AVG(loanAmount)
})
```

---

## TypeScript Full-Stack Patterns

```typescript
// Define the type once (app/stores/loans.ts)
export interface LoanApplication {
  id:                string
  applicationNo:     string
  status:            string
  loanAmount:        number
  borrowerFirstName: string
  // ...
}

// Use in store (Pinia)
const applications = ref<LoanApplication[]>([])

// Use in useFetch (auto-typed from the API response)
const { data } = await useFetch<{ data: LoanApplication[] }>('/api/loans')

// Server validates with Zod (runtime) + TypeScript (compile-time)
const schema = z.object({ loanAmount: z.number().min(10000) })
const body   = await readValidatedBody(event, schema.parse)  // throws 422 if invalid
```

---

## Docker + Azure Deployment

### Dockerfile explained:
```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder  # Alpine = tiny Linux (only ~5MB)
RUN npm ci                       # Install exact versions from package-lock.json
RUN npm run build                # Nuxt/Nitro compiles to .output/

# Stage 2: Runner — only what's needed to run (no node_modules, no src)
FROM node:20-alpine AS runner
COPY --from=builder /app/.output ./output
CMD ["node", "output/server/index.mjs"]  # Nitro's standalone server
```

### Azure deployment options:
1. **Azure Container Apps** (recommended) — serverless containers, auto-scaling
   ```bash
   az containerapp up --name loanflow --source . --target-port 3000
   ```
2. **Azure App Service** — PaaS, easier but less control
3. **Azure Kubernetes Service (AKS)** — for large teams with DevOps maturity

### Azure SQL Database (MS SQL in the cloud):
- Fully managed MS SQL Server
- Connection string: `sqlserver://your-server.database.windows.net:1433;database=LoanFlow;...`
- Free tier: 100,000 vCore-seconds/month

---

## Practice Interview Questions

**Q1: "Walk me through how a loan application flows through your system."**
> "The borrower submits via the `/api/loans` POST endpoint. The server validates the data with Zod, generates a sequential application number (APP-YYYY-XXXXXX), creates the loan record AND an initial status history row in a single Prisma transaction — so either both succeed or neither does. The loan officer sees it on the dashboard via the grouped-by-status aggregate query, then updates the status via PATCH which adds another status history row for the audit trail."

**Q2: "How do you prevent SQL injection?"**
> "Prisma generates parameterized queries automatically. Every `where` clause with user input becomes a prepared statement — the string is never interpolated into SQL. In the loans list endpoint, even the dynamic `OR` search clause uses Prisma's `{ contains: searchTerm }` syntax which becomes `WHERE borrowerFirstName LIKE @p1`."

**Q3: "How does your auth work without a library like NextAuth?"**
> "JWT signed with HMAC-SHA256 using the Web Crypto API — no external library needed in Node 20+. The token is stored in an HTTP-only cookie so JavaScript can't read it (XSS-proof). The server validates the signature on every request and checks the expiry timestamp. `requireAuth()` is a single utility that every protected endpoint calls."

**Q4: "Why Nuxt over plain Vue?"**
> "Nuxt gives us SSR for free — the dashboard's first paint includes real data from the database, which is critical for a B2B tool where loan officers open the app every morning and need instant data. Nitro's server engine means I don't need a separate Express/Fastify service; the same codebase serves both the frontend and the API. File-based routing eliminates router config boilerplate."

**Q5: "How would you scale this for thousands of loan officers?"**
> "Database indexes on the hot query paths (status, assignedOfficerId, submittedAt) — already in the schema. The dashboard stats query runs 4 Prisma queries in parallel with `Promise.all`. For read scaling: Azure SQL read replicas. For connection scaling: PgBouncer/SQL Server connection pool in front of the DB. The Nitro server is stateless and horizontally scalable behind a load balancer."

**Q6: "Explain the difference between useFetch and $fetch in Nuxt."**
> "`useFetch` is for templates — it's reactive, runs on the server during SSR (so data is in the HTML), and caches by URL. `$fetch` is imperative — I use it in Pinia actions and event handlers where I need to await a result and handle errors explicitly, like in the login action where I need to check if it succeeded before calling `navigateTo`."

**Q7: "How do you handle TypeScript across the full stack?"**
> "Prisma generates types from the schema automatically. The `LoanApplication` interface in the Pinia store is the source of truth for the client. Zod validation schemas on the API ensure the types match at runtime. So TypeScript catches shape mismatches at compile time AND Zod catches them at runtime — two layers of type safety."

**Q8: "Describe your CI/CD setup."**
> "GitHub Actions runs on every push and PR. It type-checks with `vue-tsc`, validates the Prisma schema, and runs a full `nuxt build` — if any step fails, the PR is blocked. For deployment: the same pipeline could push to Azure Container Registry, then Azure Container Apps pulls the new image. Zero-downtime rolling update is built into Container Apps."

**Q9: "How would you add multi-tenancy for different mortgage companies?"**
> "Add a `tenantId` column to every table with a composite unique index (tenantId + email, tenantId + applicationNo). The `requireAuth` middleware extracts `tenantId` from the JWT and adds it to every Prisma `where` clause. Row-level security ensures one company can never see another's data."

**Q10: "How do you handle PII (SSN, income) in the database?"**
> "In production, SSN would be encrypted at rest using AES-256 before storage and decrypted on read — only authorized roles (ADMIN, LOAN_OFFICER assigned to the loan) can trigger the decryption. Azure SQL Transparent Data Encryption (TDE) encrypts the database files. HTTPS in transit. HTTP-only cookies for sessions. The `requireAdmin` guard on sensitive endpoints adds RBAC on top."

---

## What to Build Next (Portfolio Completeness)

**Feature 1: Loan detail page** (`app/pages/loans/[id].vue`)
- Full loan info + status update buttons + status history timeline
- Add internal notes form
- Shows the complete Vue 3 reactivity + Pinia flow

**Feature 2: Document upload** (`server/api/loans/[id]/documents.post.ts`)
- Multipart form upload → save to cloud object storage (e.g. Azure Blob Storage or S3)
- Shows: file handling in Nitro, Azure SDK usage

**Feature 3: User management** (Admin only)
- CRUD for loan officers
- Role-based access enforcement on both client (v-if) and server (requireAdmin)
- Teaches: RBAC patterns common in enterprise apps

**Feature 4: Email notifications**
- Trigger when loan status changes
- Use a transactional email service (e.g. Azure Communication Services, SES, SendGrid)
- Teaches: async side-effects in Node.js without blocking the response

**Feature 5: Reports page**
- Monthly funded volume chart (Chart.js or VueChartJS)
- Export to CSV/Excel (loan officers love Excel)
- Teaches: data aggregation, file downloads from a Node.js API

---

## Commands Reference

```bash
# Setup
npm install                          # install deps
npx prisma migrate dev --name init   # create DB + run migration
npx prisma studio                    # visual DB browser at localhost:5555

# Development
npm run dev                          # start dev server at localhost:3000

# Database
npx prisma migrate dev --name <name> # create and apply a new migration
npx prisma generate                  # regenerate Prisma client after schema change
npx prisma db push                   # quick sync schema without migration file (dev only)

# Production checks
npm run build                        # full production build (catches all TS errors)
npm run typecheck                    # type-check without building

# Docker
docker compose up -d                 # start app + MS SQL Server
docker compose down                  # stop everything

# Connect to MS SQL in Docker
docker exec -it loanflow-mssql-1 /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrong@Password123!' -Q "SELECT name FROM sys.databases"
```

---

## Resources

| Topic | Resource |
|---|---|
| Nuxt 3 docs | https://nuxt.com/docs |
| Nitro server | https://nitro.unjs.io |
| Pinia | https://pinia.vuejs.org |
| Prisma | https://www.prisma.io/docs |
| VeeValidate | https://vee-validate.logaretm.com |
| Zod | https://zod.dev |
| Azure Container Apps | https://learn.microsoft.com/azure/container-apps |
| MS SQL + Prisma | https://www.prisma.io/docs/orm/overview/databases/sql-server |
| Docker multi-stage builds | https://docs.docker.com/build/building/multi-stage |

---

> **Key insight for fintech/mortgage interviews:**
> Mortgage is a regulated, high-stakes domain. Employers want engineers who understand:
> (1) **Data integrity** — transactions, immutable audit trails, no data loss
> (2) **Security** — PII protection, RBAC, encrypted storage
> (3) **Reliability** — what happens when the DB is slow? when a request fails?
>
> This project demonstrates all three. Reference specific code when answering — that's what separates a senior dev from a mid-level one.
