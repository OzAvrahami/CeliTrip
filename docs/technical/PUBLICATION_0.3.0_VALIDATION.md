# v0.3.0 publication-recording validation

**2026-10-08 — 0.3.0 Published prerelease.** This records the owner's completed publication. It adds no capability, version bump, deployment or broader acceptance.

## Verified publication and preservation

* Initial local working tree/index were clean. Branch `main`, origin `https://github.com/OzAvrahami/CeliTrip.git`; local HEAD and remote main both pointed to `6c1cb564f8cfd3ec8a395582f3581d7a800bace7`. No newer owner work was found or removed.
* Successful read-only `git ls-remote` returned annotated tag object `38ec171b9c9cf8977c2484491fad0e83659ddc25` and peeled commit `6c1cb564f8cfd3ec8a395582f3581d7a800bace7` for v0.3.0. The peeled ref establishes the immutable target, not the release's `target_commitish: main`.
* Fresh read-only GraphQL returned tag `v0.3.0`, `isDraft: false`, `isPrerelease: true`, `isLatest: false`, `publishedAt: 2026-10-08T18:32:14Z`, [the release URL](https://github.com/OzAvrahami/CeliTrip/releases/tag/v0.3.0), and the matching `tagCommit.oid`.
* v0.2.0 remote annotated object remains `1b169b2f8becef6a963176018ba3e70a4a8f7a72`, peeled commit `8d329a6d5a1dafa561772f0536e3c7811e1e2739`. Its authoritative history and historical changelog section were retained. No tag, release or Git ref was edited.
* Current metadata retains version 0.3.0, prerelease channel, preparation date 2026-10-04, checkpoint `c897a0bf4c0bd267104c073fe11dd8d672a79f8e` and release history. Only publication state and verified commit/time/URL were recorded. The tagged preparation snapshot remains Unreleased/prepared.

## Focused validation

* Prototype synchronization and `--check`, `npm.cmd run version:check`, and both existing version tests passed. Focused assertions checked the actual published metadata, retained preparation facts and unchanged v0.2.0 history.
* The optimized build completed successfully. **Build warnings:** Better Auth could not validate its database schema because the local Docker engine/PostgreSQL setup is unavailable. This is not a database validation pass. No attempt was made to reset, migrate or reseed data.
* Restarted only the identified existing loopback Next.js preview after rebuilding. Read-only HTTP checks returned 200 for the English, Hebrew, French and Russian Rome routes and inspected their server-rendered footer: **v0.3.0 · Published prerelease**, with Hebrew RTL and other locales LTR. These are label/shell checks, not a claim that persisted journeys were revalidated while PostgreSQL is unavailable. Preview remains at **http://127.0.0.1:3000/en/destinations/italy/rome**.
* **New browser visual inspection blocked:** native Computer Use reported an unavailable pipe; browser inventory returned no connected browsers. No new screenshot or visual-layout validation is claimed. The generated prototype badge and server-rendered application label were inspected directly; existing visual/workflow evidence is reused.
* The standalone prototype SHA-256 is now `899611d075497065247dbee52284a1716fa23c3e6b3e2451b82bc53c2c9ed4d3` (previous `1149af216074d9b998e48c666c9537670f4cc9560cb0a90d3381cddb97d0c869`). Normalizing only the delimited version block yields identical HTML. No flow, style, embedded asset or other prototype content changed.
* Owner-command PowerShell syntax and its read-only preflight passed; staging/commit/push phases were not executed.
* The exact manifest matches the working tree: **10 recording-only files**, eight modified and two new. Strict UTF-8, relative document targets, CRLF-aware whitespace and metadata/history checks passed. Package/lock versions remain unchanged at 0.3.0. No new JavaScript implementation was edited, so prior lint/workflow evidence is reused.
* Index SHA-256 remains `6ce2fbe364bbd1b876ea0c960451c9c74a29aa0ec8eb0a4e85a1056598e2645c`; staged scope is empty. Fresh before/after comparisons also confirm the ignored environment and package/lock files are unchanged. The complete historical 0.2.0 changelog section and published release notes are untouched.

## Reused evidence and boundaries

Existing [release preparation](RELEASE_0.3.0_VALIDATION.md), [checkpoint](CHECKPOINT_0.3.0_VALIDATION.md), [destination usability](GEOGRAPHY_USABILITY_VALIDATION.md), [administration](ADMINISTRATION_VALIDATION.md), [Milestone 2](MILESTONE_2_VALIDATION.md) and [Milestone 1](MILESTONE_1_VALIDATION.md) validation remains historical evidence for unchanged application behavior. No full workflow/database test rerun or new browser screenshots are claimed. Existing screenshot labels/fingerprints remain as captured.

DeepL configuration/live verification remain deferred; general machine translation is not operational. Working geographic lookup is separate. Owner acceptance remains narrowly limited to the demonstrated corrected destination workflow (alongside prior prototype/Milestone 1 acceptance); real content, human translations, medical/card wording, reviewer authority and production readiness remain pending. Review intervals remain proposals. No migration, reseeding, database content mutation, credential/grant edit, next milestone or cloud operation occurred.

The exact recording-only scope is [v0.3.0-publication-files.txt](../releases/v0.3.0-publication-files.txt). Earlier checkpoint and release-preparation manifests remain historical and must not be reused. Staging, committing and pushing are owner-operated; this task executed none.
