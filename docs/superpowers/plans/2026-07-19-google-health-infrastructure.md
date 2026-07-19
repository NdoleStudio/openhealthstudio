# Open Health Studio Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a reproducible Nuxt 4 static SPA foundation with automated quality gates and keyless Firebase Hosting deployment from `main`.

**Architecture:** Nuxt generates a client-only application into `.output/public`, which Firebase Hosting serves with SPA rewrites, security headers, and explicit cache rules. GitHub Actions verifies every pull request and `main` push, then deploys the verified artifact from `main` by exchanging GitHub OIDC credentials through Google Workload Identity Federation.

**Tech Stack:** Node.js 24.16.0, npm 11.13.0, Nuxt 4.5.0, Vue 3.5.40, TypeScript 5.9.3, ESLint 10.7.0, Vitest 4.1.10, Firebase CLI 15.24.0, Firebase Hosting, GitHub Actions, Google Workload Identity Federation

## Global Constraints

- Use Nuxt 4, Vue 3, and TypeScript.
- Render as a client-side SPA and generate static files.
- Use npm with a committed lockfile and Node.js 24.16.0.
- Use the existing Firebase project `openhealthstudio`.
- Verify pull requests but deploy only verified pushes to `main`.
- Deploy only the Firebase Hosting live channel.
- Use GitHub OIDC and Google Workload Identity Federation; never create or store a service-account JSON key.
- Do not add Firebase Authentication, Google Health OAuth, API requests, charts, health-data storage, SSR, Cloud Functions, Cloud Run, or preview deployments.
- Do not persist or log credentials, identity tokens, health tokens, or personal data.

## File Map

- `package.json`: supported runtime, pinned dependencies, and stable local/CI commands.
- `package-lock.json`: reproducible npm dependency graph.
- `.node-version`: shared Node.js version for local tools and CI.
- `.gitignore`: generated files, local state, environment files, and generated OIDC credential files.
- `nuxt.config.ts`: client-only Nuxt configuration and ESLint module registration.
- `tsconfig.json`: Nuxt-generated TypeScript configuration inheritance.
- `eslint.config.mjs`: Nuxt-aware flat ESLint configuration.
- `vitest.config.ts`: Nuxt test environment configuration.
- `app/app.vue`: application root and page outlet.
- `app/pages/index.vue`: minimal infrastructure-ready landing page.
- `tests/app.test.ts`: rendering smoke test.
- `.firebaserc`: association with Firebase project `openhealthstudio`.
- `firebase.json`: hosting output, SPA rewrite, cache policy, and security headers.
- `tests/firebase-config.test.ts`: executable Firebase Hosting policy checks.
- `.github/workflows/ci.yml`: verification, artifact transfer, OIDC authentication, and live deployment.
- `.github/dependabot.yml`: weekly npm and GitHub Actions dependency updates.
- `tests/ci-config.test.ts`: workflow and Dependabot policy checks.
- `README.md`: local workflow, cloud provisioning, GitHub configuration, deployment, rollback, and troubleshooting.
- `tests/readme.test.ts`: required operational documentation checks.

---

### Task 1: Nuxt Application and Quality Foundation

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `.node-version`
- Create: `.gitignore`
- Create: `nuxt.config.ts`
- Create: `tsconfig.json`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `tests/app.test.ts`
- Create: `app/app.vue`
- Create: `app/pages/index.vue`

**Interfaces:**
- Consumes: Node.js 24.16.0 and npm 11.13.0.
- Produces: npm scripts `dev`, `generate`, `preview`, `lint`, `typecheck`, `test`, and `postinstall`; generated site directory `.output/public`; page heading `Open Health Studio`; status text `Infrastructure ready`.

- [ ] **Step 1: Define the pinned npm project**

Create `package.json`:

