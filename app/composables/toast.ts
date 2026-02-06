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
    success(title: string = '成功',message: string) {
        return ensureToast().add({ title, description: message, color: 'success' })
    },
    error(title: string = '错误',message: string) {
        return ensureToast().add({ title, description: message, color: 'error' })
    },
    warning(title: string = '警告',message: string) {
        return ensureToast().add({ title, description: message, color: 'warning' })
    },
    info(title: string = '提示',message: string) {
        return ensureToast().add({ title, description: message, color: 'info' })
    },
    add(options: any) {
        return ensureToast().add(options)
    },
}

export default toast
