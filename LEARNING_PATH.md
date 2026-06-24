# LoanFlow — Learning Path
**Nuxt 3 + Node.js + MS SQL for Vue Developers**

> You already know Vue 3. This path focuses on what's NEW:
> Nuxt's server engine (Nitro), file-based routing, SSR, and the MS SQL patterns
> used in enterprise full-stack apps.

---

## Before You Start

```bash
cd ~/src/loanflow
npm run dev
# Open http://localhost:3000
# Login: admin@loanflow.com / Admin123!
```

Explore the app first. Try to login, view the dashboard, create a loan application,
use the rate calculator. Then open the code and read WHY each thing works.

---

## The Golden Rule

Every time you add a page, ask yourself:

> **"Does this data need to be live (SSR) or is it just client state?"**
> - **Needs server data on load** → `useFetch('/api/x')` in a `<script setup>` — Nuxt fetches on the server, sends data in the HTML
> - **User interaction / form** → `$fetch('/api/x')` inside a handler function — like axios, runs client-side
> - **Shared state between components** → Pinia store (you already know this!)

---

## Step 1 — Read the Annotated Files (Day 1–2)

Every key file has `🔵 VUE DEV NOTE:` comments mapping Nuxt concepts
to what you already know. Read them in this order:

| # | File | Concept |
|---|------|---------|
| 1 | `nuxt.config.ts` | Nuxt config = vite.config + main.ts + router config combined |
| 2 | `app/app.vue` | `<NuxtLayout>` + `<NuxtPage>` replace `<RouterView>` |
| 3 | `app/layouts/default.vue` | Layout system with `<slot />` |
| 4 | `app/middleware/auth.ts` | Route guard = Vue Router `beforeEach` |
| 5 | `app/plugins/auth.ts` | Nuxt plugin = `app.use()` equivalent |
| 6 | `app/stores/auth.ts` | Pinia — identical to your trading platform |
| 7 | `app/pages/dashboard/index.vue` | `useFetch` for SSR data fetching |
| 8 | `server/api/loans/index.get.ts` | Nitro API route = Express router |
| 9 | `server/utils/auth.ts` | Manual JWT = understanding auth deeply |
| 10 | `prisma/schema.prisma` | MS SQL schema design with Prisma |
| 11 | `server/api/dashboard/stats.get.ts` | SQL aggregation: COUNT, SUM, AVG, GROUP BY |
| 12 | `GUIDE.md` | Full study guide + Azure + MS SQL |

---

## Step 2 — Vue 3 vs Nuxt 3 Quick Reference

| Plain Vue 3 | Nuxt 3 Equivalent |
|---|---|
| `import { ref } from 'vue'` | **Auto-imported** — just use `ref()` |
| `import { useRouter } from 'vue-router'` | **Auto-imported** — just use `useRouter()` |
| `app.use(pinia)` in main.ts | Handled by `@pinia/nuxt` module in `nuxt.config.ts` |
| Route config in `vue-router` | Files in `app/pages/` — the filesystem IS the router |
| `<RouterView />` | `<NuxtPage />` |
| `<RouterLink to="/x">` | `<NuxtLink to="/x">` |
| `useRoute().params.id` | Same — `useRoute().params.id` |
| `useRoute().query.q` | Same — `useRoute().query.q` |
| `defineStore('auth', ...)` | Same — Pinia is identical |
| Vite config plugin | `nuxt.config.ts` → `vite: { plugins: [...] }` |
| Plugin in `main.ts` | File in `app/plugins/` — auto-registered |
| Global component | File in `app/components/` — auto-imported |
| Composable in `composables/` | Same — also auto-imported by Nuxt |
| `fetch('/api/x')` in a component | `useFetch('/api/x')` — SSR-aware version |
| `axios.post('/api/x', data)` | `$fetch('/api/x', { method: 'POST', body: data })` |

---

## Step 3 — Build These Features (the real learning)

### 🟢 Week 1 — Nuxt Fundamentals

**Task 1: Loan Detail Page**

