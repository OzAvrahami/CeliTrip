# 0.2.0 development checkpoint preparation

**Prepared:** 2026-10-01 · **Authoritative version:** 0.2.0 · **Status:** Unreleased

**Historical record:** The owner has since created and pushed checkpoint commit `a5764706afb08e93e350e8774ccf37b352c1e0f4`; local and remote main were verified at that commit during prerelease preparation. Do not rerun the 90-file checkpoint staging/commit commands below. Use the narrow [v0.2.0 release-preparation instructions](../releases/PUBLISH_v0.2.0.md) instead. The earlier preparation-time observations below are retained as history, not current claims about HEAD/index state.

**Standing execution preference:** Codex prepares/validates changes and supplies exact commands; the owner personally executes commits and pushes. Any previous authorization for Codex to create the checkpoint commit is withdrawn. Codex must not stage, commit, push, tag or otherwise mutate Git history or the index. Follow-up inspection confirmed no checkpoint commit or staging had occurred: HEAD is still `00f94b9`, the staged diff is empty, and the index matches the fingerprint below. Nothing was undone or rewritten.

The owner reviewed the running Milestone 1 application and said it "looks good". This records acceptance of the demonstrated local implementation, in addition to the earlier acceptance of the prototype's blue design and interaction flows. Translation review, medical/celiac-card wording, real venue evidence/content, proposed trust policies and public-launch readiness remain pending. No Milestone 2 implementation is included or authorized by this checkpoint.

## Reviewed scope

This checkpoint groups the previously completed work into one development commit:

* Standalone blue prototype, its four-language journeys, illustrative hotel/hub/evidence/card flows and retained design validation evidence.
* Authoritative version metadata, npm/prototype consistency tooling and repository/version guidance.
* Updated PRD, trust proposals, information architecture, handoff and technical discovery, with separate documentation and product versions.
* Next.js/JavaScript/CSS Modules application, PostgreSQL migrations/repository, repeatable fictional fixture source, isolated local configuration, four-language persisted Rome → places → branch → evidence journey, focused tests and existing application validation evidence.
* This owner-acceptance/version follow-up and focused 0.2.0 display evidence.

The increment from 0.1.0 is a **minor** increment for grouped capabilities. Neither 0.1.0 nor 0.2.0 is recorded as released. CHANGELOG entries remain under **Unreleased**; no dated release heading, Git tag or publication was created. No existing prototype route/flow was removed and no breaking change to that prototype is identified. PRD v0.2 remains a document revision.

## Exact staging scope and exclusions

The reviewed, explicit list is [checkpoint-0.2.0-files.txt](checkpoint-0.2.0-files.txt): **90 files**, one literal repository-relative file per line, including this preparation record, the list itself and the focused evidence. It uses no directory entries or wildcards. It includes the related PRD working-tree changes, which predate this checkpoint task and were preserved. The unchanged, already tracked `docs/product/reference-destinations/rome.md` is outside the list and remains in the repository history.

Included `.env.example` and `compose.yaml` contain only the documented disposable local fixture credentials. No private environment file is included. The reviewed list excludes `.env.local`, other private environment files, `node_modules`, `.next`, logs, coverage, PostgreSQL data, database dumps and unrelated work. Database data stays in the existing Docker named volume outside the repository. Intentional screenshots/validation JSON are review evidence, not generated application build output. Existing image/font rights still require review before public distribution.

At preparation time the index was empty of staged changes and unchanged from the prior tasks. Its SHA-256 was `aec821f4871b0387ece64633ad352690a7d6efa7f12f8d7463923c0c4831946f`. Local history contained only the original product-discovery commit (`00f94b9`); there were no local tags. No unrelated dirty file was identified among the nonignored candidates; unexpected future files must not be added to this list automatically.

## Validation performed for this checkpoint

* Updated `VERSION.json` to 0.2.0 while retaining `unreleased`. Used `npm.cmd version 0.2.0 --no-git-tag-version --ignore-scripts` for npm mirrors, followed by `node scripts/sync-prototype-version.cjs`. No dependencies were installed or updated; package/lockfile comparison shows only the root version fields changed.
* `node scripts/sync-prototype-version.cjs --check`, `npm.cmd run version:check`, `npm.cmd run lint`, and `npm.cmd run build` passed. Three non-database tests passed via `node --env-file=.env.local --test tests/local.test.js`.
* Restarted only the local application process with the new optimized build. The existing database/container/volume were reused; no migration, reseed, database test reset or data mutation was performed.
* Chrome confirmed the application footer and standalone prototype badge at **1440 × 1000** and **390 × 844**. Both show **v0.2.0 · Unreleased** (application status uses lowercase). Four screenshots were saved and visually inspected; no horizontal overflow or warning/error console entries were observed in these focused checks. The application preview remains at `http://127.0.0.1:3000/en/destinations/italy/rome`.
* The original [Milestone 1 report](../technical/MILESTONE_1_VALIDATION.md), its 11 passing tests/81 browser observations and the [prototype report](../design/PROTOTYPE_VALIDATION.md) remain applicable to unchanged flows. Their original screenshots/manifests were preserved, not rewritten as 0.2.0 results. The complete browser matrix and database tests were **not** rerun for a version-only change.
* Source/config/assets/database files were compared with the original M1 manifest. Only `VERSION.json`, `package.json` and `package-lock.json` differ among its recorded application files, and their differences are version metadata only. The generated prototype badge is checked separately below.
* UTF-8, relative links, whitespace, explicit staging-path existence/exclusions and focused credential-pattern checks were reviewed. This is a local checkpoint review, not a production security or content audit.

