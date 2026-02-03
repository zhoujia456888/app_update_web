// composables/useAuth.ts
import type {LoginReq, LoginResponse} from '~/types/auth'
import {authApi} from "~/api/auth";

export function useAuth() {
    const access_token = useCookie<string | null>('access_token', {sameSite: 'lax'})
    const refresh_token = useCookie<string | null>('refresh_token', {sameSite: 'lax'})

    const isAuthed = computed(() => !!access_token.value)

    async function login(payload: LoginReq) {
        const api = authApi()
        // 你的接口路径按需修改
        const res = await api.login(payload)
        access_token.value = res.data.access_token
        refresh_token.value = res.data.refresh_token
    }

    function logout() {
        access_token.value = null
        refresh_token.value = null
        return navigateTo('/login')
    }

    return {access_token, refresh_token, isAuthed, login, logout}
}
