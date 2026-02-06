// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to) => {
    const access_token = localStorage.getItem('access_token')
    const isLoginPage = to.path === '/login'

    const isRegisterPage = to.path === '/register'
    if (!access_token && !isLoginPage && !isRegisterPage) {
        return navigateTo('/login')
    }

    // 已登录还访问 login，就送回首页
    if (access_token && (isLoginPage || isRegisterPage)) {
        return navigateTo('/')
    }
})
