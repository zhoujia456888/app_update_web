// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to) => {
    if (!import.meta.client) {
        return
    }

    const { accessToken, syncFromStorage } = useUserSession()
    syncFromStorage()

    const isLoginPage = to.path === '/login'
    const isRegisterPage = to.path === '/register'
    const isAppDownloadPage = to.path === '/app_download'

    if (!accessToken.value && !isLoginPage && !isRegisterPage && !isAppDownloadPage) {
        return navigateTo('/login')
    }

    if (accessToken.value && (isLoginPage || isRegisterPage)) {
        return navigateTo('/')
    }
})
