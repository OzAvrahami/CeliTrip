# Milestone 2 — local editorial implementation and validation

**Follow-up:** The owner-authorized administration expansion has separate [2026-10-02 validation evidence](ADMINISTRATION_VALIDATION.md). The results below remain the historical baseline; they do not claim that every old browser check was rerun against the new layout.

**Date:** 2026-10-01. **Owner acceptance:** pending. **Current product:** 0.2.0, published GitHub prerelease. **Proposed grouping:** 0.3.0 minor; no bump or release performed.

## Implemented boundary

The existing Next.js App Router application now supports sign-in → mandatory TOTP → fictional Rome branch/content/claim/source/observation/translation editing → exact revision review → private preview → local publication → public evidence → withdrawal. CSS Modules reuse the blue design and local fonts. Hebrew, English, French and Russian interface dictionaries and localized routes preserve RTL/LTR and branch context. The standalone prototype remains a design reference, unchanged by Milestone 2.

Better Auth 1.7.7 uses PostgreSQL sessions and encrypted TOTP/recovery data. Public signup, trusted-device bypass and self-service MFA disabling are unavailable. Each editorial service checks a live session, its completed TOTP marker (or the narrowly scoped owner-demo password exception documented below) and explicit role/scope/locale grants; administrators do not implicitly become reviewers or publishers. Cookie caching is disabled. The loopback HTTP preview uses HttpOnly/SameSite=Lax cookies, canonical-origin checks, bounded requests and persisted authentication throttling. No public deployment configuration is enabled.

## Owner password-only walkthrough follow-up — 2026-10-01

