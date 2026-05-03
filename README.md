# Debales AI — Multi-tenant AI Assistant Platform

A production-grade multi-tenant AI assistant platform built with Next.js App Router, MongoDB, and Gemini AI.

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd debales-ai
npm install
```

### 2. Environment Variables

Create a `.env.local` file (copy from `.env.example`):

```env
MONGODB_URI=mongodb://localhost:27017/debales-ai
GEMINI_API_KEY=your_gemini_api_key_here     # free tier at ai.google.dev
SESSION_SECRET=any-random-secret-string
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **GEMINI_API_KEY** is optional — the app has smart fallbacks that work without it.

### 3. Seed the Database

```bash
npm run seed
```

This creates:
- 3 demo users (2 for ACME Corp, 1 for TechStart)
- 2 projects with multi-tenant isolation
- Product instances with integration configs
- **Dashboard config documents** that drive the admin UI

### 4. Run

```bash
npm run dev
# Open http://localhost:3000
```

---

## 🔑 Demo Login Credentials

| Email | Password | Role | Project |
|-------|----------|------|---------|
| admin@acme.com | password123 | **Admin** | ACME Corp |
| member@acme.com | password123 | Member | ACME Corp |
| admin@techstart.com | password123 | **Admin** | TechStart |

---

## 🏗️ Architecture

### Layer Stack (Mandatory Layering)

```
UI Components
     ↑
TanStack Query Hooks  (src/lib/hooks/index.ts)
     ↑
API Route Handlers    (src/app/api/**/route.ts)  — thin layer only
     ↑
Service Layer         (src/lib/services/*.ts)    — business logic + data access
     ↑
Access Layer          (src/lib/access/*.ts)      — pure rule functions
     ↑
MongoDB + Mongoose    (src/lib/db/)
```

### Multi-tenant Model

```
Project (tenant boundary, identified by slug)
  ├── members[]  { userId, role: "admin"|"member" }
  ├── ProductInstances[]  { projectId, productType, integrations[] }
  ├── Conversations[]     { projectId, productInstanceId, userId, messages[] }
  └── DashboardConfig     { projectId, sections[], widgets[] }  ← CONFIG-DRIVEN UI
```

### Directory Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          login · logout · me
│   │   └── projects/
│   │       └── [slug]/    project · dashboard · conversations · messages
│   ├── login/             Auth page
│   ├── projects/          Project picker
│   └── project/[slug]/
│       ├── layout.tsx     Sidebar + nav
│       ├── chat/          Chat interface
│       │   └── [conversationId]/  Message thread
│       └── admin/         Config-driven dashboard (ADMIN ONLY)
├── lib/
│   ├── access/            Pure access rule functions (no DB calls)
│   ├── db/                MongoDB models + connection
│   ├── hooks/             TanStack Query hooks (no direct DB)
│   ├── services/          Business logic + AI service
│   └── validations/       Zod schemas
└── types/                 Shared TypeScript interfaces
```

---

## 📊 Config-Driven Admin Dashboard

### How It Works

The admin dashboard reads its layout from MongoDB. **No code change is needed to modify the UI.**

**Collection:** `dashboardconfigs`

**Key fields:**
```json
{
  "projectId": "<ObjectId>",
  "headerTitle": "ACME Corp Dashboard",
  "headerSubtitle": "Real-time AI assistant analytics",
  "sections": [
    {
      "id": "overview",
      "title": "Overview",
      "order": 1,
      "visible": true,
      "widgets": [
        {
          "id": "total-conversations",
          "type": "stat-card",
          "title": "Total Conversations",
          "order": 1,
          "visible": true,
          "config": { "valueKey": "totalConversations", "icon": "MessageSquare", "color": "brand" }
        }
      ]
    }
  ]
}
```

### Supported Widget Types

| `type` value | Renders |
|-------------|---------|
| `stat-card` | KPI card with icon + number |
| `recent-conversations` | List of recent chats |
| `ai-usage` | AI call stats |
| `integration-status` | Integration toggle status |

### How to Verify Config-Driven Behavior

1. **Open MongoDB** (Compass, Atlas, or mongo shell)
2. **Find the document** in `dashboardconfigs` for your project
3. **Make any of these edits:**

```js
// Change dashboard title
db.dashboardconfigs.updateOne(
  { },
  { $set: { headerTitle: "🔥 My Custom Dashboard Title" } }
)

// Hide a section completely
db.dashboardconfigs.updateOne(
  { "sections.id": "integrations" },
  { $set: { "sections.$.visible": false } }
)

// Hide a widget
db.dashboardconfigs.updateOne(
  { "sections.id": "overview" },
  { $set: { "sections.$.widgets.$[w].visible": false } },
  { arrayFilters: [{ "w.id": "active-users" }] }
)

// Reorder widgets (change order field)
// Change widget title
db.dashboardconfigs.updateOne(
  { },
  { $set: { "sections.0.widgets.0.title": "Total Chats 💬" } }
)
```

4. **Refresh the admin dashboard** — changes appear immediately (30s auto-refresh or manual reload)

---

## 🤖 AI Integration

- **Provider:** Google Gemini 1.5 Flash (free tier)
- **Fallback:** Smart hardcoded responses when API key is absent or rate-limited
- **Rate limit handling:** Returns fallback response with a step message on 429
- **Integration simulation:** Shopify (orders) + HubSpot CRM (contacts) — mock data injected into AI context when enabled

---

## 🔌 Integrations

Two simulated integrations per product instance (toggleable in DB):

| Integration | Type | Mock Data |
|------------|------|-----------|
| Shopify Store | e-commerce | Orders, revenue, conversion rate |
| HubSpot CRM | crm | Leads, pipeline stages, scores |
| Google Analytics | analytics | Sessions, bounce rate |
| Mailchimp | email | Campaigns, open rates |

Toggle an integration in `productinstances.integrations[n].enabled` to change AI behavior.

---

## 🔒 Authorization

- **Server-enforced** at the API route level (no client-only checks)
- Access layer: pure functions in `src/lib/access/projectAccess.ts`
- Admin dashboard: returns 403 if user is not project admin
- Conversations: scoped to `userId` — cross-user access returns 404
- Session: HTTP-only cookie, base64-encoded JSON (demo-grade; production should use JWT/NextAuth)

---

## 🐳 Docker (Alternative)

```bash
docker build -t debales-ai .
docker run -p 3000:3000 \
  -e MONGODB_URI=your_uri \
  -e GEMINI_API_KEY=your_key \
  debales-ai
```

---

## 🧪 Testing

```bash
# Zod schema validation test
npx tsx scripts/test-schemas.ts

# Access rule unit tests
npx tsx scripts/test-access.ts
```

---

## 📝 What's Mocked

| Feature | Status |
|---------|--------|
| Authentication | Simplified — cookie stub, no bcrypt (demo only) |
| Shopify data | Mock JSON in `mockData.ts` |
| CRM data | Mock JSON in `mockData.ts` |
| AI responses | Real Gemini API + hardcoded fallbacks |
| User management | Seeded users only, no signup UI |

---

## 🎬 Proof of Config-Driven UI

See the included **Loom recording** for a walkthrough of:
1. Login as admin
2. View dashboard (config-driven sections + widgets)
3. Edit MongoDB document (change title, hide widget)
4. Refresh dashboard — UI reflects changes
5. No code was changed

---

## 📦 Env Vars Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `GEMINI_API_KEY` | Optional | Gemini AI API key (free at ai.google.dev) |
| `SESSION_SECRET` | ✅ | Cookie signing secret |
| `NEXT_PUBLIC_APP_URL` | Optional | App base URL |
