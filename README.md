# Cadence — Social Content OS

**Run your whole content rhythm — from spark to published.** Cadence is an
end-to-end content management platform for **Instagram & Threads**: ideation →
production → release, with an **AI copilot** that learns your brand voice.

Built on **Next.js 16 (App Router) · React 19 · Convex · Tailwind 4 · shadcn**.

---

## What's inside

**Marketing site** (`/`) — a product landing page.

**Admin console** (`/dashboard/admin`):
- **Pulse** — today's view: due, drafts, top movers, account health.
- **Ideation** — idea board (spark → exploring → approved → archived); promote to Studio.
- **Studio** — compose a sketch or a multi-slide story; caption, media, platform, format.
- **Pipeline** — drag content across stages (Ideation → Production → Scheduled → Published).
- **Calendar** — scheduled & published content on a month grid + timeline.
- **Gallery** — media from upload · Google Photos · Drive · URL · Unsplash.
- **Analytics** — growth, reach, engagement, top content (recharts).
- **Inbox** — comments / mentions / replies / DMs across accounts.
- **Accounts** — connect & manage Instagram + Threads.
- **Brand Profile** — voice, pillars, audience, goals — the spine of the copilot.
- **Copilot** — a RAG chatbot grounded in your content + brand profile (Voyage embeddings
  + Convex vector search + Claude).
- **Admin Panel** — Integrations, AI Config, Team, Audit, Webhooks, Settings.

---

## Local development

```bash
npm install --legacy-peer-deps
cp .env.example .env.local            # set NEXT_PUBLIC_CONVEX_URL after the next step
npx convex dev                        # logs in, provisions a Convex deployment, generates types
npm run dev                           # http://localhost:3000
```

First run: open `/dashboard/admin`, **claim owner** (first signup = owner), then seed sample
data from the setup banner (or run `npx convex run seed:run` for a full reset-and-seed).

## Keys (all optional, set on the **Convex** deployment, never `NEXT_PUBLIC_`)

The app runs on realistic seeded data until you add these — every integration degrades
gracefully and shows a "not configured" notice instead of crashing.

| Key | Enables |
|-----|---------|
| `ANTHROPIC_API_KEY` | Copilot chat + AI idea generation |
| `VOYAGE_API_KEY` | RAG retrieval (embeddings, `voyage-3`, 1024-dim) |
| `META_APP_ID` / `META_APP_SECRET` / `IG_ACCESS_TOKEN` | Instagram Graph sync |
| `THREADS_APP_ID` / `THREADS_APP_SECRET` / `THREADS_ACCESS_TOKEN` | Threads sync |
| `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_PHOTOS_ACCESS_TOKEN` | Google Photos / Drive picker |
| `UNSPLASH_ACCESS_KEY` | Live Unsplash search in the media picker |

Set one with: `npx convex env set ANTHROPIC_API_KEY sk-...`

Then in the console: **Admin Panel → Integrations** shows what's connected, and **Copilot →
Reindex knowledge** builds the RAG index over your content.

## Architecture notes

- Server-authoritative data in Convex; the frontend store (`components/templates/.../shared/store.tsx`)
  maps each Convex row 1:1 and routes dispatched actions to mutations.
- RAG: `convex/features/copilot/*` (embeddings → indexer → retrieve → chat) over the
  `ragChunks` vector index in `convex/schema.ts`.
- Integrations: `convex/features/integrations/*` — all key-guarded.
- Convex `_generated/` is committed and hand-maintained for offline typecheck; `npx convex dev`
  regenerates it identically.

---

## Run it live locally with NO Convex account (what's running now)

Cadence works against an **anonymous local Convex backend** — no login, no cloud:

```bash
# 1. Start the local Convex backend (writes NEXT_PUBLIC_CONVEX_URL into .env.local)
CONVEX_AGENT_MODE=anonymous npx convex dev --typecheck disable

# 2. One-time: provision auth signing keys on the local deployment
#    (generates RS256 JWT keys the way @convex-dev/auth expects)
node -e "import('jose').then(async j=>{const {execFileSync}=await import('node:child_process');const k=await j.generateKeyPair('RS256',{extractable:true});const pk=(await j.exportPKCS8(k.privateKey)).trimEnd().replace(/\n/g,' ');const jwks=JSON.stringify({keys:[{use:'sig',...await j.exportJWK(k.publicKey)}]});const e={...process.env,CONVEX_AGENT_MODE:'anonymous'};execFileSync('npx',['convex','env','set',`JWT_PRIVATE_KEY=${pk}`],{stdio:'inherit',env:e});execFileSync('npx',['convex','env','set',`JWKS=${jwks}`],{stdio:'inherit',env:e});execFileSync('npx',['convex','env','set','SITE_URL=http://localhost:3000'],{stdio:'inherit',env:e});})"

# 3. Seed realistic sample data
CONVEX_AGENT_MODE=anonymous npx convex run seed:run

# 4. Start Next.js
npm run dev   # http://localhost:3000
```

Open `http://localhost:3000/dashboard/admin` → sign up (the first account becomes
owner) → the onboarding wizard captures your brand profile → the console loads with
sample data. To enable the AI copilot, set keys on the local deployment, e.g.:

```bash
CONVEX_AGENT_MODE=anonymous npx convex env set ANTHROPIC_API_KEY sk-ant-...
CONVEX_AGENT_MODE=anonymous npx convex env set VOYAGE_API_KEY pa-...
```
