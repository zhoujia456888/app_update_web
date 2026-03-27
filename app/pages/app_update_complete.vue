<template>
  <div class="flex h-full min-h-0 flex-col overflow-hidden bg-white">
    <header class="py-3.5 px-4">
      <div class="text-lg font-bold text-gray-900">应用发布完成</div>
    </header>

    <div class="flex-1 overflow-y-auto px-4 pb-6">
      <div v-if="!uploadAppInfo" class="flex min-h-96 items-center justify-center">
        <UEmpty
            icon="i-lucide-file-warning"
            title="未找到上传的 APK 信息"
            description="请重新上传安装包后再完成发布。"
            :actions="[
              {
                label: '返回上传页',
                icon: 'i-lucide-arrow-left',
                onClick: () => navigateToBack()
              }
            ]"
        />
      </div>

      <div v-else class="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div class="mb-6 flex items-start gap-4">
            <div
                class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
              <img
                  v-if="appIconUrl"
                  :src="appIconUrl"
                  :alt="uploadAppInfo.app_name || 'APP图标'"
                  class="h-full w-full object-cover"
              >
              <UIcon v-else name="i-lucide-smartphone" class="h-10 w-10 text-gray-400"/>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-2xl font-semibold text-gray-900">
                {{ uploadAppInfo.app_name || '未识别应用名称' }}
              </div>
              <div class="mt-2 text-sm text-gray-500">{{ uploadAppInfo.apk_name || '-' }}</div>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div class="rounded-xl bg-gray-50 p-4">
              <div class="text-sm text-gray-500">包名</div>
              <div class="mt-2 break-all font-medium text-gray-900">{{ uploadAppInfo.package_name || '-' }}</div>
            </div>
            <div class="rounded-xl bg-gray-50 p-4">
              <div class="text-sm text-gray-500">版本号</div>
              <div class="mt-2 font-medium text-gray-900">{{ uploadAppInfo.version_name || '-' }}</div>
            </div>
            <div class="rounded-xl bg-gray-50 p-4">
              <div class="text-sm text-gray-500">内部版本</div>
              <div class="mt-2 font-medium text-gray-900">{{ uploadAppInfo.version_code || '-' }}</div>
            </div>
            <div class="rounded-xl bg-gray-50 p-4">
              <div class="text-sm text-gray-500">文件大小</div>
              <div class="mt-2 font-medium text-gray-900">{{ formattedFileSize }}</div>
            </div>
          </div>
          <div class="my-5 h-px w-full bg-gray-200"/>
          <div class="mb-4 text-base font-semibold text-gray-900">发布信息</div>
          <div class="grid gap-6">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">选择渠道</label>
              <USelectMenu
                  v-model="selectedChannelId"
                  :items="channelOptions"
                  value-key="channel_id"
                  label-key="channel_name"
                  :search-input="false"
                  placeholder="请选择渠道"
                  class="w-full"
              />
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">APP 更新日志</label>
              <UTextarea
                  v-model="updateLog"
                  :rows="8"
                  autoresize
                  class="w-full"
                  placeholder="请输入本次 APP 更新日志，例如：\n1. 修复已知问题\n2. 优化启动速度\n3. 新增某项功能"
              />
            </div>
          </div>
        </section>

        <div class="flex justify-end gap-3">
          <UButton
              color="neutral"
              variant="soft"
              icon="i-lucide-arrow-left"
              @click="navigateTo('/app_upload')"
          >
            返回上传页
          </UButton>
          <UButton
              class="min-w-32 justify-center"
              color="primary"
              variant="solid"
              :loading="isSubmitting"
              @click="submitAppInfo"
          >
            完成
          </UButton>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import {app_manage_api} from "~/api/app_manage_api";
import {app_channel_api} from "~/api/app_channel_api";
import toast from "~/composables/toast";
import type {GetAppChannelListResp, GetAppChannelListRespItem} from "~/types/app_channel";
import type {UploadAppFileCompleteReq, UploadAppFileResp} from "~/types/app_manage";
import {navigateTo} from "#imports";

const route = useRoute()
const api = app_manage_api()
const channelApi = app_channel_api()
const config = useRuntimeConfig()
const isSubmitting = ref(false)
const selectedChannelId = ref<string>()
const channelOptions = ref<GetAppChannelListRespItem[]>([])
const updateLog = ref('')
const iconServerUrl = config.public.apiBase

const rawInfo = route.query.info
const uploadAppInfo = computed<UploadAppFileResp | null>(() => {
  if (typeof rawInfo !== 'string') {
    return null
  }

  try {
    return JSON.parse(rawInfo) as UploadAppFileResp
  } catch {
    return null
  }
})

const formattedFileSize = computed(() => {
  const bytes = uploadAppInfo.value?.file_size ?? 0
  if (!bytes) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
})

const appIconUrl = computed(() => {
  const iconPath = uploadAppInfo.value?.app_icon_path?.trim()
  if (!iconPath) return ''
  if (/^https?:\/\//i.test(iconPath)) return iconPath
  return `${iconServerUrl}${iconPath.startsWith('/') ? iconPath : `/${iconPath}`}`
})

const selectedChannel = computed(() => {
  return channelOptions.value.find(item => item.channel_id === selectedChannelId.value)
})

onMounted(() => {
  void getChannelList()
})

async function getChannelList() {
  try {
    const res = await channelApi.get_app_channel_list_by_page({
      page_index: 0,
      page_size: 999,
    })

    if (res.data.code !== 200) {
      toast.error('获取渠道失败', res.data.msg || '获取渠道失败')
      return
    }

    const resp = res.data.data as GetAppChannelListResp
    channelOptions.value = resp.channel_list || []
  } catch (e: any) {
    const errorMessage = e?.response?.data?.msg || '获取渠道失败'
    toast.error('获取渠道失败', errorMessage)
  }
}

async function submitAppInfo() {
  if (!uploadAppInfo.value) {
    toast.error('提交失败', '未找到 APK 信息，请重新上传')
    return
  }

  if (!selectedChannel.value?.channel_id) {
    toast.error('提交失败', '请选择渠道')
    return
  }

  if (!updateLog.value.trim()) {
    toast.error('提交失败', '请输入 APP 更新日志')
    return
  }

  const payload: UploadAppFileCompleteReq = {
    file_path: uploadAppInfo.value.file_path || '',
    apk_name: uploadAppInfo.value.apk_name || '',
    app_name: uploadAppInfo.value.app_name || '',
    package_name: uploadAppInfo.value.package_name || '',
    app_icon_path: uploadAppInfo.value.app_icon_path || '',
    version_name: uploadAppInfo.value.version_name || '',
    version_code: uploadAppInfo.value.version_code || '',
    file_size: uploadAppInfo.value.file_size || 0,
    upload_file_info: uploadAppInfo.value.upload_file_info || '',
    channel_id: selectedChannel.value.channel_id,
    channel_name: selectedChannel.value.channel_name,
    update_log: updateLog.value.trim(),
  }

  try {
    isSubmitting.value = true
    const res = await api.upload_app_file_complete(payload)
    if (res.data.code !== 200) {
      toast.error('提交失败', res.data.msg || '提交失败')
      return
    }

    toast.success('提交成功', res.data.msg || 'APP 信息已提交')
    await navigateTo('/app_list')
  } catch (e: any) {
    const errorMessage = e?.response?.data?.msg || '提交失败，请稍后重试'
    toast.error('提交失败', errorMessage)
  } finally {
    isSubmitting.value = false
  }

}

async function navigateToBack() {
  navigateTo('/app_upload')
}

</script>

<style scoped>

</style>
