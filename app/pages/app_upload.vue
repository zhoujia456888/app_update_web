<template>

  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="text-lg font-bold">应用发布</div>
      </div>
    </template>


    <UFileUpload
        accept=".apk,application/vnd.android.package-archive"
        size="xl"
        v-model="value"
        label="点击按钮选择应用的安装包，或拖拽文件到此区域"
        description="（当前仅支持apk文件）"/>

  </UCard>
</template>

<script setup lang="ts">
const value = ref(null)
</script>