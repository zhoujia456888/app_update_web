<template>
  <div class="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
    <div class="w-full max-w-md">
      <UCard> <!-- 顶部标题 -->
        <div class="mb-6 text-center">
          <div class="text-2xl font-semibold">登录</div>
        </div>


        <div class="space-y-5">
          <!-- 用户名 -->

          <UInput
              v-model="form.username"
              size="lg"
              class="w-full"
              placeholder="请输入用户名"
              autocomplete="username"
          >
            <template #leading>
              <UIcon name="i-lucide-user" class="text-gray-400"/>
            </template>
          </UInput>

          <!-- 密码 -->

          <UInput
              v-model="form.password"
              size="lg"
              class="w-full"
              :type="showPwd ? 'text' : 'password'"
              placeholder="请输入密码"
              autocomplete="current-password"
          >
            <template #leading>
              <UIcon name="i-lucide-lock" class="text-gray-400"/>
            </template>
            <template #trailing>
              <UButton
                  type="button"
                  color="neutral"
                  variant="ghost"
                  :icon="showPwd ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  @click="showPwd = !showPwd"
              />
            </template>
          </UInput>

          <!-- 验证码：输入 + 图片同一行 -->
          <div class="flex items-end gap-3">
            <div class="flex-1">
              <UInput
                  v-model="form.captcha_code"
                  size="lg"
                  placeholder="请输入验证码"
                  autocomplete="off"
              >
                <template #leading>
                  <UIcon name="i-lucide-shield-check" class="text-gray-400"/>
                </template>
              </UInput>

            </div>

            <div class="w-32">
              <button
                  type="button"
                  class="h-11 w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-center"
                  @click="refreshCaptcha"
                  :disabled="captchaLoading"
              >
                <div v-if="captchaLoading" class="text-xs text-gray-400">加载中…</div>
                <img v-else :src="captchaImg" class="h-full w-full object-cover" alt="captcha"/>
              </button>
            </div>
          </div>

          <!-- 错误提示 -->
          <div
              v-if="error"
              class="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-xl"
          >
            {{ error }}
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-3 pt-2">
            <!-- 登录按钮：主按钮，占满 -->
            <UButton
                size="lg"
                color="primary"
                class="flex-1 justify-center"
                :loading="loading"
                @click="onLogin"
            >
              登录
            </UButton>

            <!-- 注册按钮：次按钮 -->
            <UButton
                size="lg"
                variant="outline"
                color="primary"
                class="flex-1 justify-center"
                @click="goRegister"
            >
              注册
            </UButton>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {LoginReq} from '~/types/auth'
import {authApi} from "~/api/auth";
import type {ToastProps} from "@nuxt/ui/components/Toast.vue";

const api = authApi()

const showPwd = ref(false)
const loading = ref(false)
const captchaLoading = ref(false)
const error = ref('')

const captchaImg = ref('')
const captchaId = ref('')

const form = reactive<LoginReq>({
  username: '',
  password: '',
  captcha_id: '',
  captcha_code: ''
})


const toast = useToast()


async function refreshCaptcha() {
  error.value = ''
  captchaLoading.value = true
  try {
    const res = await api.getCaptcha()
    if (res.data.code !== 200) {
      toast.add({
        title: '获取验证码失败',
        description: res.data.msg || '获取验证码失败',
        color: 'error'
      })
      return;
    }

    captchaId.value = res.data.data.captcha_id
    captchaImg.value = res.data.data.captcha_img // 已经是 data:image/...;base64

    form.captcha_id = captchaId.value
    form.captcha_code = ''
  } catch (e: any) {
    error.value = e?.message || '获取验证码失败'
  } finally {
    captchaLoading.value = false
  }
}

onMounted(refreshCaptcha)

async function onLogin() {
  error.value = ''
  loading.value = true
  try {
    if (!form.username.trim()) {
      toast.add({
        title: '登录失败',
        description: '请输入用户名',
        color: 'error'
      })
      return;
    }
    if (!form.password.trim()) {
      toast.add({
        title: '登录失败',
        description: '请输入密码',
        color: 'error'
      })
      return;
    }
    if (!form.captcha_code.trim()) {
      toast.add({
        title: '登录失败',
        description: '请输入验证码',
        color: 'error'
      })
      return;
    }
    if (!form.captcha_id) {
      toast.add({
        title: '登录失败',
        description: '验证码无效，请刷新',
        color: 'error'
      })
      return;
    }

    const res = await api.login({
      username: form.username.trim(),
      password: form.password,
      captcha_id: form.captcha_id,
      captcha_code: form.captcha_code.trim()
    })

    console.log(res)

    if (res.data.code !== 200) {
      toast.add({
        title: '登录失败',
        description: res.data.msg || '登录失败',
        color: 'error'
      })
      return;
    }

    const token = useCookie<string | null>('token', {sameSite: 'lax'})
    token.value = res.data.data.access_token

    await navigateTo('/')
  } catch (e: any) {
    error.value = e?.message || '登录失败'
    await refreshCaptcha()
  } finally {
    loading.value = false
  }
}

function goRegister() {
  navigateTo('/register')
}
</script>
