# CeliTrip — Development Handoff

**Updated:** 2026-10-08 · **Status:** 0.3.0 Published prerelease; verified non-draft and not Latest. Corrected destination workflow accepted; broader acceptance remains separate. Milestone 1 remains historically published as prerelease v0.2.0.

## 1. Current State

The owner authorized expansion into a full local administration workspace. The default authenticated page is **http://127.0.0.1:3000/en/editor**: scoped dashboard, draft destination/category management, branch details/evidence/translations/review/history, source registry, private correction assignment, team access, consumed localized display settings and audit activity. Desktop sidebar and mobile drawer support all four interface languages. The existing owner-demo account has the explicitly authorized, audited administrator grant in addition to its preserved editorial grants; its password, authenticator and narrow password-only exception were not changed. See the [administration walkthrough](../development/LOCAL_DEVELOPMENT.md#administration-workspace-walkthrough) and [new validation evidence](../technical/ADMINISTRATION_VALIDATION.md).

The owner committed/pushed checkpoint `c897a0bf4c0bd267104c073fe11dd8d672a79f8e`, prepared the release on 2026-10-04, then published **v0.3.0 at 2026-10-08T18:32:14Z**, prerelease true, draft false and isLatest false. Annotated tag object `38ec171b9c9cf8977c2484491fad0e83659ddc25` peels to immutable commit `6c1cb564f8cfd3ec8a395582f3581d7a800bace7`, independently confirmed from remote refs. Current metadata and synchronized labels say **0.3.0 Published prerelease**; the tagged Unreleased/prepared snapshot is preserved. See [release notes](../releases/v0.3.0.md), [completed publication and historical instructions](../releases/PUBLISH_v0.3.0.md), [historical preparation validation](../technical/RELEASE_0.3.0_VALIDATION.md), and [publication-recording validation](../technical/PUBLICATION_0.3.0_VALIDATION.md). The verified **0.2.0 published prerelease** remains preserved in release history with its immutable tag target. Destination drafts do not authorize launch coverage; public discovery remains the Rome milestone. Real publication, real reviewer appointments, translation/medical approval, proposed review intervals and public-launch readiness remain gated. Acceptance is limited to the corrected destination workflow described below; broader administration acceptance is not inferred.

Milestone 2 was subsequently authorized and implemented locally: authenticated editorial management, exact-revision review, synthetic local publication/withdrawal and private corrections. See [Milestone 2 validation](../technical/MILESTONE_2_VALIDATION.md) and section D below. Acceptance beyond the demonstrated corrected destination workflow remains pending; earlier prototype/Milestone 1 acceptance is not extended automatically to other capabilities.

