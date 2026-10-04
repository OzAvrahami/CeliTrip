# Changelog

Product version and release status are maintained in [VERSION.json](VERSION.json). Document revisions are separate. See the [version workflow](docs/development/VERSIONING.md) for the pre-1.0 convention and release process.

## [Unreleased]

* Preserved the verified v0.2.0 publication in authoritative release history and the historical documentation. Its published tag/release remain immutable. Current development metadata and synchronized displays now say **0.3.0 Unreleased**; no 0.3.0 release or deployment has occurred.

### 0.3.0 development checkpoint — Unreleased

* The owner reviewed the corrected destination-management experience and said it “looks good.” Acceptance covers that demonstrated local workflow only. It does not approve real content, translations, medical/card wording, reviewer authority, production readiness or every other Milestone 2 flow. The owner authorized grouping completed local capabilities into this checkpoint; broader acceptance remains separate. See [draft notes](docs/releases/v0.3.0-draft.md).

* Corrected destination action validation: legacy Submit no longer requires a distant general reason. Creation/saving accept optional private revision notes; withdrawal/archive request their own required reason. Added field-specific/action-local errors, focus, pending/success states, clear back navigation with list context, saved-draft overview and draft-country/city organization. Names and provenance are compact, with preview and contextual publication actions instead of disabled review buttons. **Local API compatibility:** geographic publication now requires `confirmGeography: true`; it cannot publish claims or guidance. No existing owner destination is automatically published.

* Added source-language-first destination naming with live identity-based geographic lookup, protected editable translations, immutable generation provenance and stale-response rejection. A shared DeepL adapter remains integrated but its setup is deferred by the owner; it is not a prerequisite and no machine-translation success is simulated.
* Added explicit destination draft/preview/local-publication/withdrawal/archive actions, separate published and newer draft revisions, and public hierarchy checks. The owner subsequently approved a narrow geography-only workflow: names/identity/hierarchy require validation and explicit scoped publisher confirmation, without subject/four formal language approvals. Earlier destination review history is retained; substantive content review gates are unchanged. **Local administration API change:** destination edits now require the expected revision/version, and archival via a status dropdown is rejected; callers must use explicit actions. Existing public Rome URLs remain compatible. Destination-workflow acceptance is recorded above; real launch coverage remains pending.
* Completed the eight-section administration follow-up review and fixed Team & access chronological sorting to use persisted account creation dates. Added a focused PostgreSQL regression for newest/oldest/name ordering; existing workflow and responsive-language evidence is reused.
* Expanded the editorial screens into a dedicated four-language administration workspace: persistent desktop sidebar, mobile navigation drawer, scoped dashboard counts/work queues, and searchable/filterable/sortable/paginated catalog, branch, evidence, translation, review, correction, team and activity lists.
* Added persisted draft countries/cities and categories with reference-preserving archival, side-by-side translation editing and exact approval states, correction assignment/history, administrator account/access management with self-change and last-administrator protections, and localized display settings consumed by the application. New destination drafts do not establish public launch coverage.
* Added additive administration migrations and focused PostgreSQL, direct-request authorization and Chrome validation. Preserved the existing owner account/authenticator and grants; added only the explicitly authorized, audited fictional administrator grant. The owner database was not reset or reseeded. Administration acceptance remains pending.
* Added Better Auth 1.7.7 with operator-created fictional accounts, disabled public signup, PostgreSQL sessions, default mandatory per-session TOTP, scoped roles, recovery and session revocation.
* Added an explicit, default-off password-only walkthrough option for `owner-demo@demo.invalid`, limited to the guarded local fictional database and canonical loopback requests. A separate password-session marker never claims MFA verification; enrolled authenticators/recovery codes and scoped authorization are preserved. Hosted/real-content operation remains blocked. The ignored owner configuration opts in; disabling the option restores mandatory MFA.
* Added four-language blue editorial screens for branch/claim/source/observation/translation editing, exact-revision comparison, private preview, review queue, immutable history, local publication and reasoned withdrawal. Concurrent saves are rejected; new revisions and returns require fresh dependent reviews.
* Added transactional substantive-content publication requiring subject review and all four language reviews of the exact revision. Public reads remain pinned to the published snapshot; synthetic reviews are confined to local fixture mode and do not approve real content or translations.
* Added bounded, rate-limited, honeypot-protected anonymous corrections with persisted receipts, private contact fields and audited editorial triage/resolution. Submissions never fetch URLs or publish automatically.
* Added additive migrations, controlled local account tooling, focused PostgreSQL/HTTP tests, Chrome evidence and secure setup documentation. Existing owner data and the published v0.2.0 tag/metadata are preserved.
* Scope remains local and fictional. Acceptance beyond the demonstrated destination workflow, real reviewer assignments/policies, translation and medical/card approval, real content and public launch readiness remain pending. Proposed review intervals are inactive; maps, cards/offline and cloud operations remain later milestones. No public-route breaking changes are identified; local setup now requires an ignored authentication secret and additive migrations.

