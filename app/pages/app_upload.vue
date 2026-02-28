<template>

  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="text-lg font-bold">应用发布</div>
      </div>
    </template>


    <div v-if="!hasShownProgress" class="flex items-center justify-between">
      <UFileUpload
          accept=".apk,application/vnd.android.package-archive"
          size="xl"
          v-model="value"
          :disabled="isUploading"
          label="点击按钮选择应用的安装包，或拖拽文件到此区域"
          description="（当前仅支持apk文件）"

      />
    </div>
    <div v-if="hasShownProgress" class="mt-4">
      <div class="mb-1 text-sm text-gray-600">
        {{ isUploading ? `上传中：${uploadProgress}%` : `上传完成：${uploadProgress}%` }}
      </div>
      <div class="h-2 w-full overflow-hidden rounded bg-gray-200">
        <div
            class="h-full bg-primary-500 transition-all duration-200"
            :style="{ width: `${uploadProgress}%` }"
        />
      </div>
    </div>

  </UCard>
</template>

<script setup lang="ts">
import {app_manage_api} from "~/api/app_manage_api";
import toast from "~/composables/toast";
import {ref, watch} from "vue";
import type {AxiosProgressEvent} from "axios";

const value = ref<File | null>(null)
const uploadProgress = ref(0)
const isUploading = ref(false)
const hasShownProgress = ref(false)
const api = app_manage_api()

watch(value, async (newValue) => {
  if (!newValue) return;

  // 检查 newValue 是否为文件对象
  if (typeof newValue === 'object' && 'type' in newValue && 'name' in newValue) {
    const file = newValue as File;

    if (file.type !== 'application/vnd.android.package-archive') {
      toast.error('文件格式错误', '请上传apk文件');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

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
        toast.success('文件上传成功', response.data.msg || '文件上传成功');
      } else {
        toast.error('文件上传失败', response.data.msg || '文件上传失败');
      }
    } catch (error) {
      console.error('文件上传失败:', error);
      toast.error('文件上传失败', '网络错误，请稍后重试');
    } finally {
      isUploading.value = false;
    }
  }
}, {immediate: false})


</script>
