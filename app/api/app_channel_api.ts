import type {BaseResp} from "~/types/base_response";
import type {
    CreateAppChannelReq,
    CreateAppChannelResp, DeleteAppChannelReq, DeleteAppChannelResp,
    GetAppChannelListResp,
    UpdateAppChannelReq,
    UpdateAppChannelResp
} from "~/types/app_channel";

export function app_channel_api() {
    const {$api} = useNuxtApp()

    return {
        /** 创建应用渠道接口 */
        create_app_channel(data: CreateAppChannelReq) {
            return $api.post<BaseResp<CreateAppChannelResp>>('/app_channel/create_app_channel', data)
        },
        /** 获取当前账户下的所有渠道接口 */
        get_app_channel_list() {
            return $api.post<BaseResp<GetAppChannelListResp[]>>('/app_channel/get_app_channel_list')
        },
        /** 更新应用渠道接口 */
        update_app_channel(data: UpdateAppChannelReq) {
            return $api.post<BaseResp<UpdateAppChannelResp>>('/app_channel/update_app_channel', data)
        },

        /** 删除应用渠道接口 */
        delete_app_channel(data: DeleteAppChannelReq) {
            return $api.post<BaseResp<DeleteAppChannelResp>>('/app_channel/delete_app_channel', data)
        },


    }
}