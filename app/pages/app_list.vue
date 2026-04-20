<template>
  <div class="flex h-full min-h-0 flex-col overflow-hidden bg-default text-default">
    <header class="px-4 py-3.5">
      <div class="text-lg font-bold text-highlighted">App列表</div>
    </header>

    <div v-if="isInitialLoading" class="flex flex-1 flex-col px-4 pb-4">
      <div class="border-b border-accented py-3.5">
        <div class="flex items-center justify-end gap-4">
          <USkeleton class="h-10 w-52"/>
          <USkeleton class="h-10 w-28"/>
        </div>
      </div>
      <div class="flex flex-1 flex-col gap-4 py-4">
        <div class="grid grid-cols-[2fr_1.4fr_1fr_1fr_1.2fr] gap-4">
          <USkeleton
              v-for="item in 5"
              :key="`app-header-${item}`"
              class="h-5 w-full"
          />
        </div>
        <div
            v-for="row in 5"
            :key="`app-row-${row}`"
            class="grid grid-cols-[2fr_1.4fr_1fr_1fr_1.2fr] items-center gap-4 rounded-lg border border-default px-4 py-5"
        >
          <div class="flex items-center gap-3">
            <USkeleton class="h-12 w-12 rounded-xl"/>
            <div class="flex flex-1 flex-col gap-2">
              <USkeleton class="h-5 w-2/3"/>
              <USkeleton class="h-4 w-4/5"/>
            </div>
          </div>
          <USkeleton class="h-5 w-4/5"/>
          <USkeleton class="h-5 w-3/4"/>
          <USkeleton class="h-5 w-3/4"/>
          <USkeleton class="h-5 w-full"/>
        </div>
      </div>
    </div>

    <div v-else class="flex min-h-0 flex-1 flex-col px-4">
      <div class="border-b border-accented py-3.5">
        <div class="flex items-center justify-end gap-4">
          <UInput
              v-model="searchKeyword"
              class="w-55 min-w-55"
              placeholder="搜索应用名称 / 包名 / 渠道..."
              @compositionstart="isComposing = true"
              @compositionend="_handleCompositionEnd"
          >
            <template #trailing>
              <UButton
                  v-if="searchKeyword"
                  icon="i-lucide-x"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  aria-label="清空搜索"
                  @click="searchKeyword = ''"
              />
            </template>
          </UInput>
          <UButton
              icon="i-lucide-refresh-cw"
              color="neutral"
              variant="outline"
              label="刷新"
              @click="_searchAppList()"
          />
          <UButton
              icon="i-lucide-upload"
              color="primary"
              variant="solid"
              label="上传APP"
              @click="navigateTo('/app_upload')"
          />
        </div>
      </div>

      <div class="flex min-h-0 flex-1 flex-col">
        <div v-if="appList.length === 0" class="flex flex-1 items-center justify-center py-20">
          <UEmpty
              class="flex items-center justify-between"
              icon="i-lucide-smartphone"
              :title="searchKeyword.trim() ? '未找到匹配的APP' : '暂无APP数据'"
              :description="searchKeyword.trim() ? '换个关键词再试一次。' : '还没有上传过 APP。现在去上传一个新版本吧！'"
              :actions="searchKeyword.trim()
                ? [
                    {
                      icon: 'i-lucide-eraser',
                      label: '清空搜索',
                      onClick: () => {
                        searchKeyword = '';
                      },
                    },
                    {
                      icon: 'i-lucide-refresh-cw',
                      label: '重新加载',
                      color: 'neutral',
                      variant: 'subtle',
                      onClick: () => getAppList(),
                    },
                  ]
                : [
                    {
                      icon: 'i-lucide-upload',
                      label: '上传APP',
                      onClick: () => _gotoUpload(),
                    },
                    {
                      icon: 'i-lucide-refresh-cw',
                      label: '刷新看看',
                      color: 'neutral',
                      variant: 'subtle',
                      onClick: () => getAppList(),
                    },
                  ]"
          />
        </div>
        <template v-else>
          <UTable
              sticky
              v-model:page-index="pageIndex"
              v-model:page-size="pageSize"
              :data="appList"
              :columns="_columns"
              :pagination-options="_paginationOptions"
              class="flex-1 overflow-auto"
          >
            <template #app_icon-cell="{ row }">
              <div class="flex min-w-0 items-center gap-3 py-1">
                <div
                    class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-default bg-elevated"
                >
                  <img
                      v-if="formattedAppIconUrl(row.original.app_icon_path?.trim() || '')"
                      :src="formattedAppIconUrl(row.original.app_icon_path?.trim() || '')"
                      :alt="row.original.app_icon_path || 'APP图标'"
                      class="h-full w-full object-cover"
                  />
                  <UIcon
                      v-else
                      name="i-lucide-smartphone"
                      class="h-6 w-6 text-muted"
                  />
                </div>
              </div>
            </template>
            <template #action-cell="{ row }">
              <div class="flex gap-2">
                <UButton
                    icon="i-lucide-info"
                    color="neutral"
                    variant="ghost"
                    aria-label="Actions"
                    @click="_showAppInfoModal(row.original)"
                    label="详情"
                />
                <UButton
                    icon="i-lucide-download"
                    color="info"
                    variant="ghost"
                    aria-label="Actions"
                    @click="_navigateToDownload(row.original)"
                    label="下载"
                />
                <UButton
                    icon="i-lucide-trash"
                    color="error"
                    variant="ghost"
                    aria-label="Actions"
                    @click="_showDeleteAppModal(row.original)"
                    label="删除"
                />
              </div>
            </template>
          </UTable>

          <div class="flex justify-end border-t border-default px-4 pt-4">
            <UPagination
                :page="pageIndex + 1"
                :items-per-page="pageSize"
                :total="totalAppCount"
                @update:page="
                              (p) => {
                                  pageIndex = p - 1;
                                  getAppList();
                              }
                          "
            />
          </div>
        </template>
      </div>
    </div>
  </div>

  <UModal
      v-model:open="isShowAppInfoModal"
      title="APP详情"
      :description="appInfoObj?.app_name || '查看当前 APP 详情信息'"
      :ui="{ body: 'space-y-4', footer: 'justify-end' }"
  >
    <template #body>
      <div v-if="isAppInfoLoading" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <USkeleton
            v-for="item in 8"
            :key="`app-detail-skeleton-${item}`"
            class="h-16 w-full rounded-xl"
        />
      </div>
      <div v-else-if="appInfoObj" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div
            v-for="item in appInfoItems"
            :key="item.label"
            class="rounded-xl border border-default bg-elevated px-4 py-3"
        >
          <div class="text-xs text-toned">{{ item.label }}</div>
          <div class="mt-1 break-all text-sm font-medium text-highlighted">
            {{ item.value || "-" }}
          </div>
        </div>
      </div>
      <div
          v-else
          class="rounded-xl border border-dashed border-default px-4 py-6 text-sm text-toned"
      >
        暂无可展示的 APP 详情。
      </div>
    </template>

    <template #footer="{ close }">
      <UButton
          label="前往下载页"
          color="primary"
          variant="subtle"
          @click="
            appInfoObj && (_navigateToDownload(appInfoObj), close())
          "
      />
      <UButton
          label="关闭"
          color="neutral"
          variant="subtle"
          @click="close"
      />
    </template>
  </UModal>

  <UModal
      v-model:open="isShowDeleteAppModal"
      title="删除APP"
      :description="`确认删除应用 '${deleteAppObj?.app_name || ''}' 吗？`"
      :ui="{ footer: 'justify-end' }"
  >
    <template #footer="{ close }">
      <UButton
          label="删除"
          color="error"
          variant="subtle"
          @click="_deleteApp()"
      />
      <UButton
          label="取消"
          color="neutral"
          variant="subtle"
          @click="close"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type {TableColumn} from "@nuxt/ui";