```json
{
  "name": "openhealthstudio",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "packageManager": "npm@11.13.0",
  "engines": {
    "node": ">=24.11.0 <25"
  },
  "scripts": {
    "dev": "nuxt dev",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "lint": "eslint .",
    "typecheck": "nuxt typecheck",
    "test": "vitest run",
    "postinstall": "nuxt prepare"
  },
  "dependencies": {
    "nuxt": "4.5.0",
    "vue": "3.5.40",
    "vue-router": "4.6.4"
  },
  "devDependencies": {
    "@nuxt/eslint": "1.16.0",
    "@nuxt/test-utils": "4.0.3",
    "@types/node": "26.1.1",
    "@vue/test-utils": "2.4.11",
    "eslint": "10.7.0",
    "happy-dom": "20.11.0",
    "typescript": "5.9.3",
    "vitest": "4.1.10",
    "vue-tsc": "3.3.7"
  }
}
```

Create `.node-version`:

```text
24.16.0
```

Create `.gitignore`:

```gitignore
node_modules/
.nuxt/
.output/
.data/
.firebase/
coverage/

.env
.env.*
!.env.example

firebase-debug.log*
gha-creds-*.json

.DS_Store
Thumbs.db
```

- [ ] **Step 2: Add the Nuxt, TypeScript, lint, and test configuration**

Create `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  compatibilityDate: '2026-07-19',
  modules: ['@nuxt/eslint'],
  ssr: false,
  typescript: {
    typeCheck: true,
  },
})
```

Create `tsconfig.json`:

```json
{
  "extends": "./.nuxt/tsconfig.json"
}
```

Create `eslint.config.mjs`:

```js
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt()
```

Create `vitest.config.ts`:

```ts
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
  },
})
```

- [ ] **Step 3: Install the exact dependency graph**

Run:

```powershell
npm install
```

Expected: npm creates `package-lock.json`, runs `nuxt prepare`, and exits with code 0.

- [ ] **Step 4: Write the failing application smoke test**

Create `tests/app.test.ts`:

```ts
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import IndexPage from '../app/pages/index.vue'

describe('Open Health Studio', () => {
  it('renders the infrastructure-ready landing page', async () => {
    const wrapper = await mountSuspended(IndexPage)

    expect(wrapper.get('h1').text()).toBe('Open Health Studio')
    expect(wrapper.get('[data-testid="status"]').text()).toBe('Infrastructure ready')
  })
})
```

- [ ] **Step 5: Run the smoke test to verify it fails**

Run:

```powershell
npm test -- tests/app.test.ts
```

Expected: FAIL because `app/pages/index.vue` does not exist.

- [ ] **Step 6: Implement the minimal Nuxt application**

Create `app/app.vue`:

```vue
<template>
  <NuxtPage />
</template>
```

Create `app/pages/index.vue`:

```vue
<template>
  <main class="shell">
    <section class="card">
      <p class="eyebrow">
        Personal health dashboard
      </p>
      <h1>Open Health Studio</h1>
      <p data-testid="status">
        Infrastructure ready
      </p>
    </section>
  </main>
</template>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  color: #17211b;
  background: #eef5ef;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}

.shell {
  display: grid;
  min-height: 100vh;
  padding: 2rem;
  place-items: center;
}

.card {
  width: min(100%, 42rem);
  padding: clamp(2rem, 8vw, 5rem);
  border: 1px solid #c9d9cd;
  border-radius: 1.5rem;
  background: #fff;
  box-shadow: 0 1.5rem 4rem rgb(23 33 27 / 10%);
}

.eyebrow {
  color: #38704d;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1 {
  margin: 0.5rem 0 1rem;
  font-size: clamp(2.5rem, 9vw, 5rem);
  letter-spacing: -0.05em;
  line-height: 0.95;
}
```

- [ ] **Step 7: Run all application quality gates**

Run:

```powershell
npm test -- tests/app.test.ts
npm run lint
npm run typecheck
npm run generate
Test-Path .output\public\index.html
```

Expected: the test, lint, type check, and generation commands pass; `Test-Path` prints `True`.

- [ ] **Step 8: Commit the application foundation**

Run:

```powershell
git add package.json package-lock.json .node-version .gitignore nuxt.config.ts tsconfig.json eslint.config.mjs vitest.config.ts app tests/app.test.ts
git commit -m "feat: scaffold Nuxt application"
```

Expected: one commit containing only the Nuxt application and its quality foundation.

---

