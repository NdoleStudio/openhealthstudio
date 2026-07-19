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
