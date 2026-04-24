/** 后端统一响应结构 */
export type BaseResp<T> = {
    data: T
    code: number
    err_code?: string
    msg: string
}
