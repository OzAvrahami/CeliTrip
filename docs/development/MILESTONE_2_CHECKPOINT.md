# CeliTrip 0.3.0 development checkpoint — historical preparation

**Completed by the owner:** checkpoint `c897a0bf4c0bd267104c073fe11dd8d672a79f8e` was verified on local/remote main during preparation. The scope, inspection and commands below describe the earlier preparation snapshot; do not rerun them. Publication subsequently completed on 2026-10-08; current metadata is **0.3.0 Published prerelease**. See the [completed publication record](../releases/PUBLISH_v0.3.0.md). Everything below describes the historical checkpoint, not current publication status.

**2026-10-04 — 0.3.0 Unreleased.** The owner authorized the grouped minor checkpoint and accepted the demonstrated corrected destination-management experience (“looks good”). This is not broader approval of real content, translations, medical/card wording, reviewer authority, production readiness or every administration workflow.

The grouping contains completed local Milestone 2 authentication/revision/review/publication/withdrawal/correction services, the eight-section four-language administration workspace, guarded owner-demo password login, geographic lookup/publication and destination usability corrections. The accepted blue design and public Rome journey remain. Geographic names use working Wikidata lookup; DeepL configuration/live verification remain deferred and machine translation is not operational. Prototype-only hotels/hubs/maps/cards/offline and future cloud work are not part of the implemented scope.

`VERSION.json` is authoritative at **0.3.0 / unreleased**, with synchronized npm, application and standalone prototype labels. Its `release_history` preserves the exact **v0.2.0 published prerelease** record, URL/time and immutable tag target `8d329a6d5a1dafa561772f0536e3c7811e1e2739`. No current 0.3.0 release object/tag/date/publication is claimed. See [draft notes](../releases/v0.3.0-draft.md), [Unreleased changelog](../../CHANGELOG.md) and [checkpoint validation](../technical/CHECKPOINT_0.3.0_VALIDATION.md).

## Reviewed file scope

The explicit [whole-file manifest](milestone-2-files.txt) was regenerated from the **actual current working tree**, not an old file count or release manifest. It includes 134 reviewed paths and prepares one combined checkpoint commit. Existing v0.2.0 publication-recording changes are intentionally included and preserved alongside Milestone 2 and this checkpoint. Metadata/handoff/version tooling now contain both historical publication information and the new development version; they are no longer described as publication-only unchanged files. Historical QA evidence retains its original fingerprints/version labels.

**Unrelated changes found: none.** No owner work was discarded. The manifest excludes ignored `.env.local`, credentials/authenticator/recovery material, database files/dumps/volumes, `.next`, `node_modules`, logs and external temporary preservation snapshots. `.env.example` contains the previously documented disposable loopback database defaults, a default-off demo option and no real auth/provider secret. Its provider remains empty and the comment now explicitly records DeepL deferral. No application data or account/grant changes are part of this task.

Fresh read-only inspection: local branch **main**, upstream **origin/main**, remote **https://github.com/OzAvrahami/CeliTrip.git**, local/remote HEAD **8d329a6d5a1dafa561772f0536e3c7811e1e2739**, empty index. A fresh pre-task index hash and working-file baseline were captured and compared; old report hashes/counts were not used as current evidence. The index remains untouched. The exact categorized list below is generated from the same manifest; only that manifest should be staged, never `git add .` or old 0.2.0 lists.

## Manual owner commands

These commands were **prepared, not executed by Codex**. Review new/untracked files through the manifest and the staged diff, since an unstaged `git diff` alone does not show them. Keep review and mutation phases separate. If branch/HEAD/index changed since preparation, review again rather than bypassing a guard. A normal push may reject later remote changes; never force it. No tag/release/deployment command is included.

Review/preflight (read-only):

```powershell
Set-Location D:\code\CeliTrip
if ((git branch --show-current).Trim() -ne 'main') { throw 'Expected main; review branch first.' }
if ((git remote get-url origin).Trim() -ne 'https://github.com/OzAvrahami/CeliTrip.git') { throw 'Unexpected origin.' }
if ((git rev-parse HEAD).Trim() -ne '8d329a6d5a1dafa561772f0536e3c7811e1e2739') { throw 'HEAD changed; review checkpoint scope again.' }
git status --short --untracked-files=all
Get-Content docs/development/milestone-2-files.txt
git diff --check
if ($LASTEXITCODE -ne 0) { throw 'Resolve whitespace findings.' }
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) { throw 'Existing staged work; review it before staging.' }
```

