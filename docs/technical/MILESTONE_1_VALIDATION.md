# Milestone 1 — local implementation validation

**Date:** 2026-10-01 · **Product:** 0.1.0 Unreleased · **Scope:** local fictional Rome journey only

**Historical validation snapshot:** The results and screenshots below were captured at the unreleased 0.1.0 baseline. The owner subsequently reviewed the running application and accepted the demonstrated implementation ("looks good"), with translation, medical/card wording, real content and launch readiness still pending. The authorized **0.2.0 Unreleased checkpoint** changes product metadata and version displays only; see [checkpoint validation and fingerprint reconciliation](../development/CHECKPOINT_0.2.0.md). The original manifest/screenshots are retained unchanged, not relabeled as newly executed checks.

The owner authorized the architecture and local milestone 1. The working implementation is separate from the unchanged [standalone design prototype](../design/CeliTrip-Design-Flow.html). Its visual/interaction acceptance remains recorded in the [handoff](../product/DEVELOPMENT_HANDOFF.md). Translation review, celiac-card wording, real evidence and launch readiness remain pending.

## Reproduce and review

Follow [LOCAL_DEVELOPMENT.md](../development/LOCAL_DEVELOPMENT.md). The final preview uses `npm.cmd run build` then `npm.cmd start`, listening at **http://127.0.0.1:3000/en/destinations/italy/rome**. PostgreSQL is isolated in Compose project `celitrip-local`, loopback port 55432, named volume `celitrip-local_pgdata`. No cloud resources were created.

Walkthrough: Rome → Explore example places → optionally filter Bakery → Forno Demo → Sources & evidence. Read the two contradictory fryer observations, historical accreditation scenario and unanswered utensil claim. Return to the list and open Tavola Demo for a chain-only statement that leaves the branch unknown. Switch Hebrew/English/French/Russian on any page; the entity and validated filters are retained. All venue/source content is explicitly fictional and unreviewed.

## Automated and operational results

| Check | Actual result |
| --- | --- |
| `npm.cmd test` | **11 passed, 0 failed** using real PostgreSQL in `celitrip_test`. |
| Migrations | Initial up, repeat up, complete down/up in the disposable test database passed. Development database was not rolled back. |
| Repeatable fixtures | Two seed passes preserve row counts and publication pointers. Seeds append with stable IDs rather than overwriting existing data. |
| Public/draft separation | All four languages read published Forno revision 1 while revision 2 remains draft. Draft-only branch, draft claim and draft search text are absent from public reads. Database rejects draft publication and revision mutation. |
| Evidence invariants | All five dimensions represented; coexisting states retained; contradictory revisions 1/2 preserved; null dates/URL/value preserved; wrong-branch and wrong-source scope rejected. |
| Search and filters | Multiple categories, cross-language Cyrillic query, combined empty filters, bounded inputs and SQL-injection string checks passed. Queries use parameters. |
| Persistence | Fresh connection test passed. App was stopped/restarted into the optimized build. Database container was stopped/recreated using the existing named volume; all three branches and evidence returned without migration or reseed. Content-revision checksum before and after: `4a97c0d92d73dfc5b7033b988ebadcb2`. |
| Fixture isolation | Unit tests reject missing mode, cloud markers and nonlocal/wrong database URLs. Actual HTTP requests with external Host, external X-Forwarded-Host or Forwarded headers each returned **403**. Normal four-language SSR responses returned 200, noindex and no draft markers. |
| Build/lint/version | Optimized Next.js build, ESLint, standalone badge check and package/lockfile version mirror checks passed. |
| Documentation/preservation | UTF-8 decoding, relative links and trailing-whitespace checks passed across 46 source/config/document files. Git diff whitespace check passed. Prototype and index fingerprints match the preserved baseline. |

Validated runtime: Node 24.11.1, Next.js 16.3.8, React 19.3.0, pg 8.23.1, node-pg-migrate 9.0.0, PostgreSQL 17 image pinned in Compose. ESLint is pinned to 9.39.5 for compatibility with the current Next configuration; npm reports its upstream deprecation. ESLint 10 exposed a parser compatibility failure during setup; the pinned configuration passes. Revisit that development-tool dependency before the next tooling upgrade.

## Chrome coverage

Chrome was connected and used for actual interactive checks. Browser validation is **completed, not blocked**. The [saved observations](qa/browser-checks.json) contain **81 DOM observations**; selected screenshots were opened and visually inspected. Dimensions are CSS viewports; screenshots may include browser scrollbar scaling.