Focused screenshots: [application desktop](qa/0.2.0/app-desktop.png), [application mobile](qa/0.2.0/app-mobile.png), [prototype desktop](qa/0.2.0/prototype-desktop.png), [prototype mobile](qa/0.2.0/prototype-mobile.png). The [checkpoint validation record](qa/0.2.0/validation.json) records version/source comparisons and screenshot fingerprints without replacing the earlier manifest.

| Prototype artifact | SHA-256 |
| --- | --- |
| Previous 0.1.0 badge | `236fa460bc88bfac4010d2290b937191099b4d7c1506701883d8d64386d000a5` |
| Current 0.2.0 badge | `324c7a8aeac3adf0b00fad58e5085127e6a6d9a30b7114442ddf3141fa8fe3bd` |

Replacing only `v0.2.0` with `v0.1.0` inside the delimited generated badge exactly reproduces the old fingerprint. There were no prototype flow/style/content changes in this task. The limited badge change does not imply that the previous 115 prototype observations were rerun.

## Prepared PowerShell commands — not executed

These commands are for the owner to run after reviewing the scope. They are intentionally split into staging/review and commit. Do not use `git add .`, `git add -A` or `git commit -a`. The literal-pathspec option is required for Next.js filenames containing brackets. The per-command safe-directory setting avoids changing global Git configuration.

First inspect the list, confirm the unchanged index, check version consistency, and stage only the explicit files:

```powershell
Set-Location -LiteralPath 'D:\code\CeliTrip'
$checkpointList = 'docs/development/checkpoint-0.2.0-files.txt'
$expectedIndex = 'aec821f4871b0387ece64633ad352690a7d6efa7f12f8d7463923c0c4831946f'
if ((Get-FileHash -LiteralPath '.git/index' -Algorithm SHA256).Hash.ToLowerInvariant() -ne $expectedIndex) {
    throw 'The index changed after checkpoint preparation. Review it before staging.'
}
Get-Content -LiteralPath $checkpointList
$checkpointFiles = @(Get-Content -LiteralPath $checkpointList)
foreach ($checkpointFile in $checkpointFiles) {
    if (!(Test-Path -LiteralPath $checkpointFile -PathType Leaf)) {
        throw "Missing checkpoint file: $checkpointFile"
    }
}
git -c safe.directory=D:/code/CeliTrip --no-optional-locks diff --cached --quiet
if ($LASTEXITCODE -ne 0) { throw 'Existing staged changes need separate review.' }
npm.cmd run version:check
if ($LASTEXITCODE -ne 0) { throw 'Version consistency failed.' }

git -c safe.directory=D:/code/CeliTrip --literal-pathspecs add --pathspec-from-file=docs/development/checkpoint-0.2.0-files.txt
if ($LASTEXITCODE -ne 0) { throw 'Staging failed. Inspect the index before continuing.' }
$stagedFiles = @(git -c safe.directory=D:/code/CeliTrip -c core.quotepath=false diff --cached --name-only)
if ($LASTEXITCODE -ne 0) { throw 'Could not inspect staged paths.' }
if (Compare-Object ($checkpointFiles | Sort-Object) ($stagedFiles | Sort-Object)) {
    throw 'Staged paths differ from the reviewed checkpoint list.'
}
git -c safe.directory=D:/code/CeliTrip diff --cached --check
if ($LASTEXITCODE -ne 0) { throw 'Staged whitespace check failed.' }
git -c safe.directory=D:/code/CeliTrip diff --cached --stat
git -c safe.directory=D:/code/CeliTrip diff --cached
```

After reviewing the staged diff, the exact checkpoint commit command is:

```powershell
Set-Location -LiteralPath 'D:\code\CeliTrip'
git -c safe.directory=D:/code/CeliTrip commit -m "chore: checkpoint CeliTrip 0.2.0 development (unreleased)"
if ($LASTEXITCODE -ne 0) { throw 'Checkpoint commit was not created.' }
git -c safe.directory=D:/code/CeliTrip --no-optional-locks status --short
git -c safe.directory=D:/code/CeliTrip --no-optional-locks log -1 --oneline
```

These blocks contain owner-executed Git mutations; Codex has not executed either block and must not execute them. A manual checkpoint commit preserves the **Unreleased** status. The owner also performs any later push; no push or tag command is included here. Publishing/deployment, changing release status, closing issues and starting Milestone 2 remain outside this task. Translation/medical/card/content/publication gates still apply before a public release.