### Task 2: Firebase Hosting Policy

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `tests/firebase-config.test.ts`
- Create: `.firebaserc`
- Create: `firebase.json`

**Interfaces:**
- Consumes: generated directory `.output/public` and npm script `generate` from Task 1.
- Produces: Firebase project alias `default -> openhealthstudio`; npm script `hosting:serve`; SPA fallback to `/index.html`; immutable static-asset caching; non-cached HTML; baseline security headers.

- [ ] **Step 1: Add the pinned Firebase CLI and local hosting command**

Run:

```powershell
npm install --save-dev --save-exact firebase-tools@15.24.0
npm pkg set "scripts.hosting:serve=npm run generate && firebase emulators:start --only hosting --project openhealthstudio"
```

Expected: `package.json` and `package-lock.json` include Firebase CLI 15.24.0, and `npm run hosting:serve` is available.

- [ ] **Step 2: Write the failing Firebase policy test**

Create `tests/firebase-config.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

type Header = {
  key: string
  value: string
}

type HeaderRule = {
  source: string
  headers: Header[]
}

type FirebaseConfig = {
  hosting: {
    public: string
    rewrites: Array<{ source: string, destination: string }>
    headers: HeaderRule[]
  }
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), 'utf8')) as T
}

describe('Firebase Hosting configuration', () => {
  it('targets the existing Firebase project', () => {
    const config = readJson<{ projects: { default: string } }>('.firebaserc')

    expect(config.projects.default).toBe('openhealthstudio')
  })

  it('serves the generated SPA with a route fallback', () => {
    const config = readJson<FirebaseConfig>('firebase.json')

    expect(config.hosting.public).toBe('.output/public')
    expect(config.hosting.rewrites).toContainEqual({
      source: '**',
      destination: '/index.html',
    })
  })

  it('sets security and cache headers', () => {
    const config = readJson<FirebaseConfig>('firebase.json')
    const allHeaders = config.hosting.headers.flatMap(rule => rule.headers)

    expect(allHeaders).toContainEqual({
      key: 'X-Content-Type-Options',
      value: 'nosniff',
    })
    expect(allHeaders).toContainEqual({
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
    })
    expect(allHeaders).toContainEqual({
      key: 'X-Frame-Options',
      value: 'DENY',
    })
    expect(config.hosting.headers).toContainEqual(expect.objectContaining({
      source: '/index.html',
      headers: expect.arrayContaining([
        {
          key: 'Cache-Control',
          value: 'public, max-age=0, must-revalidate',
        },
      ]),
    }))
    expect(config.hosting.headers).toContainEqual(expect.objectContaining({
      source: '/_nuxt/**',
      headers: expect.arrayContaining([
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ]),
    }))
  })
})
```

- [ ] **Step 3: Run the Firebase policy test to verify it fails**

Run:

```powershell
npm test -- tests/firebase-config.test.ts
```

Expected: FAIL because `.firebaserc` and `firebase.json` do not exist.

- [ ] **Step 4: Implement the Firebase project and Hosting configuration**

Create `.firebaserc`:

```json
{
  "projects": {
    "default": "openhealthstudio"
  }
}
```

Create `firebase.json`:

```json
{
  "hosting": {
    "public": ".output/public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "Referrer-Policy",
            "value": "strict-origin-when-cross-origin"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "Permissions-Policy",
            "value": "camera=(), geolocation=(), microphone=()"
          }
        ]
      },
      {
        "source": "/index.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=0, must-revalidate"
          }
        ]
      },
      {
        "source": "/_nuxt/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 5: Verify Firebase policy and local generation**

Run:

```powershell
npm test -- tests/firebase-config.test.ts
npm run generate
npx firebase-tools --version
```

Expected: the Firebase policy tests pass, generation succeeds, and the CLI prints `15.24.0`.

- [ ] **Step 6: Commit the Hosting policy**

Run:

```powershell
git add package.json package-lock.json tests/firebase-config.test.ts .firebaserc firebase.json
git commit -m "feat: configure Firebase Hosting"
```

Expected: one commit containing Firebase Hosting behavior and its executable policy tests.

---

### Task 3: GitHub Verification and Keyless Deployment Workflow

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `tests/ci-config.test.ts`
- Create: `.github/workflows/ci.yml`
- Create: `.github/dependabot.yml`

**Interfaces:**
- Consumes: all npm quality scripts, `.output/public`, `firebase.json`, and Firebase CLI from Tasks 1 and 2.
- Produces: workflow artifact `static-site`; repository-variable inputs `FIREBASE_PROJECT_ID`, `GCP_WORKLOAD_IDENTITY_PROVIDER`, `GCP_DEPLOY_SERVICE_ACCOUNT`; GitHub environment `production`.

- [ ] **Step 1: Add YAML parsing for workflow policy tests**

Run:

```powershell
npm install --save-dev --save-exact yaml@2.9.0
```

Expected: `package.json` and `package-lock.json` include YAML 2.9.0.

- [ ] **Step 2: Write the failing CI policy test**

Create `tests/ci-config.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parse } from 'yaml'

