<template>
  <div class="space-y-4">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="font-semibold">最近活动</div>
        </div>
      </template>

      <div class="space-y-3 text-sm">
        <div class="flex items-center justify-between">
          <span>用户 A 登录</span><span class="text-gray-500">2 分钟前</span>
        </div>
        <div class="flex items-center justify-between">
          <span>创建了订单 #1024</span><span class="text-gray-500">10 分钟前</span>
        </div>
        <div class="flex items-center justify-between">
          <span>更新了系统配置</span><span class="text-gray-500">1 小时前</span>
        </div>
      </div>
    </UCard>
  </div>
</template>


<script setup lang="ts">
</script>
