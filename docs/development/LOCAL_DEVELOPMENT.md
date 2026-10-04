# CeliTrip local development

**Current development checkpoint: 0.3.0 Unreleased.** The corrected destination workflow is owner-accepted; other acceptance and real-content/translation/medical/reviewer/production gates remain separate. Historical validation below retains its captured versions. See [checkpoint scope and commands](MILESTONE_2_CHECKPOINT.md).

Milestones 1 and 2 provide the local Rome journey and authenticated fictional editorial workflow backed by PostgreSQL. The standalone [approved prototype](../design/CeliTrip-Design-Flow.html) remains the design reference. Read the [implementation validation](../technical/MILESTONE_1_VALIDATION.md) for actual checks and limitations.

## Start from a fresh checkout

Prerequisites: Node.js 24 (validated with 24.11.1), npm, Docker Desktop with Linux containers and Compose. No cloud account is needed. Run these PowerShell commands from the repository root:

```powershell
Set-Location D:\code\CeliTrip
npm.cmd ci
if (!(Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm.cmd run db:start
npm.cmd run db:migrate
npm.cmd run auth:configure
# Only for a genuinely empty development database; never reseed an existing owner database.
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
* `src/server/`: local configuration guard, server-only connection pool, parameterized repository reads. Every public read starts from a pinned publication; there is no public draft query flag. Anonymous corrections have a separate bounded submission API.
* `db/migrations/`, `db/seeds/`: explicit revisions, translations, claims, source history and scoped observations. Update/delete triggers preserve revision history; branch/source scope constraints reject mismatches. Fixture publication requires four translations, all explicitly unreviewed. It is not editorial approval.

Three published fictional branches cover bakery/cafe/grocery, restaurant and supermarket/grocery. Forno demonstrates unknown, historical, needs-review and conflicting dimensions, including two contradictory revisions of one source. Tavola demonstrates chain scope coexisting with unknown/needs-review; no branch inference is made. Mercato demonstrates unknown product availability. A newer Forno draft and a draft-only branch prove draft separation. Addresses, URLs, dates and verification methods remain null where unknown. No real venue, authority, accreditation or reviewer approval is supplied.

Search is a bounded literal substring across the four fixture translations, with category and evidence-dimension filters. Reviewed aliases, accent normalization, fuzzy search, pagination, affirmative facility profiles and public SEO are future work. The fixture preview intentionally returns noindex headers and disallows indexing in robots.txt.

## Local fixture guard and future work

`CELITRIP_MODE=local-fixtures` is mandatory. Database configuration accepts only loopback port 55432 and the explicitly named local development/test databases. The request guard accepts only local hosts on port 3000, rejects external forwarded hosts/Forwarded headers, and disables operation in the detected Railway/Vercel/Render environments. The schema accepts only fixture records/unreviewed fixture translations. These controls prevent accidental use as public production content; they complement mandatory editorial authentication and must not be bypassed with a public proxy that rewrites local headers.

Real content remains blocked and requires accepted policies/reviewer assignments, real-data migrations and hosting controls. The local editorial workflow only permits fictional records and synthetic reviews. Hotels/hubs, maps, cards, offline storage and cloud operations remain later milestones. Trust/review intervals remain proposals. No real reviews or launch readiness are implied by a local publication pointer.

`VERSION.json` is authoritative at **0.3.0 Unreleased**. The historical [v0.2.0 GitHub prerelease](https://github.com/OzAvrahami/CeliTrip/releases/tag/v0.2.0), published 2026-10-01T12:32:09Z, remains in `release_history` with its immutable tag target. Package/lockfile are checked mirrors; application and prototype displays now read Unreleased. This remains a fictional local preview, not a deployed production application. Follow [VERSIONING.md](VERSIONING.md) and the [current checkpoint](MILESTONE_2_CHECKPOINT.md). The [0.2.0 checkpoint](CHECKPOINT_0.2.0.md) and [publication record](../releases/PUBLISH_v0.2.0.md) are historical; do not rerun their release commands. Version 0.1.0 was never released.

## Milestone 2: existing checkout setup

Do not reinstall dependencies or reseed when the existing checkout is already configured. After pulling these changes, install the pinned lockfile only when dependencies need updating, then apply additive migrations and generate the ignored authentication secret once:

```powershell
Set-Location D:\code\CeliTrip
npm.cmd run db:start
npm.cmd run db:migrate
npm.cmd run auth:configure
npm.cmd run dev
```

Open **http://127.0.0.1:3000/en/editor/sign-in**. Use the language selector for Hebrew, French or Russian. Better Auth accepts the canonical origin `http://127.0.0.1:3000`; use that address for sign-in rather than `localhost`. Cookies are HttpOnly/SameSite=Lax; HTTP is restricted to this loopback preview. No production HTTP exception or deployment is enabled. Keep `.env.local` and its secret private and stable across restarts.

