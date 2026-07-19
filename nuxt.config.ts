import { defineNuxtModule } from 'nuxt/kit'

// Work around vue-router/volar/sfc-route-blocks being injected by upstream tooling and breaking `nuxt typecheck`; remove once that plugin is no longer added.
const stripRouterVolarPlugin = defineNuxtModule({
  meta: { name: 'strip-router-volar-plugin' },
  setup(_options, nuxt) {
    nuxt.hook('modules:done', () => {
      nuxt.hook('prepare:types', ({ tsConfig }) => {
        const plugins = tsConfig.vueCompilerOptions?.plugins

        if (!Array.isArray(plugins)) {
          return
        }

        tsConfig.vueCompilerOptions!.plugins = plugins.filter((plugin) => {
          return typeof plugin === 'string'
            ? plugin !== 'vue-router/volar/sfc-route-blocks'
            : plugin.name !== 'vue-router/volar/sfc-route-blocks'
        })
      })
    })
  },
})

export default defineNuxtConfig({
  compatibilityDate: '2026-07-19',
  modules: [stripRouterVolarPlugin, '@nuxt/eslint'],
  ssr: false,
  typescript: {
    typeCheck: true,
  },
})
