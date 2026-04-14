<template>
  <div class="min-h-screen bg-gray-50 px-4 py-8">
    <div v-if="isLoading" class="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div class="flex items-start gap-4">
          <USkeleton class="h-20 w-20 rounded-2xl"/>
          <div class="flex flex-1 flex-col gap-3">
            <USkeleton class="h-8 w-56"/>
            <USkeleton class="h-5 w-80"/>
          </div>
        </div>
        <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <USkeleton
              v-for="item in 4"
              :key="`app-info-${item}`"
              class="h-24 w-full rounded-xl"
          />
        </div>
      </div>
    </div>

    <div v-else-if="appInfo" class="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <section class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div class="mb-6 flex items-start gap-4">
          <div
              class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50"
          >
            <img
                v-if="formattedAppIconUrl(appInfo.app_icon_path)"
                :src="formattedAppIconUrl(appInfo.app_icon_path)"
                :alt="appInfo.app_name || 'APP图标'"
                class="h-full w-full object-cover"
            />
            <UIcon
                v-else
                name="i-lucide-smartphone"
                class="h-10 w-10 text-gray-400"
            />
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-3xl font-semibold text-gray-900">
              {{ appInfo.app_name || "未识别应用名称" }}
            </div>
            <div class="mt-2 text-sm text-gray-500">
              {{ appInfo.file_name || "-" }}
            </div>
          </div>
          <UButton
              color="primary"
              variant="solid"
              icon="i-lucide-download"
              :to="appInfo.file_path"
              target="_blank"
          >
            下载 APK
          </UButton>
        </div>

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-xl bg-gray-50 p-4">
            <div class="text-sm text-gray-500">包名</div>
            <div class="mt-2 break-all font-medium text-gray-900">
              {{ appInfo.package_name || "-" }}
            </div>
          </div>
          <div class="rounded-xl bg-gray-50 p-4">
            <div class="text-sm text-gray-500">版本名称</div>
            <div class="mt-2 font-medium text-gray-900">
              {{ appInfo.version_name || "-" }}
            </div>
          </div>
          <div class="rounded-xl bg-gray-50 p-4">
            <div class="text-sm text-gray-500">版本号</div>
            <div class="mt-2 font-medium text-gray-900">
              {{ appInfo.version_code || "-" }}
            </div>
          </div>
          <div class="rounded-xl bg-gray-50 p-4">
            <div class="text-sm text-gray-500">文件大小</div>
            <div class="mt-2 font-medium text-gray-900">
              {{ formattedFileSize(appInfo.file_size || 0) }}
            </div>
          </div>
        </div>

        <div class="my-6 h-px w-full bg-gray-200"/>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-xl bg-gray-50 p-4">
            <div class="text-sm text-gray-500">渠道</div>
            <div class="mt-2 font-medium text-gray-900">
              {{ appInfo.channel_name || "-" }}
            </div>
          </div>
          <div class="rounded-xl bg-gray-50 p-4">
            <div class="text-sm text-gray-500">上传时间</div>
            <div class="mt-2 font-medium text-gray-900">
              {{ formatDateTime(appInfo.create_time) }}
            </div>
          </div>
        </div>

        <div class="mt-6 rounded-xl bg-gray-50 p-4">
          <div class="text-sm text-gray-500">更新日志</div>
          <div class="mt-2 whitespace-pre-wrap leading-7 text-gray-900">
            {{ appInfo.update_log || "-" }}
          </div>
        </div>
      </section>
    </div>

    <div v-else class="flex min-h-[60vh] items-center justify-center">
      <UEmpty
          icon="i-lucide-alert-circle"
          title="应用信息加载失败"
          description="未找到有效的 app_id，或者应用不存在。"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { app_manage_api } from "~/api/app_manage_api";
import toast from "~/composables/toast";
import type { GetAppInfoResp } from "~/types/app_manage";
import { getHttpErrorMessage } from "~/utils/http_error";
import {formattedAppIconUrl, formattedFileSize, formatDateTime} from "~/utils/app_file_info_utils";

definePageMeta({
  layout: false,
});

const route = useRoute();
const api = app_manage_api();
const isLoading = ref(true);
const appInfo = ref<GetAppInfoResp | null>(null);

onMounted(() => {
  void getAppInfo();
});

async function getAppInfo() {
  const appId = route.query.app_id;

  if (typeof appId !== "string" || !appId.trim()) {
    isLoading.value = false;
    toast.error("加载失败", "缺少 app_id");
    return;
  }

  try {
    const res = await api.get_app_info({
      app_id: appId,
    });

    if (res.data.code !== 200) {
      toast.error("加载失败", res.data.msg || "获取应用信息失败");
      return;
    }

    appInfo.value = res.data.data;
  } catch (error: unknown) {
    const errorMessage = getHttpErrorMessage(error, "获取应用信息失败");
    toast.error("加载失败", errorMessage);
  } finally {
    isLoading.value = false;
  }
}
</script>


<style scoped>
</style>
