<template>
    <div class="flex h-full min-h-0 flex-col overflow-hidden bg-default text-default">
        <header class="py-3.5 px-4">
            <div class="text-lg font-bold text-highlighted">应用发布</div>
        </header>

        <div class="min-h-0 flex-1 px-4 pb-4">
            <button
                v-if="!hasShownProgress"
                type="button"
                class="upload-dropzone flex h-full min-h-112 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-8 py-3 text-center transition"
                :class="
                    isDragging
                        ? 'border-primary-500 bg-primary-50/70 dark:bg-primary-500/15'
                        : hasChannel
                          ? 'border-default bg-elevated hover:border-primary-400 hover:bg-primary-50/40 dark:hover:bg-primary-500/10'
                          : 'cursor-not-allowed border-default bg-elevated opacity-70'
                "
                :disabled="isUploading || !hasChannel"
                @click="_openFilePicker"
                @dragover.prevent="_handleDragOver"
                @dragleave.prevent="_handleDragLeave"
                @drop.prevent="_handleDrop"
            >
                <input
                    ref="fileInputRef"
                    class="hidden"
                    type="file"
                    accept=".apk,application/vnd.android.package-archive"
                    :disabled="isUploading"
                    @change="_handleFileChange"
                />

                <div
                    class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-600"
                >
                    <UIcon name="i-lucide-upload" class="h-8 w-8" />
                </div>
                <div class="text-2xl font-semibold text-highlighted">
                    点击或拖拽上传 APK
                </div>
                <div class="mt-3 max-w-2xl text-sm leading-6 text-toned">
                    {{
                        hasChannel
                            ? "点击任意位置选择文件，或将 APK 直接拖入当前区域。"
                            : "请先创建渠道，创建完成后再上传 APK。"
                    }}
                </div>
                <div
                    class="mt-6 rounded-full border border-default bg-default px-4 py-2 text-sm text-toned shadow-sm"
                >
                    当前仅支持 `.apk` 文件
                </div>
            </button>

            <div
                v-else
                class="flex h-full `min-h-112 flex-col items-center justify-center rounded-2xl border border-default bg-elevated px-8 py-10 text-center"
            >
                <div class="text-sm font-medium tracking-[0.2em] text-toned">
                    {{
                        uploadStatus === "uploading"
                            ? "UPLOADING"
                            : uploadStatus === "success"
                              ? "COMPLETED"
                              : "FAILED"
                    }}
                </div>
                <div class="mt-4 text-6xl font-bold text-highlighted">
                    {{ uploadProgress }}%
                </div>
                <div
                    class="mt-6 w-full max-w-3xl overflow-hidden rounded-full bg-muted"
                >
                    <div
                        class="h-4 rounded-full bg-primary-500 transition-all duration-200"
                        :style="{ width: `${uploadProgress}%` }"
                    />
                </div>
                <div class="mt-6 text-sm text-toned">
                    {{
                        uploadStatus === "uploading"
                            ? "安装包正在上传，请勿关闭页面。"
                            : uploadStatus === "success"
                              ? "安装包上传完成，可继续上传新的版本。"
                              : "安装包上传失败，请检查网络或重新登录后再试。"
                    }}
                </div>
                <UButton
                    v-if="uploadStatus !== 'uploading'"
                    class="mt-8"
                    :color="uploadStatus === 'error' ? 'error' : 'primary'"
                    variant="solid"
                    :icon="uploadStatus === 'error' ? 'i-lucide-rotate-cw' : 'i-lucide-refresh-cw'"
                    @click="_resetUpload"
                >
                    {{ uploadStatus === "error" ? "重新上传" : "继续上传" }}
                </UButton>
            </div>
        </div>
    </div>

    <UModal
        v-model:open="showNoChannelModal"
        title="请先创建渠道"
        description="发布应用前请先创建至少一个渠道，否则后续无法完成发布。"
        :dismissible="false"
        :ui="{ footer: 'justify-end' }"
    >
        <template #footer>
            <UButton
                color="warning"
                variant="solid"
                icon="i-lucide-waypoints"
                @click="navigateTo('/app_channels')"
            >
                前往创建渠道
            </UButton>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import type { AxiosProgressEvent } from "axios";
