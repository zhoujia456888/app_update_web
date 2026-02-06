//用户相关类型定义
/** 登录请求参数 */
export type LoginReq = {
    username: string
    password: string
    captcha_id: string
    captcha_code: string
}

/*** 登录返回 data */
export type LoginResponse = {
    access_token: string
    refresh_token: string
    login_info: string
}

/** 验证码返回 data */
export type CaptchaData = {
    captcha_id: string
    captcha_img: string // 已经是 data:image/jpeg;base64,...
}

export type RefreshTokenReq = {
    access_token: string
    refresh_token: string
}

/*** 注册请求参数 */
export type RegisterReq = {
    username: string
    password: string
    confirm_password: string
    captcha_id: string
    captcha_code: string
}

/*** 注册返回参数 */
export type RegisterResp = {
    register_info: string
}
