// https://nuxt.com/docs/api/configuration/nuxt-config
// 浏览器统一访问 /api，由 Nuxt 在容器内转发到后端服务。
// 后端地址只给 Nuxt/Nitro 服务端使用，不直接暴露给浏览器。
// 注意：这里不要带 /api 前缀。
// PowerShell: $env:NUXT_PUBLIC_API_BASE="http://127.0.0.1:5800"
// Docker: -e NUXT_PUBLIC_API_BASE=http://app_update_service:5800
const apiBase = process.env.NUXT_PUBLIC_API_BASE || 'http://app_update_service:5800'

export default defineNuxtConfig({
    ssr: false,
    compatibilityDate: '2025-07-15',
    devtools: {enabled: import.meta.dev},
    modules: ['@nuxt/ui',],
    css: ['~/assets/css/main.css'],
    fonts: {
        provider: 'bunny'
    },
    // 浏览器只请求 /api，真正的后端地址由 Nitro 在服务端转发使用。
    runtimeConfig: {
        apiBase,
        public: {
            apiProxyPrefix: '/api'
        }
    },
    nitro: {
        devProxy: {
            '/api': {
                target: `${apiBase}/api`,
                changeOrigin: true
            }
        },
        // 生产环境下也把 /api 转发到后端，避免浏览器直连导致 5802 自己处理 /api
        routeRules: {
            '/api/**': {
                proxy: `${apiBase}/api/**`,
            }
        }
    },
    sourcemap: {
        server: import.meta.dev,
        client: import.meta.dev
    }
})
