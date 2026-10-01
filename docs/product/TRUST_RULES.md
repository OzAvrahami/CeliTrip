# CeliTrip — Trust, Evidence, and Freshness

**Version:** 0.1 proposal · **Updated:** 2026-10-01 · **Related issue:** #2

These are proposed editorial product rules for review, not medical advice, legal conclusions, or a safety certification. The source is the existing [Rome discovery](reference-destinations/rome.md), retained as an August discovery record; its candidate labels and illustrative confidence model are not approved publication rules. This proposal follows the claim-level model in [PRD v0.2](PRD.md). This document does not report a new verification of any venue.

## 1. Unit of Evidence

A claim concerns a specific subject and scope: a branch, preparation facility, hotel service, retail offering, or accreditation program. Each claim can have several supporting or contradictory observations.

An observation retains the source reference, source type, source date if known, observation date, verification method if any, scope, effective dates, and editorial rationale. Changes preserve the previous evidence and its dates.

Keep these concepts separate:

| Concept | What it means |
| --- | --- |
| Observed | CeliTrip inspected a source on this date. |
| Reported by venue | The business made this statement; it is not independent confirmation. |
| Independently confirmed | An appropriate independent source supports this exact claim and scope. |
| Historical | Evidence concerns an earlier period and cannot establish current status. |
| Needs review | An editorial review deadline passed or new information requires reassessment. |
| Conflicting | Relevant sources disagree and the disagreement remains unresolved. |
| Unknown | Available evidence does not answer the question. |

Authority, timeliness, and relevance are separate dimensions. Do not multiply arbitrary numeric weights into a public confidence score.

## 2. Minimum Publication Requirements

A public place record needs an identifiable branch/location, a supported location reference, at least one attributable reason it is relevant to the guide, an editorial review, and reviewed public content in all four launch languages.

A limited record may be published with unknown preparation details. It must explain that limit and cannot receive a stronger facility description merely to fill a required field. Unresolved identity, closure, or wrong-branch evidence keeps the record in draft or temporarily withdrawn.

Photos must be licensed for the intended use and accurately attributed. Generic imagery cannot be presented as a photograph of the named business. Source access does not itself grant a license to republish a source's full content or database.

## 3. Facility Profiles

| Profile | Required support | Insufficient support |
| --- | --- | --- |
| Fully GF facility | Explicit evidence covers the relevant preparation environment and branch. | GF business name, menu range, or a retailer selling packaged GF products. |
| Separate GF kitchen | Explicit evidence identifies a separate kitchen for the relevant branch; broader chain statements keep their scope visible. | A separate menu, oven, or preparation surface alone. |
| Shared kitchen with stated controls | Evidence describes specific procedures in a shared kitchen. | A generic “celiac friendly” claim or a positive review. |
| GF products/options only | Evidence supports availability; packaged products and prepared meals remain distinguishable. | An inference that availability establishes cross-contact controls. |
| Unknown | Evidence does not support a more specific current profile. | Guessing based on popularity, branding, or missing data. |

When the source is the venue, display attribution beside the description. A profile is not a badge that a meal is safe. Individual procedures retain separate evidence and may remain unknown even when another procedure is documented.

## 4. Accreditation

An authority must have an identifiable program, published scope, and a verifiable official source relevant to the claim. Editors document that rationale; there is no assumed list of globally interchangeable accreditations.

Current independent confirmation requires the issuing authority's applicable current record, or an independently authenticated current authority-issued record, matched to the correct branch/program. A venue's own accreditation claim is displayed as a venue claim until that requirement is met.

Preserve historical status and source validity dates. Never infer renewal from an old listing, logo, training event, or another branch's status. Program participation, certification, product licensing, and staff training must keep their actual meanings.

Do not use authority logos or imply endorsement without resolving the relevant usage rights. Restricted directories remain restricted; refer travelers to authoritative access options rather than copying their databases.

