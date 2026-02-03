// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    ssr: false,
    compatibilityDate: '2025-07-15',
    devtools: {enabled: true},
    modules: ['@nuxt/ui',],
    css: ['~/assets/css/main.css'],
    fonts: {
        provider: 'bunny'
    },
    //配置后端地址配置
    runtimeConfig: {
        public: {
            apiBase: 'http://localhost:5800'
        }
    },
    nitro: {
        devProxy: {
            '/api': {
                target: 'http://localhost:5800/api',
                changeOrigin: true
            }
        }
    }
})