function readYaml(path: string): Record<string, unknown> {
  const source = readFileSync(resolve(process.cwd(), path), 'utf8')
  return parse(source) as Record<string, unknown>
}

describe('GitHub automation configuration', () => {
  it('verifies pull requests and main pushes', () => {
    const workflow = readYaml('.github/workflows/ci.yml')
    const source = readFileSync(
      resolve(process.cwd(), '.github/workflows/ci.yml'),
      'utf8',
    )

    expect(workflow).toMatchObject({
      name: 'CI',
      on: {
        pull_request: null,
        push: {
          branches: ['main'],
        },
      },
      permissions: {
        contents: 'read',
      },
    })
    expect(workflow).toHaveProperty('jobs.verify')
    for (const command of [
      'npm ci',
      'npm run lint',
      'npm run typecheck',
      'npm test',
      'npm run generate',
    ]) {
      expect(source).toContain(command)
    }
  })

  it('deploys only after verification on main with OIDC', () => {
    const workflow = readYaml('.github/workflows/ci.yml')
    const source = readFileSync(
      resolve(process.cwd(), '.github/workflows/ci.yml'),
      'utf8',
    )

    expect(workflow).toHaveProperty('jobs.deploy.needs', 'verify')
    expect(workflow).toHaveProperty('jobs.deploy.environment', 'production')
    expect(workflow).toHaveProperty('jobs.deploy.permissions.id-token', 'write')
    expect(source).toContain("if: github.event_name == 'push' && github.ref == 'refs/heads/main'")
    expect(source).toContain('google-github-actions/auth@v3')
    expect(source).toContain('firebase deploy --only hosting')
    expect(source.match(/name: static-site/g)).toHaveLength(2)
  })

  it('checks npm and GitHub Actions dependencies weekly', () => {
    const dependabot = readYaml('.github/dependabot.yml')

    expect(dependabot).toMatchObject({
      version: 2,
      updates: [
        {
          'package-ecosystem': 'npm',
          directory: '/',
          schedule: { interval: 'weekly' },
        },
        {
          'package-ecosystem': 'github-actions',
          directory: '/',
          schedule: { interval: 'weekly' },
        },
      ],
    })
  })
})
```

- [ ] **Step 3: Run the CI policy test to verify it fails**

Run:

```powershell
npm test -- tests/ci-config.test.ts
```

Expected: FAIL because `.github/workflows/ci.yml` and `.github/dependabot.yml` do not exist.

- [ ] **Step 4: Implement the verification and deployment workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - main

permissions:
  contents: read

concurrency:
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v7

      - name: Set up Node.js
        uses: actions/setup-node@v7
        with:
          node-version-file: .node-version
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run typecheck

      - name: Test
        run: npm test

      - name: Generate static application
        run: npm run generate

      - name: Upload verified application
        uses: actions/upload-artifact@v5
        with:
          name: static-site
          path: .output/public
          if-no-files-found: error
          retention-days: 1

  deploy:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: verify
    runs-on: ubuntu-latest
    environment: production
    permissions:
      contents: read
      id-token: write
    steps:
      - name: Check out repository
        uses: actions/checkout@v7

      - name: Set up Node.js
        uses: actions/setup-node@v7
        with:
          node-version-file: .node-version
          cache: npm

      - name: Install deployment tooling
        run: npm ci --ignore-scripts

      - name: Download verified application
        uses: actions/download-artifact@v5
        with:
          name: static-site
          path: .output/public

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v3
        with:
          project_id: ${{ vars.FIREBASE_PROJECT_ID }}
          workload_identity_provider: ${{ vars.GCP_WORKLOAD_IDENTITY_PROVIDER }}
          service_account: ${{ vars.GCP_DEPLOY_SERVICE_ACCOUNT }}

      - name: Deploy Firebase Hosting
        run: npx firebase deploy --only hosting --project "${{ vars.FIREBASE_PROJECT_ID }}" --non-interactive
```

