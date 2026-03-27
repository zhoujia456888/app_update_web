<template>
  <div class="flex h-full min-h-0 flex-col overflow-hidden bg-white">
    <header class="py-3.5 px-4">
      <div class="text-lg font-bold text-gray-900">应用发布</div>
    </header>

    <div class="min-h-0 flex-1 px-4">
      <button
          v-if="!hasShownProgress"
          type="button"
          class="upload-dropzone flex h-full min-h-[28rem] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-8 py-3 text-center transition"
          :class="isDragging ? 'border-primary-500 bg-primary-50/70' : 'border-gray-300 bg-gray-50/80 hover:border-primary-400 hover:bg-primary-50/40'"
          :disabled="isUploading"
          @click="openFilePicker"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
      >
        <input
            ref="fileInputRef"
            class="hidden"
            type="file"
            accept=".apk,application/vnd.android.package-archive"
            :disabled="isUploading"
            @change="handleFileChange"
        >

        <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-600">
          <UIcon name="i-lucide-upload" class="h-8 w-8"/>
        </div>
        <div class="text-2xl font-semibold text-gray-900">点击或拖拽上传 APK</div>
        <div class="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
          点击任意位置选择文件，或将 APK 直接拖入当前区域。
        </div>
        <div class="mt-6 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 shadow-sm">
          当前仅支持 `.apk` 文件
        </div>
      </button>

      <div
          v-else
          class="flex h-full min-h-[28rem] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 px-8 py-10 text-center"
      >
        <div class="text-sm font-medium tracking-[0.2em] text-gray-400">
          {{ isUploading ? 'UPLOADING' : 'COMPLETED' }}
        </div>
        <div class="mt-4 text-6xl font-bold text-gray-900">{{ uploadProgress }}%</div>
        <div class="mt-6 w-full max-w-3xl overflow-hidden rounded-full bg-gray-200">
          <div
              class="h-4 rounded-full bg-primary-500 transition-all duration-200"
              :style="{ width: `${uploadProgress}%` }"
          />
        </div>
        <div class="mt-6 text-sm text-gray-500">
          {{ isUploading ? '安装包正在上传，请勿关闭页面。' : '安装包上传完成，可继续上传新的版本。' }}
        </div>
        <UButton
            v-if="!isUploading"
            class="mt-8"
            color="primary"
            variant="solid"
            icon="i-lucide-refresh-cw"
            @click="resetUpload"
        >
          继续上传
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {app_manage_api} from "~/api/app_manage_api";
import toast from "~/composables/toast";
import {ref} from "vue";
import type {AxiosProgressEvent} from "axios";

const fileInputRef = ref<HTMLInputElement | null>(null);
const uploadProgress = ref(0);
const isUploading = ref(false);
const hasShownProgress = ref(false);
const isDragging = ref(false);
const api = app_manage_api();

function openFilePicker() {
  if (isUploading.value) return;
  fileInputRef.value?.click();
}

function isApkFile(file: File) {
  return file.name.toLowerCase().endsWith(".apk") || file.type === "application/vnd.android.package-archive";
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

    const response = await api.upload_app_file(formData, {
      onUploadProgress: (event: AxiosProgressEvent) => {
        if (!event.total) return;
        uploadProgress.value = Math.min(100, Math.round((event.loaded * 100) / event.total));
      }
    });

    if (response.data.code === 200) {
      uploadProgress.value = 100;
      toast.success("文件上传成功", response.data.msg || "文件上传成功");
      await navigateTo({
        path: '/app_update_complete',
        query: {
          info: JSON.stringify(response.data.data)
        }
      })
    } else {
      toast.error("文件上传失败", response.data.msg || "文件上传失败");
    }
  } catch (error) {
    console.error("文件上传失败:", error);
    toast.error("文件上传失败", "网络错误，请稍后重试");
  } finally {
    isUploading.value = false;
    if (fileInputRef.value) {
      fileInputRef.value.value = "";
    }
  }
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  void uploadFile(file);
}

function handleDragOver() {
  if (isUploading.value) return;
  isDragging.value = true;
}

function handleDragLeave() {
  isDragging.value = false;
}

function handleDrop(event: DragEvent) {
  isDragging.value = false;

  if (isUploading.value) return;

  const file = event.dataTransfer?.files?.[0];
  if (!file) return;

  void uploadFile(file);
}

function resetUpload() {
  uploadProgress.value = 0;
  hasShownProgress.value = false;
  isDragging.value = false;
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
}
</script>