Create `app/pages/loans/[id].vue`
- `[id]` in the filename = dynamic route (like Vue Router's `:id`)
- Fetch the loan with: `const { data } = await useFetch('/api/loans/' + route.params.id)`
- Display: application number, borrower info, loan details, status badge
- Add a status update dropdown — use `$fetch('/api/loans/:id', { method: 'PATCH', body: { status } })` in a handler

```vue
<script setup>
const route = useRoute()
const { data, refresh } = await useFetch(`/api/loans/${route.params.id}`)

async function updateStatus(newStatus) {
  await $fetch(`/api/loans/${route.params.id}`, {
    method: 'PATCH',
    body: { status: newStatus }
  })
  await refresh()  // re-fetch to show the update
}
</script>
```

**Task 2: Status History Timeline**

Inside the loan detail page:
- `data.value.statusHistory` is already returned by `GET /api/loans/:id`
- Display as a vertical timeline: from → to, timestamp, who changed it
- Style with Tailwind: alternating icons per status

**Task 3: Add Internal Notes**

Create `server/api/loans/[id]/notes.post.ts` (nested route!):
```typescript
export default defineEventHandler(async (event) => {
  const user    = await requireAuth(event)
  const id      = getRouterParam(event, 'id')!
  const { content } = await readBody(event)

  return prisma.loanNote.create({
    data: { applicationId: id, content, isInternal: true }
  })
})
```
On the detail page: form to add notes + list existing notes.

---

### 🟡 Week 2 — Server + Database Patterns

**Task 4: Pagination on Loans List**

The API already supports `?page=1&limit=20`.
Add pagination controls to `app/pages/loans/index.vue`:
- Previous/Next buttons that update `loansStore.setFilter('page', n)`
- Show "Page 3 of 12" using `data.pagination.totalPages`
- The `useFetch` query is already reactive — it re-fetches when filters change

**Task 5: Assign Loan to Officer (Admin only)**

Create `server/api/users/index.get.ts`:
```typescript
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const officers = await prisma.user.findMany({
    where: { role: 'LOAN_OFFICER', isActive: true },
    select: { id: true, name: true, email: true }
  })
  return { data: officers }
})
```
In the loan detail (admin only): dropdown of officers + PATCH `assignedOfficerId`.
Teaches: RBAC (role-based access control) pattern — critical in enterprise apps.

**Task 6: Document Upload**

Create `server/api/loans/[id]/documents.post.ts`:
- Use `readMultipartFormData(event)` — Nitro's built-in multipart reader
- Save file metadata to the `Document` DB model
- For the file itself: save locally to `public/uploads/` (dev) or mock Azure Blob Storage
- Display uploaded docs as a list with type badges (W-2, Tax Return, etc.)

Teaches: file handling in Node.js — required for a mortgage app.

---

### 🔴 Week 3 — Production Patterns

**Task 7: Rate Lock Calculator Enhancement**

The calculator is already built in `app/pages/calculator/index.vue`.
Extend it:
- Add a "Compare" mode: two loans side-by-side (30yr vs 15yr, fixed vs ARM)
- Add a "Save Estimate" button that creates a note on a loan application
- Add an amortization chart using `chart.js` (install: `npm install chart.js vue-chartjs`)

This is pure Vue 3 composable work — identical to your trading platform charting.

**Task 8: Email Notifications on Status Change**

When loan status changes in `server/api/loans/[id].patch.ts`, send an email.

Option A (quick): use `nodemailer` with a Gmail SMTP app password
```typescript
// server/utils/mailer.ts
import nodemailer from 'nodemailer'
export const sendStatusEmail = (to: string, appNo: string, newStatus: string) => { ... }
```

Option B (Azure-aligned): use Azure Communication Services SDK
```bash
npm install @azure/communication-email
```

Teaches: async side-effects without blocking the HTTP response.

**Task 9: Reports Page (Admin)**

Create `app/pages/admin/reports.vue`:
- Monthly funded volume by loan type (CONVENTIONAL, FHA, VA...)
- Add `server/api/admin/reports.get.ts` with a grouped aggregate:
```typescript
await prisma.loanApplication.groupBy({
  by:     ['loanType', 'status'],
  _count: { id: true },
  _sum:   { loanAmount: true },
})
```
- Display as a simple bar chart with `vue-chartjs`

Teaches: complex SQL aggregation — what data teams run daily.

**Task 10: Switch Dev DB to MS SQL Server**

```bash
docker compose up mssql -d   # start the MS SQL container from docker-compose.yml
```

Update `.env`:
```
DATABASE_URL="sqlserver://localhost:1433;database=LoanFlow;user=sa;password=YourStrong@Password123!;trustServerCertificate=true"
```

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlserver"
}
```

```bash
npx prisma migrate dev --name to-mssql
npm run dev
```

This is a common enterprise production stack. If everything still works → you're ready.

**Task 11: Deploy to Azure Container Apps**

```bash
# 1. Build and push to Azure Container Registry
az login
az acr create --name loanflow --sku Basic --resource-group myRG
az acr build --registry loanflow --image loanflow:latest .

