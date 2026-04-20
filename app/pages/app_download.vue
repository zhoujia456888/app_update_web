<template>
  <div class="download-page min-h-screen px-4 py-4 sm:px-6 lg:px-8 lg:py-10">

    <div v-if="isLoading" class="download-layout mx-auto flex w-full max-w-6xl">
      <section
        class="flex w-full overflow-hidden rounded-[36px] border border-white/70 bg-white/82 shadow-[0_35px_100px_rgba(15,23,42,0.12)] backdrop-blur"
      >
        <div class="download-content-grid grid w-full gap-5 p-5 sm:p-8 xl:grid-cols-[minmax(0,1.45fr)_340px] xl:p-6">
          <div class="flex min-h-0 flex-col gap-5">
            <div
              class="brand-panel rounded-[30px] border border-white/65 bg-white/72 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] sm:p-6"
            >
              <div class="flex flex-row items-center gap-6">
                <USkeleton class="download-skeleton h-24 w-24 rounded-[30px]" />
                <div class="flex flex-1">
                  <USkeleton class="download-skeleton h-12 w-full max-w-[24rem] rounded-[20px]" />
                </div>
              </div>
            </div>

            <div class="flex min-h-0 flex-1 flex-col">
              <div class="flex min-h-0 flex-1 flex-col rounded-[30px] border border-white/70 bg-white/70 p-5 backdrop-blur-sm">
                <div class="grid gap-3 sm:grid-cols-3">
                  <USkeleton
                    v-for="item in 6"
                    :key="`stat-${item}`"
                    class="download-skeleton h-20 w-full rounded-[22px]"
                  />
                </div>

                <div class="download-log-shell mt-5 flex min-h-0 flex-1 flex-col rounded-[26px] border border-slate-200/75 p-4 sm:p-5">
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <USkeleton class="download-skeleton mt-2 h-8 w-28 rounded-[16px]" />
                    </div>
                  </div>

                  <div class="download-log-list mt-5 flex min-h-0 flex-1 flex-col gap-3">
                    <div
                      v-for="item in 4"
                      :key="`log-item-${item}`"
                      class="download-log-item flex gap-4 rounded-[22px] border border-slate-200/80 bg-white/92 px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
                    >
                      <USkeleton class="download-skeleton h-8 w-8 shrink-0 rounded-full" />
                      <div class="flex flex-1 flex-col gap-3 pt-1">
                        <USkeleton class="download-skeleton h-4 w-full rounded-full" />
                        <USkeleton class="download-skeleton h-4 w-5/6 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="brand-card rounded-[30px] p-5 text-white shadow-[0_30px_70px_rgba(15,23,42,0.22)] xl:h-full">
            <USkeleton class="download-skeleton--dark mt-2 h-10 w-52 rounded-[18px]" />
            <USkeleton class="download-skeleton mt-5 aspect-square w-full rounded-[26px] bg-white/90" />
            <div class="mt-4 grid gap-3">
              <USkeleton class="download-skeleton--dark h-20 w-full rounded-[22px]" />
              <USkeleton class="download-skeleton--dark h-20 w-full rounded-[22px]" />
            </div>
            <USkeleton class="download-skeleton--dark mt-4 h-12 w-full rounded-full" />
          </div>
        </div>
      </section>
    </div>

    <div v-else-if="appInfo" class="download-layout mx-auto flex w-full max-w-6xl">
      <section
        class="flex w-full overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_35px_100px_rgba(15,23,42,0.12)] backdrop-blur"
      >
        <div class="download-content-grid grid w-full gap-5 p-5 sm:p-8 xl:grid-cols-[minmax(0,1.45fr)_340px] xl:p-6">
          <div class="flex min-h-0 flex-col gap-5">
            <div
              class="brand-panel rounded-[30px] border border-white/55 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.38)] sm:px-6"
            >
              <div class="flex gap-6 flex-row items-center ">
                <div
                  class="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[30px] border border-white/80 bg-gradient-to-br from-slate-950 via-slate-800 to-amber-500 shadow-[0_18px_40px_rgba(15,23,42,0.18)]"
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
                    class="h-11 w-11 text-white/80"
                  />
                </div>

                <div class="flex">

                      <div
                        class="font-['Avenir_Next','PingFang_SC','Microsoft_YaHei',sans-serif] text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-4xl"
                      >
                        {{ appInfo.app_name || "未识别应用名称" }}
                      </div>
                    </div>
              </div>
            </div>

            <div class="flex min-h-0 flex-1 flex-col">
              <div
                class="flex min-h-0 flex-1 flex-col rounded-[30px] border border-white/75 bg-white/72 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)] backdrop-blur-sm"
              >
                <div class="grid gap-3 sm:grid-cols-3">
                  <div
                    v-for="item in highlightStats"
                    :key="item.label"
                    class="rounded-[22px] border border-white/75 px-4 py-4 shadow"
                  >
                    <div class="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                      {{ item.label }}
                    </div>
                    <div class="mt-2 text-base font-semibold text-slate-950">
                      {{ item.value }}
                    </div>
                  </div>
                </div>

                <div class="download-log-shell mt-5 flex min-h-0 flex-1 flex-col rounded-[26px] border border-slate-200/75 p-4 sm:p-5">
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <div class="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                        更新内容
                      </div>
                    </div>
                  </div>

                  <div class="download-log-list mt-5 flex min-h-0 flex-1 flex-col gap-3">
                    <div
                      v-for="(item, index) in normalizedUpdateLogs"
                      :key="`${index}-${item}`"
                      class="download-log-item flex gap-4 rounded-[22px] border border-slate-200/80 bg-white/92 px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
                    >
                      <div
                        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white"
                      >
                        {{ `${index + 1}`.padStart(2, "0") }}
                      </div>
                      <div class="min-w-0 flex-1 pt-0.5">
                        <div class="mt-1 text-sm leading-7 text-slate-700 sm:text-[15px]">
                          {{ item }}
                        </div>
                      </div>
                    </div>

                    <div
                      v-if="normalizedUpdateLogs.length === 0"
                      class="flex flex-1 items-center rounded-[22px] border border-dashed border-slate-200 bg-white/80 px-4 py-5 text-sm leading-7 text-slate-500"
                    >
                      暂无更新日志说明。
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside class="brand-card rounded-[30px] p-5 text-white shadow-[0_30px_70px_rgba(15,23,42,0.22)] xl:h-full">
            <div class="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">
              手机扫码或直接下载
            </div>
            <div
              class="qr-code mt-5 rounded-[26px] border border-white/18 bg-white p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
              v-html="pageQrCodeSvg"
            />

            <div class="mt-4 grid gap-3">
              <div class="rounded-[22px] bg-white/8 px-4 py-3 ring-1 ring-inset ring-white/15">
                <div class="text-[11px] uppercase tracking-[0.18em] text-white/45">当前页面</div>
                <div class="mt-2 break-all text-xs leading-6 text-white/78">
                  {{ currentPageUrl || "-" }}
                </div>
              </div>
              <div class="rounded-[22px] bg-white/8 px-4 py-3 ring-1 ring-inset ring-white/15">
                <div class="text-[11px] uppercase tracking-[0.18em] text-white/45">安装包地址</div>
                <div class="mt-2 break-all text-xs leading-6 text-white/78">
                  {{ downloadUrl || "-" }}
                </div>
              </div>
            </div>

            <UButton
              class="mt-5 h-12 w-full justify-center rounded-full bg-white text-sm font-semibold text-slate-950 ring-0 hover:bg-white/90"
              color="primary"
              variant="solid"
              icon="i-lucide-download"
              :to="downloadUrl"
              target="_blank"
            >
              下载 APK
            </UButton>
          </aside>
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
import { renderSVG } from "uqr";
import { app_manage_api } from "~/api/app_manage_api";
import toast from "~/composables/toast";
import type { GetAppInfoResp } from "~/types/app_manage";
import { formattedAppIconUrl, formattedFileSize, formatDateTime } from "~/utils/app_file_info_utils";
import { getHttpErrorMessage } from "~/utils/http_error";

