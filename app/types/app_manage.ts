//AppManage 相关类型定义

/** 创建应用渠道请求参数 */
export type UploadAppFileResp = {
	///文件路径
	file_path: string;
	///文件名称
	file_name: string;
	///APP名称
	app_name: string;
	///包名
	package_name: string;
	///APP图标文件路径
	app_icon_path: string;
	///版本名称
	version_name: string;
	///版本号
	version_code: string;
	///文件大小（字节）
	file_size: number;
	///上传文件信息
	upload_file_info: string;
};

/** 完成应用上传请求参数 */
export type UploadAppFileCompleteReq = {
	app_name: string;
	file_path: string;
	file_name: string;
	package_name: string;
	app_icon_path: string;
	version_name: string;
	version_code: string;
	file_size: number;
	channel_id: string;
	channel_name: string;
	update_log: string;
	upload_file_info: string;
};

/** 完成应用上传返回参数 */
export type UploadAppFileCompleteResp = {
	upload_app_complete_info?: string;
};

/** 获取 APP 列表请求参数 */
export type GetAppListReq = {
	page_index: number;
	page_size: number;
};

/** 获取 APP 列表返回参数 */
export type GetAppListResp = {
	app_list: GetAppListRespItem[];
	total_app_count: number;
	total_page_count: number;
};

/** 获取 APP 列表返回参数中的每个应用项 */
export type GetAppListRespItem = {
	app_id: string;
	app_name: string;
	package_name: string;
	app_icon_path: string;
	version_name: string;
	version_code: string;
	file_name: string;
	file_path: string;
	file_size: number;
	channel_id: string;
	channel_name: string;
	update_log: string;
	create_time: string;
	update_time: string;
};
