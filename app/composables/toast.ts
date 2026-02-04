// toast.ts
type ToastApi = {
    add: (options: any) => any
}

let toastApi: ToastApi | null = null

export function setToastApi(api: ToastApi) {
    toastApi = api
}

function ensureToast() {
    if (!toastApi) {
        // 你也可以选择不 throw，只是 console.warn
        throw new Error('[toast] Toast API not initialized. Call setToastApi() in App.vue setup.')
    }
    return toastApi
}

const toast = {
    success(message: string, title: string = '成功') {
        return ensureToast().add({ title, description: message, color: 'success' })
    },
    error(message: string, title: string = '错误') {
        return ensureToast().add({ title, description: message, color: 'error' })
    },
    warning(message: string, title: string = '警告') {
        return ensureToast().add({ title, description: message, color: 'warning' })
    },
    info(message: string, title: string = '提示') {
        return ensureToast().add({ title, description: message, color: 'info' })
    },
    add(options: any) {
        return ensureToast().add(options)
    },
}

export default toast