definePageMeta({
  layout: false,
});

const route = useRoute();
const config = useRuntimeConfig();
const api = app_manage_api();
const isLoading = ref(true);
const appInfo = ref<GetAppInfoResp | null>(null);

const currentPageUrl = computed(() => {
  if (!import.meta.client) {
    return "";
  }

  return new URL(route.fullPath, window.location.origin).toString();
});

const downloadUrl = computed(() => {
  const filePath = appInfo.value?.file_path?.trim();

  if (!filePath) {
    return "";
  }

  if (/^https?:\/\//i.test(filePath)) {
    return filePath;
  }

  const baseUrl = config.public.apiBase || "";
  return `${baseUrl}${filePath.startsWith("/") ? filePath : `/${filePath}`}`;
});

const pageQrCodeSvg = computed(() => {
  if (!currentPageUrl.value) {
    return "";
  }

  return renderSVG(currentPageUrl.value, {
    border: 1,
    pixelSize: 6,
  });
});

const normalizedUpdateLogs = computed(() => {
  const rawLog = appInfo.value?.update_log?.trim();

  if (!rawLog) {
    return [];
  }

  return rawLog
    .split(/\r?\n+/)
    .map((item) => item.replace(/^\s*(?:[-*•]|\d+[.)、])\s*/, "").trim())
    .filter(Boolean);
});