Explicitly requested by the owner, default-off `CELITRIP_LOCAL_DEMO_PASSWORD_ONLY` permits only `owner-demo@demo.invalid` after successful password authentication in the guarded fictional environment and canonical loopback request. The ignored owner configuration now sets it to `1`; checked-in `.env.example` sets `0`. A separate `session.localDemoPassword` column records the authentication path without fabricating `mfaVerified`. A narrow server-side matcher wraps the installed Better Auth 1.7.7 two-factor sign-in hook; password validation, cookies, throttling and the remaining plugin endpoints stay unchanged. Implementation was checked against installed source and official [two-factor](https://better-auth.com/docs/plugins/2fa) and [plugin hook](https://better-auth.com/docs/concepts/plugins#hooks) documentation. Recheck the wrapper when upgrading Better Auth.

New focused evidence:

* `npm.cmd test`: **23 passed, 0 failed** with real PostgreSQL, including the existing Milestone 1/Milestone 2 regression groups and new policy/integration groups. Repeated with the local option enabled so normal other-account MFA was exercised in that configuration.
* Successful password-only login both before and after actual test TOTP enrollment; wrong-password rejection; truthful MFA=false/demo-password=true state; unchanged enrolled secret/recovery row and user enrollment; disabled-flag denial of an existing session; normal challenge after disabling; backup-code recovery cannot mint the password marker.
* Revoked/expired sessions, wrong branch, wrong locale, missing publisher/editor grants, missing request context, external hosts/origins/forwarding, unapproved DB/mode, cloud markers and external app URLs all deny the exception. Policy tests explicitly distinguish a guarded optimized local build from hosted production operation; `NODE_ENV` alone never enables it.
* `scripts/validate-demo-auth-http.js`: passed against the optimized preview using only `celitrip_editorial_test`. Verified actual HTTP password/origin/Host checks, separate session marker, scoped reads/mutations, forwarded external-client denial, all four localized editorial pages, MFA-to-dashboard redirect and session revocation. The initial test harness used Node fetch, which normalized Host; it was corrected to send the hostile Host with `node:http`. It also now accepts Next's valid streamed redirect as well as a 307. These were harness corrections, not relaxed authorization.
* Optimized build, ESLint and version consistency passed. The additive migration was applied to the owner DB without reset/reseed. Before/after in-memory SHA-256 comparisons of complete user/account/TOTP/grant/content/publication rows matched: **1 account, 1 authenticator row, 7 grants, 6 content revisions, 4 publication pointers** preserved. No credentials or recovery material were written to reports.
* Chrome was closed; it was reopened for the requested sign-in page. Checked the new notice through Hebrew, French, Russian and English language switching, inspected the English desktop screenshot, and found no console warnings/errors. An initial automation loop used the old English selector label after switching to Hebrew; using each observed localized label completed the checks. The running preview is restored to `celitrip_dev`, English sign-in open. The owner's actual password was not requested or used; owner sign-in/acceptance remains for the owner.

The full prior editorial browser journey and unchanged public/prototype screenshots below remain historical evidence, not reruns of this exception. Owner acceptance remains pending. Disable the exception by setting the flag to `0` and restarting the preview; see [local setup](../development/LOCAL_DEVELOPMENT.md#optional-password-only-owner-walkthrough). Version remains published prerelease 0.2.0; this follow-up is Unreleased work in the proposed 0.3.0 grouping.

Operator CLI creation, role replacement, recovery and revocation are audited. Recovery revokes sessions and requires TOTP reenrollment. A backup code alone yields a restricted session without editorial access. Account setup is documented in [LOCAL_DEVELOPMENT.md](../development/LOCAL_DEVELOPMENT.md); secrets and enrollment material are absent from evidence files.

Additive migrations preserve the Milestone 1 tables and fixtures. `editorial_revision` seals an immutable content/claim/source/translation snapshot, with parent revision and actor. `editorial_head` tracks the current workflow/cycle. Reviews bind that exact revision/cycle, actor and locale. New saves require fresh reviews; returns increment the review cycle. Publication locks the branch and atomically switches the publication pointer after subject and all four language gates, checking current reviewer grants. Withdrawal deletes the pointer and records its reason. The legacy immutable `content_revision.status` is not the new workflow authority: approved editorial snapshots remain immutable and become public only through the guarded pointer. Public queries have no draft switch and remain uncached.

Corrections are bounded to 2,000 characters, optionally accept a private contact email, validate branch/claim/public-revision relationships, use a honeypot and a persisted local throttle (8 submissions per 10 minutes). Receipt responses contain only the stored receipt ID. The private queue lists up to 100 recent submissions; triage/resolution requires an editor and records an audit rationale. Submitted URLs are never fetched. Corrections cannot edit or publish.

## New executed evidence

| Check | Actual result |
| --- | --- |
| `npm.cmd test` | **20 passed, 0 failed**, using real PostgreSQL: existing Milestone 1 tests plus nine editorial integration groups. |
| Migration preservation | Additive up applied to `celitrip_dev`; no owner reseed/reset. Repeat-up and down/up exercised only in disposable tests. |
| Authentication | Disabled signup, foreign origin denial, password-only/enrollment-session denial, TOTP, wrong code, scoped roles/locales, login throttling, recovery and session revocation passed. |
| Exact revisions | Private persistence, immutable/sealed children, actual concurrent saves, stale revision rejection, approval invalidation and return cycles passed. |
| Publication | Subject/four-language gates, current reviewer grants, public draft exclusion, withdrawal and audit passed. A deliberately failing audit trigger in the disposable DB proved the publication pointer/state rolls back atomically. |
| Evidence | Wrong branch/source/chain identity rejected; chain scope stays explicit; historical/conflicting/unknown dimensions coexist; expired sources require needs-review; source history/null dates retained. Proposed editorial intervals are not implemented. |
| Corrections | Persistence, private contact exclusion, honeypot/reference validation, throttling, stale triage rejection and inability to publish passed. |
| Actual HTTP requests | `scripts/validate-editorial-http.js` passed **22 assertions** against the optimized test preview: signup/origin/MFA, scope/role/locale denials, revocation and anonymous correction persistence/privacy. |
| Restart persistence | `docker compose restart postgres` preserved the browser-created head, audit and withdrawal state. Owner DB remained at **6 content revisions, 4 publications, 0 accounts**. See sanitized [workflow record](qa/milestone-2/workflow-record.json). |
| Build/lint/version | Final optimized build, ESLint and `npm.cmd run version:check` passed. Package/lock remain 0.2.0; publication metadata and generated badge remain consistent. |
| Documentation/files | UTF-8, relative links, whitespace and explicit staging scope checked; see the [check summary and source fingerprints](qa/milestone-2/check-summary.json). Git's normal CRLF conversion notices are informational; `git diff --check` passed. |

Tests use `celitrip_test` and `celitrip_editorial_test`, separate from the owner DB. Editorial tests recreate only the disposable editorial schema. The browser demonstration was recorded before the final test rerun; its temporary identities/records were subsequently replaced by that explicit disposable reset. Saved artifacts are historical evidence of that executed local workflow, not live owner content.

### Chrome

[Browser observations](qa/milestone-2/browser-checks.json) record actual URLs, language/direction, headings and measured widths. The main fictional journey covered password sign-in, TOTP enrollment, branch/source creation, private save, subject review, a rejected publication missing Russian review, all four synthetic language reviews, preview, successful local publication, public evidence, private correction triage/resolution, a new unpublished draft, a two-tab stale-edit conflict and reasoned withdrawal. The newer draft text was absent from the public page; the withdrawn public branch returned not-found.

Public evidence and editorial preview were checked in all four languages at **1440 × 1000** and **390 × 844**, with no horizontal overflow. Two attempted desktop resizes left an existing background tab at mobile width; those observations are explicitly labeled as such and were replaced with measured 1440-pixel checks in a dedicated tab. The final optimized-build sign-in/TOTP/logout checks used the browser's restored normal width. Logout/back/direct-entry checks exposed no editorial data. Final checked-tab console logs contained no warnings/errors.

The focused Milestone 1 regression covered Rome → bakery-filtered list → Forno branch → evidence, all four evidence interface languages with the branch/filter context preserved, and mobile back navigation/empty-result recovery. Existing broader Milestone 1 and prototype reports remain historical evidence for unchanged behavior; they are not relabeled as rerun.

Selected screenshots were opened and visually inspected:

* [English private preview, desktop](qa/milestone-2/preview-en-desktop.png)
* [Hebrew editorial preview, desktop](qa/milestone-2/editorial-he-desktop.png) and [mobile](qa/milestone-2/editorial-he-mobile.png)
* [Russian editorial preview, mobile](qa/milestone-2/editorial-ru-mobile.png)
* [Hebrew public evidence, desktop](qa/milestone-2/public-evidence-he-desktop.png) and [mobile](qa/milestone-2/public-evidence-he-mobile.png)
* [Russian public evidence, mobile](qa/milestone-2/public-evidence-ru-mobile.png)
* [Review gates and revision comparison after withdrawal](qa/milestone-2/withdrawn-review-desktop.png)

An initial Next.js wrapped-request adapter error caused sign-in to fail; it was fixed and sign-in/MFA rerun successfully. A browser-command timeout while opening the filtered branch was retried after inspecting the page and passed. Negative tests intentionally log rejected origins/passwords; those are expected assertions, not unexplained runtime failures. The final small chain-identity guard and logout navigation changes received focused PostgreSQL and optimized HTTP/Chrome checks; unchanged four-language screenshots were reused rather than claimed as recaptured after every edit. No required check remains blocked by unavailable PostgreSQL or Chrome.

## Preservation and pending work

The 20 pre-existing publication-recording files were copied to an external local comparison snapshot before editing. Fifteen remain byte-for-byte unchanged from that baseline. Five also contain Milestone 2 work: changelog, local setup, handoff, technical discovery and application layout. The [reviewed file scope](../development/MILESTONE_2_CHECKPOINT.md) separates these groups from Milestone 2-only files.

The Git index SHA-256 remains `9e1d87b329854b2ac6a457e3a3b4a897005284af3b92299dc183b6747520718f`. The standalone prototype remains `a5dfb6fcd0f83b64c2917bf4a89f6b879f973127a10e74f0d448ec8cee80b241`. `VERSION.json` and the published v0.2.0 tag/release were not changed. No staging, commit, tag, push, publication, deployment or cloud provisioning was executed.

This is a local fictional implementation. All recorded reviews/identities are explicitly synthetic. Real authority assignments, publication/conflict/translation policies, correction retention/response policy, translation and medical/card wording approval, real evidence/content and launch readiness remain pending. No 14/90/180-day review intervals were activated. Owner acceptance of Milestone 2 is pending. Maps, hotel/hub expansion, cards/offline and cloud operations remain later milestones. Accessibility received focused keyboard/label/layout checks, not a full assistive-technology audit; external security review and production recovery/hosting remain launch work.

## Open and reproduce

The delivered optimized preview runs against the preserved **celitrip_dev** database at **http://127.0.0.1:3000/en/editor/sign-in**. The Rome page remains **http://127.0.0.1:3000/en/destinations/italy/rome**. No owner account was generated automatically; use the secure operator setup and walkthrough in [LOCAL_DEVELOPMENT.md](../development/LOCAL_DEVELOPMENT.md). The local environment secret was appended only if absent; existing environment values were preserved.

Official documentation consulted for the pinned integration: [Better Auth Next.js](https://better-auth.com/docs/integrations/next), [TOTP and recovery](https://better-auth.com/docs/plugins/2fa), [email/password](https://better-auth.com/docs/authentication/email-password), and [rate limiting](https://better-auth.com/docs/concepts/rate-limit). The auth migration was generated from the installed 1.7.7 schema and reviewed; no provider was provisioned.
