# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains a personal portfolio website for Najmul Alam (student & graphic designer from Bangladesh), plus shared utilities.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React 19 + Vite + Tailwind CSS v4 + Framer Motion
- **API framework**: Express 5
- **Fonts**: Outfit (display) + Inter (body) — Google Fonts
- **Build**: esbuild (API server), Vite (portfolio)

## Structure

```text
workspace/
├── artifacts/
│   ├── api-server/         # Express API server (port 8080, path /api)
│   ├── portfolio/          # React+Vite portfolio site (port 21113, path /)
│   └── mockup-sandbox/     # Component preview server for canvas prototyping
├── lib/                    # Shared libraries (api-spec, api-client-react, api-zod, db)
├── worker/                 # Cloudflare Worker (worker.js + wrangler.toml) for CF deployment
│   └── worker.js           # Standalone CF Worker with contact form logic
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Portfolio (artifacts/portfolio)

A single-page portfolio website for **Najmul Alam** — student & graphic designer from Bangladesh.

### Sections (in order)
1. **Hero** — Profile photo, name, title, bio, "Available for new projects" badge, CTA buttons (Download CV, Hire Me)
2. **About** — 3-tab card: Education & Training / Languages / Extra-Curricular
3. **Skills** — 4 core skill cards (Graphic Design, UI/UX, Adobe Illustrator, Photoshop) + tech/office pills
4. **Experience** — Timeline: Facebook (Ads Marketing), YouTube (Web Solution)
5. **Portfolio** — 6-item gradient grid with hover overlay
6. **Contact** — Info cards (email/phone/location) + contact form with inline success/error feedback
7. **Footer** — Social links (Facebook/Twitter/Instagram), quick links, copyright

### Key Design Details
- **Primary color**: Orange gradient (`#f97316` → `#ea580c`)
- **Dark mode**: Dark navy background (`hsl(220 15% 12%)`) — toggle stored in `localStorage` key `portfolio-theme`
- **Fonts**: Outfit (display headings) + Inter (body text), loaded via Google Fonts
- **Animations**: Framer Motion on Hero, CSS IntersectionObserver `FadeIn` component for scroll reveals
- **Performance**: Code-split with `React.lazy()` + `Suspense` for all sections except Navbar & Hero (eager for LCP)

### Contact Form
- **Frontend**: `artifacts/portfolio/src/components/sections/Contact.tsx` — form with honeypot field, inline status banner
- **Backend**: `artifacts/api-server/src/routes/contact.ts` — validates fields, sends via Resend API (gracefully degrades if `RESEND_API_KEY` not set)
- **Target email**: a2nnajmul@gmail.com

### Static Assets in `public/`
- `profile-banner.jpg` — profile photo, displayed with `objectPosition: "75% center"` to center on face
- `Najmul_Alam_CV.pdf` — downloadable CV
- `_headers` — Cloudflare Pages cache control headers
- `_redirects` — SPA fallback for Cloudflare Pages

### Cloudflare Deployment
- `worker/worker.js` — standalone Cloudflare Worker handling both static serving and contact API
- `worker/wrangler.toml` — Wrangler config (`RESEND_API_KEY` secret required)
- Static build output: `artifacts/portfolio/dist/public/`

## API Server (artifacts/api-server)

Express 5 API, mounted at path `/api`. Routes:
- `GET /api/healthz` — health check
- `POST /api/contact` — contact form submission

### Contact Route Validation
- `name`: string, min 2 chars, max 100 chars
- `email`: valid email format, max 200 chars
- `message`: string, min 10 chars, max 2000 chars
- `hp`: honeypot — silently succeeds if non-empty (bot detection)

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck` (`tsc --build --emitDeclarationOnly`)
- **`emitDeclarationOnly`** — only emits `.d.ts`; bundling is by esbuild/vite
- **Project references** — when A depends on B, A's tsconfig lists B in references

## Root Scripts

- `pnpm run build` — typecheck + recursively build all packages
- `pnpm run typecheck` — `tsc --build --emitDeclarationOnly`

## Personal Info (Najmul Alam)

- **Email**: a2nnajmul@gmail.com
- **Phone**: (+880) 1793908183
- **Location**: Panchua, Kapasia, 1743, Dhaka, Bangladesh
- **Social**: Facebook/Twitter/Instagram — @a2nnajmul
