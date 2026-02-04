<template>
  <UApp :toaster="toaster">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
const t = useToast()
setToastApi(t)
const toaster = {position: 'top-right'  as const}
</script>
