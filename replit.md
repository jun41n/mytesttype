# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/inner-meter` (`@workspace/inner-meter`)

Korean-first, mobile-first personality test web app. Fully static React + Vite SPA.

- **15+ experiences**: personality tests + Pet Type Test (dog/cat) + Tarot 3-card reading + K-Shaman fortune reading
- **Pet Test**: Fully merged from pet-test artifact. Routes: `/pet-test` (home) → `/pet-test/quiz/:type` → `/pet-test/result/:type/:key`
  - Data: `src/data/petData.ts` (DOG_TEST, CAT_TEST, getPetTest)
  - Pages: `src/pages/pet-home.tsx`, `src/pages/pet-quiz.tsx`, `src/pages/pet-result.tsx`
  - Components: `src/components/PetShareCard.tsx`
  - Locale keys: `pet.*`, `dog.*`, `cat.*` in all 6 locale JSON files
  - test-card.tsx links `pet-type-test` slug → `/pet-test`; test-detail.tsx redirects `pet-type-test` → `/pet-test`
- **i18n**: 6 languages (ko/en/ja/es/pt-BR/fr) via `react-i18next`
  - UI strings: `src/locales/json/{ko,en,ja,es,pt-BR,fr}.json`
  - Language config: `src/lib/i18n.ts` — imports JSON files, exports `LANGUAGES` array and `setLanguage()`
  - Test content translations: `src/locales/testTranslations.ts` — const en/ja/es/ptBR/fr (fr=en alias), exported as `TEST_TRANSLATIONS`
  - `LocalizedString` type in `src/data/tests.ts`: `{ ko, en, ja, es, 'pt-BR', fr }` — used for MBTI `relationshipStyle` / `compatibleVibe`
- **Tarot 3-card**: `src/pages/tarot.tsx` — 3 phases (intro → 22-card grid selection → reading with Present/Advice/Future positions); data from `src/data/tarot3Cards.ts` (22 cards × 6 languages)
  - `CardLocale` type: `'ko' | 'en' | 'ja' | 'es' | 'pt-BR' | 'fr'`
- **K-Shaman**: `src/pages/k-shaman.tsx` — birthday-based fortune reading; birth year input max=2020
- **Tests**: `src/data/tests.ts` (15+ test definitions), `src/pages/test-detail.tsx`, `src/pages/test-result.tsx`
- **MBTI SEO**: `src/data/mbti-seo.ts` (ko/en/ja/es/'pt-BR' sections), `src/components/MbtiSeoContent.tsx`
- **Analytics**: GA4 `G-70BK9892B5` in `src/lib/analytics.ts`; AdSense `ca-pub-7780005617186465` in `index.html`
- **Contact**: `meaningout_d@naver.com`
- **OG**: default image `/opengraph.jpg`; per-test images can go in `public/og/` (SeoHead accepts `ogImage` prop)
- Port: `24578` (reads `PORT` env)

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.
