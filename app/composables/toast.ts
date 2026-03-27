// toast.ts
type ToastApi = {
    add: (options: any) => any
    remove: (id: string | number) => void
    clear: () => void
}

let toastApi: ToastApi | null = null
const DEFAULT_DURATION = 3000
const toastTimers = new Map<string | number, ReturnType<typeof setTimeout>>()

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

function clearToastTimer(id: string | number) {
    const timer = toastTimers.get(id)
    if (timer) {
        clearTimeout(timer)
        toastTimers.delete(id)
    }
}

function addToast(options: any) {
    const api = ensureToast()
    const duration = DEFAULT_DURATION
    const toast = api.add({
        duration,
        ...options,
    })

    clearToastTimer(toast.id)
    const timer = setTimeout(() => {
        api.remove(toast.id)
        toastTimers.delete(toast.id)
    }, duration)
    toastTimers.set(toast.id, timer)

    return toast
}

const toast = {
    success(title: string = '成功',message: string) {
        return addToast({ title, description: message, color: 'success' })
    },
    error(title: string = '错误',message: string) {
        return addToast({ title, description: message, color: 'error' })
    },
    warning(title: string = '警告',message: string) {
        return addToast({ title, description: message, color: 'warning' })
    },
    info(title: string = '提示',message: string) {
        return addToast({ title, description: message, color: 'info' })
    },
    add(options: any) {
        return addToast(options)
    },
    remove(id: string | number) {
        clearToastTimer(id)
        return ensureToast().remove(id)
    },
    clear() {
        for (const id of toastTimers.keys()) {
            clearToastTimer(id)
        }
        return ensureToast().clear()
    }
}

export default toast
