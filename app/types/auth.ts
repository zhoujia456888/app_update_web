// types/auth.ts
export type LoginReq = {
    username: string
    password: string
    captcha_id: string
    captcha_code: string
}

export type LoginResponse = {
    access_token: string
    refresh_token: string
}

/** 验证码返回 data */
export type CaptchaData = {
    captcha_id: string
    captcha_img: string // 已经是 data:image/jpeg;base64,...
}