- [ ] **Step 5: Configure weekly dependency updates**

Create `.github/dependabot.yml`:

```yaml
version: 2

updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    open-pull-requests-limit: 5

  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
    open-pull-requests-limit: 5
```

- [ ] **Step 6: Verify the automation policies and full local suite**

Run:

```powershell
npm test -- tests/ci-config.test.ts
npm run lint
npm run typecheck
npm test
npm run generate
```

Expected: all CI policy tests and project quality gates pass.

- [ ] **Step 7: Commit GitHub automation**

Run:

```powershell
git add package.json package-lock.json tests/ci-config.test.ts .github/workflows/ci.yml .github/dependabot.yml
git commit -m "ci: deploy verified site to Firebase"
```

Expected: one commit containing the tested workflow and dependency automation.

---

### Task 4: Operations Documentation

**Files:**
- Create: `tests/readme.test.ts`
- Create: `README.md`

**Interfaces:**
- Consumes: project commands and repository variables defined in Tasks 1 through 3.
- Produces: exact local workflow; exact Google Cloud WIF setup; GitHub repository-variable setup; production environment setup; deployment, rollback, and troubleshooting procedures.

- [ ] **Step 1: Write the failing documentation contract test**

Create `tests/readme.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('operations documentation', () => {
  it('documents local development and every quality command', () => {
    const readme = readFileSync(resolve(process.cwd(), 'README.md'), 'utf8')

    for (const command of [
      'npm ci',
      'npm run dev',
      'npm run lint',
      'npm run typecheck',
      'npm test',
      'npm run generate',
      'npm run hosting:serve',
    ]) {
      expect(readme).toContain(command)
    }
  })

  it('documents keyless deployment configuration and recovery', () => {
    const readme = readFileSync(resolve(process.cwd(), 'README.md'), 'utf8')

    for (const value of [
      'FIREBASE_PROJECT_ID',
      'GCP_WORKLOAD_IDENTITY_PROVIDER',
      'GCP_DEPLOY_SERVICE_ACCOUNT',
      'Workload Identity Federation',
      'production',
      'Rollback',
      'Troubleshooting',
    ]) {
      expect(readme).toContain(value)
    }
    expect(readme).toContain('roles/firebasehosting.admin')
    expect(readme).toContain('roles/serviceusage.serviceUsageConsumer')
    expect(readme).not.toContain('service-account JSON key')
  })
})
```

- [ ] **Step 2: Run the documentation test to verify it fails**

Run:

```powershell
npm test -- tests/readme.test.ts
```

Expected: FAIL because `README.md` does not exist.

- [ ] **Step 3: Write the complete operations guide**

Create `README.md`:

````markdown
# Open Health Studio

Open Health Studio is a personal web interface for Google Health data. The
current milestone provides only the Nuxt application, quality gates, Firebase
Hosting, and automatic deployment foundation.

Firebase Authentication, Google Health authorization, health-data access, and
charts are intentionally not implemented yet.

## Requirements

- Node.js 24.16.0
- npm 11.13.0
- A Firebase project named `openhealthstudio`
- Google Cloud CLI for one-time deployment identity setup
- GitHub CLI or repository administrator access for one-time repository setup

## Local development

Install the exact dependency graph:

```powershell
npm ci
```

Start Nuxt:

```powershell
npm run dev
```

Run the quality gates:

