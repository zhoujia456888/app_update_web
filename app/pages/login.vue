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
            <div class="w-60 flex-1">
              <UInput
                  v-model="form.captcha_code"
                  size="lg"
                  class="w-full"
                  placeholder="请输入验证码"
                  autocomplete="off"
                  icon="i-lucide-shield-check"
              >
              </UInput>

            </div>

            <div class="w-32">
              <button
                  type="button"
                  class="h-10 w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-center"
                  @click="refreshCaptcha"
                  :disabled="captchaLoading"
              >
                <span v-if="captchaLoading" class="text-xs text-gray-400">加载中…</span>
                <img v-else :src="captchaImg" class="h-full w-full object-cover" alt="captcha"/>
              </button>
            </div>
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
import type {LoginReq} from '~/types/user'
import {user_api} from "~/api/user_api";
import toast from "~/composables/toast";
import type {AxiosResponse} from "axios";
//登录页面不使用默认布局
definePageMeta({layout: false})
const api = user_api()

const showPwd = ref(false)
const loading = ref(false)
const captchaLoading = ref(false)

const captchaImg = ref('')
const captchaId = ref('')

const form = reactive<LoginReq>({
  username: '',
  password: '',
  captcha_id: '',
  captcha_code: ''
})


async function refreshCaptcha() {
  captchaLoading.value = true
  try {
    const res = await api.getCaptcha()
    if (res.data.code !== 200) {
      toast.error('获取验证码失败', res.data.msg || '获取验证码失败')
      return;
    }

    captchaId.value = res.data.data.captcha_id
    captchaImg.value = res.data.data.captcha_img // 已经是 data:image/...;base64

    form.captcha_id = captchaId.value
    form.captcha_code = ''
  } catch (e: any) {
    let errorMessage = '获取验证码失败'
    if (e?.response?.data?.msg) {
      errorMessage = e.response.data.msg
    }
    toast.error('获取验证码失败', errorMessage)
  } finally {
    captchaLoading.value = false
  }
}

onMounted(refreshCaptcha)

async function onLogin() {
  loading.value = true
  try {
    if (!form.username.trim()) {
      toast.error('登录失败', '请输入用户名')
      return;
    }
    if (!form.password.trim()) {
      toast.error('登录失败', '请输入密码')
      return;
    }
    if (!form.captcha_code.trim()) {
      toast.error('登录失败', '请输入验证码')
      return;
    }
    if (!form.captcha_id) {
      toast.error('登录失败', '验证码无效，请刷新')
      return;
    }

    const res = await api.login({
      username: form.username.trim(),
      password: form.password,
      captcha_id: form.captcha_id,
      captcha_code: form.captcha_code.trim()
    })

    if (res.data.code !== 200) {
      toast.error('登录失败', res.data.msg || '登录失败')
      return;
    }

    // 登录成功后，将 access_token 和 refresh_token 存储到 localStorage
    localStorage.setItem('access_token', res.data.data.access_token)
    localStorage.setItem('refresh_token', res.data.data.refresh_token)

    await getUserInfo(res)

  } catch (e: any) {
    console.log(e)
    let errorMessage = '登录失败'
    if (e?.response?.data?.msg) {
      errorMessage = e.response.data.msg
    }
    toast.error('登录失败', errorMessage)
    await refreshCaptcha()
  } finally {
    loading.value = false
  }
}


async function getUserInfo(loginRes: AxiosResponse) {
  const userInfoRes = await api.getUserInfo()
  if (userInfoRes.data.code !== 200) {
    toast.error('获取用户信息失败,请重试!', userInfoRes.data.msg || '获取用户信息失败,请重试!')
    return;
  }
  // 登录成功后，将用户信息存储到 localStorage
  localStorage.setItem('user_info', JSON.stringify(userInfoRes.data.data))
  toast.success('登录成功', loginRes.data.data.login_info || '登录成功')
  // 使用 replace: true 确保路由正确跳转
  await navigateTo('/', {replace: true})
}

function goRegister() {
  navigateTo('/register', {replace: true})
}
</script>
