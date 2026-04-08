// plugins/axios.ts

import type { InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import type { BaseResp } from "~/types/base_response";
import type { RefreshTokenResp } from "~/types/user";

function removeTokenAndToLogin() {
	localStorage.removeItem("access_token");
	localStorage.removeItem("refresh_token");
	window.location.href = "/login";
}

export default defineNuxtPlugin(() => {
	const refreshApi = axios.create({
		baseURL: "/api",
		timeout: 10000,
	});

	refreshApi.interceptors.response.use(
		(res) => res,
		(err) => {
			// 处理超时错误
			if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
				toast.error("请求超时", "网络连接超时，请检查网络后重试");
			}
			// 常见：token 过期/无效
			if (err?.response?.status === 401) {
				removeTokenAndToLogin();
			}
			return Promise.reject(err);
		},
	);

	const api = axios.create({
		baseURL: "/api",
		timeout: 10000,
	});

	api.interceptors.request.use((req) => {
		const access_token = localStorage.getItem("access_token");
		if (access_token) {
			req.headers = req.headers || {};
			req.headers.Authorization = `Bearer ${access_token}`;
		}
		return req;
	});

	api.interceptors.response.use(
		(res) => res,
		async (err) => {
			// 处理超时错误
			if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
				toast.error("请求超时", "网络连接超时，请检查网络后重试");
			}
			// 常见：token 过期/无效
			if (err?.response?.status === 401) {
				removeTokenAndToLogin();
			} else if (err?.response?.status === 403) {
				const originalRequest = err.config as
					| (InternalAxiosRequestConfig & { _retry?: boolean })
					| undefined;
				if (!originalRequest || originalRequest._retry) {
					return Promise.reject(err);
				}

				const refresh_token = localStorage.getItem("refresh_token");
				if (refresh_token) {
					const user_id = JSON.parse(
						localStorage.getItem("user_info") || "{}",
					)?.id;
					originalRequest._retry = true;

					try {
						const res = await refreshApi.post<BaseResp<RefreshTokenResp>>(
							"/users/refresh_token",
							{
								user_id,
								refresh_token,
							},
						);

						if (res.data.code !== 200) {
							removeTokenAndToLogin();
							return Promise.reject(err);
						}

						localStorage.setItem("access_token", res.data.data.access_token);
						localStorage.setItem("refresh_token", res.data.data.refresh_token);
						originalRequest.headers = originalRequest.headers || {};
						originalRequest.headers.Authorization = `Bearer ${res.data.data.access_token}`;
						return api(originalRequest);
					} catch (refreshErr) {
						removeTokenAndToLogin();
						return Promise.reject(refreshErr);
					}
				} else {
					removeTokenAndToLogin();
				}
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
