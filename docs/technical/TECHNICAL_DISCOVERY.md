# CeliTrip technical discovery — issue #4

**Recorded:** 2026-10-01 · **Status:** Architecture subsequently approved for local implementation; milestone 1 implemented; cloud services not provisioned

Discovery was recorded at **0.1.0 Unreleased** and had no product-version impact itself. The subsequent owner-authorized development checkpoint is **0.2.0 Unreleased**, as defined in [VERSION.json](../../VERSION.json). Document revisions are independent; neither baseline is a published release.

**Implementation follow-up:** The owner later authorized milestone 1 using this architecture, reviewed it running and accepted the demonstrated implementation. The local Next.js/PostgreSQL Rome journey is implemented; see [setup](../development/LOCAL_DEVELOPMENT.md) and [validation evidence](MILESTONE_1_VALIDATION.md). It is included in the approved [0.2.0 Unreleased checkpoint](../development/CHECKPOINT_0.2.0.md). The recommendations below remain the plan for later milestones; discovery itself did not provision services. Stable readable text IDs are used for deterministic fixtures; UUID identities/slug redirects, reviewed aliases, editorial approvals and public SEO remain real-data/launch work. `/` currently redirects to Hebrew Rome, with the four-language selector in the shell; the broader destination/language landing page is future work.

## Basis and accepted scope

The owner confirmed acceptance of the **current prototype's visual direction and interaction flows** in the task instruction recorded on 2026-10-01. This includes the blue design and hotel, airport/outlet, evidence and card interactions. It does **not** approve translations, celiac-card wording, venue evidence, trust policies or launch readiness. The accepted artifact and existing browser evidence are identified in the [validation report](../design/PROTOTYPE_VALIDATION.md); the HTML is unchanged by this discovery.

