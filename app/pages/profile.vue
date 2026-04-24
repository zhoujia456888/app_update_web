<template>
  <div class="flex h-full min-h-0 flex-col overflow-hidden bg-default text-default">
    <header class="px-4 py-3.5">
      <div class="text-lg font-bold text-highlighted">个人中心</div>
    </header>

    <div class="flex-1 overflow-y-auto px-4 pb-6">
      <div class="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section class="rounded-2xl border border-default bg-default p-6 shadow-sm">
          <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div class="flex min-w-0 items-center gap-4">
              <UAvatar
                  :alt="displayName"
                  :text="avatarText"
                  size="3xl"
                  class="shrink-0"
              />

              <div class="min-w-0">
                <div class="text-2xl font-semibold text-highlighted">
                  {{ displayName }}
                </div>
                <div class="mt-2 break-all text-sm text-toned">
                  {{ userInfo?.username || "未设置用户名" }}
                </div>
                <div class="mt-3 flex flex-wrap gap-2">
                  <UBadge color="primary" variant="soft">当前账号</UBadge>
                  <UBadge :color="hasToken ? 'success' : 'neutral'" variant="soft">
                    {{ hasToken ? "已登录" : "未登录" }}
                  </UBadge>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-3">
              <UButton
                  color="neutral"
                  variant="outline"
                  icon="i-lucide-refresh-cw"
                  @click="_reloadUserInfo"
              >
                刷新资料
              </UButton>
              <UButton
                  color="primary"
                  variant="solid"
                  icon="i-lucide-settings"
                  @click="navigateTo('/settings')"
              >
                前往设置
              </UButton>
            </div>
          </div>
        </section>

        <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <UCard>
            <div class="text-sm text-toned">用户ID</div>
            <div class="mt-2 break-all text-base font-semibold text-highlighted">
              {{ userInfo?.id || "-" }}
            </div>
          </UCard>

          <UCard>
            <div class="text-sm text-toned">用户名</div>
            <div class="mt-2 break-all text-base font-semibold text-highlighted">
              {{ userInfo?.username || "-" }}
            </div>
          </UCard>

          <UCard>
            <div class="text-sm text-toned">昵称</div>
            <div class="mt-2 break-all text-base font-semibold text-highlighted">
              {{ userInfo?.name || userInfo?.nickname || "-" }}
            </div>
          </UCard>

          <UCard>
            <div class="text-sm text-toned">邮箱</div>
            <div class="mt-2 break-all text-base font-semibold text-highlighted">
              {{ userInfo?.email || "-" }}
            </div>
          </UCard>
        </section>

        <section class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <UCard>
            <template #header>
              <div class="text-base font-semibold text-highlighted">账户详情</div>
            </template>

            <div class="grid gap-4 md:grid-cols-2">
              <div
                  v-for="item in profileItems"
                  :key="item.label"
                  class="rounded-xl border border-default bg-elevated px-4 py-3"
              >
                <div class="text-sm text-toned">{{ item.label }}</div>
                <div class="mt-2 break-all text-sm font-medium text-highlighted">
                  {{ item.value }}
                </div>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="text-base font-semibold text-highlighted">会话信息</div>
            </template>

            <div class="space-y-4">
              <div class="rounded-xl border border-default bg-elevated px-4 py-3">
                <div class="text-sm text-toned">Access Token</div>
                <div class="mt-2 break-all text-xs text-highlighted">
                  {{ maskedAccessToken }}
                </div>
              </div>

              <div class="rounded-xl border border-default bg-elevated px-4 py-3">
                <div class="text-sm text-toned">Refresh Token</div>
                <div class="mt-2 break-all text-xs text-highlighted">
                  {{ maskedRefreshToken }}
                </div>
              </div>

              <div class="flex flex-wrap gap-3">
                <UButton
                    color="neutral"
                    variant="outline"
                    icon="i-lucide-copy"
                    @click="_copyUserInfo"
                >
                  复制资料 JSON
                </UButton>
                <UButton
                    color="error"
                    variant="soft"
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
const { accessToken, clearSession, refreshToken, syncFromStorage, userInfo } = useUserSession();

const displayName = computed(() => {
  return userInfo.value?.nickname
      || userInfo.value?.name
      || userInfo.value?.username
      || "用户";
});

const avatarText = computed(() => {
  return displayName.value.slice(0, 1).toUpperCase();
});

const hasToken = computed(() => {
  return Boolean(accessToken.value || refreshToken.value);
});

const maskedAccessToken = computed(() => _maskToken(accessToken.value));
const maskedRefreshToken = computed(() => _maskToken(refreshToken.value));

const profileItems = computed(() => {
  const info = userInfo.value || {};

  return [
    { label: "用户ID", value: String(info.id || "-") },
    { label: "用户名", value: String(info.username || "-") },
    { label: "昵称", value: String(info.nickname || info.name || "-") },
    { label: "邮箱", value: String(info.email || "-") },
    { label: "手机号", value: String(info.phone || "-") },
    { label: "创建时间", value: String(info.create_time || "-") },
    { label: "更新时间", value: String(info.update_time || "-") },
  ];
});

onMounted(() => {
  syncFromStorage();
});

function _reloadUserInfo() {
  syncFromStorage();
  toast.success("刷新成功", "已重新读取本地用户信息");
}

async function _copyUserInfo() {
  if (!import.meta.client) {
    return;
  }

  try {
    await navigator.clipboard.writeText(
        JSON.stringify(userInfo.value || {}, null, 2),
    );
    toast.success("复制成功", "用户资料 JSON 已复制");
  } catch {
    toast.error("复制失败", "当前环境不支持剪贴板写入");
  }
}

async function _logout() {
  clearSession();
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
