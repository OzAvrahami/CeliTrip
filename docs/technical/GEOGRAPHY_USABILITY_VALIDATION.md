# Geographic destination usability correction

**Acceptance/checkpoint follow-up — 2026-10-04:** The owner reviewed the corrected destination workflow and said it “looks good.” This accepts only that demonstrated local experience, not real content, translations, medical wording, reviewer authority or production readiness. It is now grouped into **0.3.0 Unreleased**. The validation record below retains its original 0.2.0 version and pending-acceptance context; its workflow tests/screenshots were reused, not rerun for the version-only checkpoint. See [checkpoint validation](CHECKPOINT_0.3.0_VALIDATION.md).

**2026-10-04 — implemented locally; overall owner acceptance pending.** Current product: **0.2.0 published prerelease**. Proposed grouping: **0.3.0**, not bumped or published.

## Reproduced failure and cause

Created a new **Disposable usability QA** country through the original Chrome form with four names and a creation note. Saving redirected to the edit route and reset `form.reason` to an empty string. Clicking the bottom **Submit for review** reproduced **“Check required fields, lengths, dates and values.”** at the top, with no nearby explanation.

Tracing `DestinationEditor.persist()` → `/api/administration` → `destinations.transition()` identified the actual cause: the transition service unconditionally ran `text(input.reason, 1000, 5)` for **every** action, including submission. The request used the saved revision/version/cycle and authorized session; names were complete. The generic `invalid` error was serialized without a field and rendered by the single page-top error component. This was not a missing geographic name or a permission denial. The old save service also required a note through its audit helper.

The corrected service validates the saved revision and each action's inputs separately. Legacy submission accepts an empty/omitted note and ignores irrelevant editing fields. Save accepts optional private `internalNote`; withdrawal/archive/return require their own bounded reason. Specific field errors include a safe field key, with no input values or secrets. Stale revision/version/cycle checks and live scoped authorization remain enforced.

## Narrowly accepted behavior

The owner's approval covers **country/city identity, hierarchy and localized names only**. A publisher explicitly confirms the exact saved geographic names; celiac subject review and four formal language-review clicks are not prerequisites. No human review rows are fabricated. Old review records and their actors remain in immutable history. The geography service rejects substantive payloads, and its publication pointer references only `destination_revision`; it does not write substantive content/claim/translation revisions or their `publication` pointers. Existing branch/guidance/card review requirements and real-content/environment gates remain intact. No owner record was automatically published.

New drafts can contain incomplete translations and an optional note. Local publication still requires four nonempty bounded names and a published parent, where applicable. Scoped country editors can register/edit internal draft cities. Public visibility is independent: private drafts and newer draft revisions remain excluded, and publication/withdrawal/archival are separate, explicit actions.

The editor now provides prominent return navigation and breadcrumbs, bounded list-context URLs, a compact saved overview, a parent-preselected city link, expandable names and secondary source/history details. The available primary action follows saved/dirty state and permissions. Blockers either focus the missing name or link to the named parent. Less frequent actions use confirmation/reason dialogs. Pending requests prevent duplicates; errors and success remain beside the action. Inline errors expand/focus the relevant field. Failed requests preserve input; network, server, permission, stale-revision and unsaved-change messages differ. A committed action whose refreshed view fails is identified separately and blocked from blind repeat submission.

## New validation

