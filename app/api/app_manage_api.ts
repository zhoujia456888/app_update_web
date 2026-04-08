import type { AxiosRequestConfig } from "axios";
import type {
	UploadAppFileCompleteReq,
	UploadAppFileCompleteResp,
	UploadAppFileResp,
} from "~/types/app_manage";
import type { BaseResp } from "~/types/base_response";

export function app_manage_api() {
	const { $api } = useNuxtApp();

	return {
		/** 创建应用渠道接口 */
		upload_app_file(data: FormData, config?: AxiosRequestConfig<FormData>) {
			return $api.post<BaseResp<UploadAppFileResp>>(
				"/app_manage/upload_app_file",
				data,
				config,
			);
		},
		/** 补充上传后的应用信息接口 */
		upload_app_file_complete(data: UploadAppFileCompleteReq) {
			return $api.post<BaseResp<UploadAppFileCompleteResp>>(
				"/app_manage/upload_app_file_complete",
				data,
			);
		},
	};
}
