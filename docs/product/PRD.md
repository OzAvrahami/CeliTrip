# CeliTrip — Product Requirements Document

**Version:** 0.1
**Status:** Discovery / Draft
**Product:** CeliTrip
**Working tagline:** לטייל בלי לנחש

---

## 1. Product Vision

CeliTrip is a travel platform for people who need to manage celiac disease while traveling abroad.

The initial product is designed for Israeli travelers and provides trusted, structured, and current information in Hebrew about traveling safely with celiac disease.

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

CeliTrip initially targets Hebrew-speaking Israeli travelers who need to manage celiac disease abroad.

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

**כל מה שצריך לדעת כדי לטייל בעולם עם צליאק — בעברית, במקום אחד, עם דגש על בטיחות ועדכניות.**

CeliTrip differentiates itself through:

* Hebrew-first travel information
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

Therefore, safety-related information should include its observation or verification date whenever possible.

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

CeliTrip separates two different concepts:

**Gluten-Free Profile**

and:

**Evidence Level**

They must not be treated as the same thing.

---

## 8.1 Gluten-Free Profile

### Dedicated Gluten Free

The establishment operates entirely or effectively as a dedicated gluten-free environment based on available evidence.

### Celiac-Aware Kitchen

The establishment is not entirely gluten-free, but there is credible information regarding procedures intended to manage cross-contact.

### Gluten-Free Options

Gluten-free items are available, but there is insufficient evidence regarding cross-contact procedures.

### Unknown

There is insufficient information to determine the establishment's gluten-free profile.

---

# 9. Evidence Model

## Official Accreditation

Evidence originates from a recognized celiac organization or accreditation program.

This is the strongest evidence category.

## Venue Confirmed

Current information was obtained directly from the establishment.

This does not equal independent accreditation.

## Community Confirmed

Recent reports from travelers with celiac disease provide relevant information about the establishment.

## Unverified

Information exists, such as a gluten-free menu or public claim, but there is insufficient supporting evidence.

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

* source
* source type
* observation date
* verification date
* confidence
* notes

CeliTrip should be able to explain why information is being displayed.

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

### Safety & Evidence classifications

The two classification systems are visible and understandable.

### Freshness information

Relevant information includes observation or verification dates where available.

### Celiac Card

Destination-language communication assistance.

### Supermarket guide

Country or city-level shopping information.

### Administration interface

CeliTrip operators can create, edit, verify, and maintain destination and place information.

---

# 14. Initial Place Categories

The initial data model should be capable of representing:

* Restaurants
* Bakeries
* Cafés
* Supermarkets
* Hotels

The architecture should allow additional travel-related categories later.

---

# 15. Out of Scope for V1

The following are intentionally excluded from the first version:

* Native mobile applications
* User accounts
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

The five launch destinations have not yet been finalized.

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
* structured verification workflows
* restaurant onboarding
* notifications when saved information changes
* hotel integrations
* booking affiliates
* travel insurance affiliates
* eSIM affiliates
* premium destination guides
* native applications
* multilingual expansion

CeliTrip should be architected so that these possibilities are not unnecessarily blocked, without building them prematurely.

---

# 19. Working Brand

**Name:** CeliTrip

**Hebrew descriptor:**
המדריך הישראלי לטיולים עם צליאק

**Working tagline:**
לטייל בלי לנחש.

CeliTrip remains a working name until brand, domain, and trademark screening is completed.

---

# 20. Open Questions

The following questions should be resolved during the next discovery phases:

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

---

# 21. Immediate Next Steps

Before implementation:

**Phase A — Launch Destination Discovery**

Select the first five cities using demand, data availability, and celiac suitability.

**Phase B — Trust Rules**

Define publication requirements, freshness rules, conflicts, and evidence expiry.

**Phase C — Technical Discovery**

Select architecture, database, mapping solution, CMS/admin approach, hosting, analytics, and deployment strategy.

**Phase D — Information Architecture & UX**

Define the main navigation, country pages, city pages, place pages, map experience, Celiac Card, and mobile flows.

Only after these decisions are sufficiently stable should implementation begin.
