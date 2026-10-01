# Changelog

Product version and release status are maintained in [VERSION.json](VERSION.json). Document revisions are separate. See the [version workflow](docs/development/VERSIONING.md) for the pre-1.0 convention and release process.

## [Unreleased]

Reserved for future work; no changes beyond the prepared 0.2.0 scope are recorded here yet. Milestone 2 has not begun.

## [0.2.0] - 2026-10-01

**GitHub prerelease preparation — not yet published.** This date records preparation, not a confirmed GitHub publication date. The accepted Milestone 1 checkpoint is on remote main at `a5764706afb08e93e350e8774ccf37b352c1e0f4`. The owner will commit these release-preparation files and tag that exact new release commit. See [release notes](docs/releases/v0.2.0.md) and [manual publication commands](docs/releases/PUBLISH_v0.2.0.md).

This grouping includes the completed standalone prototype, version tooling, product/technical documentation, and persisted four-language Rome journey. The earlier 0.1.0 was an unreleased development baseline, not a release. Authoritative publication status remains `unreleased` with release state `prepared` until GitHub publication is verified.

### Added

* A standalone interactive design prototype using the approved blue palette and Hebrew/English/French/Russian product interface, with RTL/LTR layouts, destination discovery, venue details, a static map demonstration, source information, shopping guidance and simulated editorial/correction flows.
* Connected illustrative hotel discovery and service details, plus a fictional airport guide with separate before/after-security outlet contexts.
* Unknown, historical, needs-review, conflicting and chain-level evidence scenarios, explicitly separated from claims about real venues.
* Short/detailed Italian Celiac Card drafts, an English fallback, destination selection, enlarged previews and prominent review-pending labels. Interface language and card language remain independent.
* Claim-level evidence, source freshness, branch scopes and current prototype/production boundaries in product documentation.
* Authoritative development version metadata, a generated prototype review badge, a read-only consistency check, and repository guidance for grouped releases and completion reporting.
* [Technical discovery for issue #4](docs/technical/TECHNICAL_DISCOVERY.md): JavaScript/Next.js, PostgreSQL and Railway recommendation, verified provider/cost references, domain/editorial/localization design and ordered implementation criteria beginning with a persisted four-language Rome journey. The discovery itself did not provision services.
* Owner-authorized milestone 1: local Next.js App Router/JavaScript application with CSS Modules, shared blue design, four localized Rome → places → branch → claim-evidence journeys, context-preserving language switching, query filters and recovery states.
* Isolated PostgreSQL 17 Compose setup, parameterized `pg` repository, explicit `node-pg-migrate` migrations and repeatable fictional fixtures. Published pointers exclude newer drafts; immutable source revisions retain contradictory observations, unknown values and branch/chain scope.
* Local-only fixture safeguards, noindex responses, setup instructions, focused database tests and [Chrome validation evidence](docs/technical/MILESTONE_1_VALIDATION.md), including database restart persistence. The standalone prototype remains unchanged.

### Changed

* Recorded the standing owner preference: Codex prepares and validates changes and provides exact commands; the owner personally performs commits and pushes. Codex does not mutate Git history or the index. The owner-created checkpoint is now confirmed on remote main; Codex has executed no release-preparation Git mutations.
* Prototype navigation retains filters, outlet/evidence context and card options in URL fragments for refresh and browser back/forward behavior.
* Product handoff and information architecture distinguish demonstrated design flows from remaining implementation work.
* Recorded owner acceptance of the current prototype's visual direction and interaction flows, separately from pending translation/card review, real evidence, trust-policy acceptance and launch readiness. Existing browser evidence remains applicable to the unchanged prototype.
* Recorded the owner's review of the running Milestone 1 application and acceptance of the demonstrated implementation ("looks good"). This is not translation, medical/card wording, real-content or public-launch approval, and does not authorize Milestone 2.
* Prepared the agreed 0.2.0 development checkpoint with Unreleased status. Synchronized npm metadata, rebuilt the local application version display and regenerated only the standalone prototype's version badge. Existing flow evidence is reused; the version-label checks are documented separately.

### Limitations

* The standalone prototype and new local persisted Rome application are unreleased. The application has a working local read backend; authenticated editorial publishing, correction submissions, subscribed maps, deployment and offline card storage remain unimplemented.
* New hotel, airport, outlet and evidence examples are fictional. Original venue content and dates are supplied prototype material and have not been newly verified.
* Card wording and interface translations still need human review; no reviewer approval, accreditation or verification date is invented. Editorial review intervals remain unapproved proposals.
* Real destination coverage, facility-profile filters, full country/shopping content and production accessibility validation remain open. Architecture is approved for local implementation; only milestone 1 is implemented. Translations and fixture publication are unreviewed demonstrations. Recurring budget and operational ownership remain to be agreed before hosting. Browser checks are scoped separately for the prototype and local application.
* V1 exclusions remain unchanged; no native mobile app, traveler accounts, saved trips, ratings, reservations or AI recommendations are included.

### Checkpoint scope and release boundary

* **0.2.0 Unreleased** groups the accepted prototype and its illustrative hotel/hub/evidence/card flows; authoritative version management and tooling; product, trust-proposal and technical discovery/handoff documents; the persisted Rome application, fixtures and focused validation evidence. Prototype demonstrations remain distinct from implemented application capabilities.
* Minor increment for the grouped capabilities, explicitly authorized by the owner. No existing prototype route or flow was removed, and no breaking change to the existing prototype is identified. PRD v0.2 remains a separate document revision.
* The [checkpoint preparation](docs/development/CHECKPOINT_0.2.0.md) remains a historical record. Its 90-file commands are superseded for this task by the narrow release-preparation list. The checkpoint commit/push were performed by the owner; the new release commit, annotated tag and GitHub prerelease remain pending. No deployment is implied.