const highlightStats = computed(() => {
  if (!appInfo.value) {
    return [];
  }

  return [
    { label: "包名", value: appInfo.value.package_name || "-" },
    { label: "渠道", value: appInfo.value.channel_name || "-" },
    { label: "版本名称", value: appInfo.value.version_name || "版本待补充" },
    { label: "版本号", value: appInfo.value.version_code || "版本待补充" },
    { label: "文件大小", value: formattedFileSize(appInfo.value.file_size || 0) },
    { label: "上传时间", value: formatDateTime(appInfo.value.create_time) },
  ];
});

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
.download-page {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(251, 191, 36, 0.24), transparent 26%),
    radial-gradient(circle at 82% 8%, rgba(56, 189, 248, 0.24), transparent 28%),
    linear-gradient(180deg, #fffaf0 0%, #f6f7fb 42%, #eef2f7 100%);
}

.download-page__glow {
  position: absolute;
  width: 32rem;
  height: 32rem;
  border-radius: 9999px;
  filter: blur(90px);
  opacity: 0.5;
  pointer-events: none;
}

.download-page__glow--warm {
  top: -10rem;
  left: -8rem;
  background: rgba(251, 191, 36, 0.28);
}

.download-page__glow--cool {
  right: -10rem;
  top: 8rem;
  background: rgba(56, 189, 248, 0.22);
}

.brand-panel {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at right top, rgba(56, 189, 248, 0.2), transparent 26%),
    radial-gradient(circle at left bottom, rgba(251, 191, 36, 0.18), transparent 28%),
    linear-gradient(135deg, rgba(255, 248, 235, 0.95), rgba(255, 255, 255, 0.72) 45%, rgba(240, 249, 255, 0.88));
}

.brand-card {
  background:
    radial-gradient(circle at top right, rgba(251, 191, 36, 0.3), transparent 24%),
    radial-gradient(circle at left center, rgba(56, 189, 248, 0.22), transparent 30%),
    linear-gradient(160deg, #0f172a 0%, #172554 52%, #1d4ed8 100%);
}

.download-layout {
  min-height: calc(100vh - 2rem);
}

.download-content-grid {
  min-height: 100%;
}

.download-log-shell {
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.36));
}

.download-log-shell::before {
  content: "";
  position: absolute;
  inset: 0 0 auto;
  height: 88px;
  background: linear-gradient(180deg, rgba(148, 163, 184, 0.08), rgba(148, 163, 184, 0));
  pointer-events: none;
}

.download-log-item {
  position: relative;
}

.download-log-list {
  overflow-y: auto;
}

.download-skeleton {
  border: 1px solid rgba(255, 255, 255, 0.58);
}

.download-skeleton--dark {
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.qr-code :deep(svg) {
  display: block;
  width: 100%;
  height: auto;
}

@media (max-width: 1279px) {
  .download-layout {
    min-height: auto;
  }
}
</style>
