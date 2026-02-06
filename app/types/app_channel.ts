//AppChannel 相关类型定义

/** 创建应用渠道请求参数 */
export type CreateAppChannelReq = {
    channel_name: string
}


/** 创建应用渠道返回参数 */
export type CreateAppChannelResp = {
    channel_name: string
    create_info: string
}

/***获取当前账户下的所有渠道返回参数 */
export type GetAppChannelListResp = {
    channel_id: string
    channel_name: string
    create_time: string
}

/***更新应用渠道请求参数 */
export type UpdateAppChannelReq = {
    channel_id: string
    channel_name: string
}

/***更新应用渠道返回参数 */
export type UpdateAppChannelResp = {
    channel_id: string
    channel_name: string
    update_info: string
}

/***删除应用渠道请求参数 */
export type DeleteAppChannelReq = {
    channel_id: string
    channel_name: string
}

/***删除应用渠道返回参数 */
export type DeleteAppChannelResp = {
    channel_id: string
    channel_name: string
    delete_info: string
}