import {getPaginationRowModel} from "@tanstack/vue-table";
import {app_manage_api} from "~/api/app_manage_api";
import toast from "~/composables/toast";
import type {GetAppInfoResp, GetAppListResp, GetAppListRespItem} from "~/types/app_manage";
import {getHttpErrorMessage} from "~/utils/http_error";
import {formattedAppIconUrl, formattedFileSize, formatDateTime} from "~/utils/app_file_info_utils";


const api = app_manage_api();
const config = useRuntimeConfig();
const iconServerUrl = config.public.apiBase;
const appList = ref<GetAppListRespItem[]>([]);
const totalAppCount = ref(0);
const totalPageCount = ref(0);
const pageIndex = ref(0);
const pageSize = ref(5);
const searchKeyword = ref("");
const isInitialLoading = ref(true);
const isShowAppInfoModal = ref(false);
const isAppInfoLoading = ref(false);
const appInfoObj = ref<GetAppInfoResp>();
const isShowDeleteAppModal = ref(false);
const deleteAppObj = ref<GetAppListRespItem>();
const isComposing = ref(false);
let searchTimer: ReturnType<typeof setTimeout> | undefined;

onMounted(() => {
  void getAppList();
});

onBeforeUnmount(() => {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
});

const _paginationOptions = {
  getPaginationRowModel: getPaginationRowModel(),
};