import { ref } from "vue";
import { app_channel_api } from "~/api/app_channel_api";
import { app_manage_api } from "~/api/app_manage_api";
import { useAppUploadState } from "~/composables/app_shared_state";
import toast from "~/composables/toast";
import { getHttpErrorMessage } from "~/utils/http_error";
import {isApkFile} from "~/utils/app_file_info_utils";

const fileInputRef = ref<HTMLInputElement | null>(null);
const uploadProgress = ref(0);
const isUploading = ref(false);
const hasShownProgress = ref(false);
const uploadStatus = ref<"uploading" | "success" | "error">("success");
const isDragging = ref(false);
const isChannelLoading = ref(true);
const hasChannel = ref(true);
const showNoChannelModal = ref(false);
const api = app_manage_api();
const channelApi = app_channel_api();

onMounted(() => {
	void _checkChannels();
});

function _openFilePicker() {
	if (!hasChannel.value) {
		toast.error("无法上传", "请先创建渠道后再发布应用");
		void navigateTo("/app_channels");
		return;
	}
	if (isUploading.value) return;
	fileInputRef.value?.click();
}

async function uploadFile(file: File) {
	if (!isApkFile(file)) {
		toast.error("文件格式错误", "请上传 apk 文件");
		return;
	}

	const formData = new FormData();
	formData.append("file", file);

	try {
		isUploading.value = true;
		uploadProgress.value = 0;
		hasShownProgress.value = true;
		uploadStatus.value = "uploading";

		const response = await api.upload_app_file(formData, {
			onUploadProgress: (event: AxiosProgressEvent) => {
				if (!event.total) return;
				uploadProgress.value = Math.min(
					100,
					Math.round((event.loaded * 100) / event.total),
				);
			},
		});

		if (response.data.code === 200) {
			uploadProgress.value = 100;
			uploadStatus.value = "success";
			toast.success(
				"文件上传成功",
				response.data.data.upload_file_info || "文件上传成功",
			);
      const appUploadState = useAppUploadState();
      appUploadState.value = response.data.data;
      await navigateTo("/app_update_complete");
		} else {
			uploadStatus.value = "error";
			toast.error("文件上传失败", response.data.msg || "文件上传失败");
		}
	} catch (error) {
		uploadStatus.value = "error";
		const errorMessage = error instanceof Error ? error.message : "未知错误";
		console.error("文件上传失败:", error);
		toast.error("文件上传失败", errorMessage);
	} finally {
		isUploading.value = false;
		if (fileInputRef.value) {
			fileInputRef.value.value = "";
		}
	}
}

function _handleFileChange(event: Event) {
	const input = event.target as HTMLInputElement;
	const file = input.files?.[0];

	if (!file) return;

	void uploadFile(file);
}

function _handleDragOver() {
	if (isUploading.value || !hasChannel.value) return;
	isDragging.value = true;
}

function _handleDragLeave() {
	isDragging.value = false;
}

function _handleDrop(event: DragEvent) {
	isDragging.value = false;

	if (isUploading.value || !hasChannel.value) return;

	const file = event.dataTransfer?.files?.[0];
	if (!file) return;

	void uploadFile(file);
}

function _resetUpload() {
	uploadProgress.value = 0;
	hasShownProgress.value = false;
	uploadStatus.value = "success";
	isDragging.value = false;
	if (fileInputRef.value) {
		fileInputRef.value.value = "";
	}
}

async function _checkChannels() {
	try {
		isChannelLoading.value = true;
		const res = await channelApi.get_app_channel_list_by_page({
			page_index: 0,
			page_size: 1,
			channel_name: "",
		});

		if (res.data.code !== 200) {
			toast.error("获取渠道失败", res.data.msg || "获取渠道失败");
			hasChannel.value = false;
			return;
		}

		hasChannel.value = (res.data.data.total_channel_count || 0) > 0;
		showNoChannelModal.value = !hasChannel.value;
	} catch (error: unknown) {
		hasChannel.value = false;
		showNoChannelModal.value = true;
		const errorMessage = getHttpErrorMessage(error, "获取渠道失败");
		toast.error("获取渠道失败", errorMessage);
	} finally {
		isChannelLoading.value = false;
	}
}
</script>
