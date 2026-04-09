import type { AxiosRequestConfig } from "axios";
import type {
	GetAppListReq,
	GetAppListResp,
	UploadAppFileCompleteReq,
	UploadAppFileCompleteResp,
	UploadAppFileResp,
} from "~/types/app_manage";
import type { BaseResp } from "~/types/base_response";

export function app_manage_api() {
	const { $api } = useNuxtApp();

	return {
		/** 上传应用安装包接口 */
		upload_app_file(data: FormData, config?: AxiosRequestConfig<FormData>) {
			return $api.post<BaseResp<UploadAppFileResp>>(
				"/app_manage/upload_app_file",
				data,
				{
					timeout: 10 * 60 * 1000,
					...config,
				},
			);
		},
		/** 补充上传后的应用信息接口 */
		upload_app_file_complete(data: UploadAppFileCompleteReq) {
			return $api.post<BaseResp<UploadAppFileCompleteResp>>(
				"/app_manage/upload_app_file_complete",
				data,
			);
		},
		/** 获取 APP 列表接口 */
		get_app_list_by_page(data: GetAppListReq) {
			return $api.post<BaseResp<GetAppListResp>>(
				"/app_manage/get_app_list_by_page",
				data,
			);
		},
	};
}
