# Prepare and publish the v0.2.0 GitHub prerelease

**Prepared on:** 2026-10-01 · **GitHub publication:** not performed or confirmed

Read-only inspection found local main and remote main at accepted checkpoint `a5764706afb08e93e350e8774ccf37b352c1e0f4`, a clean working tree/index, no local/remote v0.2.0 tag and no GitHub releases. The owner made the checkpoint commit/push. Codex prepares and validates only; every Git mutation and GitHub publication command below is for the owner to execute manually. No deployment or Milestone 2 work is included.

## Scope and metadata

The [eight explicit preparation files](v0.2.0-files.txt) contain only release metadata, changelog/workflow/handoff updates, [English release notes](v0.2.0.md) and these commands. They exclude application code, fixtures, private environment files, database data, dependencies, generated build output and unrelated work. The historical 90-file checkpoint list must not be reused.

VERSION.json remains version **0.2.0**, with `status: "unreleased"` until publication is actually verified. Its new release object declares tag **v0.2.0**, channel **prerelease**, state **prepared**, preparation date and the accepted checkpoint SHA. The dated changelog section is explicitly preparation, not evidence of GitHub publication; Unreleased remains for future work. No 0.1.0 release is invented.

The tag must point to the **new release-preparation commit** containing these files, not the earlier checkpoint and not a moving branch name. Capture `$releaseCommit` immediately after committing and keep the same PowerShell session for all blocks. A remote-main advance, preexisting tag/release or failed command stops the sequence. Do not force-push, delete, edit or overwrite an existing tag/release. If a step fails after a partial success, inspect the actual state before continuing; do not rerun creation commands blindly.

The GitHub CLI documents `--verify-tag` as requiring an existing remote tag, `--prerelease` as selecting prerelease status, `--latest=false` as preventing latest promotion, and `--notes-file` as reading the supplied notes. This workflow also verifies the tag's exact peeled commit; tag existence alone is insufficient. [Official gh release create documentation](https://cli.github.com/manual/gh_release_create).

## 1a. Stage only these files and review — owner runs manually

```powershell
Set-Location -LiteralPath 'D:\code\CeliTrip'
$ErrorActionPreference = 'Stop'
$repo = 'OzAvrahami/CeliTrip'
$tag = 'v0.2.0'
$checkpoint = 'a5764706afb08e93e350e8774ccf37b352c1e0f4'
$notes = 'docs/releases/v0.2.0.md'
$releaseFiles = @(Get-Content -LiteralPath 'docs/releases/v0.2.0-files.txt')

function ctgit {
    & git -c safe.directory=D:/code/CeliTrip @args
    if ($LASTEXITCODE -ne 0) { throw 'Git command failed; stop and inspect.' }
}
function ctgh {
    & gh @args
    if ($LASTEXITCODE -ne 0) { throw 'GitHub CLI command failed; stop and inspect.' }
}
function Assert-NoRelease {
    $releaseTags = @(ctgh api "repos/$repo/releases" --paginate --jq '.[].tag_name')
    if ($releaseTags -contains $tag) { throw 'Release already exists; do not overwrite it.' }
}
function Assert-NoTag {
    if (@(ctgit tag --list $tag).Count) { throw 'Local tag already exists; stop.' }
    if (@(ctgit ls-remote --tags origin "refs/tags/$tag" "refs/tags/$tag^{}").Count) {
        throw 'Remote tag already exists; do not overwrite it.'
    }
}
function Remote-Main {
    $refs = @(ctgit ls-remote origin refs/heads/main)
    if ($refs.Count -ne 1) { throw 'Cannot determine remote main.' }
    ($refs[0] -split '\s+')[0]
}

if ((ctgit remote get-url origin) -ne 'https://github.com/OzAvrahami/CeliTrip.git') { throw 'Unexpected origin.' }
if ((ctgit branch --show-current) -ne 'main') { throw 'Expected main.' }
if ((ctgit rev-parse HEAD) -ne $checkpoint -or (Remote-Main) -ne $checkpoint) { throw 'Checkpoint state changed; review before proceeding.' }
ctgit --no-optional-locks diff --cached --quiet
Assert-NoTag
Assert-NoRelease
Get-Content -LiteralPath 'docs/releases/v0.2.0-files.txt'
foreach ($file in $releaseFiles) {
    if (!(Test-Path -LiteralPath $file -PathType Leaf)) { throw "Missing file: $file" }
}
npm.cmd run version:check
if ($LASTEXITCODE -ne 0) { throw 'Version check failed.' }
ctgit --literal-pathspecs add --pathspec-from-file=docs/releases/v0.2.0-files.txt
$staged = @(ctgit -c core.quotepath=false diff --cached --name-only)
if (Compare-Object ($releaseFiles | Sort-Object) ($staged | Sort-Object)) { throw 'Unexpected staged scope.' }
ctgit diff --cached --check
ctgit diff --cached --stat
ctgit diff --cached
```

## 1b. After reviewing the staged diff, commit and push — owner runs manually

