// plugins/axios.ts
import axios from 'axios'
import {user_api} from "~/api/user_api";

const refreshApi = axios.create({
    baseURL: '/api',
    timeout: 10000
})

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()

    const api = axios.create({
        baseURL: '/api',
        timeout: 10000
    })

    api.interceptors.request.use((req) => {
        const access_token = localStorage.getItem('access_token')
        if (access_token) {
            req.headers = req.headers || {}
            req.headers.Authorization = `Bearer ${access_token}`
        }
        return req
    })

    api.interceptors.response.use(
        (res) => res,
        (err) => {
            // 常见：token 过期/无效
            if (err?.response?.status === 401) {
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                // 这里不要直接使用 navigateTo（插件里不一定有路由上下文）
                // 可以使用 useRouter 来获取路由实例
                window.location.href = '/login'
            } else if (err?.response?.status === 403) {
                //此处应该调用接口刷新Token
                // 调用刷新token接口
                const refresh_token = localStorage.getItem('refresh_token')
                if (refresh_token) {
                    refreshApi.post('/users/refresh_token', { refresh_token }).then((res) => {
                        if (res.data.code == 200) {
                            localStorage.setItem('access_token', res.data.data.access_token)
                            localStorage.setItem('refresh_token', res.data.data.refresh_token)
                            // 重新请求失败的接口
                            // 重新设置请求头
                            err.config.headers.Authorization = `Bearer ${res.data.data.access_token}`
                            return api(err.config)
                        }
                    })
                }else{
                    localStorage.removeItem('access_token')
                    localStorage.removeItem('refresh_token')
                    window.location.href = '/login'
                }
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
