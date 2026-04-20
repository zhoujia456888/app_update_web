<template>
  <div class="flex h-full min-h-0 flex-col overflow-hidden bg-default text-default">
    <header class="px-4 py-3.5">
      <div class="text-lg font-bold text-highlighted">首页</div>
    </header>

    <div class="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
      <div class="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section class="rounded-2xl border border-default bg-default p-6 shadow-sm">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div class="text-2xl font-semibold text-highlighted">最近操作</div>
              <div class="mt-2 text-sm text-toned">
                展示当前用户最近的登录、创建、修改、删除渠道与 APP 操作记录。
              </div>
            </div>

            <UButton
                color="neutral"
                variant="outline"
                icon="i-lucide-refresh-cw"
                :loading="isLoading"
                @click="getRecentOperationLogs"
            >
              刷新
            </UButton>
          </div>
        </section>

        <section class="grid gap-4 md:grid-cols-3">
          <UCard>
            <div class="text-sm text-toned">总记录数</div>
            <div class="mt-2 text-2xl font-semibold text-highlighted">
              {{ totalCount }}
            </div>
          </UCard>
          <UCard>
            <div class="text-sm text-toned">最近一次操作</div>
            <div class="mt-2 text-sm font-medium text-highlighted">
              {{ latestOperationLabel }}
            </div>
          </UCard>
          <UCard>
            <div class="text-sm text-toned">最近时间</div>
            <div class="mt-2 text-sm font-medium text-highlighted">
              {{ latestOperationTime }}
            </div>
          </UCard>
        </section>

        <section class="rounded-2xl border border-default bg-default shadow-sm">
          <div v-if="isLoading" class="space-y-4 p-6">
            <USkeleton
                v-for="item in 5"
                :key="`operation-skeleton-${item}`"
                class="h-20 w-full rounded-xl"
            />
          </div>

          <div v-else-if="operationLogs.length === 0" class="p-6">
            <UEmpty
                icon="i-lucide-clipboard-list"
                title="暂无最近操作日志"
                description="当前还没有可展示的操作记录。"
                :actions="[
                  {
                    icon: 'i-lucide-refresh-cw',
                    label: '重新加载',
                    onClick: () => getRecentOperationLogs(),
                  },
                ]"
            />
          </div>

          <div v-else class="divide-y divide-default">
            <div
                v-for="(item, index) in normalizedLogs"
                :key="`${index}-${item.title}-${item.time}`"
                class="flex items-start gap-4 px-6 py-5"
            >
              <div
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-elevated text-primary"
              >
                <UIcon :name="item.icon" class="h-5 w-5"/>
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div class="min-w-0">
                    <div class="break-all text-sm font-semibold text-highlighted">
                      {{ item.title }}
                    </div>
                    <div class="mt-1 break-all text-sm leading-6 text-toned">
                      {{ item.description }}
                    </div>
                  </div>

                  <div class="shrink-0 text-xs text-toned">
                    {{ item.time }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {operation_logs_api} from "~/api/operation_log";
import toast from "~/composables/toast";
import type {GetRecentOperationLogsResp, OperationLogItem} from "~/types/user";
import {getHttpErrorMessage} from "~/utils/http_error";

const api = operation_logs_api();
const isLoading = ref(true);
const operationLogs = ref<OperationLogItem[]>([]);
const totalCount = ref(0);

const normalizedLogs = computed(() => {
  return operationLogs.value.map((item) => {
    const type = item.operation_type.toLowerCase();
    const time = _formatDateTime(item.create_time);

    return {
      icon: _resolveOperationIcon(type),
      title: _buildOperationTitle(item.username, type),
      description: item.operation_detail,
      time,
    };
  });
});

const latestOperationLabel = computed(() => {
  return normalizedLogs.value[0]?.title || "-";
});

const latestOperationTime = computed(() => {
  return normalizedLogs.value[0]?.time || "-";
});

onMounted(() => {
  void getRecentOperationLogs();
});

async function getRecentOperationLogs() {
  try {
    isLoading.value = true;
    const res = await api.get_recent_operation_logs();

    if (res.data.code !== 200) {
      toast.error("获取最近操作日志失败", res.data.msg || "获取最近操作日志失败");
      return;
    }

    const resp = res.data.data as GetRecentOperationLogsResp;
    operationLogs.value = resp.operation_logs || [];
    totalCount.value = resp.total_count || 0;
  } catch (error: unknown) {
    const errorMessage = getHttpErrorMessage(error, "获取最近操作日志失败");
    toast.error("获取最近操作日志失败", errorMessage);
  } finally {
    isLoading.value = false;
  }
}

function _resolveOperationIcon(type: string) {
  if (type.includes("login")) {
    return "i-lucide-log-in";
  }
  if (type.includes("delete")) {
    return "i-lucide-trash";
  }
  if (type.includes("update") || type.includes("edit")) {
    return "i-lucide-pencil";
  }
  if (type.includes("create") || type.includes("add")) {
    return "i-lucide-plus";
  }
  return "i-lucide-history";
}

function _buildOperationTitle(username: string, type: string) {
  const typeText = _translateOperationType(type);

  if (username && typeText) {
    return `${username} ${typeText}`;
  }

  return username || "操作记录";
}

function _translateOperationType(type: string) {
  if (type.includes("login")) return "登录";
  if (type.includes("create") || type.includes("add")) return "创建";
  if (type.includes("update") || type.includes("edit")) return "修改";
  if (type.includes("delete") || type.includes("remove")) return "删除";
  return "";
}

function _formatDateTime(value: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("zh-CN").replaceAll("/", "-");
}
</script>
