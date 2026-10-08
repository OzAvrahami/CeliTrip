# CeliTrip v0.3.0 prerelease publication record

## Completed publication — do not rerun creation commands

The owner published [v0.3.0](https://github.com/OzAvrahami/CeliTrip/releases/tag/v0.3.0) at **2026-10-08T18:32:14Z**. Fresh read-only GraphQL verification confirms `isDraft: false`, `isPrerelease: true`, `isLatest: false`, the timestamp/URL and tag commit. Remote refs independently confirm annotated object **38ec171b9c9cf8977c2484491fad0e83659ddc25** and peeled commit **6c1cb564f8cfd3ec8a395582f3581d7a800bace7**. The release's `target_commitish: main` is not immutable target evidence.

This recording follow-up keeps version **0.3.0**, sets root status `released` and current release state `published`, retains channel `prerelease`, preparation date/checkpoint and unchanged v0.2.0 history, and records the actual tag commit/time/URL. Application/prototype labels read **v0.3.0 · Published prerelease**. The tag and GitHub release were not edited; the tagged preparation snapshot remains intact. Codex performed no Git mutations or deployment.

Only the [recording manifest](v0.3.0-publication-files.txt) applies to this follow-up; neither earlier checkpoint/preparation manifest should be staged again. See [recording validation](../technical/PUBLICATION_0.3.0_VALIDATION.md). DeepL remains deferred, general machine translation is not operational, and owner acceptance remains limited to the demonstrated corrected destination workflow.

## Recording-only owner commands

Prepared, not executed by Codex. Use one PowerShell session; review at each prompt. A failed guard stops without resetting owner work. These commands create only a follow-up commit on main; they never move the published tag or edit the release.

```powershell
Set-Location D:\code\CeliTrip
$ErrorActionPreference = 'Stop'
function Invoke-RecordingGit {
    & git -c safe.directory=D:/code/CeliTrip --no-optional-locks @args
    if ($LASTEXITCODE -ne 0) { throw "Git failed: $args. Stop and inspect." }
}
$expectedHead = '6c1cb564f8cfd3ec8a395582f3581d7a800bace7'
$manifest = 'docs/releases/v0.3.0-publication-files.txt'
$files = @(Get-Content -Encoding UTF8 $manifest)

# 1. Read-only preflight: stop if newer owner work changes this scope.
if ((Invoke-RecordingGit branch --show-current) -ne 'main') { throw 'Expected main.' }
if ((Invoke-RecordingGit rev-parse HEAD) -ne $expectedHead) { throw 'HEAD changed; review newer work.' }
if ((Invoke-RecordingGit remote get-url origin) -ne 'https://github.com/OzAvrahami/CeliTrip.git' -or
    (Invoke-RecordingGit remote get-url --push origin) -ne 'https://github.com/OzAvrahami/CeliTrip.git') { throw 'Unexpected origin.' }
$remoteMain = @(Invoke-RecordingGit ls-remote origin refs/heads/main)
if ($remoteMain.Count -ne 1 -or ($remoteMain[0] -split '\s+')[0] -ne $expectedHead) { throw 'Remote main changed.' }
if (@(Invoke-RecordingGit diff --cached --name-only).Count) { throw 'Preserve existing staged work; stop.' }
$changed = @((Invoke-RecordingGit diff --name-only); (Invoke-RecordingGit ls-files --others --exclude-standard))
if (($changed | Sort-Object) -join "`n" -cne (($files | Sort-Object) -join "`n")) { throw 'Working scope differs from manifest.' }
Invoke-RecordingGit -c core.autocrlf=false diff --check
npm.cmd run version:check
if ($LASTEXITCODE -ne 0) { throw 'Version check failed.' }
$files

# 2. Owner stages only the recording manifest, then reviews.
if ((Read-Host 'Type STAGE to stage this recording-only scope') -cne 'STAGE') { throw 'Stopped.' }
Invoke-RecordingGit --literal-pathspecs add "--pathspec-from-file=$manifest"
$staged = @(Invoke-RecordingGit diff --cached --name-only)
if (($staged | Sort-Object) -join "`n" -cne (($files | Sort-Object) -join "`n")) { throw 'Staged scope mismatch.' }
Invoke-RecordingGit -c core.autocrlf=false diff --cached --check
Invoke-RecordingGit diff --cached --stat
Invoke-RecordingGit --no-pager diff --cached

# 3. Owner commits after review and pushes main normally; no tags/releases.
if ((Read-Host 'Review the diff. Type COMMIT to commit and push') -cne 'COMMIT') { throw 'Stopped before commit.' }
if ((Invoke-RecordingGit rev-parse HEAD) -ne $expectedHead) { throw 'HEAD changed during review.' }
if (@(Invoke-RecordingGit diff --name-only).Count -or @(Invoke-RecordingGit ls-files --others --exclude-standard).Count) { throw 'Unstaged changes appeared; review again.' }
$staged = @(Invoke-RecordingGit diff --cached --name-only)
if (($staged | Sort-Object) -join "`n" -cne (($files | Sort-Object) -join "`n")) { throw 'Staged scope changed.' }
Invoke-RecordingGit commit -m 'docs: record verified v0.3.0 prerelease publication'
$recordingCommit = (Invoke-RecordingGit rev-parse HEAD).Trim()
Invoke-RecordingGit push origin main
$remoteMain = @(Invoke-RecordingGit ls-remote origin refs/heads/main)
if ($remoteMain.Count -ne 1 -or ($remoteMain[0] -split '\s+')[0] -ne $recordingCommit) { throw 'Remote verification failed.' }
Write-Host "Recording commit verified on remote main: $recordingCommit"
```

## Historical preparation record — 2026-10-04

Everything below, including the owner-operated sequence and after-publication instructions, is the preserved preparation record. It does not describe current non-publication. **Do not rerun its mutation commands or replace/move any existing tag or release.**


**Prepared 2026-10-04; publication not yet verified.** Product version remains **0.3.0 Unreleased**, with current release state `prepared` and channel `prerelease`. The dated changelog section is preparation, not a publication announcement. The owner alone runs the mutations below.

Read-only inspection confirmed clean local/remote `main` at accepted checkpoint `c897a0bf4c0bd267104c073fe11dd8d672a79f8e`, empty index, authenticated repository push access, and no local/remote v0.3.0 tag or GitHub release (including drafts). v0.2.0 remains an annotated tag at `8d329a6d5a1dafa561772f0536e3c7811e1e2739`, published prerelease at 2026-10-01T12:32:09Z. No Git mutations were performed during preparation.

## Explicit preparation scope

Use only [v0.3.0-files.txt](v0.3.0-files.txt): 10 metadata/documentation files. The earlier 134-file checkpoint manifest is historical and must not be used again. No application code, dependencies, prototype badge bytes, environment files, credentials, database files/dumps, generated output or temporary artifacts are included. No unrelated changes were found. See [validation](../technical/RELEASE_0.3.0_VALIDATION.md).

Final publication text is [v0.3.0.md](v0.3.0.md); the old checkpoint draft is retained only as history. DeepL remains deferred and general machine translation is not operational. Narrow owner acceptance covers the demonstrated corrected destination workflow, not real content, human translations, medical wording, reviewer appointments or production readiness.

## Owner-operated sequence

Copy the complete block into one PowerShell session. Review each phase; prompts pause before staging, commit/push, tagging and publication. Every native command checks its exit code. Tag/release absence is established only after successful queries; authentication/network failures stop the sequence. Successful authenticated push access ensures the release list includes drafts. Existing tags/releases always stop preparation; never delete, overwrite, move or force them.

If a later phase fails, retain the printed full preparation SHA and inspect which operations completed. Do not rerun the whole sequence or remove an existing tag/release to get past a guard. Resume only the missing operation after reviewing actual local/remote state. The script never resets the index or rolls back owner work. Read-only verification can be repeated with the already captured `$releaseCommit` and helper functions.

The final check uses GitHub's `Release.isLatest` field directly, alongside the remote annotated tag and its peeled commit. CLI flags follow the [official release-create manual](https://cli.github.com/manual/gh_release_create); authenticated draft visibility follows the [official release-list documentation](https://docs.github.com/en/rest/releases/releases#list-releases). The GraphQL fields and query were verified against the live schema and unchanged historical v0.2.0 release during preparation.

```powershell
# Run in one PowerShell session. Stop on any failed phase; never force or replace refs.
# Phase 1: read-only preflight
Set-Location D:\code\CeliTrip
$ErrorActionPreference = 'Stop'
$repo = 'OzAvrahami/CeliTrip'
$tag = 'v0.3.0'
$checkpoint = 'c897a0bf4c0bd267104c073fe11dd8d672a79f8e'
$manifest = 'docs/releases/v0.3.0-files.txt'
$notes = 'docs/releases/v0.3.0.md'
function Invoke-ReleaseGit {
    & git -c safe.directory=D:/code/CeliTrip --no-optional-locks @args
    if ($LASTEXITCODE -ne 0) { throw "Git failed: $args. Stop; do not retry mutations blindly." }
}
function Invoke-ReleaseGh {
    & gh @args
    if ($LASTEXITCODE -ne 0) { throw "GitHub request failed: $args. This does NOT prove absence." }
}
function Assert-Access {
    $access = (Invoke-ReleaseGh api "repos/$repo") | ConvertFrom-Json
    if ($access.full_name -cne $repo -or $access.permissions.push -ne $true) {
        throw 'Expected authenticated repository access with push permission (including draft visibility).'
    }
}
function Assert-NoRelease {
    Assert-Access
    $releaseTags = @(Invoke-ReleaseGh api --paginate "repos/$repo/releases?per_page=100" --jq '.[].tag_name')
    if ($releaseTags -contains $tag) { throw 'Release already exists, possibly as a draft. Do not replace it.' }
}
function Assert-NoTag {
    if (@(Invoke-ReleaseGit tag --list $tag).Count) { throw 'Local tag exists. Do not replace or move it.' }
    if (@(Invoke-ReleaseGit ls-remote origin "refs/tags/$tag" "refs/tags/$tag^{}").Count) {
        throw 'Remote tag exists. Do not replace or move it.'
    }
}
function Assert-RemoteMain([string]$expected) {
    $refs = @(Invoke-ReleaseGit ls-remote origin refs/heads/main)
    if ($refs.Count -ne 1 -or ($refs[0] -split '\s+')[0] -cne $expected) {
        throw 'Remote main differs. Stop and review; never force push.'
    }
}
if ((Invoke-ReleaseGit rev-parse --show-toplevel).Replace('\','/') -cne 'D:/code/CeliTrip') { throw 'Wrong repository.' }
if ((Invoke-ReleaseGit branch --show-current) -cne 'main') { throw 'Expected main.' }
if ((Invoke-ReleaseGit remote get-url origin) -cne "https://github.com/$repo.git") { throw 'Unexpected fetch origin.' }
if ((Invoke-ReleaseGit remote get-url --push origin) -cne "https://github.com/$repo.git") { throw 'Unexpected push origin.' }
if ((Invoke-ReleaseGit rev-parse HEAD) -cne $checkpoint) { throw 'HEAD changed; review newer work before release preparation.' }
Assert-RemoteMain $checkpoint
if (@(Invoke-ReleaseGit diff --cached --name-only).Count) { throw 'Index is not empty. Preserve and review staged owner work.' }
Assert-NoTag
Assert-NoRelease
$files = @(Get-Content -Encoding UTF8 $manifest)
if ($files.Count -eq 0 -or @($files | Sort-Object -Unique).Count -ne $files.Count) { throw 'Invalid manifest.' }
foreach ($file in $files) {
    if (-not (Test-Path -LiteralPath $file -PathType Leaf)) { throw "Missing manifest file: $file" }
}
$changed = @((Invoke-ReleaseGit -c core.quotepath=false diff --name-only); (Invoke-ReleaseGit -c core.quotepath=false ls-files --others --exclude-standard))
if (($changed | Sort-Object) -join "`n" -cne (($files | Sort-Object) -join "`n")) {
    throw 'Working scope differs from the reviewed preparation manifest. Preserve and inspect newer changes.'
}
$version = Get-Content -Raw -Encoding UTF8 VERSION.json | ConvertFrom-Json
if ($version.version -ne '0.3.0' -or $version.status -ne 'unreleased' -or
    $version.release.state -ne 'prepared' -or $version.release.channel -ne 'prerelease' -or
    $version.release.tag -ne $tag -or $version.release.checkpoint_commit -ne $checkpoint) {
    throw 'Unexpected release-preparation metadata.'
}
npm.cmd run version:check
if ($LASTEXITCODE -ne 0) { throw 'Version check failed.' }
Invoke-ReleaseGit -c core.autocrlf=false diff --check
Invoke-ReleaseGit status --short --untracked-files=all
$files

# Phase 2: owner stages only this manifest, then reviews
if ((Read-Host 'Inspect the scope above. Type STAGE to stage it') -cne 'STAGE') { throw 'Stopped before staging.' }
Invoke-ReleaseGit --literal-pathspecs add "--pathspec-from-file=$manifest"
$staged = @(Invoke-ReleaseGit -c core.quotepath=false diff --cached --name-only)
if (($staged | Sort-Object) -join "`n" -cne (($files | Sort-Object) -join "`n")) { throw 'Staged scope mismatch.' }
Invoke-ReleaseGit -c core.autocrlf=false diff --cached --check
Invoke-ReleaseGit diff --cached --stat
Invoke-ReleaseGit --no-pager diff --cached

# Phase 3: owner commits after review, captures the actual SHA, pushes and verifies
if ((Read-Host 'Review the full staged diff. Type COMMIT to commit and push main') -cne 'COMMIT') { throw 'Stopped before commit.' }
if ((Invoke-ReleaseGit rev-parse HEAD) -cne $checkpoint) { throw 'HEAD changed during review.' }
Assert-RemoteMain $checkpoint
if (@(Invoke-ReleaseGit diff --name-only).Count -or @(Invoke-ReleaseGit ls-files --others --exclude-standard).Count) { throw 'Unstaged changes appeared; review again.' }
$staged = @(Invoke-ReleaseGit -c core.quotepath=false diff --cached --name-only)
if (($staged | Sort-Object) -join "`n" -cne (($files | Sort-Object) -join "`n")) { throw 'Staged scope changed.' }
Invoke-ReleaseGit commit -m 'chore: prepare CeliTrip v0.3.0 prerelease'
$releaseCommit = (Invoke-ReleaseGit rev-parse HEAD).Trim()
if ($releaseCommit -notmatch '^[0-9a-f]{40}$' -or (Invoke-ReleaseGit rev-parse "${releaseCommit}^") -cne $checkpoint) { throw 'Unexpected preparation commit ancestry.' }
if (@(Invoke-ReleaseGit status --porcelain --untracked-files=all).Count) { throw 'Working tree changed during commit; inspect before pushing.' }
Invoke-ReleaseGit push origin main
Assert-RemoteMain $releaseCommit
Write-Host "Release preparation commit: $releaseCommit"

# Phase 4: owner creates an annotated tag on that EXACT commit, pushes ONLY that tag
if ((Read-Host 'Type TAG to annotate and push v0.3.0 on the printed commit') -cne 'TAG') { throw 'Stopped before tagging.' }
Assert-RemoteMain $releaseCommit
Assert-NoTag
Assert-NoRelease
Invoke-ReleaseGit tag -a $tag $releaseCommit -m 'CeliTrip v0.3.0 development prerelease'
if ((Invoke-ReleaseGit cat-file -t "refs/tags/$tag") -ne 'tag' -or (Invoke-ReleaseGit rev-parse "refs/tags/$tag^{}") -cne $releaseCommit) { throw 'Local annotated tag verification failed.' }
Invoke-ReleaseGit push origin "refs/tags/${tag}:refs/tags/${tag}"
$remoteTag = @(Invoke-ReleaseGit ls-remote origin "refs/tags/$tag" "refs/tags/$tag^{}")
if ($remoteTag.Count -ne 2 -or $remoteTag -notcontains "$releaseCommit`trefs/tags/$tag^{}") { throw 'Remote annotated tag target mismatch.' }

# Phase 5: owner publishes the GitHub prerelease (not Latest)
if ((Read-Host 'Type PUBLISH to create the GitHub prerelease') -cne 'PUBLISH') { throw 'Stopped before publication.' }
Assert-NoRelease
if ((Invoke-ReleaseGit rev-parse HEAD) -cne $releaseCommit -or @(Invoke-ReleaseGit status --porcelain --untracked-files=all).Count) {
    throw 'Local files changed; ensure notes still match the tagged preparation commit.'
}
Invoke-ReleaseGh release create $tag --repo $repo --verify-tag --prerelease --latest=false --title 'CeliTrip v0.3.0' --notes-file $notes

# Phase 6: read-only verification of remote annotated tag AND GitHub publication
$remoteTag = @(Invoke-ReleaseGit ls-remote origin "refs/tags/$tag" "refs/tags/$tag^{}")
$tagObject = (Invoke-ReleaseGit rev-parse "refs/tags/$tag").Trim()
if ($remoteTag.Count -ne 2 -or $remoteTag -notcontains "$tagObject`trefs/tags/$tag" -or
    $remoteTag -notcontains "$releaseCommit`trefs/tags/$tag^{}") { throw 'Remote tag object/peeled target mismatch.' }
Assert-Access
$query = 'query($owner:String!,$repo:String!,$tag:String!){repository(owner:$owner,name:$repo){release(tagName:$tag){tagName isDraft isPrerelease isLatest publishedAt url tagCommit{oid}}}}'
$result = (Invoke-ReleaseGh api graphql -f "query=$query" -f owner=OzAvrahami -f repo=CeliTrip -f "tag=$tag") | ConvertFrom-Json
if ($result.errors) { throw 'GraphQL errors: publication is not verified.' }
$release = $result.data.repository.release
if ($null -eq $release -or $release.tagName -cne $tag -or $release.isDraft -ne $false -or
    $release.isPrerelease -ne $true -or $release.isLatest -ne $false -or
    $release.tagCommit.oid -cne $releaseCommit -or -not $release.publishedAt -or
    $release.url -cne "https://github.com/$repo/releases/tag/$tag") { throw 'Publication verification failed.' }
$null = [DateTimeOffset]::Parse($release.publishedAt)
$release | ConvertTo-Json -Depth 4
Write-Host "Verified annotated $tag -> $releaseCommit; published prerelease, non-draft, not Latest."
Write-Host 'Record these verified facts in a separate follow-up. Do not move the tag or auto-bump the version.'
```

## After verified publication

Keep this tagged preparation snapshot unchanged. In a separate owner-authorized recording task, set root `status` to `released`, current `release.state` to `published`, and record the verified `tag_commit`, `published_at` and `url`; retain channel `prerelease` and version 0.3.0. Synchronize displays and update the changelog/handoff using actual verification evidence. Preserve `release_history` and the historical v0.2.0 tag. Publication is not deployment, production readiness or approval of real content. Do not automatically begin another milestone/version.
