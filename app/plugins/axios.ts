import type { InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import type { BaseResp } from "~/types/base_response";
import type { RefreshTokenResp } from "~/types/user";

const REFRESH_TOKEN_PATH = "/public/users/refresh_token";
const ACCESS_TOKEN_ERROR_CODES = new Set([
	"ACCESS_TOKEN_MISSING",
	"ACCESS_TOKEN_INVALID",
	"ACCESS_TOKEN_EXPIRED",
	"ACCESS_TOKEN_REVOKED",
]);
const REFRESH_TOKEN_INVALID_CODE = "REFRESH_TOKEN_INVALID";
const FORBIDDEN_CODE = "FORBIDDEN";

function isTimeoutError(err: unknown) {
	return (
		typeof err === "object" &&
		err !== null &&
		("code" in err || "message" in err) &&
		((err as { code?: string }).code === "ECONNABORTED" ||
			typeof (err as { message?: string }).message === "string" &&
				(err as { message: string }).message.includes("timeout"))
	);
}

function isRefreshTokenRequest(config?: InternalAxiosRequestConfig) {
	const url = config?.url || "";
	return url.includes(REFRESH_TOKEN_PATH);
}

function shouldRefreshFromResponse(resp?: BaseResp<unknown>) {
	return resp?.code === 401 && Boolean(resp.err_code && ACCESS_TOKEN_ERROR_CODES.has(resp.err_code));
}

function shouldLogoutFromResponse(resp?: BaseResp<unknown>) {
	return resp?.code === 401 && resp.err_code === REFRESH_TOKEN_INVALID_CODE;
}

function shouldShowForbidden(resp?: BaseResp<unknown>) {
	return resp?.code === 403 && resp.err_code === FORBIDDEN_CODE;
}

export default defineNuxtPlugin(() => {
	const { accessToken, clearSession, refreshToken, syncFromStorage, userInfo, setTokens } =
		useUserSession();
	let refreshTokenRequest: Promise<string> | null = null;
	let logoutRedirectTimer: ReturnType<typeof setTimeout> | null = null;

	syncFromStorage();

	function clearSessionAndToLogin(message = "登录已过期，请重新登录") {
		clearSession();
		toast.warning("登录状态失效", message);
		if (window.location.pathname !== "/login" && !logoutRedirectTimer) {
			logoutRedirectTimer = setTimeout(() => {
				logoutRedirectTimer = null;
				void navigateTo("/login", { replace: true });
			}, 1200);
		}
	}

	async function tryRefreshToken() {
		if (!refreshToken.value) {
			clearSessionAndToLogin("登录信息缺失，请重新登录");
			throw new Error("缺少 refresh_token");
		}

		if (!refreshTokenRequest) {
			refreshTokenRequest = refreshApi
				.post<BaseResp<RefreshTokenResp>>(REFRESH_TOKEN_PATH, {
					user_id: String(userInfo.value?.id || ""),
					refresh_token: refreshToken.value,
				})
				.then((res) => {
					if (
						res.data.code !== 200 ||
						!res.data.data?.access_token ||
						!res.data.data?.refresh_token
					) {
						throw new Error(res.data.msg || "刷新登录态失败");
					}

					setTokens(
						res.data.data.access_token,
						res.data.data.refresh_token,
					);
					return res.data.data.access_token;
				})
				.finally(() => {
					refreshTokenRequest = null;
				});
		}

		return refreshTokenRequest;
	}

	async function handleUnauthorizedResponse(
		resp: BaseResp<unknown> | undefined,
		originalRequest?: InternalAxiosRequestConfig & { _retry?: boolean },
	) {
		if (!resp) {
			return null;
		}

		if (shouldLogoutFromResponse(resp) || isRefreshTokenRequest(originalRequest)) {
			clearSessionAndToLogin(resp.msg || "登录已过期，请重新登录");
			throw new Error(resp.msg || "登录状态失效");
		}

		if (!shouldRefreshFromResponse(resp)) {
			return null;
		}

		if (!originalRequest || originalRequest._retry) {
			clearSessionAndToLogin(resp.msg || "登录已过期，请重新登录");
			throw new Error(resp.msg || "登录状态失效");
		}

		originalRequest._retry = true;
		const nextAccessToken = await tryRefreshToken();
		originalRequest.headers = originalRequest.headers || {};
		originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
		return api(originalRequest);
	}

	const refreshApi = axios.create({
		baseURL: "/api",
		timeout: 10000,
	});

	refreshApi.interceptors.response.use(
		(res) => res,
		(err) => {
			const resp = err?.response?.data as BaseResp<unknown> | undefined;

			if (isTimeoutError(err)) {
				toast.error("请求超时", "网络连接超时，请检查网络后重试");
			}
			if (shouldLogoutFromResponse(resp) || err?.response?.status === 401) {
				clearSessionAndToLogin();
			}
			return Promise.reject(err);
		},
	);

	const api = axios.create({
		baseURL: "/api",
		timeout: 10000,
	});

	api.interceptors.request.use((req) => {
		if (accessToken.value) {
			req.headers = req.headers || {};
			req.headers.Authorization = `Bearer ${accessToken.value}`;
		}
		return req;
	});

	api.interceptors.response.use(
		async (res) => {
			const retriedResponse = await handleUnauthorizedResponse(
				res.data as BaseResp<unknown>,
				res.config as InternalAxiosRequestConfig & { _retry?: boolean },
			);
			if (retriedResponse) {
				return retriedResponse;
			}

			if (shouldShowForbidden(res.data as BaseResp<unknown>)) {
				toast.error("请求被拒绝", res.data.msg || "当前账号没有权限执行该操作");
			}

			return res;
		},
		async (err) => {
			const originalRequest = err.config as
				| (InternalAxiosRequestConfig & { _retry?: boolean })
				| undefined;
			const resp = err?.response?.data as BaseResp<unknown> | undefined;

			if (isTimeoutError(err)) {
				toast.error("请求超时", "网络连接超时，请检查网络后重试");
			}

			if (resp?.code === 401 || err?.response?.status === 401) {
				try {
					const retriedResponse = await handleUnauthorizedResponse(
						resp,
						originalRequest,
					);
					if (retriedResponse) {
						return retriedResponse;
					}
				} catch (refreshErr) {
					return Promise.reject(refreshErr);
				}
			}

			if (shouldShowForbidden(resp) || err?.response?.status === 403) {
				toast.error("请求被拒绝", resp?.msg || "当前账号没有权限执行该操作");
			}

			return Promise.reject(err);
		},
	);

	return {
		provide: {
			api,
		},
	};
});