# 2. Deploy
az containerapp up \
  --name loanflow \
  --resource-group myRG \
  --image loanflow.azurecr.io/loanflow:latest \
  --target-port 3000 \
  --env-vars DATABASE_URL=secretref:db-url JWT_SECRET=secretref:jwt-secret
```

Teaches: Azure Container Apps — a common enterprise deployment target.

---

## Key Concepts Checklist

Track your understanding. Check each one when you can explain it WITHOUT looking:

### Nuxt Fundamentals
- [ ] I know why `nuxt.config.ts` replaces vite.config + main.ts + router config
- [ ] I understand `future: { compatibilityVersion: 4 }` changes the folder layout
- [ ] I can create a new page and understand how the URL is derived from the filename
- [ ] I know what `definePageMeta()` does and when to use it
- [ ] I understand the difference between `app/middleware/` and `server/middleware/`

### Data Fetching
- [ ] I know when to use `useFetch` vs `$fetch`
- [ ] I can make `useFetch` reactive (auto-refetch when params change)
- [ ] I understand what SSR means for data — why the first page load has data without a loading spinner
- [ ] I can handle `useFetch` errors with the `error` ref

### Nitro Server (Node.js)
- [ ] I can create a new API route and know what filename to use
- [ ] I understand `readValidatedBody`, `getRouterParam`, `getValidatedQuery`
- [ ] I know when to use `createError({ statusCode: 404 })` vs returning data
- [ ] I can write a Prisma query with `where`, `select`, `include`, `orderBy`

### MS SQL / Prisma
- [ ] I understand what `@@index([field])` does in the schema
- [ ] I can write an aggregate query (groupBy, _count, _sum, _avg)
- [ ] I know what a `$transaction` does and when to use it
- [ ] I can switch from SQLite to MS SQL Server with 2 config changes

### Auth + Security
- [ ] I understand why HTTP-only cookies are more secure than localStorage
- [ ] I know what a JWT is and what's inside one (header.payload.signature)
- [ ] I understand RBAC — how `requireAdmin` blocks loan officers from admin routes
- [ ] I can explain bcrypt: why cost factor 12, what "slow hashing" means

### Docker
- [ ] I can explain each line of the Dockerfile
- [ ] I understand why multi-stage builds make the final image smaller
- [ ] I can start the full stack (`docker compose up -d`) and connect to MS SQL
- [ ] I understand the difference between a volume and a bind mount

---

## Nuxt 3 vs Next.js — Cheat Sheet

| Concept | NexDash (Next.js) | LoanFlow (Nuxt 3) |
|---|---|---|
| Data fetch | `async function Page() { const data = await fetch() }` | `const { data } = await useFetch()` |
| Route guard | `middleware.ts` on Edge | `app/middleware/auth.ts` with `defineNuxtRouteMiddleware` |
| Server API | `src/app/api/route.ts` with `export async function GET()` | `server/api/index.get.ts` with `defineEventHandler` |
| Layout | `(dashboard)/layout.tsx` with `{children}` | `app/layouts/default.vue` with `<slot />` |
| State | Zustand `create()` | Pinia `defineStore()` |
| Forms | React Hook Form + `zodResolver` | VeeValidate `useForm` + `useField` |
| Plugin | React Context Provider | `app/plugins/auth.ts` with `defineNuxtPlugin` |
| Auto-imports | ❌ Must import everything | ✅ ref, computed, useFetch, stores all auto-imported |
| TypeScript | Strict, explicit | Strict, but less boilerplate (no `as const`, etc.) |
| Deployment | Vercel-optimized | Any Node.js / Azure / Vercel |

---

## Commands Reference

```bash
# Development
npm run dev                            # Start at localhost:3000 (hot reload)
npm run build                          # Production build (catches TypeScript errors)
npm run typecheck                      # Type-check without building