### Controlled fictional account setup

Accounts are operator-created; public signup is disabled. The CLI restricts emails to `@demo.invalid` and labels names as local demos. Choose explicitly assigned roles; the example grants one fictional local operator all five roles and four locales for demonstration only. It assigns no real-world reviewer authority. Scope may be `rome` or an existing Rome branch ID; language reviewers require a specific locale. Administrator grants do not implicitly grant editorial/reviewer/publisher roles.

The password is read securely, passed over stdin and not printed or placed on the command line. Run from the repository root in PowerShell; do not use a transcript or save the input payload:

```powershell
$securePassword = Read-Host "New local demo password (14–128 characters)" -AsSecureString
$accountInput = @{
  email = "owner-demo@demo.invalid"
  name = "Owner fictional workflow"
  operator = "Owner local operator"
  reason = "Create a fictional local demonstration identity"
  password = [System.Net.NetworkCredential]::new("", $securePassword).Password
  grants = @(
    @{ role = "editor"; scope = "rome"; locale = "*" }
    @{ role = "subject_reviewer"; scope = "rome"; locale = "*" }
    @{ role = "publisher"; scope = "rome"; locale = "*" }
    @{ role = "administrator"; scope = "rome"; locale = "*" }
    @{ role = "language_reviewer"; scope = "rome"; locale = "he" }
    @{ role = "language_reviewer"; scope = "rome"; locale = "en" }
    @{ role = "language_reviewer"; scope = "rome"; locale = "fr" }
    @{ role = "language_reviewer"; scope = "rome"; locale = "ru" }
  )
}
try { $accountInput | ConvertTo-Json -Depth 5 -Compress | node --env-file=.env.local scripts/editorial-account.js create }
finally { $accountInput.password = $null; Remove-Variable accountInput, securePassword }
```

By default, sign in with that identity, re-enter the password to enroll an authenticator, transfer the private setup key to your authenticator app, privately retain the recovery codes and enter its TOTP. Enrollment material is deliberately not included in screenshots or reports. No editorial reads or mutations are allowed until the current session passes TOTP, except for the explicitly enabled owner-demo option below. Trusted-device bypass and self-service MFA disabling are unavailable.

### Optional password-only owner walkthrough

`CELITRIP_LOCAL_DEMO_PASSWORD_ONLY=0` is the checked-in default. The owner explicitly enabled `CELITRIP_LOCAL_DEMO_PASSWORD_ONLY=1` in ignored `.env.local` for this walkthrough. Use **http://127.0.0.1:3000/en/editor/sign-in**, enter `owner-demo@demo.invalid` and its existing password, then select **Sign in**. The editorial studio opens without TOTP, including if that account already has an enrolled authenticator. Do not recreate or recover the account just to use this option.

This server-side exception requires the exact account, a successful password sign-in, a live PostgreSQL session, the existing `local-fixtures`/isolated loopback database guard, canonical loopback request headers, and no hosted-environment indicators or external application URL. Forwarded external clients/proxies are rejected. The existing `dev` and `start` commands bind only `127.0.0.1`; never expose this preview through a tunnel or reverse proxy. `NODE_ENV=production` alone does not identify deployment: an optimized local build is allowed only with all these local guards. Hosted/real-content configurations cannot enable the exception merely by setting the flag.

The session's `localDemoPassword` marker is separate from `mfaVerified`, which remains false unless TOTP actually succeeds. Roles, scope, locale, expiry and revocation are still checked on every editorial access. No authenticator, recovery code, password or grant is changed. A recovery-code-only session cannot activate this exception. The sign-in and editorial pages show a localized demo-mode notice; no real reviewer authority or real-content publication is granted.

To disable it, change just this line in `.env.local`:

```dotenv
CELITRIP_LOCAL_DEMO_PASSWORD_ONLY=0
```

Stop the preview with Ctrl+C and restart `npm.cmd start` (or `npm.cmd run dev` when using the development server). Existing password-only sessions then lose editorial access; the account must complete its normal TOTP flow. Existing enrollment and recovery codes remain valid. No database reset, reseed, account recovery, migration rollback or version change is needed. Apply the additive session-marker migration with `npm.cmd run db:migrate` when updating another checkout.

