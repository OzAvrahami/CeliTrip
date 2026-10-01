# CeliTrip local development

Milestone 1 is a working, local-only Rome journey backed by PostgreSQL. The standalone [approved prototype](../design/CeliTrip-Design-Flow.html) remains the design reference. Read the [implementation validation](../technical/MILESTONE_1_VALIDATION.md) for actual checks and limitations.

## Start from a fresh checkout

Prerequisites: Node.js 24 (validated with 24.11.1), npm, Docker Desktop with Linux containers and Compose. No cloud account is needed. Run these PowerShell commands from the repository root:

```powershell
Set-Location D:\code\CeliTrip
npm.cmd ci
if (!(Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm.cmd run db:start
npm.cmd run db:migrate
npm.cmd run db:seed
npm.cmd run dev
```

Open **http://127.0.0.1:3000/en/destinations/italy/rome**. Replace `en` with `he`, `fr` or `ru`, or use the language selector. `/` redirects to the Hebrew Rome journey. The preview remains available only while its process and local database are running.

For the optimized build used in final browser validation, stop the dev process with Ctrl+C, then:

```powershell
npm.cmd run build
npm.cmd start
```

Only one process should occupy port 3000. Both scripts bind to `127.0.0.1`; do not expose them through a public tunnel or proxy.

## Isolated database and persistence

[compose.yaml](../../compose.yaml) uses project `celitrip-local`, service `postgres`, database `celitrip_dev`, loopback port **55432**, and named volume `celitrip-local_pgdata`. PostgreSQL 17 Alpine is pinned by image digest. Disposable local credentials are in [.env.example](../../.env.example); `.env.local` is ignored. This setup does not reuse or modify other local PostgreSQL/Supabase services.

`npm.cmd run db:stop` stops this Compose project while retaining data. `npm.cmd run db:start` starts it again. Application restarts and container recreation retain the named volume. Do not run `docker compose down -v` against data you intend to preserve. No remote backup or restoration capability is implemented in this milestone.

Migrations run explicitly, never at application startup. `node-pg-migrate` records migration history and takes its migration lock. The seed runs in one transaction with stable fixture IDs and `ON CONFLICT DO NOTHING`; reruns neither duplicate rows nor reset edits/publication pointers. To change fixture content, append new revision IDs and deliberately choose the publication pointer rather than editing immutable history. Seed reruns are not a reset operation.

## Verification

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run version:check
npm.cmd run build
```

Tests use **celitrip_test** on the same isolated local server, creating it if absent. The final integration test rolls back and reapplies all CeliTrip migrations in that test database only. Treat `celitrip_test` as disposable; never store manual work there. Tests do not drop or reset `celitrip_dev`.

## Code and data boundaries

* `src/app/`: Node server-rendered App Router journey, localized loading/error/not-found states. Stable fixture IDs form URLs; no separate slug alias is necessary for this slice.
* `src/components/`, `src/styles/`: shared blue components, logical CSS layout, locally served Heebo/Manrope fonts. The Rome hero and fonts were extracted from the supplied prototype; public-distribution rights remain a launch review item.
* `src/i18n/`: four interface dictionaries. Tests require every key in each language. Language switching performs a full localized navigation to refresh the server-rendered shell, retaining validated filters and evidence context.
* `src/server/`: local configuration guard, server-only connection pool, parameterized repository reads. Every public read starts from a pinned publication; there is no draft query flag or public mutation API.
* `db/migrations/`, `db/seeds/`: explicit revisions, translations, claims, source history and scoped observations. Update/delete triggers preserve revision history; branch/source scope constraints reject mismatches. Fixture publication requires four translations, all explicitly unreviewed. It is not editorial approval.

Three published fictional branches cover bakery/cafe/grocery, restaurant and supermarket/grocery. Forno demonstrates unknown, historical, needs-review and conflicting dimensions, including two contradictory revisions of one source. Tavola demonstrates chain scope coexisting with unknown/needs-review; no branch inference is made. Mercato demonstrates unknown product availability. A newer Forno draft and a draft-only branch prove draft separation. Addresses, URLs, dates and verification methods remain null where unknown. No real venue, authority, accreditation or reviewer approval is supplied.

Search is a bounded literal substring across the four fixture translations, with category and evidence-dimension filters. Reviewed aliases, accent normalization, fuzzy search, pagination, affirmative facility profiles and public SEO are future work. The fixture preview intentionally returns noindex headers and disallows indexing in robots.txt.

## Local fixture guard and future work

`CELITRIP_MODE=local-fixtures` is mandatory. Database configuration accepts only loopback port 55432 and the two named local databases. The request guard accepts only local hosts on port 3000, rejects external forwarded hosts/Forwarded headers, and disables operation in the detected Railway/Vercel/Render environments. The schema accepts only fixture records/unreviewed fixture translations. These controls prevent accidental use as public production content; they are not authentication and must not be bypassed with a public proxy that rewrites local headers.

Real content requires a separately authorized implementation of editorial authentication, review/publication gates, real-data migrations and hosting controls. Hotels/hubs, maps, cards, offline storage and cloud operations remain later milestones. Trust/review intervals remain proposals. No real reviews or launch readiness are implied by a local publication pointer.

`VERSION.json` is authoritative at **0.2.0 Unreleased**, the owner-authorized grouped development checkpoint. The package version is a checked mirror; the application footer reads the authoritative file. A future authorized bump must update the npm manifest/lockfile mirror and regenerate the standalone badge as described in [VERSIONING.md](VERSIONING.md). See [checkpoint preparation](CHECKPOINT_0.2.0.md) for scope and unexecuted commit commands. Neither 0.1.0 nor 0.2.0 has been recorded as released.
