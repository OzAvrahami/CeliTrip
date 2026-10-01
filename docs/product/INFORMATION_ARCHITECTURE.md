# CeliTrip — Information Architecture and Prototype Review

**Version:** 0.2 · **Updated:** 2026-10-01 · **Related issue:** #3

## 1. Established Direction

Responsive mobile-first web application; approved blue visual direction; Hebrew, English, French, and Russian at launch. Hebrew is RTL and the other interface languages are LTR. Traveler accounts, saved places, trips, ratings, reservations, and AI recommendations remain outside V1.

The interactive [design prototype](../design/CeliTrip-Design-Flow.html) is now included in the repository. It was run in Chrome before this update. The original blue palette, embedded Heebo/Manrope typography, components, device controls, navigation and four-language product interface remain the design reference. The surrounding design-studio controls remain in Hebrew, as in the supplied artifact.

The prototype now has 27 routes representing **screens and states**, including five new hotel/hub routes. Evidence variants and card modes are states within their existing routes. The September handoff reports that the native [Figma file](https://www.figma.com/design/BOhbD1MsfjxLcBNpYudAr1) contains foundations only; this update does not transfer screens or verify the live Figma file.

## 2. Primary Journey

1. **Home / destination search:** choose a supported destination in the interface language.
2. **City guide:** understand the destination and choose food, shopping, accommodation, transport guidance, or a card.
3. **List / map:** filter relevant categories and preparation profiles independently; preserve the selection when switching views.
4. **Place:** identify the exact branch, see the attributed preparation summary and unknowns, then access directions or the official website.
5. **Evidence:** inspect the source, claim scope, observation date, and any historical or conflicting information.
6. **Communication card:** show a readable card in the destination language, with short/detailed versions and an English fallback.

Country pages supply shared national context. A city search can go straight to the matching city; country navigation is available without imposing an extra step on every visitor.

## 3. Content Responsibilities

| Surface | Owns | Links to |
| --- | --- | --- |
| Home / destinations | Search, supported destinations, explicit coverage | Countries and cities |
| Country | Local terminology, labeling guidance, national organizations, shopping basics, destination-language card | City guides and sources |
| City | Local overview, practical guidance, places, shopping locations, hotels, transport hubs | Country guidance and contextual card |
| Place | Branch identity, categories, service/preparation profile, individual claims, sources, directions | Evidence, correction form, card |
| Shopping guide | Country shopping vocabulary and city-specific stores | Relevant places and original sources |
| Hotel | Breakfast/service details, packaged versus prepared food, advance notice and unknowns | Individual claims and sources |
| Travel hub | Terminal/access-specific guidance and outlet locations | Individual outlets without inheriting their claims |
| Trust explanation | How claims, dates, unknowns, and conflicts are presented | Relevant examples |
| Editorial admin | Draft, evidence review, translation review, preview, publish/withdraw | Version history and correction queue |

A place can belong to several categories. Restaurant, bakery, café, supermarket, and hotel are not preparation-confidence levels. Hotel and hub content must not be forced into a restaurant template.

## 4. Navigation and Localization

Mobile navigation uses Home, Destinations, Celiac Card, and How We Check Information, as demonstrated. Desktop exposes the same destinations and contextual actions. A card opened globally requires a destination/language choice if no destination is selected; it must not silently assume Italy outside the Rome demo.

Preserve the route, place, filters, and map/list context when switching interface language or returning from evidence. Search matches reviewed names and aliases across all four languages while preserving accented and Cyrillic text. Empty results provide a route back to supported destinations.

Direction is per text block where needed: Hebrew layout stays RTL, while URLs, phone numbers, Latin addresses, and the Italian card keep their natural direction. Localized routes, metadata, and alternative-language links must be considered during technical discovery.

## 5. Current Prototype Coverage

| Group | Prototype routes |
| --- | --- |
| Discovery | `home`, `destinations`, `country`, `city`, `map` |
| Hotels | `hotels`, `hotel` |
| Travel hubs | `hubs`, `hub`, `outlet` (two outlet contexts) |
| Place and trust | `place`, `evidence`, `trust` |
| On-trip help | `shopping`, `card` |
| Corrections | `report`, `report-success` |
| Editorial demo | `admin-login`, `admin`, `edit`, `translations`, `publish-preview`, `published` |
| Recovery and loading | `empty`, `filtered-empty`, `offline`, `loading` |

The new journeys have local Chrome validation recorded in the [prototype validation report](../design/PROTOTYPE_VALIDATION.md). The prior handoff's QA of 22 routes remains a historical report, separate from this pass. Neither set of checks establishes production persistence, authentication, offline caching, or a map-provider integration.

Demonstrated additions:

* Country/city quick links and the Hotels discovery control open hotel discovery, with breakfast, sealed products, kitchen-prepared food, buffet/cross-contact and advance-notice details. Unavailable information is explicitly unknown.
* Travel hub discovery opens a fictional airport guide and two distinct outlet contexts: before and after security. Terminal/access labels are fictional scenarios, with no inherited airport-wide preparation claim.
* Hotel and outlet details open evidence in their own context. The evidence screen offers unknown, historical, needs-review, conflicting and chain-level scenarios. These are explicitly fictional and are not reports about the selected real venue. Source dates and verification remain unrecorded/not performed.
* Cards have short/detailed views, independent Italian/English-fallback selection, a destination choice for global entry, and an enlarged dialog. Draft/review-pending status precedes the text in both views; no reviewer approval or date is supplied.
* Language changes preserve the current screen and options. URL fragments carry filters, outlet/evidence context and card options for browser navigation and refresh. This is prototype navigation, not durable saving; offline saving remains unimplemented.

The original Mama Eat/New Food data and dates are retained as supplied prototype content, with a visible provenance notice on their evidence screen. This update performs no new venue or accreditation verification. New fictional examples have no venue URLs, addresses, coordinates, accreditation or verification dates.

## 6. Review Findings and Required Follow-up

The main visual journey is coherent and the established blue direction can remain the implementation reference. The following gaps must be reflected in delivery scope:

| Finding | Required behavior | Timing |
| --- | --- | --- |
| Rome contains two example places; Barcelona is planned | Keep demonstration labels; establish reviewed destination coverage before public launch. | Content preparation |
| Hotel and Travel Hub flows now use fictional examples | Owner accepted the visual/interaction flows; reviewed real content and production data relationships remain required. | Before publication |
| Category filters exist; facility-profile filters are absent | Add separate source-attributed preparation filters only after trust rules are accepted. | Discovery slice |
| Country/shopping pages contain only sample guidance | Provide reviewed source-linked guidance and a clear country/city content distinction. | Content preparation |
| Card now has short/detailed Italian and English drafts and an enlarged dialog | Obtain language and subject-matter review; implement versioned publication and real saved offline access. | Card slice |
| Map shows static tiles with two selectable markers | Implement a provider-backed accessible map, attribution, filtering, and selection persistence. | Map slice |
| Admin save/publish/report submission are simulations | Add authenticated editorial roles, durable revisions, translation invalidation, and a private correction queue. | Editorial slice |
| Five evidence scenarios are demonstrated with fictional observations | Validate editorial resolution, source history and publication behavior against accepted trust rules. | Evidence slice |
| Draft warning now precedes card text in normal and enlarged views | Record real reviewer/version/date metadata only after review; no approved card is simulated. | Card publication gate |

The existing prototype's single-category and in-memory data are implementation shortcuts, not domain decisions.

## 7. Acceptance Scenarios for the First Product Slice

* A Hebrew-speaking visitor finds Rome, selects a bakery, opens its branch, and can identify what the venue claims and what remains unknown.
* Changing the interface to French preserves the selected branch and does not change the Italian card's destination language.
* A Russian destination query finds the corresponding supported guide using reviewed aliases.
* Returning from evidence restores the filtered result set and selected place.
* Empty filters offer a reset; failed loading offers retry without losing the destination.
* Keyboard users can navigate all actions; focus remains visible and modal closing returns focus.
* Missing content, source dates, and translations are represented explicitly rather than invented.

The owner confirmed acceptance of the current prototype's visual direction and interaction flows in the task instruction recorded on 2026-10-01. This does not approve translations, card wording, real venue evidence, proposed trust rules or launch readiness. The [prototype validation report](../design/PROTOTYPE_VALIDATION.md) identifies the accepted artifact. The subsequently authorized persisted Rome slice now has separate [application validation](../technical/MILESTONE_1_VALIDATION.md); broader discovery aliases, maps, cards and editorial behavior remain in the [technical plan](../technical/TECHNICAL_DISCOVERY.md). Issue #3 has not been closed.