Read alongside the [PRD](../product/PRD.md), [trust proposal](../product/TRUST_RULES.md), [information architecture](../product/INFORMATION_ARCHITECTURE.md) and [handoff](../product/DEVELOPMENT_HANDOFF.md). [Issue #4](https://github.com/OzAvrahami/CeliTrip/issues/4) was read: open, no comments, covering architecture, maps, administration, analytics, search, offline cards, localization and history. The domain is sufficiently defined for this recommendation; provisional editorial policies remain configurable and unapproved.

## Recommended architecture

Use **one Next.js application in plain JavaScript/JSX, PostgreSQL, and Railway**. Keep the public site, server-side data access and editorial interface in one repository and deployment. Separate domain modules, rather than creating microservices. Use CSS modules and shared design tokens/components to reproduce the approved blue palette, Heebo/Manrope typography and responsive interactions.

| Area | Recommendation and reason |
| --- | --- |
| Frontend | Next.js App Router: server-render destination/place/evidence pages; client components for filters, maps and card controls. JavaScript/JSX, JSDoc for domain contracts, runtime input validation, pinned dependencies and lockfile. |
| Backend | Next.js server modules and route handlers on the Node runtime. Public reads select published revisions only; editorial mutations use server authorization and transactions. No separate Express server or public generic database API. |
| Database/data access | PostgreSQL with UUID identities, foreign keys and explicit constraints. `pg` parameterized queries and a small repository layer; `node-pg-migrate` with reviewed SQL migrations. Avoid an ORM initially: publication and history need explicit relational queries. |
| Editorial tools | Purpose-built forms in the same app, with Better Auth and PostgreSQL-backed sessions. This costs UI work but keeps claim scope, translation gates and atomic publication explicit. |
| Hosting | Railway app and PostgreSQL services in the same European region/private network, initially one app replica. R2 for independent encrypted backups and, when needed, licensed media. |
| Maps/search | MapLibre GL JS with MapTiler tiles; owned PostgreSQL search and filters. No imported commercial venue directory or separate search service. |

Next.js documents self-hosting and locale-segment routing; Railway documents Next.js with Postgres. These support the proposed deployment without requiring Vercel. Parameterized SQL and PostgreSQL migration tooling are documented by their maintainers. [Next.js self-hosting](https://nextjs.org/docs/app/guides/self-hosting), [internationalization](https://nextjs.org/docs/app/guides/internationalization), [Railway guide](https://docs.railway.com/guides/nextjs), [node-postgres](https://node-postgres.com/features/queries), [node-pg-migrate](https://salsita.github.io/node-pg-migrate/).

**Meaningful alternative:** Next.js on Vercel plus Supabase Postgres/Auth reduces direct database/auth operations and supplies integrated services. Its paid starting subscriptions are about $45/month before maps, monitoring, additional projects/seats and overages: Vercel Pro $20 and Supabase Pro from $25, including one Micro project's compute through credits and seven-day daily backups. Vercel Hobby is personal/non-commercial. Prefer Railway for the owner's preference and one application/data environment; choose the split option only if avoiding database operations outweighs that simplicity. [Vercel pricing](https://vercel.com/pricing), [Hobby scope](https://vercel.com/docs/plans/hobby), [Supabase pricing](https://supabase.com/pricing).

A separate CMS would supply generic editing screens but still require custom evidence, revision and publication rules. It is not recommended for this small V1 team. A browser-only SPA would require additional rendering work for the localized search landing pages. Neither adds enough value to justify another stack now.

Target repository layout (milestone 1 now implements the public journey/data subset; auth/API/editorial/offline modules remain future work):

```text
src/app/[locale]/       public pages and localized editorial routes
src/app/api/            auth, corrections, health and narrow server endpoints
src/components/        shared approved design components
src/i18n/              he/en/fr/ru interface dictionaries and formatting
src/server/            auth, domain services, publication, queries, validation
db/migrations/         ordered SQL migrations, including reviewed auth schema
db/seeds/              clearly fictional development fixtures; separate real imports
tests/                 domain, PostgreSQL integration and browser journeys
public/                licensed assets and later the card service worker
scripts/               retain version helper; later local/migration/export commands
docs/                  retain product, prototype, validation and technical records
```

Keep root `VERSION.json` authoritative. A future package manifest/build label is a derived copy checked for drift. Do not replace the standalone prototype or treat its embedded dataset as production seed content.

## Four languages, URLs and publication fallback

* Use explicit `/he`, `/en`, `/fr`, `/ru` prefixes, including the default Hebrew locale. Examples: `/he/destinations/italy/rome`, `/fr/places/<stable-id>/<slug>`, and the corresponding `/evidence` page. Translate titles and navigation; stable ASCII slugs are sufficient for V1. IDs bind equivalent translations; old slugs redirect. `/` offers language selection, with Hebrew as the default suggestion.
* Language switching resolves the same entity and preserves validated query parameters for category/profile filters, selected place and map/list state. Evidence back navigation restores discovery context. Card language remains independent.
* Set document `lang` and `dir`; Hebrew RTL, others LTR. Use logical CSS properties, direction-aware icons and `bdi`/explicit direction for original names, URLs and addresses. Format dates/numbers with `Intl`; missing dates remain unknown. Verify Cyrillic font coverage and readable fallbacks rather than assuming every Manrope subset contains it.
* Server-render localized title/description and content; provide self-canonical URLs, reciprocal `hreflang` only for available published equivalents, an `x-default` selector, localized sitemap entries and truthful structured data. Keep admin, previews, search/filter combinations and draft/fallback-only pages out of indexing. Google's guidance supports alternate URLs and reciprocal language links. [Google localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions).
* UI dictionaries are code-reviewed; missing keys fail validation, with English as an explicit runtime recovery fallback. Editorial text is different: public launch content requires reviewed Hebrew, English, French and Russian revisions. Never silently publish machine translations or relabel English as Hebrew. In a private pilot, missing content may show a clearly labeled English fallback; in public, show unavailable content and an explicit link to an available reviewed language. Do not publish a changed revision until its required translations pass review; an accurate previous reviewed revision can remain published.

## Domain and history

Use relational records with immutable revisions and explicit publication pointers. JSONB is suitable for versioned text blocks and audit diffs, not for hiding subject relationships or approval state.

| Records | Essential relationships and invariants |
| --- | --- |
| Country, destination, content document | City belongs to country; national guidance stays distinct from city guidance. Document types include shopping and transport guidance. |
| Organization/chain, place/branch, categories | Each physical branch has its own ID, location provenance and many categories; chain is optional. Chains never substitute for branches. Coordinates may be unknown. |
| Hotel service, preparation facility | Hotel is a place with service records such as breakfast; claims can concern one service or preparation facility without covering the whole hotel. |
| Travel hub, terminal, outlet context | Hub has terminals/access areas; an outlet references a branch and its terminal/public-or-airside context. Hub guidance does not confer any outlet preparation profile. |
| Evidence subject, claim | A constrained subject registry references exactly one chain, branch, facility, service, hub or guidance document. Claim has subject, predicate, typed value, scope and revision. Enforce subject foreign keys; avoid unconstrained polymorphic IDs. |
| Source, source revision, observation | Source identity/type/URL/rights; immutable observed source revisions with permitted excerpt or content fingerprint. Claim-observation links state support/contradiction/unresolved and exact scope. Retain publication, observation, actual verification, effective and expiry dates separately; unknown stays null. |
| Authority/program, claim assessment | Accreditation names the authority and program. Assessment references the exact claim and observations, reviewer, rationale and policy version; no single venue evidence score or blanket verified date. |
| Content/translation revision, review, publication | Translation binds locale and exact source-content revision. Approval records actor, role, real timestamp and reviewed revision. Publication pins the full content/claim/translation revision set atomically. |
| Editorial identity, audit event, correction | Role grants and sessions separate from content authorship. Corrections reference the branch/claim/public revision; private contact details never join public queries. Audit preserves changes and withdrawal reasons. |

Represent evidence dimensions separately: **unknown**, **historical**, **needs review**, **conflicting** and **chain scope** may coexist. A new observation never refreshes another claim or turns chain scope into branch confirmation. Retain superseded and contradictory observations; immutable history survives edits/withdrawal. Facility profiles are attributed assessments supported by branch-specific claims, not category labels or guarantees.

Material claim/source changes invalidate dependent assessments and translations. Store the dependency links and affected revision IDs. Proposed deadline rules belong in versioned policy configuration with an acceptance status; **do not activate the proposed 14/90/180-day intervals without product acceptance**. Fixture scenarios can demonstrate them without creating actual reviewer records. Source-expiry facts and proposed editorial deadlines remain distinct.

## Editorial access, publication and corrections

Recommend Better Auth email/password with TOTP, **operator-created editorial accounts only**, public signup disabled, and mandatory MFA enrollment before any editorial data access. Use its session/password/recovery primitives; do not implement cryptography. Start with a controlled account-bootstrap/recovery command and securely delivered enrollment details for the small team, avoiding an email-service dependency. Recovery requires an identified operator, audit entry and session revocation. Better Auth supports PostgreSQL, disabled signup and a two-factor plugin; enforcement must be tested, not assumed from plugin installation. [Installation](https://better-auth.com/docs/installation), [email/password](https://better-auth.com/docs/authentication/email-password), [2FA](https://better-auth.com/docs/plugins/2fa).

Proposed roles: editor drafts and attaches evidence; language reviewer approves assigned locales; subject reviewer approves card/evidence content within assigned authority; publisher publishes/withdraws; administrator manages access. One person may hold several roles only where the owner explicitly assigns them. Every server action checks role, session and revision; browser controls are not access control. Use secure cookies, origin/CSRF checks, login throttling and revocation on access removal.

Workflow: **draft → evidence review → translation review → publication preview → published**, with return-to-draft and immediate withdrawal. Enforce current revision checks to prevent lost updates. Publication runs one transaction against the exact approved dependencies; a draft edit never leaks into a published page. Revoke publication when underlying content is materially inaccurate. Use uncached evidence/publication reads initially; any later caching needs tested invalidation on publish/withdraw, including search/map projections.

Anonymous corrections accept bounded text, reason, branch/claim reference and optional contact information. Validate/rate-limit submissions, use a honeypot and private moderation queue, and return a receipt only after persistence. Do not fetch submitted URLs automatically. No visitor accounts, public comments, ratings or automatic claim edits. Retention and correction-response targets remain provisional policies; decide them before collecting real submissions.

## Discovery, maps and cards

Search the owned dataset using normalized reviewed aliases across all four languages, Unicode-aware case/accent handling and explicit Hebrew/Cyrillic test cases. Begin with indexed exact/prefix matches; add `pg_trgm` for fuzzy matching after confirming the selected database image exposes the extension. PostgreSQL documents trigram indexes, but extension availability must be checked on the chosen Railway image. No external geocoder is needed for city/name discovery. [PostgreSQL pg_trgm](https://www.postgresql.org/docs/current/pgtrgm.html), [Railway PostgreSQL](https://docs.railway.com/databases/postgresql).

Keep category and facility-profile filters separate. Only accepted, current, scoped assessments may power affirmative profile filters; conflicts/unknowns remain visible. Paginate deterministically. For initial destinations, latitude/longitude bounds and application distance calculation suffice; defer PostGIS until spatial requirements justify it.

MapLibre renders MapTiler tiles with CeliTrip's own markers. Lazy-load the map; synchronize selection/filters with the accessible list and URL. Ask for geolocation only on user action. Review Hebrew labels/RTL shaping and original-language label fallback, restrict public tile keys by origin, preserve attribution, and keep list discovery usable on map/quota failure. Do not import the prototype's tiles or vendor POIs as licensed production data. [MapLibre](https://maplibre.org/maplibre-gl-js/docs/), [MapTiler attribution](https://docs.maptiler.com/guides/map-design/attribution/add-attribution/).

Celiac Cards are separately versioned short/detailed destination-language documents with reviewed English fallback; interface language never changes the card language implicitly. Keep drafts visibly marked and unavailable for public/offline distribution. Language and qualified celiac subject-matter review are both required for each wording revision.

**Proposed V1 offline scope: deliberately saved, reviewed cards only.** Cache a minimal card viewer/assets with a service worker and store selected immutable card revisions/metadata in IndexedDB. Show saved version/date and offline status, allow removal, check for replacement/withdrawal on reconnect, and never claim an offline copy is current. Explain storage eviction/failure; confirm saving only after a read-back check. Exclude offline maps, place directories, queued corrections and admin operations. Test airplane-mode reopening after browser restart. Service workers need HTTPS (localhost is allowed for development). The existing prototype implements none of this. [Service-worker documentation](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers).

## Operations and material costs

Provider facts checked against official pages on **2026-10-01**. USD/month, before tax; estimates below are planning calculations, not quotes or measured CeliTrip usage. Recheck before subscribing.

| Service | Verified basis and proposed use |
| --- | --- |
| Railway | Hobby $5 or Pro $20 minimum, credited toward usage; RAM $10/GB-month, CPU $20/vCPU-month, volume $0.15/GB-month, egress $0.05/GB. Recommend Pro for public production; local development needs no subscription. [Plans and rates](https://docs.railway.com/pricing/plans). |
| MapTiler Flex | $30 includes 500k API requests/month; extra requests $0.15/1k. MapLibre uses request billing, not the separate SDK session allowance. Example: 10k map visits × assumed 20 requests = 200k; panning can increase that. At 1m requests, estimated map bill is $105. Free is for testing/personal/non-commercial scope; set spending limits and retain attribution. [Pricing](https://www.maptiler.com/cloud/pricing/). |
| Cloudflare R2 Standard | $0.015/GB-month, $4.50/million Class A and $0.36/million Class B operations; free monthly allowance 10 GB, 1m A and 10m B, no R2 internet-egress charge. Budget $0–$2 for small encrypted dumps/media initially; Railway outbound transfer still counts. [R2 pricing](https://developers.cloudflare.com/r2/pricing/). |
| External monitoring | Recommend Better Stack for HTTP availability and backup heartbeats. Budget one monthly responder at $34; published free tier is described for personal projects, so do not assume it covers public CeliTrip. No paid replay/AI add-ons. [Pricing](https://betterstack.com/pricing). |

Railway illustration: combined app/database average **1.5 GB RAM + 0.15 vCPU + 5 GB volume + 10 GB egress = $19.25 usage**, or a $20 Pro bill before backup increments and other services. At 2.5 GB RAM and 0.3 vCPU with the same storage/egress, usage is $32.25. Plan roughly **$85–$110/month** for one small production environment including maps and external monitoring within the assumptions above; staging, map overages, domain registration, editorial/language labor and growing media are additional. This is not a performance guarantee or an approved budget.

Railway's PostgreSQL template is a database service based on its Postgres image. HA is an explicit additional setup; a single database is not an HA guarantee. Assign responsibility for upgrades, security updates, disk capacity, backups and restoration. Keep the database private, use least-privilege app/migration credentials, separate staging data/secrets, and pin compatible runtime/database versions when implementation begins. [Railway PostgreSQL operations](https://docs.railway.com/databases/postgresql).

Enable daily/weekly Railway volume backups, plus nightly encrypted `pg_dump` exports to private R2 with separate credentials and proposed 30-day retention. Native backup retention is 6 days daily, 27 days weekly and 89 days monthly; incremental storage is billed like volumes, and native restores stay within the same project/environment. Independent dumps therefore matter. Proposed recovery targets: at most 24 hours of lost edits and restoration within four hours, to be measured in a restore drill before launch. These are engineering targets, not achieved guarantees. [Railway backups](https://docs.railway.com/volumes/backups).

Run migrations once in a controlled pre-deploy step with a lock; use additive changes, backup before destructive changes, and rehearse upgrade/restore against staging. Never run competing migrations on every app startup. Keep seeds development-only and production evidence imports separately reviewed. Reverting an app build does not revert a database migration.

Use structured redacted application logs and Railway CPU/RAM/disk/network metrics; alert on availability, 5xx rates, database capacity, backup failure and overdue editorial queues. Railway deployment healthchecks do **not** monitor the live endpoint after deployment, so use the external monitor. Add readiness with a bounded DB check and a backup heartbeat. [Railway healthchecks](https://docs.railway.com/deployments/healthchecks), [metrics](https://docs.railway.com/observability/metrics).

For initial product analytics, record bounded daily aggregate counts for destination/place views, search/no-results, map opening, directions, card view/save success and correction success. No cookies, session replay, raw queries, contact text or precise visitor location in analytics. These counts do not measure unique/returning travelers; defer that requirement and any analytics SaaS until its value and privacy policy are agreed.

Local development: supported Node LTS pinned at implementation, npm lockfile, Docker Compose PostgreSQL matching production, ignored `.env.local` and documented `.env.example`. Future scripts should cover dev, lint, build, migration, explicit fixture loading and tests. CI should run domain tests, real-Postgres integration tests, four-language browser journeys and the existing version check. No local cloud account is required for the first milestone.

## Ordered implementation plan

Milestone 1 has since been authorized and implemented locally. Milestones 2–5 remain future work; this plan does not authorize provisioning or deployment.

| Order | Deliverable | Acceptance criteria |
| --- | --- | --- |
| **1** | **Working Rome journey: destination → places → branch detail → evidence** | Local app and migrated PostgreSQL persist data across restarts. All four interface languages work on direct-entry/refreshable URLs with correct RTL/LTR and approved blue components. A deterministic, clearly fictional fixture dataset exercises multi-category branches and all five evidence states; no manufactured real reviews. Language/back navigation preserves context. Server-rendered content and error/empty states work at mobile/desktop widths, keyboard checks pass, console has no unexplained errors. Draft/public projections are separate even before the admin UI. Fixture mode cannot be used as a public production dataset. No map subscription or reviewed real content is needed to prove this slice. |
| 2 | Editorial revisions, authentication and corrections | Operator-created accounts, mandatory MFA, server role-denial tests, session revocation and recovery exercised. Edits persist privately; publication atomically pins reviewed claims and all four translations. Material edits invalidate dependent approvals. Wrong-branch, historical, conflict, stale and withdrawal tests pass; corrections cannot publish. Accepted policies/reviewer roles are required before actual publication is enabled. |
| 3 | Hotels, hubs, country/shopping guidance and map | Hotel-service and hub/terminal/outlet relations persist without scope inheritance. Separate category/profile filters obey accepted assessment rules. Map/list/URL selection matches, attribution stays visible, Hebrew labels are readable, quota failure preserves the list. Real imports remain gated by source/content review. |
| 4 | Reviewed cards and limited offline support | Short/detailed destination-language and English versions have actual revision-specific dual review. Save/reopen offline, eviction/failure, version replacement and withdrawn-on-reconnect tests pass in target mobile browsers. Draft wording cannot be saved as approved content; no claim of offline venue freshness. |
| 5 | Launch readiness and operational rehearsal | Agreed destination coverage, four-language review, evidence and imagery rights, trust policies and card approval completed. Authorized hosting configuration, migration/restore drill, monitoring/alerts and accessibility checks pass. Budget and operational ownership agreed. Release/version scope decided separately; no automatic 1.0.0 or release from finishing a milestone. |

## Decisions that actually gate delivery

**No unresolved product decision blocks local milestone 1** with labeled fixtures and the approved architecture. Owner authorization was subsequently received and that slice is implemented. Further milestone work requires its own task scope.

Before real editorial publication: owner must assign reviewer/publisher authority and accept publication/conflict/translation rules, correction handling and any review intervals to activate. Before public hosting: approve recurring budget and appoint an operator able to restore/maintain PostgreSQL (otherwise choose the managed alternative). Before cards or destination launch: obtain the still-pending wording/language reviews, source/branding rights, real evidence and coverage decision. These gates do not require redesigning the accepted prototype or choosing all launch cities before the Rome slice.

V1 exclusions remain: native apps, traveler accounts, social/community features, public comments/ratings, trips/saved places, automated itineraries, AI recommendations, reservations and user-authored guides. No new service, backend, authentication, map subscription, offline capability, publication or deployment is established by this document.