### Recovery, role changes and revocation

Use a single-use recovery code at the MFA screen only to recover a restricted session. Editorial data remains locked until TOTP succeeds. If the authenticator is lost, the identified local operator uses the same secure stdin pattern with `recover` instead of `create`, a new password and a specific rationale. Recovery resets enrollment and revokes sessions; enroll TOTP again. `grant` replaces the supplied explicit role/locale/scope set and revokes sessions; omit the password. `revoke` needs email, operator and reason, and revokes all sessions. These actions append audit records. The administrator screen also revokes an account’s sessions with a reason. Account creation/recovery/role assignment remain operator CLI tasks, deliberately outside public signup.

### Administration workspace walkthrough

Open **http://127.0.0.1:3000/en/editor**. The existing owner account is already configured: do not recreate it, recover it, reseed data, or rerun grant commands. Its seven existing editorial grants were preserved and the explicitly authorized eighth grant adds local demo administration. Use its existing password in Chrome; the guarded password-only option above remains enabled. Other identities must complete normal MFA. No real reviewer appointments are established.

1. **Dashboard** shows authorized database counts and links to filtered queues. **Places** supports search, category/destination/publication/status filters and sorting. List pages paginate ten records at a time. **Create fictional branch** offers only destinations where the account can create branches.
2. In a branch, use **Details**, **Evidence**, **Translations**, **Review & publication**, **Private preview**, and **History**. Attach source observations to individual claims; retain scope, conflicting statements and blank unknown dates. **Save new draft revision** creates an immutable revision. Source URLs are stored, never fetched. The source registry links back to the affected branch evidence/history.
3. **Translations** compares a reference language with the selected target language, including branch, claim, source and observation text. **Save changes** saves a new draft, not an approval. Review states distinguish missing text, draft, awaiting review, recorded demo review and outdated review. Language reviewers may save/review only their assigned locale and scope.
4. In **Review & publication**, inspect the **Publication checklist** and **Exact snapshot comparison**, enter a **Review / action rationale**, then **Submit for review**, **Record demo subject review**, and **Record demo language review** for Hebrew, English, French and Russian. Use **Private preview**, then **Publish locally**. All reviews are explicitly synthetic. A change or return invalidates dependent reviews; revoked reviewer authority also blocks publication and requires a fresh review cycle.
5. **Open public branch page** loads the public shell; **Read the evidence** shows only the published snapshot. A newer private draft must remain absent. **Suggest a correction** persists a private report. In **Corrections**, open **Edit**, choose **Assignment** and **Status**, enter **Resolution / triage notes**, and **Save correction update**. **History** retains the actor and notes; a correction never edits or publishes a claim.
6. Return to the branch, enter a reason, and **Withdraw public revision**. Public detail/evidence/list projections stop returning it. The draft, immutable revisions, reviews and audit history remain available privately. Concurrent edits show a conflict instead of replacing newer work.
7. **Destinations** and **Categories** provide persisted four-language catalog forms and archival. Countries/cities are private drafts; creating one does not approve launch coverage or add a public destination page. In-use references cannot be destroyed or silently reassigned. Rome remains the public discovery slice.
8. **Team & access** is administrator-only: create explicitly labeled `@demo.invalid` accounts, assign explicit scope/locale grants, disable/enable access or revoke sessions. Enter new passwords only in the local form/terminal. Self-grant changes and self-disable are blocked, and the last active administrator cannot be removed. Administrator access does not implicitly grant content editing, review or publication. Changes revoke the affected account's sessions. Controlled authenticator recovery remains an operator CLI action.
9. **Settings & policy** persists four localized display names/taglines consumed by the administration shell and public header/footer. Accepted language/scope principles are separate from proposed review intervals and real-authority policies. **Activity** filters authorized audit records; no analytics, deadlines or traffic numbers are invented.

The sidebar persists on desktop; the mobile drawer supports keyboard focus and Escape. The interface selector retains route and filters. Unsaved form changes trigger a leave confirmation; save or cancel deliberately before switching pages/languages. Old branch `/edit` and `/access` links redirect to the reorganized screens. One compact local-demo notice explains the boundary.

Apply new additive migrations with `npm.cmd run db:migrate`, then start/restart the existing preview (`npm.cmd run dev`, or `npm.cmd run build` followed by `npm.cmd start`). Do not run two previews on port 3000. Dependencies, `.env.local`, owner data and account credentials already exist and do not need reinstalling or reseeding. See [administration validation](../technical/ADMINISTRATION_VALIDATION.md); owner acceptance remains pending.

