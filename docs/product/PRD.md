# CeliTrip — Product Requirements Document

**Version:** 0.2
**Status:** Product definition / Draft for review
**Updated:** 2026-10-01
**Product:** CeliTrip
**Working tagline:** לטייל בלי לנחש

This revision incorporates the [Rome discovery](reference-destinations/rome.md), the approved blue visual direction, and the four launch languages: Hebrew, English, French, and Russian. It does not select an application stack.

The August Rome document remains a historical discovery record. Its candidate venue profiles, earlier terminology, and illustrative confidence model are not current publication decisions; this PRD defines the revised product model. The [local prototype](../design/CeliTrip-Design-Flow.html) now demonstrates hotel, hub, evidence and card flows using explicitly illustrative content; see the [current design coverage](INFORMATION_ARCHITECTURE.md). Original venue content remains supplied September prototype data, not a new verification.

Companion specifications:

* [Trust, evidence, and freshness rules](TRUST_RULES.md)
* [Information architecture and prototype review](INFORMATION_ARCHITECTURE.md)
* [Development handoff and remaining decisions](DEVELOPMENT_HANDOFF.md)
* [Technical discovery recommendation for issue #4](../technical/TECHNICAL_DISCOVERY.md)

The owner has accepted the current prototype's visual direction and interaction flows, as recorded in the [validation report](../design/PROTOTYPE_VALIDATION.md). This is separate from the still-pending translation review, approved celiac-card wording, real venue evidence and launch-content readiness. The technical recommendation does not approve provisional trust policies or establish implemented services.

---

## 1. Product Vision

CeliTrip is a travel platform for people who need to manage celiac disease while traveling abroad.

The initial product is a responsive, mobile-first web application providing structured, source-attributed travel information for people with celiac disease. Hebrew is the primary design and research reference; Hebrew, English, French, and Russian are required at launch.

CeliTrip aims to answer a simple but important question:

**“How can I travel here with celiac disease?”**

The product is not intended to be merely a directory of restaurants offering gluten-free food.

It should help travelers understand how to manage the entire destination: restaurants, bakeries, supermarkets, hotels, local terminology, cross-contact considerations, and other practical information needed before and during a trip.

---

# 2. Problem

Planning international travel with celiac disease currently requires collecting information from many disconnected sources.

Travelers commonly rely on:

* Facebook groups
* Blogs
* Google Maps
* Restaurant websites
* Gluten-free applications
* Local celiac organizations
* Old recommendations
* Other travelers

Information may be outdated, incomplete, contradictory, or unclear about the distinction between:

**“Gluten-free food is available”**

and:

**“This is appropriate for someone with celiac disease.”**

For travelers with celiac disease, particularly families traveling with children, this uncertainty creates significant friction when planning and during the trip itself.

---

# 3. Target Users

CeliTrip initially focuses its research on the needs of Israeli travelers and families while serving Hebrew-, English-, French-, and Russian-speaking travelers at launch.

## Primary personas

### Adult traveler with celiac disease

A person traveling alone, with a partner, with friends, or with family who needs reliable information about where and how they can safely eat.

### Family traveling with a child with celiac disease

Parents need to understand not only which restaurants offer gluten-free food, but also:

* cross-contact risk
* breakfast availability
* nearby supermarkets
* bakeries
* snacks
* food near attractions
* local terminology
* emergency alternatives

The product should be safe and useful enough for a parent planning food for a child with celiac disease.

If CeliTrip meets that standard, it should generally also serve independent adult travelers well.

---

# 4. Value Proposition

**מידע מעשי לטיול עם צליאק — במקום אחד, עם מקורות, תאריכים והסבר על מה שעדיין לא ידוע.**

CeliTrip differentiates itself through:

* Hebrew-first design with four launch languages
* Celiac-first rather than gluten-free-first thinking
* Structured safety information
* Evidence-backed claims
* Information freshness
* Destination-level guidance
* Mobile-first usability
* Israeli traveler context

CeliTrip does not need to have the world's largest restaurant database.

It needs to help users make better-informed decisions.

---

# 5. Core Product Promise

## לטייל בלי לנחש.

Internally, this translates into an important product principle:

**CeliTrip never claims more certainty than its evidence supports.**

Unknown information should remain unknown rather than being inferred.

---

# 6. Core Product Principles

## 6.1 Safety before convenience

The existence of a gluten-free menu does not automatically mean that a restaurant is appropriate for someone with celiac disease.

CeliTrip should communicate this distinction clearly.

## 6.2 Evidence before claims

Safety information should be connected to evidence.

The product should communicate not only *what* is believed about a place, but also *why*.

## 6.3 Freshness matters

Restaurants change.

Menus change.

Staff changes.

Preparation procedures change.

Businesses close.

Therefore, each operational or safety-related claim should retain its own source, observation date, and review status. A recent observation about opening hours does not refresh evidence about kitchen practices or accreditation.

## 6.4 Unknown is acceptable

CeliTrip should never convert missing information into confidence.

If cross-contact procedures are unknown, the product should explicitly say so.

## 6.5 Travel context over restaurant directory

Restaurants are only one component of traveling with celiac disease.

The product should eventually support the complete travel experience.

## 6.6 Mobile first

The product will frequently be used while:

* walking through a city
* standing outside a restaurant
* speaking with restaurant staff
* shopping in a supermarket
* visiting an attraction

Mobile usability is therefore a primary requirement.

---

# 7. Core User Journey

## Phase 1 — Planning

The traveler searches for a destination such as:

**Rome gluten free**

or:

**צליאק ברומא**

CeliTrip provides a destination overview explaining how easy or difficult the destination is for travelers with celiac disease.

---

## Phase 2 — Understanding the destination

The traveler learns:

* general celiac awareness
* common gluten-free labeling
* useful local terminology
* supermarket availability
* recommended areas
* restaurants and bakeries
* relevant local celiac organizations

The desired outcome is:

**“I understand how we are going to manage food on this trip.”**

---

## Phase 3 — Finding places

The traveler browses restaurants, bakeries, supermarkets, hotels, and other useful locations.

Places can be viewed through both lists and a map.

---

## Phase 4 — On-location use

During the trip, the user's primary question becomes:

**“What can I safely eat near me?”**

Location and map-based discovery therefore become especially important.

---

## Phase 5 — Communication

When necessary, the traveler can open a destination-specific Celiac Card containing translated explanations and questions for restaurant staff.

Examples include questions about:

* dedicated fryers
* pasta water
* preparation surfaces
* utensils
* grills
* cross-contact

The card should be designed so that it can easily be shown directly to restaurant staff.

---

## Phase 6 — Shopping

The traveler can understand:

* local gluten-free labeling
* supermarket chains
* commonly available brands
* useful products
* where gluten-free products are typically located

---

# 8. Place Safety Model

CeliTrip separates a facility's reported configuration from the evidence supporting each individual claim. Neither a profile nor a recent source observation is a guarantee of a safe meal.

There is no single place-level Evidence Level. One place can have several observations with different sources, dates, scopes, and unresolved disagreements.

---

## 8.1 Facility Profile

The conceptual profiles are:

* **Fully gluten-free facility:** evidence explicitly covers the whole relevant preparation environment.
* **Separate gluten-free kitchen:** a mixed establishment describes a separate GF kitchen; this does not describe the entire establishment as dedicated GF.
* **Shared kitchen with stated controls:** specific cross-contact procedures are described in a shared kitchen.
* **Gluten-free products or options only:** availability is supported, while preparation controls are not established. Packaged retail products and prepared dishes remain distinguishable.
* **Unknown:** evidence is missing, too old for the claim, too broad for the branch, or unresolved.

These are product concepts, not a committed database enum. Profiles must be source-attributed and branch-specific. A gluten-free business name, menu, or product range alone cannot establish a preparation profile.

## 8.2 Categories Are Separate

A place can have several categories, such as bakery, specialist grocery, and café. Categories describe what a traveler can do there; facility profiles describe the reported preparation environment. Neither replaces the other.

---

# 9. Evidence Model

Each place can have multiple evidence observations. Each observation supports, contradicts, or leaves unresolved a specific claim.

Source types include an accreditation authority, regulator, venue, institutional publisher, and traveler report. Source authority must be evaluated against the particular claim; a source's reputation does not make every statement current or branch-specific.

Examples:

* A venue website can support **“the operator states that it has a separate GF kitchen.”**
* Only evidence from the relevant authority or an independently authenticated current authority-issued record can support a current independently confirmed accreditation label.
* An old accreditation record stays historical even if the venue website is newly observed.
* A traveler correction enters editorial review; it does not directly change a public preparation profile.

V1 does not publish numeric safety or confidence scores. [Trust rules](TRUST_RULES.md) propose publication and uncertainty behavior for review; the editorial review intervals remain unapproved proposals.

---

# 10. Safety Details

Where available, CeliTrip may track individual preparation details such as:

* dedicated fryer
* separate pasta water
* separate preparation area
* dedicated or cleaned utensils
* grill procedures
* flour exposure
* staff celiac awareness
* other cross-contact controls

Missing information must be represented as unknown.

---

# 11. Evidence Provenance

Safety-related information should retain provenance whenever possible.

Conceptually, an observation should support fields such as:

* exact claim and the place, branch, facility, or program it concerns
* source reference and source type
* source publication date, when known
* date CeliTrip observed the source
* verification method and date, when an actual verification occurred
* effective and expiry dates, when the source supplies them
* scope and whether the source supports or contradicts the claim
* review status, rationale, and editorial history

CeliTrip should be able to explain why information is being displayed.

Unknown dates remain unknown. Opening a webpage today does not prove that an undated operational statement describes today's conditions. A chain-level source must not silently become a branch-level confirmation.

---

# 12. Data Ownership Principle

CeliTrip should build and maintain its own structured database.

Third-party databases should not be copied or scraped unless explicitly permitted by their applicable terms, licenses, or agreements.

External organizations may be referenced as sources where appropriate, but their databases should not automatically become CeliTrip data.

Potential future partnerships or licensing arrangements remain possible.

---

# 13. MVP Scope

The first public version should include:

### Destination search

Users can search for supported countries and cities.

### Country pages

Country-level guidance for traveling with celiac disease.

### City guides

Practical city-level travel information.

### Place database

Structured information about relevant establishments.

### Place pages

Each supported place contains its known safety and evidence information.

### Interactive map

Places can be discovered geographically.

### Facility profiles and claim-level evidence

Source-attributed facility descriptions, unknown information, conflicts, and historical evidence are visible and understandable.

### Freshness information

Each relevant claim includes its own observation or verification date and review status. There is no blanket “verified place” date that implies every claim was checked.

### Celiac Card

Destination-language communication assistance, with short and detailed versions, large text, an English fallback, visible review metadata, and deliberate saving for offline use. Public cards require language and celiac subject-matter review. Saving a card does not introduce saved places or traveler accounts into V1.

### Supermarket guide

Country or city-level shopping information.

### Administration interface

CeliTrip operators can create, edit, verify, and maintain destination and place information.

### Four-language content

The interface and published destination/place content support Hebrew, English, French, and Russian. Hebrew uses RTL; the other languages use LTR. Source quotations, addresses, and names preserve their original language and direction where appropriate.

Changing interface language preserves the destination, selected place, and current task. Restaurant communication cards use the destination language independently of interface language, with an English fallback and visible language label.

### Corrections

Visitors may suggest a correction without creating an account. Submission enters a private editorial queue and does not publish a review or alter public claims automatically.

---

# 14. Initial Place Categories

The initial data model should be capable of representing:

* Restaurants
* Bakeries
* Cafés
* Supermarkets
* Hotels

Places may have more than one category. A chain and an individual branch are not interchangeable evidence scopes. The architecture should allow additional travel-related categories later.

## 14.1 Travel Hubs

Travel Hubs include airports, train stations, ferry terminals, and similar transport infrastructure. A hub can contain practical food guidance and links to individual outlets without being classified as a restaurant.

GF food availability at a hub does not establish preparation controls for every outlet. Terminal, public/airside access, and branch-specific guidance should be represented where relevant and supported.

---

# 15. Out of Scope for V1

The following are intentionally excluded from the first version:

* Native mobile applications
* Traveler accounts (editorial administrators still require authentication)
* Social feeds
* Public comments
* Public ratings
* Full community functionality
* My Trips
* Saved places
* Automated itineraries
* AI recommendations
* Restaurant reservations
* User-generated destination guides

These may be considered after validating the core product.

---

# 16. Initial Launch Strategy

CeliTrip should launch with a small number of destinations containing high-quality information rather than a large number of shallow destination pages.

Initial working target:

**5 cities**

A potential city should be evaluated based on:

* popularity among Israeli travelers
* availability of reliable information
* celiac infrastructure
* ability to build a useful initial place database
* search demand
* geographic diversity

The five launch destinations have not yet been finalized. Rome is the reference destination and the first proposed implementation/pilot destination. This does not establish Rome as the only public launch city or treat the existing two-place prototype as launch-ready coverage.

The earlier five-city target remains a planning target, subject to evidence quality, complete content, and review in all four launch languages. Barcelona's appearance as “planned” in the prototype is not a published guide or a commitment to a launch date.

---

# 17. Success Criteria

Initial success should focus on product usefulness rather than monetization.

Potential indicators include:

* organic destination traffic
* destination searches
* place page views
* map usage
* Google Maps outbound clicks
* Celiac Card usage
* repeat visits during a trip
* submitted corrections or updates

The primary qualitative question is:

**Does CeliTrip make travelers feel more informed and confident about managing celiac disease during their trip?**

---

# 18. Future Opportunities

Not part of the MVP, but potential future directions include:

* traveler accounts
* saved places
* trip planning
* community reports
* expanded verification workflows beyond the V1 editorial review and publication process
* restaurant onboarding
* notifications when saved information changes
* hotel integrations
* booking affiliates
* travel insurance affiliates
* eSIM affiliates
* premium destination guides
* native applications
* additional languages beyond the four launch languages

CeliTrip should be architected so that these possibilities are not unnecessarily blocked, without building them prematurely.

---

# 19. Working Brand

**Name:** CeliTrip

**Hebrew descriptor:**
מדריך לטיולים עם צליאק

**Working tagline:**
לטייל בלי לנחש.

CeliTrip remains a working name until brand, domain, and trademark screening is completed.

The approved visual direction uses blue (`#355CD0`), navy (`#1B2944`), white, and pale blue surfaces, with Heebo for Hebrew and Manrope for the other interface languages. Blue is a brand color, not an accreditation or safety signal.

---

# 20. Open Questions

The following questions should be resolved during the next discovery phases:

The [issue #4 technical recommendation](../technical/TECHNICAL_DISCOVERY.md) now addresses maps, administration, stack, initial analytics and translation-revision implementation. These recommendations are not implemented services or acceptance of provisional editorial policies. Its milestone plan separates local development from publication and launch gates.

1. Which five cities should launch first?
2. What minimum evidence is required before a place can appear publicly?
3. How long before safety information should be considered stale?
4. How should conflicting evidence be represented?
5. What constitutes a recognized accreditation authority?
6. How should traveler-submitted reports work in future versions?
7. Which map provider should be used?
8. How should Celiac Card translations be validated?
9. What content-management workflow is required?
10. What technology stack best supports the MVP?
11. What analytics events should be captured from launch?
12. What legal disclaimers are necessary for safety-related information?
13. What branch-specific evidence is sufficient to apply a facility profile?
14. Who validates each interface/content language and the destination-language cards?
15. What evidence and practical-content coverage make a destination ready for launch?
16. How should the editorial workflow implement the proposed invalidation and re-review of translations affected by a source-claim change?

---

# 21. Immediate Next Steps

Discovery workstreams (local milestone 1 has since been authorized as noted below):

The following are discovery workstreams, not a strict sequence. Product/trust and interaction gaps should be resolved sufficiently to inform technical discovery, as described in the development handoff.

**Phase A — Launch Destination Discovery**

Select the first five cities using demand, data availability, and celiac suitability.

**Phase B — Trust Rules**

Define publication requirements, freshness rules, conflicts, and evidence expiry.

**Phase C — Technical Discovery**

The issue #4 recommendation now covers architecture, database, mapping, editorial administration, hosting, analytics and operations. The owner subsequently approved local implementation; milestone 1 delivers a persisted, fictional Rome journey in all four interface languages. See the [implementation validation](../technical/MILESTONE_1_VALIDATION.md). Editorial, maps, cards, cloud operations and real publication remain later milestones requiring their own authorization and readiness gates.

**Phase D — Information Architecture & UX**

Define the main navigation, country pages, city pages, place pages, map experience, Celiac Card, and mobile flows.

These decisions are sufficiently stable for the authorized local Rome slice. Real publication and launch still require the remaining trust, content and operational decisions. The September prototype informs information architecture; it does not replace those gates. See the [development handoff](DEVELOPMENT_HANDOFF.md) for the current evidence, gaps, and next implementation boundary.
