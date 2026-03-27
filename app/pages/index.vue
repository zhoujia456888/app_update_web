<template>
  <div class="flex h-full min-h-0 flex-col overflow-hidden bg-white">
    <header class="py-3.5 px-4">
      <div class="text-lg font-bold text-gray-900">首页</div>
    </header>
    <div class="min-h-0 flex-1 px-4">
      <UCard>
        <div class="min-h-0 flex-1">
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
  </div>
</template>


<script setup lang="ts">
</script>