## 5. Proposed Review Cadence

These intervals are **proposed editorial queue defaults**, not facts about how long a venue remains safe. They require product acceptance before implementation. A review deadline measures when CeliTrip should look again; it does not certify source currency.

| Claim class | Proposed review interval | Publication after deadline |
| --- | --- | --- |
| Preparation practices / facility configuration | 90 days | Mark needs review; remove an unqualified current profile from prominent filters until reviewed. |
| Accreditation status | Earlier of source expiry or 90 days | Mark needs review; current independent confirmation becomes unknown until re-established. Preserve evidence and actual validity dates; a missed review deadline alone does not prove accreditation expired. |
| Opening hours / temporary availability | 14 days | Label as needing confirmation; do not promise “open now” from stale data. |
| Venue identity, address, and operation | 90 days | Queue review; credible closure or location conflict triggers immediate reassessment. |
| Country guidance / labeling explanation | 180 days | Queue editorial review; a known material rule change triggers immediate review. |
| Communication cards | 180 days and whenever wording changes | Preserve the last reviewed version; materially inaccurate content is withdrawn. |

Source expiry, a closure notice, a relevant contradiction, or a reported material change can require action sooner. Unknown source dates stay visible as unknown. Reopening the same undated page records a new observation, not an invented operational verification.

Review does not automatically mean approval: the editor records what was checked, the relevant dates, and whether the claim is still publishable. If evidence is inaccessible, it cannot silently reset a current-confirmation state.

## 6. Conflicts and Corrections

1. Preserve both observations and their exact scopes and dates.
2. Determine whether they actually conflict; a chain policy and an individual branch exception may describe different scopes.
3. Explain the unresolved disagreement in plain language. Do not choose a winner solely because a source is newer or more authoritative overall.
4. Suppress a disputed affirmative preparation/accreditation claim from prominent labels and profile filters until reviewed.
5. Record the editor's resolution, reasoning, and supporting evidence without erasing history.

Visitor corrections enter a private review queue with moderation, validation, and abuse controls. A report does not directly edit public data. A credible material concern can justify an immediate temporary withdrawal or uncertainty notice while it is investigated.

## 7. Translation and Cards

Interface language and destination-card language are separate. A French-speaking traveler in Rome still gets an explicitly labeled Italian card, with an English fallback.

Translations refer to a specific source-content revision. A material edit invalidates approval of affected translations. Editors cannot publish a new revision until its required languages are reviewed; the previous reviewed revision may stay public unless the underlying information requires withdrawal.

Before public use, communication cards need both competent target-language review and review by a suitably qualified celiac subject-matter reviewer. Record the reviewed version and reviewers' roles. The [local prototype](../design/CeliTrip-Design-Flow.html) demonstrates short/detailed Italian and English-fallback drafts with review-pending labels; none is evidence that this gate has passed.

## 8. Review Scenarios

| Scenario | Expected product behavior |
| --- | --- |
| Recent venue kitchen claim plus historical accreditation | Attribute the kitchen claim to the venue; show accreditation as historical/current unknown. |
| Chain website describes two kitchens without identifying this branch | Show chain scope; do not independently confirm the branch layout. |
| Large GF bakery range but no production information | Show GF products/options only with source attribution; preparation controls remain unknown. |
| Same place is bakery, grocery, and café | Preserve all supported categories and one branch identity. |
| GF food offered somewhere in an airport | Hub guide can state availability with scope; no airport-wide safety claim. |
| Source changes after four translations were approved | Mark affected translations for review and block publication of that changed revision. |
| New correction contradicts a public preparation claim | Queue review and display/withdraw the disputed claim as warranted; never auto-approve it. |

## 9. Decisions Still Requiring Review

Accept or revise the proposed intervals; appoint editorial and language/card reviewers; establish authority/program records and rights; define the correction-review service level and the destination coverage threshold. Until reviewed, this proposal does not close issue #2.