const appInfoItems = computed(() => {
  if (!appInfoObj.value) {
    return [];
  }

  return [
    {label: "应用名称", value: appInfoObj.value.app_name},
    {label: "包名", value: appInfoObj.value.package_name},
    {label: "渠道", value: appInfoObj.value.channel_name},
    {label: "版本名称", value: appInfoObj.value.version_name},
    {label: "版本号", value: appInfoObj.value.version_code},
    {label: "文件名称", value: appInfoObj.value.file_name},
    {label: "文件大小", value: formattedFileSize(appInfoObj.value.file_size)},
    {label: "上传时间", value: formatDateTime(appInfoObj.value.create_time)},
    {label: "更新时间", value: formatDateTime(appInfoObj.value.update_time)},
    {label: "更新日志", value: appInfoObj.value.update_log},
    {label: "文件路径", value: appInfoObj.value.file_path},
    {label: "图标路径", value: appInfoObj.value.app_icon_path},
  ];
});

const _columns: TableColumn<GetAppListRespItem>[] = [
  {
    accessorKey: "app_icon",
    header: "应用图标",
  },
  {
    accessorKey: "app_name",
    header: "应用名称",
  },
  {
    accessorKey: "package_name",
    header: "包名",
  },
  {
    accessorKey: "channel_name",
    header: "渠道",
  },
  {
    accessorKey: "version_name",
    header: "版本名称",
  },
  {
    accessorKey: "version_code",
    header: "版本号",
  },
  {
    accessorKey: "file_size",
    header: "文件大小",
    cell: ({row}) => formattedFileSize(row.original.file_size),
  },
  {
    accessorKey: "create_time",
    header: "上传时间",
    cell: ({row}) => formatDateTime(row.original.create_time),
  },
  {
    accessorKey: "action",
    header: "操作",
    id: "action",
  },

];

async function getAppList() {
  const keyword = searchKeyword.value.trim();

  try {
    const res = await api.get_app_list_by_page({
      page_index: pageIndex.value,
      page_size: pageSize.value,
      search_key: keyword,
    });

    if (res.data.code !== 200) {
      toast.error("获取APP列表失败", res.data.msg || "获取APP列表失败");
      return;
    }

    const resp = res.data.data as GetAppListResp;
    totalPageCount.value = resp.total_page_count || 0;
    totalAppCount.value = resp.total_app_count || 0;
    appList.value = resp.app_list || [];
  } catch (error: unknown) {
    const errorMessage = getHttpErrorMessage(error, "获取APP列表失败");
    toast.error("获取APP列表失败", errorMessage);
  } finally {
    isInitialLoading.value = false;
  }
}

function _gotoUpload() {
  navigateTo("/app_upload");
}

function _searchAppList() {
  pageIndex.value = 0;
  void getAppList();
}

function _handleCompositionEnd() {
  isComposing.value = false;
  _searchAppList();
}

watch(searchKeyword, () => {
  if (isComposing.value) {
    return;
  }

  if (searchTimer) {
    clearTimeout(searchTimer);
  }

  searchTimer = setTimeout(() => {
    _searchAppList();
  }, 300);
});

async function _showAppInfoModal(appItem: GetAppListRespItem) {
  if (!appItem.app_id) {
    toast.error("获取APP详情失败", "app_id 不能为空");
    return;
  }

  isShowAppInfoModal.value = true;
  isAppInfoLoading.value = true;
  appInfoObj.value = undefined;

  try {
    const res = await api.get_app_info({
      app_id: appItem.app_id,
    });

    if (res.data.code !== 200) {
      toast.error("获取APP详情失败", res.data.msg || "获取APP详情失败");
      isShowAppInfoModal.value = false;
      return;
    }

    appInfoObj.value = res.data.data;
  } catch (error: unknown) {
    const errorMessage = getHttpErrorMessage(error, "获取APP详情失败");
    toast.error("获取APP详情失败", errorMessage);
    isShowAppInfoModal.value = false;
  } finally {
    isAppInfoLoading.value = false;
  }
}

function _navigateToDownload(appItem: GetAppListRespItem) {
  navigateTo({
    path: "/app_download",
    query: {
      app_id: appItem.app_id,
    },
  });
}


function _showDeleteAppModal(appItem: GetAppListRespItem) {
  isShowDeleteAppModal.value = true;
  deleteAppObj.value = appItem;
}

async function _deleteApp() {
  if (!deleteAppObj.value?.app_id) {
    toast.error("删除APP失败", "app_id 不能为空");
    return;
  }

  try {
    const res = await api.delete_app({
      app_id: deleteAppObj.value.app_id,
      app_name: deleteAppObj.value.app_name || "",
    });

    if (res.data.code !== 200) {
      toast.error("删除APP失败", res.data.msg || "删除APP失败");
      return;
    }

    toast.success("删除APP成功", res.data.data.app_name || "删除APP成功");

    if (appList.value.length === 1 && pageIndex.value > 0) {
      pageIndex.value -= 1;
    }

    await getAppList();
    isShowDeleteAppModal.value = false;
    deleteAppObj.value = undefined;
  } catch (error: unknown) {
    const errorMessage = getHttpErrorMessage(error, "删除APP失败");
    toast.error("删除APP失败", errorMessage);
  }
}

</script>

<style scoped></style>
