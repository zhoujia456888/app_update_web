import { useToast } from "#imports";

// toast.ts
type ToastId = string | number;

type ToastOptions = {
  title?: string;
  description?: string;
  color?: string;
  duration?: number;
  [key: string]: unknown;
};

type ToastInstance = {
  id: ToastId;
  [key: string]: unknown;
};

type ToastApi = ReturnType<typeof useToast>;

let toastApi: ToastApi | null = null;
const DEFAULT_DURATION = 3000;
const toastTimers = new Map<ToastId, ReturnType<typeof setTimeout>>();

export function setToastApi(api: ToastApi) {
  toastApi = api;
}

function ensureToast() {
  if (!toastApi) {
    // 你也可以选择不 throw，只是 console.warn
    throw new Error(
      "[toast] Toast API not initialized. Call setToastApi() in App.vue setup.",
    );
  }
  return toastApi;
}

function clearToastTimer(id: ToastId) {
  const timer = toastTimers.get(id);
  if (timer) {
    clearTimeout(timer);
    toastTimers.delete(id);
  }
}

function addToast(options: ToastOptions) {
  const api = ensureToast();
  const duration = DEFAULT_DURATION;
  const toast = api.add({
    duration,
    ...options,
  });

  clearToastTimer(toast.id);
  const timer = setTimeout(() => {
    api.remove(toast.id);
    toastTimers.delete(toast.id);
  }, duration);
  toastTimers.set(toast.id, timer);

  return toast;
}

const toast = {
  success(title: string = "成功", message: string) {
    return addToast({ title, description: message, color: "success" });
  },
  error(title: string = "错误", message: string) {
    return addToast({ title, description: message, color: "error" });
  },
  warning(title: string = "警告", message: string) {
    return addToast({ title, description: message, color: "warning" });
  },
  info(title: string = "提示", message: string) {
    return addToast({ title, description: message, color: "info" });
  },
  add(options: ToastOptions) {
    return addToast(options);
  },
  remove(id: ToastId) {
    clearToastTimer(id);
    return ensureToast().remove(id);
  },
  clear() {
    for (const id of toastTimers.keys()) {
      clearToastTimer(id);
    }
    return ensureToast().clear();
  },
};

export default toast;