### Disposable validation database

`npm.cmd test` also uses **celitrip_editorial_test**. It explicitly recreates that database’s public schema and inserts fictional fixtures/test identities. Never put owner work there. This is separate from `celitrip_dev`, which is not reset or reseeded. The HTTP test below requires a preview running against the disposable editorial database; do not run it against owner data:

```powershell
# In a separate preview shell after npm.cmd test, with no other process on port 3000:
$env:DATABASE_URL = "postgresql://celitrip:celitrip_local_only@127.0.0.1:55432/celitrip_editorial_test"
npm.cmd run dev
# In another shell with the same DATABASE_URL override:
node --env-file=.env.local scripts/validate-editorial-http.js
node --env-file=.env.local scripts/validate-administration-http.js
node --env-file=.env.local scripts/validate-demo-auth-http.js
```

Clear that shell override with `Remove-Item Env:DATABASE_URL` before starting the owner preview. The final delivered preview uses the existing `celitrip_dev` data and has no automatically created owner account. See [Milestone 2 validation](../technical/MILESTONE_2_VALIDATION.md) for actual evidence, pending acceptance and limitations.

### Destination names and publication

Open http://127.0.0.1:3000/he/editor/destinations/new (English: /en/editor/destinations/new). Select Country or City and its parent, choose a source language, and enter one name. Leaving the field or pressing Enter starts lookup; no request is made per keystroke. Confirm the exact geographic candidate when needed. The other names populate from Wikidata, stay editable and show provenance. Existing manual/reviewed names are preserved; incomplete geographic labels stay empty. Resolve a parent country's identity before automatic city lookup. Nothing approves real coverage.

Use **Save draft** without a note if none is needed. **Internal note (optional)** is private administrative context stored with the revision, not public text and not an action reason. After creation, the saved overview offers **Back to destinations**, **Add a city in this country** (country only, parent preselected) and **Continue editing**. Draft countries and their cities can be organized internally before publication. Return links preserve the originating list's search, filters, sort and page; direct entry returns to the destinations list.

Expand **Names in four languages** to correct localized labels. **Name sources and revision details** contains provider identity/provenance and immutable history. The primary action is **Save draft** while editing, then **Publish geographic names locally** when the saved names, permissions and parent publication are ready. **Complete localized names** expands/focuses the missing name; a parent blocker names and links to the actual country. **Preview saved revision** displays exactly the saved names.

Publication requires the publisher role and an explicit confirmation of that exact saved geography revision. The owner's narrowly accepted simplification removes celiac subject/four separate formal language-review prerequisites for basic names/identity/hierarchy only. This creates no human translation approvals, safe-destination claim, approved launch coverage or real reviewer authority. It cannot publish substantive guidance or claims. Existing claim/travel/card review policies and real-content/environment gates remain intact, and earlier destination review history is retained.

**More actions** contains **Withdraw publication** and **Archive destination**. Each dialog asks for its own reason (5–1000 characters), records the actor/revision and explains validation failures beside the action. Published children prevent parent withdrawal; publication or any children prevent archival. **View cities in this country** opens the actual child list. Restore retains history. New draft edits never overwrite the currently published snapshot. Failed saves preserve inputs; field errors expand/focus the field, and stale edits require comparison with the latest saved revision. Pending actions are locked against duplicates.

Geographic lookup uses Wikidata and needs no API credential. **DeepL setup is deferred at the owner's request. Do not enable it or request a key for this workflow.** The reusable adapter remains available in source for a future authorized integration, but live machine translation is not claimed. **Enter names manually** makes no machine-translation requests. The working lookup continues to protect manual/reviewed values and reject stale source results. Only the selected geographic name/context is sent; private notes and unrelated records are excluded.

Run `npm.cmd test`, `npm.cmd run lint`, `npm.cmd run build` and `npm.cmd run version:check`. Apply the additive optional-note migration with `npm.cmd run db:migrate`; never reseed/reset `celitrip_dev`. `scripts/validate-destination-http.js` requires a preview explicitly connected to `celitrip_editorial_test` and creates synthetic test identities only there. See [current validation and narrow owner acceptance](../technical/GEOGRAPHY_USABILITY_VALIDATION.md) and [earlier lookup evidence](../technical/DESTINATION_VALIDATION.md). Broader acceptance remains separate.
