<template>
    <div class="flex h-full min-h-0 flex-col overflow-hidden bg-white">
        <header class="px-4 py-3.5">
            <div class="text-lg font-bold text-gray-900">App列表</div>
        </header>

        <div v-if="isInitialLoading" class="flex flex-1 flex-col px-4 pb-4">
            <div class="border-b border-accented py-3.5">
                <div class="flex items-center justify-end gap-4">
                    <USkeleton class="h-10 w-52" />
                    <USkeleton class="h-10 w-28" />
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
                    class="grid grid-cols-[2fr_1.4fr_1fr_1fr_1.2fr] items-center gap-4 rounded-lg border border-gray-100 px-4 py-5"
                >
                    <div class="flex items-center gap-3">
                        <USkeleton class="h-12 w-12 rounded-xl" />
                        <div class="flex flex-1 flex-col gap-2">
                            <USkeleton class="h-5 w-2/3" />
                            <USkeleton class="h-4 w-4/5" />
                        </div>
                    </div>
                    <USkeleton class="h-5 w-4/5" />
                    <USkeleton class="h-5 w-3/4" />
                    <USkeleton class="h-5 w-3/4" />
                    <USkeleton class="h-5 w-full" />
                </div>
            </div>
        </div>

        <div
            v-else-if="appList.length === 0"
            class="flex items-center justify-center py-20"
        >
            <UEmpty
                class="flex items-center justify-between"
                icon="i-lucide-smartphone"
                title="暂无APP数据"
                description="还没有上传过 APP。现在去上传一个新版本吧！"
                :actions="[
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

        <div v-else class="flex min-h-0 flex-1 flex-col px-4">
            <div class="border-b border-accented py-3.5">
                <div class="flex items-center justify-end gap-4">
                    <UInput
                        v-model="_globalFilter"
                        placeholder="搜索应用名称 / 包名 / 渠道..."
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
                <UTable
                    sticky
                    v-model:page-index="pageIndex"
                    v-model:page-size="pageSize"
                    v-model:global-filter="_globalFilter"
                    :data="appList"
                    :columns="_columns"
                    :pagination-options="_paginationOptions"
                    class="flex-1 overflow-auto"
                >
                    <template #app_name-cell="{ row }">
                        <div class="flex min-w-0 items-center gap-3 py-1">
                            <div
                                class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                            >
                                <img
                                    v-if="_getAppIconUrl(row.original)"
                                    :src="_getAppIconUrl(row.original)"
                                    :alt="row.original.app_name || 'APP图标'"
                                    class="h-full w-full object-cover"
                                />
                                <UIcon
                                    v-else
                                    name="i-lucide-smartphone"
                                    class="h-6 w-6 text-gray-400"
                                />
                            </div>
                            <div class="min-w-0">
                                <div class="truncate font-medium text-gray-900">
                                    {{ row.original.app_name || "-" }}
                                </div>
                                <div class="truncate text-sm text-gray-500">
                                    {{ row.original.file_name || "-" }}
                                </div>
                            </div>
                        </div>
                    </template>

                    <template #package_name-cell="{ row }">
                        <div class="py-1">
                            <div class="font-medium text-gray-900">
                                {{ row.original.package_name || "-" }}
                            </div>
                            <div class="text-sm text-gray-500">
                                {{ row.original.channel_name || "-" }}
                            </div>
                        </div>
                    </template>

                    <template #version_name-cell="{ row }">
                        <div class="py-1">
                            <div class="font-medium text-gray-900">
                                {{ row.original.version_name || "-" }}
                            </div>
                            <div class="text-sm text-gray-500">
                                build {{ row.original.version_code || "-" }}
                            </div>
                        </div>
                    </template>

                    <template #file_size-cell="{ row }">
                        <div class="py-1 text-gray-900">
                            {{ _formatFileSize(row.original.file_size) }}
                        </div>
                    </template>

                    <template #create_time-cell="{ row }">
                        <div class="py-1">
                            <div class="text-gray-900">
                                {{ _formatDateTime(row.original.create_time) }}
                            </div>
                            <div class="line-clamp-2 text-sm text-gray-500">
                                {{ row.original.update_log || "暂无更新日志" }}
                            </div>
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
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { getPaginationRowModel } from "@tanstack/vue-table";
import { app_manage_api } from "~/api/app_manage_api";
import toast from "~/composables/toast";
import type { GetAppListResp, GetAppListRespItem } from "~/types/app_manage";
import { getHttpErrorMessage } from "~/utils/http_error";

const api = app_manage_api();
const config = useRuntimeConfig();
const iconServerUrl = config.public.apiBase;
const appList = ref<GetAppListRespItem[]>([]);
const totalAppCount = ref(0);
const totalPageCount = ref(0);
const pageIndex = ref(0);
const pageSize = ref(5);
const _globalFilter = ref("");
const isInitialLoading = ref(true);

onMounted(() => {
    void getAppList();
});

const _paginationOptions = {
    getPaginationRowModel: getPaginationRowModel(),
};

const _columns: TableColumn<GetAppListRespItem>[] = [
    {
        accessorKey: "app_name",
        header: "应用信息",
    },
    {
        accessorKey: "package_name",
        header: "包名 / 渠道",
    },
    {
        accessorKey: "version_name",
        header: "版本",
    },
    {
        accessorKey: "file_size",
        header: "文件大小",
    },
    {
        accessorKey: "create_time",
        header: "上传时间 / 更新日志",
    },
];

async function getAppList() {
    try {
        const res = await api.get_app_list_by_page({
            page_index: pageIndex.value,
            page_size: pageSize.value,
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

function _formatDateTime(value?: string) {
    if (!value) return "-";

    return new Date(value).toLocaleString("zh-CN").replaceAll("/", "-");
}

function _formatFileSize(bytes?: number) {
    if (!bytes) return "0 B";

    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex += 1;
    }

    return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function _getAppIconUrl(appItem: GetAppListRespItem) {
    const iconPath = appItem.app_icon_path?.trim();
    if (!iconPath) return "";
    if (/^https?:\/\//i.test(iconPath)) return iconPath;
    return `${iconServerUrl}${iconPath.startsWith("/") ? iconPath : `/${iconPath}`}`;
}

function _gotoUpload() {
    navigateTo("/app_upload");
}
</script>

<style scoped></style>
