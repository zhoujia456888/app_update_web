type StoredUserInfo = {
  id?: string;
  username?: string;
  name?: string;
  nickname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  create_time?: string;
  update_time?: string;
  [key: string]: unknown;
};

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_INFO_KEY = "user_info";

export function useUserSession() {
  const accessToken = useState<string>("session:access-token", () => "");
  const refreshToken = useState<string>("session:refresh-token", () => "");
  const userInfo = useState<StoredUserInfo | null>("session:user-info", () => null);

  function syncFromStorage() {
    if (!import.meta.client) {
      return;
    }

    accessToken.value = localStorage.getItem(ACCESS_TOKEN_KEY) || "";
    refreshToken.value = localStorage.getItem(REFRESH_TOKEN_KEY) || "";

    try {
      userInfo.value = JSON.parse(localStorage.getItem(USER_INFO_KEY) || "null");
    } catch {
      userInfo.value = null;
    }
  }

  function setTokens(nextAccessToken: string, nextRefreshToken: string) {
    accessToken.value = nextAccessToken;
    refreshToken.value = nextRefreshToken;

    if (!import.meta.client) {
      return;
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, nextAccessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, nextRefreshToken);
  }

  function setUserInfo(nextUserInfo: StoredUserInfo | null) {
    userInfo.value = nextUserInfo;

    if (!import.meta.client) {
      return;
    }

    if (nextUserInfo) {
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(nextUserInfo));
      return;
    }

    localStorage.removeItem(USER_INFO_KEY);
  }

  function clearSession() {
    accessToken.value = "";
    refreshToken.value = "";
    userInfo.value = null;

    if (!import.meta.client) {
      return;
    }

    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
  }

  return {
    accessToken: readonly(accessToken),
    refreshToken: readonly(refreshToken),
    userInfo: readonly(userInfo),
    syncFromStorage,
    setTokens,
    setUserInfo,
    clearSession,
  };
}
