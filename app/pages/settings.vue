<template>
  <div class="flex h-full min-h-0 flex-col overflow-hidden bg-default text-default">
    <header class="px-4 py-3.5">
      <div class="text-lg font-bold text-highlighted">设置</div>
    </header>

    <div class="flex-1 overflow-y-auto px-4 pb-6">
      <div class="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section class="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <UCard>
            <template #header>
              <div class="text-base font-semibold text-highlighted">外观设置</div>
            </template>

            <div class="space-y-5">
              <div>
                <div class="text-sm font-medium text-default">主题模式</div>
                <div class="mt-1 text-sm text-toned">选择跟随系统或手动切换明暗主题。</div>
                <URadioGroup
                    v-model="selectedTheme"
                    :items="themeOptions"
                    orientation="horizontal"
                    class="mt-4"
                />
              </div>

              <div class="rounded-xl border border-default bg-elevated px-4 py-4">
                <div class="flex items-center justify-between gap-4">
                  <div>
                    <div class="text-sm font-medium text-highlighted">快速切换</div>
                    <div class="mt-1 text-sm text-toned">
                      仍然可以通过顶部按钮快速切换主题。
                    </div>
                  </div>
                  <UColorModeButton />
                </div>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="text-base font-semibold text-highlighted">界面设置</div>
            </template>

            <div class="space-y-5">
              <div class="flex items-start justify-between gap-4 rounded-xl border border-default bg-elevated px-4 py-4">
                <div>
                  <div class="text-sm font-medium text-highlighted">自动搜索</div>
                  <div class="mt-1 text-sm text-toned">控制列表页搜索框在输入完成后是否自动发起搜索。</div>
                </div>
                <USwitch v-model="preferences.autoSearch" />
              </div>

              <div class="flex items-start justify-between gap-4 rounded-xl border border-default bg-elevated px-4 py-4">
                <div>
                  <div class="text-sm font-medium text-highlighted">记住筛选条件</div>
                  <div class="mt-1 text-sm text-toned">为后续列表页保留你的筛选习惯设置。</div>
                </div>
                <USwitch v-model="preferences.rememberFilters" />
              </div>

              <div class="flex items-start justify-between gap-4 rounded-xl border border-default bg-elevated px-4 py-4">
                <div>
                  <div class="text-sm font-medium text-highlighted">显示调试信息</div>
                  <div class="mt-1 text-sm text-toned">用于本地开发和排查问题，不影响接口行为。</div>
                </div>
                <USwitch v-model="preferences.showDebugInfo" />
              </div>

              <div class="flex justify-end">
                <UButton
                    color="primary"
                    variant="solid"
                    icon="i-lucide-save"
                    @click="_savePreferences"
                >
                  保存界面设置
                </UButton>
              </div>
            </div>
          </UCard>
        </section>

        <section class="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <UCard>
            <template #header>
              <div class="text-base font-semibold text-highlighted">会话与存储</div>
            </template>

            <div class="space-y-4">
              <div
                  v-for="item in sessionItems"
                  :key="item.label"
                  class="rounded-xl border border-default bg-elevated px-4 py-3"
              >
                <div class="text-sm text-toned">{{ item.label }}</div>
                <div class="mt-2 break-all text-sm font-medium text-highlighted">
                  {{ item.value }}
                </div>
              </div>

              <div class="flex flex-wrap gap-3">
                <UButton
                    color="neutral"
                    variant="outline"
                    icon="i-lucide-copy"
                    @click="_copySettingsSnapshot"
                >
                  复制设置快照
                </UButton>
                <UButton
                    color="warning"
                    variant="soft"
                    icon="i-lucide-eraser"
                    @click="_resetPreferences"
                >
                  重置界面设置
                </UButton>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="text-base font-semibold text-highlighted">账号操作</div>
            </template>

            <div class="space-y-4">
              <div class="rounded-xl border border-default bg-elevated px-4 py-4">
                <div class="text-sm font-medium text-highlighted">个人中心</div>
                <div class="mt-1 text-sm text-toned">查看当前账户资料、Token 状态和本地用户信息。</div>
                <UButton
                    class="mt-4"
                    color="primary"
                    variant="outline"
                    icon="i-lucide-user-round"
                    @click="navigateTo('/profile')"
                >
                  打开个人中心
                </UButton>
              </div>

              <div class="rounded-xl border border-error/30 bg-error/5 px-4 py-4">
                <div class="text-sm font-medium text-highlighted">退出登录</div>
                <div class="mt-1 text-sm text-toned">
                  清除当前浏览器中的登录态并返回登录页面。
                </div>
                <UButton
                    class="mt-4"
                    color="error"
                    variant="solid"
                    icon="i-lucide-log-out"
                    @click="_logout"
                >
                  退出登录
                </UButton>
              </div>
            </div>
          </UCard>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import toast from "~/composables/toast";