Stage only the reviewed manifest (owner-operated mutation):

```powershell
git --literal-pathspecs add --pathspec-from-file=docs/development/milestone-2-files.txt
if ($LASTEXITCODE -ne 0) { throw 'Staging failed.' }
```

Review the staged result (read-only; stop here until satisfied):

```powershell
$checkpointFiles = @(Get-Content docs/development/milestone-2-files.txt)
$stagedFiles = @(git -c core.quotepath=false diff --cached --name-only)
if ($LASTEXITCODE -ne 0) { throw 'Cannot read staged files.' }
if (Compare-Object ($checkpointFiles | Sort-Object) ($stagedFiles | Sort-Object)) { throw 'Staged scope differs from the manifest.' }
git diff --cached --check
if ($LASTEXITCODE -ne 0) { throw 'Resolve staged whitespace findings.' }
git diff --cached --stat
git diff --cached
```

After reviewing, create the checkpoint commit (owner-operated mutation):

```powershell
git commit -m "chore: checkpoint CeliTrip 0.3.0 development (unreleased)"
if ($LASTEXITCODE -ne 0) { throw 'Commit failed; do not push.' }
```

Push that branch normally (owner-operated mutation; no force):

```powershell
git push origin main
if ($LASTEXITCODE -ne 0) { throw 'Push failed; inspect remote state without force-pushing.' }
```

## Exact checkpoint file manifest

The path list is also available as [the literal Git pathspec file](milestone-2-files.txt).

### Version, release history and checkpoint documentation (21)

* `CHANGELOG.md`
* `VERSION.json`
* `docs/design/CeliTrip-Design-Flow.html`
* `docs/design/PROTOTYPE_VALIDATION.md`
* `docs/development/LOCAL_DEVELOPMENT.md`
* `docs/development/MILESTONE_2_CHECKPOINT.md`
* `docs/development/VERSIONING.md`
* `docs/development/milestone-2-files.txt`
* `docs/product/DEVELOPMENT_HANDOFF.md`
* `docs/product/TRUST_RULES.md`
* `docs/releases/PUBLISH_v0.2.0.md`
* `docs/releases/v0.3.0-draft.md`
* `docs/technical/ADMINISTRATION_VALIDATION.md`
* `docs/technical/CHECKPOINT_0.3.0_VALIDATION.md`
* `docs/technical/DESTINATION_VALIDATION.md`
* `docs/technical/GEOGRAPHY_USABILITY_VALIDATION.md`
* `docs/technical/MILESTONE_1_VALIDATION.md`
* `docs/technical/MILESTONE_2_VALIDATION.md`
* `docs/technical/TECHNICAL_DISCOVERY.md`
* `package-lock.json`
* `package.json`

### Application, migration and validation tooling (66)

* `.env.example`
* `db/migrations/1790850000000_auth.cjs`
* `db/migrations/1790850000001_editorial.cjs`
* `db/migrations/1790850000002_local_demo_session.cjs`
* `db/migrations/1790930000000_administration.cjs`
* `db/migrations/1790930000001_catalog_dates.cjs`
* `db/migrations/1791100000000_destination_workflow.cjs`
* `db/migrations/1791200000000_destination_notes.cjs`
* `scripts/auth-configure.js`
* `scripts/check-version.js`
* `scripts/editorial-account.js`
* `scripts/sync-prototype-version.cjs`
* `scripts/validate-administration-http.js`
* `scripts/validate-demo-auth-http.js`
* `scripts/validate-destination-http.js`
* `scripts/validate-editorial-http.js`
* `src/app/[locale]/[[...path]]/page.jsx`
* `src/app/[locale]/editor/[[...editorPath]]/page.jsx`
* `src/app/[locale]/editor/error.jsx`
* `src/app/[locale]/editor/layout.jsx`
* `src/app/[locale]/editor/loading.jsx`
* `src/app/api/administration/route.js`
* `src/app/api/auth/[...all]/route.js`
* `src/app/api/corrections/route.js`
* `src/app/api/editorial/route.js`
* `src/app/layout.jsx`
* `src/components/Admin.module.css`
* `src/components/AdminForms.jsx`
* `src/components/AdminShell.jsx`
* `src/components/AdminWorkspace.jsx`
* `src/components/CorrectionForm.jsx`
* `src/components/DestinationEditor.jsx`
* `src/components/Editorial.module.css`
* `src/components/EditorialAuth.jsx`
* `src/components/EditorialForm.jsx`
* `src/components/EditorialStudio.jsx`
* `src/components/Journey.jsx`
* `src/components/LanguageSwitcher.jsx`
* `src/components/RevisionComparison.jsx`
* `src/components/TranslationEditor.jsx`
* `src/i18n/admin.js`
* `src/i18n/copy.js`
* `src/i18n/destinations.js`
* `src/i18n/editorial.js`
* `src/i18n/geography.js`
* `src/lib/destination-navigation.js`
* `src/lib/release-label.cjs`
* `src/lib/translation-state.js`
* `src/proxy.js`
* `src/server/administration.js`
* `src/server/auth-config.js`
* `src/server/auth.js`
* `src/server/corrections.js`
* `src/server/db.js`
* `src/server/destinations.js`
* `src/server/editorial-http.js`
* `src/server/editorial-service.js`
* `src/server/editorial-validation.js`
* `src/server/local-config.js`
* `src/server/local-demo-auth.js`
* `src/server/repository.js`
* `src/server/translation-service.js`
* `tests/destination-navigation.test.js`
* `tests/editorial.test.js`
* `tests/local-demo-auth.test.js`
* `tests/version.test.js`

