# 0.3.0 development checkpoint validation

**2026-10-04 — 0.3.0 Unreleased.** This prepares a grouped local checkpoint, not a release or deployment. The owner accepted the demonstrated corrected destination-management workflow (“looks good”). Other workflow acceptance, real content, translations, medical/card wording, reviewer authority and production readiness are separate.

## New checks

* Read the actual working tree, root guidance, version tooling and checkpoint documents. Fresh read-only Git inspection found branch **main**, upstream **origin/main**, remote **https://github.com/OzAvrahami/CeliTrip.git**, an empty index, and local/remote main at `8d329a6d5a1dafa561772f0536e3c7811e1e2739`. No fetch/ref/index mutation was needed.
* The local and remote annotated **v0.2.0** tag object remains `1b169b2f8becef6a963176018ba3e70a4a8f7a72`; its peeled commit remains `8d329a6d5a1dafa561772f0536e3c7811e1e2739`. Its previously verified publication timestamp/URL/channel/state were preserved exactly in `VERSION.json.release_history`. No new GitHub API publication check or release mutation is claimed.
* Current metadata is **0.3.0 / unreleased**, with no current `release` object, tag, prepared release date or published URL. npm mirrors were synchronized using `npm version --no-git-tag-version --ignore-scripts`; the existing prototype synchronization script regenerated only its delimited badge. No dependency installation occurred.
* **2 focused version tests passed**, including rejection of carried-over, duplicate and incomplete publication metadata. `npm.cmd run version:check`, optimized build and lint passed. Existing application/domain behavior did not change in this checkpoint task.
* Rebuilt/restarted the existing optimized local preview with the existing database/environment. Chrome displayed **v0.3.0 · Unreleased** on the authenticated administration dashboard, at the actual 2752×983 viewport without horizontal overflow. The [screenshot](qa/checkpoint-0.3.0/admin-version.jpg) was inspected; no warning/error console entries were returned. The application remains available at **http://127.0.0.1:3000/en/editor**.
* Chrome's URL security policy blocked opening the standalone HTML through a local `file:` URL. No workaround was attempted. Prototype validation here is the generated HTML/badge check plus exact non-badge comparison; a new prototype browser-render check is **not** claimed. Earlier prototype visual/flow evidence is reused.
* Strict UTF-8, relative document targets, CRLF-aware whitespace, exact manifest/working-tree comparison, package/dependency preservation and fresh index/environment preservation checks are recorded in [the check summary](qa/checkpoint-0.3.0/check-summary.json).

## Prototype fingerprint reconciliation

The new HTML SHA-256 is `1149af216074d9b998e48c666c9537670f4cc9560cb0a90d3381cddb97d0c869`. Replacing only the generated product-version block with the pre-task block exactly reproduces the preceding HTML; prototype flows, scripts, fonts and embedded assets are unchanged. Historical screenshots/fingerprints remain as captured, not relabeled as new 0.3.0 workflow checks.

## Reused evidence and preserved data

The completed [geography correction validation](GEOGRAPHY_USABILITY_VALIDATION.md) records **41 passing tests in real isolated PostgreSQL**, focused HTTP permission/publication checks, live four-language geographic-name lookup and Hebrew/English desktop/mobile journeys. [Administration](ADMINISTRATION_VALIDATION.md), [Milestone 2](MILESTONE_2_VALIDATION.md) and [Milestone 1](MILESTONE_1_VALIDATION.md) reports retain their broader browser/authentication/evidence coverage. Their historical version labels and file hashes describe those runs. Those unchanged workflows were not repeated for this metadata/documentation checkpoint. The two new version tests are additional checks, not a claim of a fresh full 43-test run.

No migrations, fixtures, account/grant operations, database mutations, reseeding or resets were performed for this task. The existing ignored environment, accounts, credentials, authenticators, local-demo restrictions and owner records were preserved. A fresh pre-task index hash was captured and compared after preparation; it was not inferred from earlier reports.

**DeepL remains deferred and unverified live.** Working geographic-name lookup is distinct from operational machine translation. Prototype-only hotels/hubs/maps/cards/offline remain demonstrations; future implementation, real publication policy, human approvals and production operations are outside this checkpoint. No next-milestone implementation, Git mutation, release creation, deployment or provisioning occurred.
