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
