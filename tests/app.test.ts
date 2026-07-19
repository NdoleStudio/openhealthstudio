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