| Check | Actual result |
| --- | --- |
| Additive owner migration | Optional `destination_revision.internal_note` column applied to existing PostgreSQL. No resets/reseeds. Old notes remain available through audit history and the legacy-note fallback. |
| Automated PostgreSQL/regression suite | **41/41 passed**. Includes original empty-note submission; source-field errors; optional-note persistence; exact confirmation; scope denials; draft city creation; stale revisions; immutable/history protection; atomic rollback; published/new-draft separation; hierarchy, withdrawal and archival; rejection of substantive attachments; unchanged branch subject/four-language gates. Existing MFA/demo-boundary, correction/privacy, source/evidence and four-language Rome tests also passed. |
| Direct HTTP | `scripts/validate-destination-http.js` passed against a preview explicitly using **celitrip_editorial_test**: actual synthetic TOTP, anonymous/scoped/origin denials, field-error JSON, optional-note submission, required confirmation/reasons, geography publication/withdrawal/archive, and draft not-found/noindex without private text. Owner preview was then restored to **celitrip_dev**. |
| Geographic lookup | Real Wikidata request resolved Canada **Q16** with Hebrew/English/French/Russian labels. No credential/provider configuration changed. Existing ambiguity, manual preservation and source-race tests passed. |
| Chrome save/error flow | Empty source produced inline error and focus on `destination-labels-en`; entered values remained. Corrected save with empty note succeeded. Private draft city saved with only its source name; **Complete localized names** opened both collapsed sections and focused Hebrew. Remaining names then saved. |
| Chrome publication/reasons | QA country published with explicit confirmation and no formal reviews, public name page inspected, then withdrawn with an action-specific reason. Missing confirmation and withdrawal reason produced nearby localized errors and focused the checkbox/reason field. Success updated visible state and actions. No owner content was published. |
| Navigation | Country → preselected draft city → saved overview; named parent blocker and parent breadcrumbs inspected. Filtered list (`q=Disposable`, country, withdrawn, name sort, page 1) → edit → **Back to destinations** preserved all parameters. Hebrew switch preserved entity/list context; direct entry has a deterministic list fallback. |
| Responsive/focus | Chrome **1440×1000** and **390×844**, Hebrew RTL and English LTR: no horizontal overflow. Inspected screenshots. Final confirmation dialog fits the mobile viewport with both actions visible; field/checkbox focus and cancel restoration checked. Native details/buttons/links retain keyboard semantics. |
| Build/lint/version | Optimized build and lint passed. Version/package/lockfile/release metadata checks passed at **0.2.0 released**, channel **prerelease**. Final field-message changes passed the full 41-test suite and build again. Unchanged direct HTTP behaviors were reused; final dialog screenshots include the compact spacing. |

The first added regression encountered an unpublished Italy parent in the disposable test fixture. The test was corrected to explicitly publish that synthetic parent before testing Rome's geography pointer. No production safeguard was removed. One screenshot transport timeout was retried; an incomplete desktop capture was replaced by the inspected final image. The final browser tab had no warning/error console entries at inspection. A fresh Chrome Rome landing-page smoke check also passed with no console warnings/errors; the broader unchanged public browser journey is reused.

## Screenshots and preservation

* [Hebrew desktop editor](qa/geography-usability/editor-he-desktop.jpg)
* [Hebrew mobile editor](qa/geography-usability/editor-he-mobile.jpg)
* [English mobile editor](qa/geography-usability/editor-en-mobile.jpg)
* [Saved city overview, English desktop](qa/geography-usability/saved-city-en-desktop.jpg)
* [Final desktop confirmation error](qa/geography-usability/confirmation-error-en-desktop.jpg)
* [Final Hebrew mobile confirmation error](qa/geography-usability/confirmation-error-he-mobile.jpg)

[Preservation checks](qa/geography-usability/preservation.json) compare hashes using the original column lists before/after the additive migration: all original user, credential, authenticator, grant, publication, content revision, destination, destination revision and review rows remain unchanged. **Israel stays version 1, draft, unpublished.** Browser mutations used only two newly created disposable QA destinations, leaving the QA country withdrawn and its city private. The original database and application were reused; destructive tests touched only the named disposable databases. The Git index hash remained unchanged; see [check summary](qa/geography-usability/check-summary.json).

## Reused evidence and limits

Earlier [destination lookup/provenance evidence](DESTINATION_VALIDATION.md), [administration validation](ADMINISTRATION_VALIDATION.md), and [Milestone 1 browser evidence](MILESTONE_1_VALIDATION.md) apply to unchanged behavior. The existing unsaved-change hook remains attached to the new navigation links and still guards current-tab departure/refresh; its prior behavior/code was reused rather than reopening a native leave-page dialog that previously blocked browser control. This is not a claim of a new full keyboard/accessibility audit. French/Russian dictionary completeness and unchanged shell evidence are reused; this correction's new responsive browser matrix covers Hebrew/English. Network/server failures have distinct preserved-input handling, but browser transport faults were not artificially injected.

**DeepL setup is deferred by the owner**, not operationally validated or enabled. Geographic lookup/manual input need no DeepL key. Basic geography does not approve translations, medical wording, real venue evidence, real reviewer authority, destination launch coverage or broader trust policies; proposed review intervals remain inactive. No release publication, deployment or later milestone work occurred.
