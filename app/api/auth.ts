// app/api/auth.ts
import type {CaptchaData, LoginReq, LoginResponse} from '~/types/auth'
import type {ApiResp} from "~/types/base_response";

export function authApi() {
    const {$api} = useNuxtApp()

    return {
        /** 登录接口 */
        login(data: LoginReq) {
            return $api.post<ApiResp<LoginResponse>>('/api/users/login', data)
        },

        /** 获取验证码接口 */
        getCaptcha() {
            return $api.post<ApiResp<CaptchaData>>('/api/users/get_auth_captcha')
        }
    }
}
