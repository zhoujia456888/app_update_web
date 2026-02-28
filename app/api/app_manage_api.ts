import type {BaseResp} from "~/types/base_response";
import type {UploadAppFileResp} from "~/types/app_manage";
import type {AxiosRequestConfig} from "axios";

export function app_manage_api() {
    const {$api} = useNuxtApp()

    return {
        /** 创建应用渠道接口 */
        upload_app_file(data: FormData, config?: AxiosRequestConfig<FormData>) {
            return $api.post<BaseResp<UploadAppFileResp>>('/app_manage/upload_app_file', data, config)
        },
    }

}
