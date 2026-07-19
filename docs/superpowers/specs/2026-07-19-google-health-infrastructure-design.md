# Open Health Studio Infrastructure Design

**Date:** 2026-07-19
**Status:** Approved

## Purpose

Establish the deployable foundation for Open Health Studio, a personal web UI
for viewing Google Health data. This milestone creates the Nuxt application,
quality gates, Firebase Hosting configuration, and automatic production
deployment. It deliberately excludes authentication, Google Health access,
charts, and health-data presentation.

The first release is for one allowlisted Google test user. This keeps the later
Google Health OAuth integration in testing mode while the product is personal.

## Decisions

- Use Nuxt 4, Vue 3, and TypeScript.
- Render as a client-side SPA and generate static files.
- Use npm with a committed lockfile and a pinned Node version.
- Host on the existing Firebase project used for Firebase Authentication.
- Verify pull requests but deploy only verified pushes to `main`.
- Deploy through GitHub Actions to the Firebase Hosting live channel.
- Authenticate deployments with GitHub OIDC and Google Workload Identity
  Federation, not a stored service-account key.
- Keep Google Health access fully client-side in the first functional release.
  Health access tokens will remain in memory and require reconnection after
  expiry rather than using refresh tokens.

## Scope

### Included

- Nuxt application scaffold with a minimal landing page
- TypeScript and Nuxt type checking
- ESLint
- Unit-test runner and a scaffold smoke test
- Static generation
- Firebase Hosting configuration and SPA rewrites
- Baseline HTTP security and caching headers
- GitHub Actions verification and production deployment
- Dependabot configuration for npm and GitHub Actions
- Documentation for local development and one-time cloud setup

### Excluded

- Firebase Authentication and route protection
- Google Identity Services and Google Health OAuth consent
- Google Health REST API requests
- Persistent access or refresh tokens
- Charting and dashboard UI
- Health-data storage
- Pull-request preview deployments
- Server-side rendering, Cloud Functions, and Cloud Run
- Google restricted-scope production verification

## Repository Structure

The repository will follow the Nuxt 4 application layout:

```text
openhealthstudio/
|-- .github/
|   |-- dependabot.yml
|   `-- workflows/
|       `-- ci.yml
|-- app/
|   |-- app.vue
|   `-- pages/
|       `-- index.vue
|-- tests/
|   `-- app.test.ts
|-- .firebaserc
|-- .gitignore
|-- .node-version
|-- eslint.config.mjs
|-- firebase.json
|-- nuxt.config.ts
|-- package-lock.json
|-- package.json
|-- README.md
`-- tsconfig.json
```

Nuxt-generated directories, Firebase local state, environment files, and test
artifacts will be ignored.

## Application Foundation

Nuxt will use client-side rendering and static generation. `npm run generate`
will produce the deployable site in `.output/public`. The initial page will be
intentionally minimal and will prove only that routing, styling, generation,
and hosting work.

The package scripts will expose stable interfaces for contributors and CI:

- `dev`: run the Nuxt development server
- `generate`: generate the static production site
- `preview`: preview the generated application
- `lint`: run ESLint
- `typecheck`: run Nuxt type checking
- `test`: run unit tests once

No charting or component framework will be selected in this milestone because
the dashboard design has not yet been specified.

## Firebase Hosting

Firebase Hosting will publish `.output/public` to the existing Firebase
project. Unmatched paths will rewrite to `/index.html` so direct navigation and
browser refreshes work for future client-side routes.

Hosting will set these baseline controls:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- a frame restriction that prevents embedding by other origins
- a restrictive `Permissions-Policy` for capabilities the application does not
  use
- fresh validation for HTML
- long-lived immutable caching for fingerprinted static assets

A Content Security Policy will be introduced with the authentication milestone.
Deferring it avoids guessing the required Firebase Authentication, Google
Identity Services, and Google Health endpoint allowlists.

The Firebase project ID is configuration, not a secret, and may be committed in
`.firebaserc`. Firebase web configuration used in the later authentication
milestone is also public application configuration; secrets and privileged
credentials must never be exposed through Nuxt public runtime configuration.

## Continuous Integration and Deployment

A single GitHub Actions workflow will trigger on pull requests and pushes to
`main`.

### Verification job

The verification job will:

1. Check out the exact revision.
2. Install the pinned Node version with npm caching.
3. Run `npm ci`.
4. Run linting.
5. Run Nuxt type checking.
6. Run unit tests.
7. Generate the static application.
8. Upload `.output/public` as a short-lived workflow artifact for the deploy
   job.

Every command must return a non-zero status on failure. A failed verification
job blocks deployment.

### Deployment job

The deployment job will:

1. Run only for a push to `main`.
2. Depend on the successful verification job.
3. Target the GitHub `production` environment.
4. Download the exact generated artifact from the verification job.
5. Request a short-lived GitHub OIDC token.
6. Exchange it through Google Workload Identity Federation.
7. Impersonate the dedicated Firebase deployment service account.
8. Deploy only Firebase Hosting to the live channel.

Workflow concurrency will be grouped by workflow and branch, with superseded
runs cancelled. This prevents an older queued run from deploying after a newer
commit.

### Cloud identity setup

One-time setup will create:

- a Google Workload Identity Pool and GitHub OIDC provider restricted to the
  `NdoleStudio/openhealthstudio` repository
- a dedicated deployment service account
- permission for the repository identity to impersonate that service account
- only the Firebase Hosting and service-usage permissions needed to deploy

GitHub repository variables will contain:

- `FIREBASE_PROJECT_ID`
- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_DEPLOY_SERVICE_ACCOUNT`

These values identify resources and are not credentials. The workflow will
request only `contents: read` and `id-token: write`; all unspecified GitHub
token permissions remain disabled.

## Dependency Maintenance

Dependabot will check npm dependencies and GitHub Actions weekly. Updates remain
subject to the same lint, type-check, test, and generation gates as application
changes. Action references will use stable major releases, while the npm
lockfile provides reproducible dependency resolution.

## Error Handling and Recovery

- Installation, validation, generation, authentication, and deployment errors
  fail the workflow visibly.
- Deployment does not retry by publishing an unverified or locally rebuilt
  artifact.
- Firebase Hosting retains prior releases, allowing an operator to roll back
  from the Firebase console if a verified release has an operational defect.
- OIDC credentials expire automatically and are requested independently for
  each deployment.
- No workflow output may print identity tokens, Firebase credentials, future
  Google Health tokens, or personal health data.

## Testing Strategy

The scaffold smoke test will mount the initial application and verify that its
primary content renders. Static generation serves as the integration check for
Nuxt configuration and route generation. CI performs the complete quality
sequence on both pull requests and `main`.

The infrastructure milestone does not require browser end-to-end tests because
there is no interactive behavior. Authentication and dashboard milestones will
add tests at their own boundaries.

## Future Authentication and Health API Boundary

Firebase Authentication will later protect application routes and establish who
may use the UI. It does not authorize Google Health API access.

Google Health access will use a separate Google Identity Services consent flow
for the minimum read-only health scopes. The Google Health API accepts
cross-origin browser requests. For the backend-free personal v1, the
approximately one-hour access token will be held only in memory and discarded
on refresh, sign-out, or expiry. The UI will then require the user to reconnect.
No client secret or refresh token will be shipped to or persisted by the
browser.

If background synchronization, silent renewal, or multi-user production access
is later required, that capability must be designed as a separate backend
milestone with encrypted token storage and Google restricted-scope review.

## Documentation

The README will document:

- supported Node and npm versions
- local install, development, testing, generation, and preview commands
- Firebase project association
- local Firebase Hosting preview
- one-time Workload Identity Federation and IAM setup
- required GitHub repository variables
- pull-request verification and `main` deployment behavior
- rollback location and basic deployment troubleshooting

## Acceptance Criteria

The infrastructure milestone is complete when:

1. A clean checkout installs reproducibly with `npm ci`.
2. Linting, Nuxt type checking, unit tests, and static generation pass locally.
3. The generated output contains the initial application and no credentials.
4. Firebase Hosting serves the generated application over HTTPS.
5. Direct navigation and refresh of a client-side route return the application.
6. Pull requests run every verification gate and never deploy.
7. A verified push to `main` automatically deploys the exact CI artifact to the
   Firebase live channel.
8. Deployment uses short-lived OIDC credentials and no persistent cloud key is
   stored in GitHub.
9. A failed verification prevents deployment and reports the failing command.