type Preferences = {
  autoSearch: boolean;
  rememberFilters: boolean;
  showDebugInfo: boolean;
};

const STORAGE_KEY = "app_settings";

const colorMode = useColorMode();

const themeOptions = [
  { label: "跟随系统", value: "system" },
  { label: "浅色", value: "light" },
  { label: "深色", value: "dark" },
];

const selectedTheme = computed({
  get: () => colorMode.preference,
  set: (value: string) => {
    colorMode.preference = value as "system" | "light" | "dark";
  },
});

const preferences = reactive<Preferences>({
  autoSearch: true,
  rememberFilters: true,
  showDebugInfo: false,
});

const accessToken = ref("");
const refreshToken = ref("");
const username = ref("用户");

const sessionItems = computed(() => {
  return [
    { label: "当前主题", value: selectedTheme.value },
    { label: "用户名", value: username.value || "-" },
    { label: "Access Token", value: _maskToken(accessToken.value) },
    { label: "Refresh Token", value: _maskToken(refreshToken.value) },
  ];
});

onMounted(() => {
  _loadPreferences();
  _loadSession();
});

function _loadPreferences() {
  if (!import.meta.client) {
    return;
  }

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved) {
      preferences.autoSearch = Boolean(saved.autoSearch);
      preferences.rememberFilters = Boolean(saved.rememberFilters);
      preferences.showDebugInfo = Boolean(saved.showDebugInfo);
    }
  } catch {
    // Ignore invalid local settings.
  }
}

function _savePreferences() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...preferences }));
  toast.success("保存成功", "界面设置已保存到本地");
}

function _resetPreferences() {
  preferences.autoSearch = true;
  preferences.rememberFilters = true;
  preferences.showDebugInfo = false;
  localStorage.removeItem(STORAGE_KEY);
  toast.success("已重置", "界面设置已恢复默认值");
}

function _loadSession() {
  if (!import.meta.client) {
    return;
  }

  accessToken.value = localStorage.getItem("access_token") || "";
  refreshToken.value = localStorage.getItem("refresh_token") || "";

  try {
    const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");
    username.value = userInfo.username || userInfo.name || "用户";
  } catch {
    username.value = "用户";
  }
}

async function _copySettingsSnapshot() {
  if (!import.meta.client) {
    return;
  }

  const snapshot = {
    theme: selectedTheme.value,
    preferences: { ...preferences },
    username: username.value,
  };

  try {
    await navigator.clipboard.writeText(JSON.stringify(snapshot, null, 2));
    toast.success("复制成功", "设置快照已复制");
  } catch {
    toast.error("复制失败", "当前环境不支持剪贴板写入");
  }
}

async function _logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user_info");
  toast.success("已退出登录", "正在返回登录页");
  await navigateTo("/login", { replace: true });
}

function _maskToken(token: string) {
  if (!token) {
    return "-";
  }

  if (token.length <= 16) {
    return token;
  }

  return `${token.slice(0, 8)}...${token.slice(-8)}`;
}
</script>

<style scoped></style>