```powershell
npm run lint
npm run typecheck
npm test
npm run generate
```

Preview the generated site with the Firebase Hosting emulator:

```powershell
npm run hosting:serve
```

The generated application is written to `.output\public`.

## Deployment model

Pull requests run install, lint, type checking, unit tests, and static
generation. Pull requests never deploy.

A push to `main` runs the same gates, uploads `.output/public` as the
`static-site` workflow artifact, and deploys that exact artifact to the Firebase
Hosting live channel. The deploy job targets the GitHub `production`
environment.

Deployment uses GitHub OIDC and Google Workload Identity Federation. No
long-lived Google Cloud credential is stored in GitHub.

## One-time Google Cloud setup

Authenticate as a project administrator:

```powershell
gcloud auth login
gcloud config set project openhealthstudio
```

Set reusable values:

```powershell
$ProjectId = 'openhealthstudio'
$ProjectNumber = gcloud projects describe $ProjectId --format='value(projectNumber)'
$Pool = 'github'
$Provider = 'openhealthstudio'
$ServiceAccountName = 'firebase-hosting-deployer'
$ServiceAccount = "$ServiceAccountName@$ProjectId.iam.gserviceaccount.com"
```

Enable the required APIs:

```powershell
gcloud services enable iam.googleapis.com iamcredentials.googleapis.com sts.googleapis.com firebasehosting.googleapis.com serviceusage.googleapis.com --project=$ProjectId
```

Create the deployment service account:

```powershell
gcloud iam service-accounts create $ServiceAccountName --project=$ProjectId --display-name='Firebase Hosting deployer'
```

Grant only the project roles needed for Hosting deployment:

```powershell
gcloud projects add-iam-policy-binding $ProjectId --member="serviceAccount:$ServiceAccount" --role='roles/firebasehosting.admin'
gcloud projects add-iam-policy-binding $ProjectId --member="serviceAccount:$ServiceAccount" --role='roles/serviceusage.serviceUsageConsumer'
```

Create the workload identity pool:

```powershell
gcloud iam workload-identity-pools create $Pool --project=$ProjectId --location='global' --display-name='GitHub Actions'
```

Create a provider restricted to this repository:

```powershell
gcloud iam workload-identity-pools providers create-oidc $Provider --project=$ProjectId --location='global' --workload-identity-pool=$Pool --display-name='NdoleStudio openhealthstudio' --issuer-uri='https://token.actions.githubusercontent.com' --attribute-mapping='google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner' --attribute-condition="assertion.repository == 'NdoleStudio/openhealthstudio'"
```

Allow only this repository identity to impersonate the deployment service
account:

```powershell
$Principal = "principalSet://iam.googleapis.com/projects/$ProjectNumber/locations/global/workloadIdentityPools/$Pool/attribute.repository/NdoleStudio/openhealthstudio"
gcloud iam service-accounts add-iam-policy-binding $ServiceAccount --project=$ProjectId --role='roles/iam.workloadIdentityUser' --member=$Principal
```

Read the full provider resource name:

```powershell
$ProviderName = gcloud iam workload-identity-pools providers describe $Provider --project=$ProjectId --location='global' --workload-identity-pool=$Pool --format='value(name)'
$ProviderName
```

Allow up to five minutes for new Workload Identity Federation resources and IAM
bindings to propagate.

## One-time GitHub setup

Create a GitHub environment named `production`. Restrict its deployment branch
to `main`.

Create these repository variables:

| Variable | Value |
| --- | --- |
| `FIREBASE_PROJECT_ID` | `openhealthstudio` |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | the value printed in `$ProviderName` |
| `GCP_DEPLOY_SERVICE_ACCOUNT` | `firebase-hosting-deployer@openhealthstudio.iam.gserviceaccount.com` |

With GitHub CLI authenticated as a repository administrator:

```powershell
gh variable set FIREBASE_PROJECT_ID --repo NdoleStudio/openhealthstudio --body 'openhealthstudio'
gh variable set GCP_WORKLOAD_IDENTITY_PROVIDER --repo NdoleStudio/openhealthstudio --body $ProviderName
gh variable set GCP_DEPLOY_SERVICE_ACCOUNT --repo NdoleStudio/openhealthstudio --body $ServiceAccount
gh api --method PUT repos/NdoleStudio/openhealthstudio/environments/production
```