```powershell
if ((ctgit rev-parse HEAD) -ne $checkpoint -or (Remote-Main) -ne $checkpoint) { throw 'Checkpoint state changed.' }
$staged = @(ctgit -c core.quotepath=false diff --cached --name-only)
if (Compare-Object ($releaseFiles | Sort-Object) ($staged | Sort-Object)) { throw 'Staged scope changed.' }
ctgit commit -m "chore: prepare v0.2.0 Milestone 1 prerelease"
$releaseCommit = ctgit rev-parse HEAD
if ((ctgit rev-parse "${releaseCommit}^") -ne $checkpoint) { throw 'Unexpected release commit parent.' }
Write-Output "Exact release commit: $releaseCommit"
ctgit -c push.followTags=false push --no-follow-tags origin "${releaseCommit}:refs/heads/main"
if ((Remote-Main) -ne $releaseCommit) { throw 'Remote main does not match the release commit.' }
```

## 2. Create and push one annotated tag on that exact commit

```powershell
if ($releaseCommit -notmatch '^[0-9a-f]{40}$') { throw 'Missing exact release commit; complete step 1b first.' }
Assert-NoTag
Assert-NoRelease
ctgit tag -a $tag $releaseCommit -m "CeliTrip v0.2.0 - accepted Milestone 1 development prerelease"
if ((ctgit cat-file -t "refs/tags/$tag") -ne 'tag') { throw 'Expected an annotated tag.' }
if ((ctgit rev-parse "${tag}^{commit}") -ne $releaseCommit) { throw 'Local tag target mismatch.' }
ctgit -c push.followTags=false push --no-follow-tags origin "refs/tags/${tag}:refs/tags/${tag}"

function Assert-RemoteTag {
    $tagRef = ctgh api "repos/$repo/git/ref/tags/$tag" | ConvertFrom-Json
    if ($tagRef.object.type -ne 'tag') { throw 'Remote tag is not annotated.' }
    if ($tagRef.object.sha -ne (ctgit rev-parse "refs/tags/$tag")) { throw 'Remote tag object mismatch.' }
    $tagObject = ctgh api "repos/$repo/git/tags/$($tagRef.object.sha)" | ConvertFrom-Json
    if ($tagObject.object.type -ne 'commit' -or $tagObject.object.sha -ne $releaseCommit) {
        throw 'Remote annotated tag does not point to the exact release commit.'
    }
}
Assert-RemoteTag
```

## 3. Create the GitHub prerelease from the verified tag

```powershell
Assert-RemoteTag
Assert-NoRelease
ctgit diff --exit-code $releaseCommit -- $notes
ctgh release create $tag --repo $repo --verify-tag --prerelease --latest=false --target $releaseCommit --title "CeliTrip v0.2.0 - Milestone 1 development prerelease" --notes-file $notes
```

`--verify-tag` prevents automatic tag creation. No release assets or generated binaries are uploaded. GitHub publication is separate from application hosting; this command does not deploy the application.

## 4. Verify the resulting tag target and published prerelease

```powershell
Assert-RemoteTag
$release = ctgh release view $tag --repo $repo --json tagName,isDraft,isPrerelease,publishedAt,url,targetCommitish | ConvertFrom-Json
if ($release.tagName -ne $tag -or $release.isDraft -or !$release.isPrerelease -or !$release.publishedAt) {
    throw 'GitHub release state did not match the requested published prerelease.'
}
$listed = ctgh release list --repo $repo --limit 100 --json tagName,isLatest | ConvertFrom-Json
$entry = @($listed | Where-Object { $_.tagName -eq $tag })
if ($entry.Count -ne 1 -or $entry[0].isLatest) { throw 'Release missing from listing or unexpectedly marked latest.' }
$release | Format-List
Write-Output "Verified annotated tag $tag -> $releaseCommit"
ctgit --no-optional-locks status --short
```

`targetCommitish` is displayed for context; the tag object's peeled SHA is the authoritative target verification. The bounded release listing is appropriate for this first prerelease and stops rather than assuming success if the entry is absent. Save the actual URL/publication time for a later metadata follow-up. Do not move the tag to that follow-up commit. This prepared snapshot remains `unreleased/prepared` until a later task records the verified publication; it does not pretend commands have already succeeded.

## Preparation validation and preservation

Version synchronization/checks, metadata invariants, notes/changelog/document links, UTF-8 and whitespace checks passed. All five PowerShell blocks parsed successfully without execution. The eight-file list matches the changed/untracked release-preparation scope. Version number and display status are unchanged, so the existing 0.2.0 display screenshots remain applicable. The original application tests and four-language browser matrix are reused; no application/database behavior changed and no database commands or reseeding were performed.

The prototype fingerprint remains `324c7a8aeac3adf0b00fad58e5085127e6a6d9a30b7114442ddf3141fa8fe3bd`. The preparation-time Git index fingerprint is `3024d2483581b9de9b667e2d0ec2f0443cce241815385d9516c15749b244f90d`. Neither Git mutation nor GitHub publication was executed by Codex. Translation, medical/card wording, real evidence/content and launch gates remain pending.
