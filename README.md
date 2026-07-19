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