Configure the `production` environment's deployment branch policy for `main`
in **Repository settings > Environments > production > Deployment branches and
tags**.

## Rollback

Open **Firebase console > Hosting > Release history**, select the last known
good release, and choose **Rollback**. Firebase retains prior Hosting releases;
do not bypass CI by deploying a local rebuild as a rollback.

## Troubleshooting

### OIDC authentication fails

Confirm the workflow has `id-token: write`, all three repository variables are
set, and the provider condition exactly matches
`NdoleStudio/openhealthstudio`. Wait five minutes after changing WIF or IAM.

### Firebase deployment is denied

Confirm the deployment service account has
`roles/firebasehosting.admin` and
`roles/serviceusage.serviceUsageConsumer` on `openhealthstudio`.

### Generated site is missing

Run `npm ci` and `npm run generate`, then confirm
`.output\public\index.html` exists. CI intentionally fails instead of deploying
when the artifact is absent.

### A direct route returns 404

Run `npm test -- tests/firebase-config.test.ts` and verify the deployed release
contains the `firebase.json` rewrite from `**` to `/index.html`.
````

- [ ] **Step 4: Verify the operations guide and full project**

Run:

```powershell
npm test -- tests/readme.test.ts
npm run lint
npm run typecheck
npm test
npm run generate
git diff --check
```

Expected: documentation tests and all project quality gates pass; Git reports no whitespace errors.

- [ ] **Step 5: Commit operations documentation**

Run:

```powershell
git add README.md tests/readme.test.ts
git commit -m "docs: add deployment operations guide"
```

Expected: one commit containing the tested setup, deployment, rollback, and troubleshooting guide.

---

### Task 5: Provision and Verify Production Deployment

**Files:**
- Verify only: `.github/workflows/ci.yml`
- Verify only: `firebase.json`

**Interfaces:**
- Consumes: Firebase project `openhealthstudio`, GitHub repository `NdoleStudio/openhealthstudio`, workflow variables from Task 3, and setup commands from Task 4.
- Produces: keyless GitHub-to-Google trust, live Firebase Hosting release, successful CI run, and HTTPS site at `https://openhealthstudio.web.app`.

- [ ] **Step 1: Verify local completion before changing cloud resources**

Run:

```powershell
npm ci
npm run lint
npm run typecheck
npm test
npm run generate
$SensitivePatterns = 'BEGIN PRIVATE KEY|client_secret|refresh_token|gha-creds-'
$SensitiveMatches = Get-ChildItem .output\public -File -Recurse | Select-String -Pattern $SensitivePatterns
if ($SensitiveMatches) { $SensitiveMatches; throw 'Generated output contains credential material' }
git status --short --branch
```

Expected: every quality command passes, the generated output has no credential
material, and the branch is clean and ahead of `origin/main` only by the
approved spec and implementation commits.

- [ ] **Step 2: Authenticate and define cloud resource values**

Run:

```powershell
gcloud auth login
gcloud config set project openhealthstudio
$ProjectId = 'openhealthstudio'
$ProjectNumber = gcloud projects describe $ProjectId --format='value(projectNumber)'
$Pool = 'github'
$Provider = 'openhealthstudio'
$ServiceAccountName = 'firebase-hosting-deployer'
$ServiceAccount = "$ServiceAccountName@$ProjectId.iam.gserviceaccount.com"
```

Expected: `gcloud projects describe` returns the numeric project number and no command fails.

- [ ] **Step 3: Enable APIs and create the deployment service account**

Run:

```powershell
gcloud services enable iam.googleapis.com iamcredentials.googleapis.com sts.googleapis.com firebasehosting.googleapis.com serviceusage.googleapis.com --project=$ProjectId
gcloud iam service-accounts create $ServiceAccountName --project=$ProjectId --display-name='Firebase Hosting deployer'
gcloud projects add-iam-policy-binding $ProjectId --member="serviceAccount:$ServiceAccount" --role='roles/firebasehosting.admin'
gcloud projects add-iam-policy-binding $ProjectId --member="serviceAccount:$ServiceAccount" --role='roles/serviceusage.serviceUsageConsumer'
```

