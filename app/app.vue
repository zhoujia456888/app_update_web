<template>
  <UApp :toaster="toaster">
    <NuxtLayout>
      <NuxtPage/>
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
const toaster = {
  position: 'top-right' as const,
  expand: false,
  progress: false,
  duration: 3000
}

onMounted(() => {
  setToastApi(useToast())
})
</script>
