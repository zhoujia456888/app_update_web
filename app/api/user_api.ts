// app/api/user_api.ts

import type { BaseResp } from "~/types/base_response";
import type {
	CaptchaData,
	LoginReq,
	LoginResponse,
	RegisterReq,
	RegisterResp,
} from "~/types/user";

export function user_api() {
	const { $api } = useNuxtApp();

	return {
		/** 注册接口 */
		register(data: RegisterReq) {
			return $api.post<BaseResp<RegisterResp>>("/users/register", data);
		},

		/** 登录接口 */
		login(data: LoginReq) {
			return $api.post<BaseResp<LoginResponse>>("/users/login", data);
		},

		/** 获取验证码接口 */
		getCaptcha() {
			return $api.post<BaseResp<CaptchaData>>("/users/get_auth_captcha");
		},

		/** 获取用户信息接口 */
		getUserInfo() {
			return $api.post<BaseResp<LoginResponse>>("/users/get_users_info");
		},
	};
}