Expected: APIs become enabled, the service account exists, and both least-privilege project bindings are present. If the service account already exists, verify it with `gcloud iam service-accounts describe $ServiceAccount --project=$ProjectId` and continue without recreating it.

- [ ] **Step 4: Create repository-restricted Workload Identity Federation**

Run:

```powershell
gcloud iam workload-identity-pools create $Pool --project=$ProjectId --location='global' --display-name='GitHub Actions'
gcloud iam workload-identity-pools providers create-oidc $Provider --project=$ProjectId --location='global' --workload-identity-pool=$Pool --display-name='NdoleStudio openhealthstudio' --issuer-uri='https://token.actions.githubusercontent.com' --attribute-mapping='google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner' --attribute-condition="assertion.repository == 'NdoleStudio/openhealthstudio'"
$Principal = "principalSet://iam.googleapis.com/projects/$ProjectNumber/locations/global/workloadIdentityPools/$Pool/attribute.repository/NdoleStudio/openhealthstudio"
gcloud iam service-accounts add-iam-policy-binding $ServiceAccount --project=$ProjectId --role='roles/iam.workloadIdentityUser' --member=$Principal
$ProviderName = gcloud iam workload-identity-pools providers describe $Provider --project=$ProjectId --location='global' --workload-identity-pool=$Pool --format='value(name)'
```

Expected: the provider exists with the repository condition, the external repository identity can impersonate only the deployment service account, and `$ProviderName` begins with `projects/`.

- [ ] **Step 5: Configure GitHub variables and production environment**

Run:

```powershell
gh auth status
gh variable set FIREBASE_PROJECT_ID --repo NdoleStudio/openhealthstudio --body $ProjectId
gh variable set GCP_WORKLOAD_IDENTITY_PROVIDER --repo NdoleStudio/openhealthstudio --body $ProviderName
gh variable set GCP_DEPLOY_SERVICE_ACCOUNT --repo NdoleStudio/openhealthstudio --body $ServiceAccount
gh api --method PUT repos/NdoleStudio/openhealthstudio/environments/production
gh variable list --repo NdoleStudio/openhealthstudio
```

Expected: the three non-secret variables are listed and the `production` environment exists. In GitHub repository settings, restrict that environment's deployment branches to `main`.

- [ ] **Step 6: Push the verified commits to trigger deployment**

Run:

```powershell
git log --oneline origin/main..HEAD
git push origin main
gh run list --repo NdoleStudio/openhealthstudio --workflow CI --limit 1
```

Expected: the push succeeds and the newest `CI` workflow run is queued or in progress for `main`.

- [ ] **Step 7: Verify the workflow and live site**

Run after the workflow starts:

```powershell
$RunId = gh run list --repo NdoleStudio/openhealthstudio --workflow CI --branch main --limit 1 --json databaseId --jq '.[0].databaseId'
gh run watch $RunId --repo NdoleStudio/openhealthstudio --exit-status
curl.exe --fail --silent --show-error --head https://openhealthstudio.web.app/
curl.exe --fail --silent --show-error --head https://openhealthstudio.web.app/health
```

Expected: `gh run watch` exits with code 0; both URLs return HTTP 200 over HTTPS; the `/health` request proves the SPA fallback works.

- [ ] **Step 8: Verify deployed security and cache headers**

Run:

```powershell
$Headers = curl.exe --fail --silent --show-error --head https://openhealthstudio.web.app/
$Headers
$Headers | Select-String -Pattern 'x-content-type-options: nosniff' -CaseSensitive:$false
$Headers | Select-String -Pattern 'referrer-policy: strict-origin-when-cross-origin' -CaseSensitive:$false
$Headers | Select-String -Pattern 'x-frame-options: DENY' -CaseSensitive:$false
$Headers | Select-String -Pattern 'cache-control: public, max-age=0, must-revalidate' -CaseSensitive:$false
```

Expected: each `Select-String` prints the corresponding deployed response header.