# Database
npx prisma migrate dev --name <name>   # Create + apply a migration
npx prisma generate                    # Regenerate Prisma client after schema change
npx prisma db push                     # Quick schema sync (dev only, no migration file)
npx prisma studio                      # Visual DB browser at localhost:5555
npx prisma migrate reset               # Wipe DB and re-run all migrations (careful!)

# Docker
docker compose up -d                   # Start app + MS SQL Server
docker compose down                    # Stop all containers
docker compose logs -f app             # Stream app logs

# Connect to MS SQL in Docker
docker exec -it loanflow-mssql-1 /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrong@Password123!' -Q "SELECT name FROM sys.databases"
```

---

## Suggested Daily Schedule

| Day | Focus | Task |
|-----|-------|------|
| 1 | Read + explore | Open the app, trace every feature to its code |
| 2 | Dynamic routing | Build the loan detail page (Task 1) |
| 3 | Server + DB | Status history timeline + notes (Tasks 2–3) |
| 4 | Pagination + RBAC | Pagination + officer assignment (Tasks 4–5) |
| 5 | File handling | Document upload (Task 6) |
| 6 | Vue 3 deep dive | Enhanced calculator + charts (Task 7) |
| 7 | Async patterns | Email notifications (Task 8) |
| 8 | SQL aggregation | Reports page (Task 9) |
| 9 | Production DB | Switch to MS SQL Server (Task 10) |
| 10 | Cloud deployment | Deploy to Azure Container Apps (Task 11) |
| 11+ | Polish + portfolio | Clean UI, add tests, put it on GitHub |

---

## Resources

| Topic | Best Resource |
|-------|--------------|
| Nuxt 3 docs | https://nuxt.com/docs |
| Nitro server docs | https://nitro.unjs.io |
| Pinia | https://pinia.vuejs.org |
| VeeValidate | https://vee-validate.logaretm.com/v4 |
| Prisma ORM | https://www.prisma.io/docs |
| Prisma + SQL Server | https://www.prisma.io/docs/orm/overview/databases/sql-server |
| Docker docs | https://docs.docker.com |
| Azure Container Apps | https://learn.microsoft.com/azure/container-apps |
| Zod | https://zod.dev |
| Tailwind CSS | https://tailwindcss.com/docs |

---

## Interview Tip

After completing the 11 tasks, you will be able to answer:

1. **"How does SSR work in Nuxt?"** → `useFetch` runs on the server, embeds data in HTML, no loading flicker on first paint
2. **"How do you design a database for a mortgage application?"** → Show the `prisma/schema.prisma`: indexes on hot query fields, transactions for atomic operations, immutable audit trail in `status_history`
3. **"How do you secure a Node.js API?"** → HTTP-only cookies (no XSS), bcrypt with cost 12, JWT HMAC-SHA256, RBAC on every route via `requireAuth`/`requireAdmin`
4. **"What's your Docker experience?"** → Multi-stage build: builder stage compiles, runner stage is minimal; MS SQL 2022 in `docker-compose.yml`; CI/CD pipeline in GitHub Actions
5. **"Have you worked with Azure?"** → Azure Container Apps for deployment, Azure SQL Database for production MS SQL

> After Task 10 (MS SQL on Docker) you will have hands-on experience with the database technology many enterprise fintech stacks run in production. That is a strong interview talking point.
