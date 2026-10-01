# CeliTrip — Development Handoff

**Updated:** 2026-10-01 · **Status:** Accepted Milestone 1 checkpoint on remote main; v0.2.0 GitHub prerelease prepared, publication unconfirmed

## 1. Current State

The repository contains product discovery documents, the standalone [interactive design prototype](../design/CeliTrip-Design-Flow.html) with unchanged flows, and a working local milestone 1 application. The application uses Next.js/JavaScript, shared blue CSS Modules and isolated PostgreSQL for Rome → places → branch details → claim evidence in Hebrew, English, French and Russian. See [local setup](../development/LOCAL_DEVELOPMENT.md) and [application validation](../technical/MILESTONE_1_VALIDATION.md). The September handoff reports Figma foundations only; the live Figma state was not verified or changed. No deployment, production admin, or launch-ready content collection is established by this work.

The owner confirmed acceptance of the current prototype's visual direction and interaction flows in the task instruction recorded on 2026-10-01. Translation review, approved celiac-card wording, real venue evidence and launch-content readiness remain separate pending items. This acceptance does not approve the proposed trust policies or establish production capabilities.

The owner subsequently reviewed the running Milestone 1 application and said it "looks good". The checkpoint task records acceptance of the **demonstrated local implementation**: the persisted four-language Rome discovery/branch/evidence journey. This is distinct from the earlier prototype acceptance. Translation review, medical/celiac-card wording approval, real-content review and public-launch readiness remain pending. No clinical endorsement, source verification, reviewer approval or acceptance of provisional trust intervals is inferred.

The owner subsequently approved the [issue #4 architecture](../technical/TECHNICAL_DISCOVERY.md) for local implementation and explicitly authorized milestone 1. Railway and other cloud services remain unprovisioned recommendations. [PRD v0.2](PRD.md), the proposed [trust rules](TRUST_RULES.md) and [information architecture](INFORMATION_ARCHITECTURE.md) remain the product inputs.

The owner committed and pushed the grouped **0.2.0 Unreleased development checkpoint** to remote main at `a5764706afb08e93e350e8774ccf37b352c1e0f4`, covering the prototype, version tooling, documents and persisted Rome slice. Local and remote state were verified before prerelease preparation. The [checkpoint record](../development/CHECKPOINT_0.2.0.md) is historical; use the new [release-preparation commands](../releases/PUBLISH_v0.2.0.md) for the narrow follow-up. Version remains 0.2.0, publication status remains Unreleased, and release metadata identifies a prepared prerelease. The dated changelog records preparation, not confirmed publication. No v0.2.0 tag or release existed at inspection. Codex has not staged, committed, tagged, pushed or published these release-preparation changes; the owner performs those actions. Application data and the index are preserved. No deployment, PR, issue closure or Milestone 2 work is included; 0.1.0 was never released.

## 2. Established Decisions Versus Proposals

| Established project direction | Proposal / still open |
| --- | --- |
| Responsive mobile-first web application; approved local architecture and implemented Rome slice | Editorial, maps/cards, other persisted flows and cloud operations remain later milestones |
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

No issue was changed or closed. Owner acceptance covers the prototype direction/flows and the demonstrated local Milestone 1 implementation; editorial, medical/card and content approval remain pending.

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

Provider facts and material costs were checked against official sources during discovery. No cloud service has been subscribed to or provisioned. The subsequent owner authorization covers local milestone 1 only.

### C. First functional increment — a persisted Rome discovery journey

**Implemented locally.** The application shell, four-language routing, destination → places → branch detail → evidence, filters and recovery states use persisted, clearly fictional local fixtures. Three multi-category branches exercise all five evidence dimensions, with coexisting states, preserved contradictory source revisions and unknown values. A newer draft and draft-only branch are excluded from public queries. Do not activate provisional facility-profile/review policies as accepted rules.

Direct entry, refresh, language switching and back/forward navigation preserve the journey and validated filters. PostgreSQL revisions persist across application and database restarts. Public reads use publication pointers; fixture publication is explicitly unreviewed and is not an authenticated editorial workflow. Local host/database guards and noindex responses keep this fixture slice private to local development.

Open **http://127.0.0.1:3000/en/destinations/italy/rome** while the preview is running. Follow Explore example places → Forno Demo → Sources & evidence; use Tavola Demo for chain scope. The [setup guide](../development/LOCAL_DEVELOPMENT.md) contains reproducible commands. Neither the prototype's two places nor the application's three fictional branches establish launch coverage. Real data requires the later publication gates and real-data migrations.

### D. Map, cards, and editorial publishing

Follow the technical plan's order: authenticated editorial revisions/publication/corrections, then hotel/hub/content relationships and map/list synchronization, then reviewed destination-language cards and offline saving. Each milestone has explicit acceptance criteria; publication uses actual reviews, never fixture approval records.

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

In the standalone prototype, saving, reporting, publication, editor access and loading/offline states remain simulations. The local application now has a persisted read backend and exercised loading/error recovery; authentication, editorial publishing/reporting, maps, cards and offline storage remain unimplemented. Remaining delivery gates include accepted trust/publication rules, reviewer ownership, source/authority rights, reviewed content and launch coverage, plus budget and operational ownership before hosting. No proposed editorial interval has been activated.
