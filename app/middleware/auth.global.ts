// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to) => {
    const token = useCookie<string | null>('token')
    const isLoginPage = to.path === '/login'

    if (!token.value && !isLoginPage) {
        return navigateTo('/login')
    }

    // 已登录还访问 login，就送回首页
    if (token.value && isLoginPage) {
        return navigateTo('/')
    }
})
