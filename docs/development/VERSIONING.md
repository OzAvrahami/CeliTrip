# CeliTrip product version workflow

## Authority and current development state

Read [VERSION.json](../../VERSION.json) for the authoritative product version and release status. Version management starts with **0.1.0, explicitly unreleased**, covering the current design prototype and product discovery work. Repository inspection found no existing product version file, changelog or local Git tags. This initializes a development baseline; it does not create or imply a previous release.

The owner subsequently authorized **0.2.0 Unreleased** as the grouped development checkpoint after reviewing the running Milestone 1 application. This is the current development version; 0.1.0 remains an unreleased historical baseline. See [checkpoint scope and prepared commit commands](CHECKPOINT_0.2.0.md). A checkpoint commit does not change release status or imply a tag/publication.

The owner has now committed/pushed that checkpoint at `a5764706afb08e93e350e8774ccf37b352c1e0f4` and authorized preparation of its GitHub prerelease. Follow the narrower [v0.2.0 publication instructions](../releases/PUBLISH_v0.2.0.md), not the historical checkpoint staging list.

[CHANGELOG.md](../../CHANGELOG.md) records pending work under **Unreleased**. Document revision numbers, such as PRD v0.2, and the design studio's `DESIGN PROTOTYPE / 01` label have their own meanings. They must not set or trigger the product version.

## Pre-1.0 convention

| Change in an agreed release | Increment | Example of a future transition, not a release history |
| --- | --- | --- |
| Fixes to existing capabilities | Patch | 0.1.0 → 0.1.1 |
| New capabilities | Minor; reset patch to zero | 0.1.0 → 0.2.0 |
| Breaking changes | Minor; reset patch to zero | 0.1.0 → 0.2.0; explicitly label **Breaking changes** in the changelog |
| Documentation-only corrections | Normally none | Leave the product version unchanged |
| Agreed first stable release | 1.0.0 | Requires an explicit stable-release decision |

A breaking change removes or incompatibly changes an existing flow, route, content contract, or integration. Identify what changes and any migration/review needed, even before 1.0. For a release containing several kinds of work, use the largest applicable increment once.

## Task and release process

1. Read repository guidance, `VERSION.json`, the changelog and local tags before planning a version change. Preserve existing history and unrelated work.
2. Implement the authorized task. Classify its version impact and add a concise, accurate Unreleased entry when it materially changes the product or development workflow. Do not add a new version heading, tag or release date for each completed task.
3. Keep related tasks grouped under the current development version until the next release scope/version is agreed. Report a proposed version separately; do not apply speculative bumps. Work completing the initial unreleased baseline can remain at 0.1.0.
4. When an agreed version change is authorized, edit `VERSION.json` and regenerate the prototype badge. Validate the affected display and run the consistency check. The badge is a generated copy, not another version authority.
5. Only when a release is explicitly authorized, move its agreed Unreleased entries into a dated version section and update release status consistently. Codex prepares and validates changes and provides exact commands; the owner personally performs commits and pushes. Codex must not stage, commit, tag, push or otherwise mutate Git history or the index. Publishing and deployment remain subject to explicit task authorization; the version helper performs none of these actions. Leave remaining work under Unreleased.
6. Establish the next development version/status when that cycle is agreed. Do not fabricate release history from repository creation dates, prototype timestamps or completed validation.

## Standalone prototype badge

The HTML includes a generated badge so it continues to open directly from disk without a fetch, build system or backend. Its source is `VERSION.json`.

From the repository root:

```text
node scripts/sync-prototype-version.cjs
node scripts/sync-prototype-version.cjs --check
```

The first command updates only the delimited badge block in `docs/design/CeliTrip-Design-Flow.html`. The check command is read-only, exits nonzero if it is stale or invalid, and must pass before reporting completion of a version-related change. No dependencies, package installation, Git index operations or release actions are involved.

Every completion report must include version impact, current and proposed version, changelog status, validation, and release status as specified in [AGENTS.md](../../AGENTS.md).

## Application version mirror

The local application's footer reads `VERSION.json` directly. `package.json` and the root package entry in `package-lock.json` mirror that version for npm tooling; they are not independent authorities. When a product bump is authorized, update those mirrors along with the standalone badge and run `npm.cmd run version:check`. The read-only check verifies both the prototype badge and npm metadata against `VERSION.json`. Starting or building the application never bumps or releases the product.

After an authorized edit to `VERSION.json`, use npm's existing version tooling without Git/tag hooks to synchronize its mirrors (PowerShell):

```powershell
$productVersion = (Get-Content -Raw VERSION.json | ConvertFrom-Json).version
npm.cmd version $productVersion --no-git-tag-version --ignore-scripts
node scripts/sync-prototype-version.cjs
npm.cmd run version:check
```

If npm already matches the authoritative version, skip the npm version command. Rebuild/restart an existing optimized local preview to refresh its imported version label; this does not require migrations or reseeding. Retain earlier validation artifacts as historical evidence and document the new badge fingerprint separately.

## Preparing a GitHub prerelease

Keep `version` at the agreed number. Until actual GitHub publication has been verified, retain `status: "unreleased"`; add a `release` object recording `tag`, `channel: "prerelease"`, `state: "prepared"`, `prepared_on` and the accepted `checkpoint_commit`. A prepared date and a dated changelog section do not establish publication. Label the changelog date explicitly as preparation and retain Unreleased for future changes. Existing tooling continues to derive displays from `version` and `status`, so the badge remains Unreleased during preparation.

The owner creates the release-preparation commit, captures its full SHA, creates an annotated tag on that exact commit, pushes that specific tag and publishes with `--verify-tag --prerelease --latest=false --notes-file`. Existing tags/releases must not be replaced, force-pushed or edited by a retry. Read-only checks must distinguish absence from authentication/network errors.

After the owner runs publication commands, verify the remote annotated tag's peeled commit and the GitHub release's tag, prerelease flag, non-draft state, publication time and URL. Only a separate evidence-based follow-up may record `status: "released"`, `release.state: "published"`, actual `published_at` and `url`, while retaining `channel: "prerelease"`. Update displays/docs then without rewriting or moving the published tag; the tagged preparation snapshot remains a truthful historical record. Do not auto-increment the next version or imply a stable release/deployment.
