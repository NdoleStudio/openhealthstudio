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
