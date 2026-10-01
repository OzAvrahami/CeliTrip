# CeliTrip repository guidance

## Scope and preservation

Read the relevant product documents under `docs/product/` before changing product behavior. Preserve existing work, the approved blue design, Hebrew/English/French/Russian launch scope, claim-level evidence, branch scopes, and V1 exclusions. Illustrative prototype content must remain clearly labeled; never invent venue facts, accreditation, verification dates, or reviewer approval. Editorial review intervals remain proposals until accepted.

Keep design demonstrations distinct from production capabilities. Prototype saving, publishing, reporting, access and offline/loading states do not establish a working backend, authentication or offline storage. Do not begin production implementation without an explicit task requesting it.

Standing owner preference: Codex prepares and validates changes, reviews the explicit file scope, and provides exact commands. The owner personally executes all commits and pushes. Previous authorization for Codex to create a checkpoint commit is withdrawn.

Do not stage, commit, push, create tags, or otherwise mutate Git history or the index. Git mutation commands may be provided for the owner to run manually, but must not be executed by Codex. Preserve existing history and staged work; do not undo or rewrite an owner's actions. Do not publish or deploy without explicit authorization.

## Product versions and changelog

`VERSION.json` is the single authoritative product version and release status, including during the prototype stage. Preserve any established history. Document revisions such as PRD v0.2 and design-studio revision labels are independent of the product version.

Follow [the version workflow](docs/development/VERSIONING.md). Group related work into releases; do not automatically increment the version for every task. Documentation-only edits normally need no product bump. Before 1.0, use patch increments for fixes and minor increments for new capabilities or breaking changes. Explicitly identify breaking changes in `CHANGELOG.md`. Reserve 1.0.0 for the agreed first stable release.

Record relevant work under `CHANGELOG.md` → Unreleased without fabricating past releases. Update `VERSION.json` only when initializing version management or when a version/release scope has been agreed. After changing it, run `node scripts/sync-prototype-version.cjs`, then `node scripts/sync-prototype-version.cjs --check`. Never manually edit the generated version badge in the standalone prototype.

Validate the affected behavior and the version display when changed; reuse completed validation for unchanged behavior. Do not imply a release occurred merely because checks passed or a version is displayed.

## Every completion report

Include these fields, even when no version change is needed:

* **Version impact:** none, patch, minor (including explicitly identified breaking changes), or initial baseline, with the reason.
* **Current and proposed version:** read the current version/status from `VERSION.json`; state the proposed version or that no bump is proposed. A proposal is not a performed bump.
* **Changelog status:** entries added/updated, or unchanged with a reason.
* **Validation:** checks performed, relevant existing evidence reused, and material gaps.
* **Release status:** unreleased/released from the authoritative file, and any release actions actually performed. Never claim a tag, publication or deployment without evidence.
