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
  expand: false
}

onMounted(() => {
  setToastApi(useToast())
})
</script>

