<!-- pages/index.vue -->
<template>
  <div class="p-6 space-y-4">
    <div class="text-2xl font-semibold">首页</div>

    <UCard>
      <div class="space-y-2">
        <div>已登录 ✅</div>
        <div class="text-sm text-gray-500">token 存在 cookie：{{ access_token ? 'yes' : 'no' }}</div>

        <div class="flex gap-2">
          <UButton loading-auto @click="logout">退出登录</UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const {access_token, logout} = useAuth()
</script>