The owner requested an opt-in password-only walkthrough for `owner-demo@demo.invalid`. It is enabled only in ignored local configuration, requires the guarded fictional database and canonical loopback access, and preserves live sessions/scoped roles plus all enrolled MFA material. MFA stays mandatory by default and for every other account; no MFA verification is fabricated. See [setup and disabling instructions](../development/LOCAL_DEVELOPMENT.md#optional-password-only-owner-walkthrough). This is included in the 0.3.0 published prerelease, without real reviewer/publication approval.

The repository contains product discovery documents, the standalone [interactive design prototype](../design/CeliTrip-Design-Flow.html) with unchanged flows, and a working local milestone 1 application. The application uses Next.js/JavaScript, shared blue CSS Modules and isolated PostgreSQL for Rome → places → branch details → claim evidence in Hebrew, English, French and Russian. See [local setup](../development/LOCAL_DEVELOPMENT.md) and [application validation](../technical/MILESTONE_1_VALIDATION.md). The September handoff reports Figma foundations only; the live Figma state was not verified or changed. No deployment, production admin, or launch-ready content collection is established by this work.

The owner confirmed acceptance of the current prototype's visual direction and interaction flows in the task instruction recorded on 2026-10-01. Translation review, approved celiac-card wording, real venue evidence and launch-content readiness remain separate pending items. This acceptance does not approve the proposed trust policies or establish production capabilities.

The owner subsequently reviewed the running Milestone 1 application and said it "looks good". The checkpoint task records acceptance of the **demonstrated local implementation**: the persisted four-language Rome discovery/branch/evidence journey. This is distinct from the earlier prototype acceptance. Translation review, medical/celiac-card wording approval, real-content review and public-launch readiness remain pending. No clinical endorsement, source verification, reviewer approval or acceptance of provisional trust intervals is inferred.

The owner subsequently approved the [issue #4 architecture](../technical/TECHNICAL_DISCOVERY.md) for local implementation and explicitly authorized milestone 1. Railway and other cloud services remain unprovisioned recommendations. [PRD v0.2](PRD.md), the proposed [trust rules](TRUST_RULES.md) and [information architecture](INFORMATION_ARCHITECTURE.md) remain the product inputs.

The owner committed/pushed the grouped checkpoint at `a5764706afb08e93e350e8774ccf37b352c1e0f4`, then published [v0.2.0](https://github.com/OzAvrahami/CeliTrip/releases/tag/v0.2.0) at **2026-10-01T12:32:09Z** as a **published prerelease, not a draft**. Its annotated tag targets `8d329a6d5a1dafa561772f0536e3c7811e1e2739`. Read-only GitHub/tag checks confirmed these facts. That publication follow-up kept version 0.2.0 and displayed Published prerelease. The current version is the 0.3.0 published prerelease; the 0.2.0 record is retained in `VERSION.json.release_history`. The [checkpoint](../development/CHECKPOINT_0.2.0.md) and [publication commands](../releases/PUBLISH_v0.2.0.md) are historical; do not rerun them or move the tag. Codex only recorded this publication locally, preserving the index and application data. Translation, medical/card wording, real evidence/content and launch readiness remain pending. That publication-recording follow-up included no deployment, PR, issue closure or Milestone 2 work; 0.1.0 was never released.

### Destination administration follow-up — 2026-10-04

Destination naming starts from one source language with identity-aware geographic lookup, protected manual names, provenance and stale-response checks. The owner narrowly approved simpler **basic geographic metadata** management: save an optional-note draft, preview, explicitly confirm publication with publisher scope, withdraw with a reason, or archive with a reason. Celiac subject/four formal language reviews are no longer prerequisites for geographic labels; old review records remain in history. Geography publication writes only a destination-name revision pointer, never substantive guidance/claims. Draft/published/archival states remain separate. Draft countries can contain internal draft cities. Back navigation preserves list context; saved creation shows a compact overview, and field/action errors appear where they are relevant.

Substantive travel guidance, venue evidence, celiac cards and real-content launch gates remain unchanged. Israel and all pre-existing owner records were preserved. **DeepL setup is deferred by the owner**, with no credentials requested or service enabled. Geographic lookup and manual names remain available. See [current usability validation](../technical/GEOGRAPHY_USABILITY_VALIDATION.md), [earlier lookup evidence](../technical/DESTINATION_VALIDATION.md), and [walkthrough](../development/LOCAL_DEVELOPMENT.md#destination-names-and-publication). This work is grouped into the 0.3.0 published prerelease. The owner subsequently reviewed the corrected destination-management experience and said it “looks good”: acceptance is recorded for that demonstrated local workflow only. It does not approve real content, human translations, medical/card wording, reviewer authority, public launch or production readiness. Other Milestone 2 acceptance remains separate. See [checkpoint and explicit manifest](../development/MILESTONE_2_CHECKPOINT.md) and [release notes](../releases/v0.3.0.md).

## 2. Established Decisions Versus Proposals

| Established project direction | Proposal / still open |
| --- | --- |
| Responsive mobile-first web application; approved local architecture and implemented Rome slice | Local editorial workflow now implemented; maps/cards, other persisted flows and cloud operations remain later milestones |
| Owner accepted blue prototype direction/flows and the demonstrated Milestone 1 implementation | Reviewed translations, medical/card wording, real evidence and launch content |
| Hebrew, English, French, Russian at launch | Named language and card reviewers |
| Claim-specific sources and freshness | Acceptance of proposed editorial review intervals |
| Separate venue claims from independent accreditation | Recognized-authority records and permitted branding |
| No traveler accounts, trips, ratings, reservations, or AI in V1 | Final launch destinations and coverage threshold |
| Rome is the reference and requested first persisted implementation journey | Public launch destinations and coverage remain open |

## 3. Existing Issues

| Issue | Contribution in this change | Remaining work |
| --- | --- | --- |
| [#1 PRD v0.2](https://github.com/OzAvrahami/CeliTrip/issues/1) | Multiple observations, claim freshness, richer facility profile, Travel Hubs, and current language/design decisions | Product review of the revised PRD; any merge is deferred beyond this local pass |
| [#2 Trust rules](https://github.com/OzAvrahami/CeliTrip/issues/2) | Concrete editorial proposal and review scenarios | Accept/refine intervals, reviewer responsibilities, authority rules, and publication criteria |
| [#3 Information architecture](https://github.com/OzAvrahami/CeliTrip/issues/3) | Connected journeys, 27-route prototype inventory and owner visual/interaction acceptance | Translation/content review, remaining discovery filters and production states |
| [#4 Technical discovery](https://github.com/OzAvrahami/CeliTrip/issues/4) | Architecture documented, owner approved local implementation, milestone 1 implemented and validated | Remaining ordered milestones and publication/operational gates; issue remains unchanged |

No issue was changed or closed. Owner acceptance covers the prototype direction/flows, demonstrated local Milestone 1 implementation and corrected destination-management workflow; acceptance beyond those demonstrations, medical/card and real content approvals remain separate.

## 4. Suggested Implementation Sequence

### A. Preserve accepted design; resolve publication policy

Use the accepted Rome, hotel/hub, card and evidence interactions as the implementation reference. Confirm or refine the trust proposal and arrange language/content review before real publication. These pending reviews do not block a local persisted Rome journey with clearly fictional fixtures.

### B. Technical recommendation — issue #4

The [technical discovery](../technical/TECHNICAL_DISCOVERY.md) now recommends one coherent approach and compares the meaningful managed alternative. It covers:

* Search-visible localized country/city/place pages and stable shareable URLs.
* RTL/LTR rendering and reviewed translations tied to content revisions.
* Multiple observations, branch scopes, accreditation history, and multi-category places.
* Editorial access control and draft/publish/withdraw behavior.
* Map pricing/licensing and attribution, without selecting a vendor solely from the prototype's static tiles.
* Reviewed cards that can be deliberately saved and used offline.
* Operational simplicity, content exportability, and expected early usage.

Provider facts and material costs were checked against official sources during discovery. No cloud service has been subscribed to or provisioned. The owner subsequently authorized local milestones 1 and 2; no cloud operations are authorized.

### C. First functional increment — a persisted Rome discovery journey

**Implemented locally.** The application shell, four-language routing, destination → places → branch detail → evidence, filters and recovery states use persisted, clearly fictional local fixtures. Three multi-category branches exercise all five evidence dimensions, with coexisting states, preserved contradictory source revisions and unknown values. A newer draft and draft-only branch are excluded from public queries. Do not activate provisional facility-profile/review policies as accepted rules.

Direct entry, refresh, language switching and back/forward navigation preserve the journey and validated filters. PostgreSQL revisions persist across application and database restarts. Public reads use publication pointers; fixture publication is explicitly unreviewed and is not an authenticated editorial workflow. Local host/database guards and noindex responses keep this fixture slice private to local development.

Open **http://127.0.0.1:3000/en/destinations/italy/rome** while the preview is running. Follow Explore example places → Forno Demo → Sources & evidence; use Tavola Demo for chain scope. The [setup guide](../development/LOCAL_DEVELOPMENT.md) contains reproducible commands. Neither the prototype's two places nor the application's three fictional branches establish launch coverage. Real data requires the later publication gates and real-data migrations.

### D. Editorial publishing — Milestone 2 local implementation

**Implemented locally; owner acceptance pending.** Sign in → TOTP → create/edit fictional Rome branch → attach claim-specific evidence → exact subject/four-language review → private preview → publish locally → public page → withdraw. New revisions, return-for-changes cycles and concurrency checks prevent stale approval reuse. Anonymous corrections persist privately and require audited triage; they cannot change content or publish.

[Milestone 2 validation](../technical/MILESTONE_2_VALIDATION.md) separates new PostgreSQL/HTTP/Chrome evidence from historical Milestone 1/prototype evidence. [Local setup](../development/LOCAL_DEVELOPMENT.md) documents secret generation, operator account creation, assigned roles/locales/scopes, recovery and session revocation. All identities/reviews in validation are explicitly synthetic and live in a disposable database. The owner database was migrated additively without reseeding or changing its existing six content revisions/four publication pointers.

Current metadata is **0.3.0 Published prerelease**, with the historical 0.2.0 published prerelease preserved. Acceptance beyond the demonstrated destination workflow, real reviewer authority, publication/conflict/translation policies, correction handling/retention and launch readiness remain pending. No proposed review intervals are activated. Hotels/hubs/maps, reviewed cards/offline and cloud operations remain later milestones.

### E. Launch preparation

Resolve venue/source currency, imagery rights, all required translations, card review, destination coverage, accessibility, recovery behavior, and monitoring. These are concrete launch requirements, not claims that the prototype already satisfies them.

## 5. Accepted Prototype Walkthrough

Open [CeliTrip-Design-Flow.html](../design/CeliTrip-Design-Flow.html) directly in Chrome (double-click the file); it includes its fonts, imagery, styles and scripts. Select the clickable prototype or a flow-map screen. Use the existing mobile/desktop controls and the language selector inside the product preview. Then follow:

1. Home → Rome guide → list / map → named branch.
2. Branch → sources and freshness → back to branch.
3. City → Hotels → illustrative hotel → breakfast details → evidence → back.
4. City → Travel hubs → illustrative airport → each outlet → evidence → back to its outlet/hub.
5. Evidence → unknown / historical / needs review / conflicting / chain scope.
6. City / hotel / outlet → Celiac Card → short/detailed → Italian/English fallback → enlarge → close. Global card entry without a destination first asks for the demo destination.
7. Switch Hebrew → English → French → Russian and check context retention and RTL/LTR layout.

Use this walkthrough as the accepted interaction reference. Future change requests should identify the screen and intended outcome; acceptance does not replace the separate translation and content reviews.

## 6. Validation and Prototype Limits

See the [prototype validation report](../design/PROTOTYPE_VALIDATION.md) for browser dimensions, checked journeys and screenshots. Documentation checks cover relative links, UTF-8, whitespace and consistency with the four-language scope and V1 exclusions. The Git index remains untouched.

The separate [milestone 1 report](../technical/MILESTONE_1_VALIDATION.md) records real database tests, restart persistence, Chrome journeys at 1440 × 1000 and 390 × 844 in all four languages, error recovery and source fingerprints. It does not replace or broaden the unchanged prototype's acceptance evidence.

New hotels, hubs, outlets and evidence observations are labeled fictional. The original venue data is preserved as supplied and is not newly verified. All card wording and interface translations require human review before public use. No review date or approval has been invented. Editorial review intervals remain proposals.

In the standalone prototype, saving, reporting, publication, editor access and loading/offline states remain simulations. The local application now has authenticated editorial revisions, synthetic review/publication, withdrawal and private corrections in addition to the persisted Rome journey. Maps, cards and offline storage remain unimplemented. Remaining delivery gates include accepted trust/publication rules, reviewer ownership, source/authority rights, reviewed content and launch coverage, plus budget and operational ownership before hosting. No proposed editorial interval has been activated.
