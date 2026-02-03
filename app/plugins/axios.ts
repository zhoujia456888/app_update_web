// plugins/axios.ts
import axios from 'axios'

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    const access_token = useCookie<string | null>('access_token')

    const api = axios.create({
        baseURL: '/',
        timeout: 10000
    })

    api.interceptors.request.use((req) => {
        if (access_token.value) {
            req.headers = req.headers || {}
            req.headers.Authorization = `Bearer ${access_token.value}`
        }
        return req
    })

    api.interceptors.response.use(
        (res) => res,
        (err) => {
            // 常见：token 过期/无效
            if (err?.response?.status === 401) {
                access_token.value = null
                // 这里不要直接使用 navigateTo（插件里不一定有路由上下文）
            }
            return Promise.reject(err)
        }
    )

    return {
        provide: {
            api
        }
    }
})