### Recorded screenshots and validation artifacts (47)

* `docs/releases/qa/v0.2.0-published/app-desktop.png`
* `docs/releases/qa/v0.2.0-published/app-mobile.png`
* `docs/releases/qa/v0.2.0-published/prototype-desktop.png`
* `docs/releases/qa/v0.2.0-published/prototype-mobile.png`
* `docs/releases/qa/v0.2.0-published/validation.json`
* `docs/technical/qa/administration/check-summary.json`
* `docs/technical/qa/administration/correction-en-desktop.png`
* `docs/technical/qa/administration/dashboard-en-desktop.png`
* `docs/technical/qa/administration/dashboard-en-mobile.png`
* `docs/technical/qa/administration/dashboard-fr-desktop.png`
* `docs/technical/qa/administration/dashboard-fr-mobile.png`
* `docs/technical/qa/administration/dashboard-he-desktop.png`
* `docs/technical/qa/administration/dashboard-he-mobile.png`
* `docs/technical/qa/administration/dashboard-ru-desktop.png`
* `docs/technical/qa/administration/dashboard-ru-mobile.png`
* `docs/technical/qa/administration/drawer-he-mobile.png`
* `docs/technical/qa/administration/evidence-he-mobile.png`
* `docs/technical/qa/administration/preservation.json`
* `docs/technical/qa/administration/public-rome-he-mobile.png`
* `docs/technical/qa/administration/review-en-desktop.png`
* `docs/technical/qa/checkpoint-0.3.0/admin-version.jpg`
* `docs/technical/qa/checkpoint-0.3.0/check-summary.json`
* `docs/technical/qa/destinations/check-summary.json`
* `docs/technical/qa/destinations/create-en-desktop.jpg`
* `docs/technical/qa/destinations/create-en-mobile.jpg`
* `docs/technical/qa/destinations/create-he-desktop.jpg`
* `docs/technical/qa/destinations/create-he-mobile.jpg`
* `docs/technical/qa/destinations/preservation.json`
* `docs/technical/qa/geography-usability/check-summary.json`
* `docs/technical/qa/geography-usability/confirmation-error-en-desktop.jpg`
* `docs/technical/qa/geography-usability/confirmation-error-he-mobile.jpg`
* `docs/technical/qa/geography-usability/editor-en-mobile.jpg`
* `docs/technical/qa/geography-usability/editor-he-desktop.jpg`
* `docs/technical/qa/geography-usability/editor-he-mobile.jpg`
* `docs/technical/qa/geography-usability/preservation.json`
* `docs/technical/qa/geography-usability/saved-city-en-desktop.jpg`
* `docs/technical/qa/milestone-2/browser-checks.json`
* `docs/technical/qa/milestone-2/check-summary.json`
* `docs/technical/qa/milestone-2/editorial-he-desktop.png`
* `docs/technical/qa/milestone-2/editorial-he-mobile.png`
* `docs/technical/qa/milestone-2/editorial-ru-mobile.png`
* `docs/technical/qa/milestone-2/preview-en-desktop.png`
* `docs/technical/qa/milestone-2/public-evidence-he-desktop.png`
* `docs/technical/qa/milestone-2/public-evidence-he-mobile.png`
* `docs/technical/qa/milestone-2/public-evidence-ru-mobile.png`
* `docs/technical/qa/milestone-2/withdrawn-review-desktop.png`
* `docs/technical/qa/milestone-2/workflow-record.json`
