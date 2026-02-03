// app/composables/useCaptcha.ts
import {authApi} from "~/api/auth";

export function useCaptcha() {
    const captchaId = ref('')
    const captchaImg = ref('')
    const loading = ref(false)

    async function refreshCaptcha() {
        loading.value = true
        try {
            const api = authApi()
            const res = await api.getCaptcha()

            captchaId.value = res.data.id

            const img = res.data.imageBase64
            captchaImg.value = img.startsWith('data:image')
                ? img
                : `data:image/png;base64,${img}`
        } finally {
            loading.value = false
        }
    }

    return { captchaId, captchaImg, loading, refreshCaptcha }
}