| Viewport | Hebrew | English | French | Russian |
| --- | --- | --- | --- | --- |
| 1440 × 1000 | Destination/list/filter/branch/evidence/refresh passed | Passed | Passed | Passed |
| 390 × 844 | Destination/list/filter/branch/evidence/refresh passed | Passed | Passed | Passed |

Additional checks:

* No document horizontal overflow or visible draft markers in recorded states. Hebrew `lang=he`, `dir=rtl`; other languages `dir=ltr`. Shared blue components and local typography inspected in screenshots.
* Language switching through all four locales retains the evidence route and bakery filter; list switching also checked. Evidence and branch back links restore the filtered list. Actual browser back/forward restores branch/list context.
* Direct-entry chain evidence, combined-filter empty state and draft-only not-found state checked in all four locales. Unknown route and recovery link checked in English.
* Keyboard Enter activates journey navigation. Shift+Tab reaches the language/evidence selectors with a visible solid focus outline. This is a focused keyboard check, not a full accessibility audit.
* A temporary PostgreSQL read lock exposed the localized loading boundary; normal content appeared when it was released. Loading was observed in English. Database stop produced translated error screens in all four languages; Russian Retry restored the list after restart.
* Normal journey/empty/chain checks produced **no warning/error console entries**. Four deliberate outage navigations produced four expected minified React #441 server-render errors, saved separately in the observations. React documents this as the production server-render error wrapper; it is not an unexplained hydration/layout failure. [Official error reference](https://react.dev/errors/441).
* Footer reads **v0.1.0 · unreleased** from the authoritative file; the unchanged standalone version badge passes its existing check.

Issues found and fixed during implementation: Next's own local forwarded-host header initially tripped the guard; local matching headers are now accepted while external/mismatching headers are rejected. Client-only locale navigation retained the old root shell; switching now loads the localized document and preserves context. Evidence branch-title spacing was corrected and the final English screenshot replaced. Existing successful navigation checks were reused for that spacing-only edit.

## Visual evidence and fingerprints

* Desktop: [Rome](qa/1440-en-destination.png), [place list](qa/1440-en-list.png), evidence in [English](qa/1440-en-evidence.png), [Hebrew](qa/1440-he-evidence.png), [French](qa/1440-fr-evidence.png), [Russian](qa/1440-ru-evidence.png).
* Mobile: [Hebrew list](qa/390-he-list.png), evidence in [English](qa/390-en-evidence.png), [Hebrew](qa/390-he-evidence.png), [French](qa/390-fr-evidence.png), [Russian](qa/390-ru-evidence.png), [Russian chain scope](qa/390-ru-chain.png).
* [Validation manifest](qa/validation-manifest.json) records SHA-256 hashes for the final application source/config/assets, database files and screenshots. Use it to determine whether later changes invalidate this evidence. The initial English desktop journey predates only the final spacing edit; the remaining matrix and final English visual check follow it.

Standalone prototype SHA-256 remains `236fa460bc88bfac4010d2290b937191099b4d7c1506701883d8d64386d000a5`; its previous browser evidence is reused, not claimed as new app validation. Git index SHA-256 remains `aec821f4871b0387ece64633ad352690a7d6efa7f12f8d7463923c0c4831946f`.

## Limits and next boundary

This is a persisted local read application using three fictional branches, not public launch content. Fixture publication is not reviewer approval; dates/authority/verification records are not invented. The schema intentionally accepts fixture records and unreviewed translations only. Source and claim revisions are immutable, but authenticated authorship, publication authorization, dependency invalidation and real-content migration are milestone 2 work.

Only Rome is implemented. Stable readable fixture IDs, literal multilingual substring search and default-Hebrew redirect are deliberate first-slice choices; UUID real-data identities, reviewed aliases, full public SEO, broader destinations and pagination remain future work. Public indexing is disabled. No editorial authentication, corrections API, hotel/hub persistence, map service, cards, offline storage, backups/monitoring or deployment is claimed. Real imagery/font rights and human translation review remain launch gates. Proposed trust/review intervals remain unapproved and inactive.

Version impact is **minor capability work**, proposed for a grouped **0.2.0** release. **VERSION.json remains 0.1.0 Unreleased**. CHANGELOG Unreleased was updated; no bump, staging, commit, tag, push, PR, issue closure, publication or deployment was performed.
