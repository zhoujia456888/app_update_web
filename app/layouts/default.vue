<template>
  <div class="h-screen flex flex-col overflow-hidden">
    <UHeader title="App Update" :ui="{
    container: 'w-full max-w-none px-4'
  }">
      <template #right>
        <UNavigationMenu :items="menu"/>
        <UColorModeButton/>
        <UButton
            color="neutral"
            variant="ghost"
            to="https://github.com/zhoujia456888/app_update_web"
            target="_blank"
            icon="i-simple-icons-github"
            aria-label="GitHub"
        />

        <UPopover mode="hover">
          <UButton color="neutral" variant="ghost">
            <UUser name="John Doe"/>
            <template #trailing>
              <UIcon name="i-lucide-chevron-down"/>
            </template>
          </UButton>

          <template #content>
            <div class="w-24">
              <UButton color="neutral" to="/profile" variant="ghost" block>个人中心</UButton>
              <UButton color="neutral" to="/settings" variant="ghost" block>设置</UButton>
              <UButton color="error" @click="logout()" variant="ghost" block>退出登录</UButton>
            </div>
          </template>
        </UPopover>
      </template>

    </UHeader>


    <UMain class="flex-1 min-h-0 overflow-hidden">
      <NuxtPage/>
    </UMain>


    <!-- Footer -->
    <UFooter class="w-full">
      <div class="mx-auto flex items-center justify-between px-4 py-3 text-xs text-gray-500">
        <span>© {{ new Date().getFullYear() }} App Update Powered by Nuxt 4 + Nuxt UI</span>
      </div>
    </UFooter>
  </div>
</template>


<script setup lang="ts">

/**
 * 菜单数据：支持父级 children
 * key 用于控制展开/收起
 */
type MenuItem = {
  key: string
  label: string
  icon: string
  to?: string
  children?: Array<{ label: string; to: string }>
}

const menu: MenuItem[] = [
  {
    key: 'app_upload',
    label: '首页',
    icon: 'i-lucide-house',
    to: '/'
  },
  {
    key: 'app_manage',
    label: '应用管理',
    icon: 'i-lucide-folder-kanban',
    children: [
      {label: '渠道管理', to: '/app_channels',},
      {label: 'APP列表', to: '/app_list'}
    ]
  },
  {
    key: 'app_upload',
    label: '应用发布',
    icon: 'i-lucide-file-up',
    to: '/app_upload'
  }
]

async function logout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user_info')
  await navigateTo('/login', {replace: true})
}

</script>