### Breaking changes to local administration callers

Destination writes require the exact saved revision/version. Publication also requires `confirmGeography: true`; a status dropdown cannot archive/publish. Callers must use the explicit authorized actions. Apply existing additive migrations; do not reset/reseed owner data. Existing public Rome URLs remain compatible.

## [0.2.0] - 2026-10-01

**Published GitHub prerelease**, not a draft or stable release: [v0.2.0](https://github.com/OzAvrahami/CeliTrip/releases/tag/v0.2.0), published **2026-10-01T12:32:09Z**. Annotated tag `v0.2.0` points to release-preparation commit `8d329a6d5a1dafa561772f0536e3c7811e1e2739`, following accepted Milestone 1 checkpoint `a5764706afb08e93e350e8774ccf37b352c1e0f4`. Publication was performed by the owner and verified through read-only GitHub/tag checks. See [release notes](docs/releases/v0.2.0.md) and the [publication record](docs/releases/PUBLISH_v0.2.0.md). This is not a production deployment.

This grouping includes the completed standalone prototype, version tooling, product/technical documentation, and persisted four-language Rome journey. The earlier 0.1.0 was an unreleased development baseline, not a release. The historical publication record retains channel `prerelease` and state `published`; current development metadata is 0.3.0 Unreleased. The immutable tagged preparation snapshot retains its original `unreleased/prepared` metadata; the publication-record follow-up does not move or rewrite that tag.

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

* The standalone prototype and local persisted Rome application are published as a development prerelease, not a stable production application. The application has a working local read backend; authenticated editorial publishing, correction submissions, subscribed maps, deployment and offline card storage remain unimplemented.
* New hotel, airport, outlet and evidence examples are fictional. Original venue content and dates are supplied prototype material and have not been newly verified.
* Card wording and interface translations still need human review; no reviewer approval, accreditation or verification date is invented. Editorial review intervals remain unapproved proposals.
* Real destination coverage, facility-profile filters, full country/shopping content and production accessibility validation remain open. Architecture is approved for local implementation; only milestone 1 is implemented. Translations and fixture publication are unreviewed demonstrations. Recurring budget and operational ownership remain to be agreed before hosting. Browser checks are scoped separately for the prototype and local application.
* V1 exclusions remain unchanged; no native mobile app, traveler accounts, saved trips, ratings, reservations or AI recommendations are included.

### Checkpoint scope and release boundary

* **0.2.0 published prerelease** groups the accepted prototype and its illustrative hotel/hub/evidence/card flows; authoritative version management and tooling; product, trust-proposal and technical discovery/handoff documents; the persisted Rome application, fixtures and focused validation evidence. Prototype demonstrations remain distinct from implemented application capabilities.
* Minor increment for the grouped capabilities, explicitly authorized by the owner. No existing prototype route or flow was removed, and no breaking change to the existing prototype is identified. PRD v0.2 remains a separate document revision.
* The [checkpoint preparation](docs/development/CHECKPOINT_0.2.0.md) and release-preparation commands are historical records and must not be rerun to replace existing state. The owner performed the checkpoint/release commits, pushes, annotated tag and GitHub prerelease publication. No deployment is implied; Codex performed only the local verification/recording follow-up.
