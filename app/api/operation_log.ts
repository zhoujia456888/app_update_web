// app/api/operation_logs.ts

import type { BaseResp } from "~/types/base_response";
import type {
    GetRecentOperationLogsResp,
} from "~/types/user";

export function operation_logs_api() {
    const { $api } = useNuxtApp();

    return {
        /** 获取最近操作日志接口 */
        get_recent_operation_logs() {
            return $api.post<BaseResp<GetRecentOperationLogsResp>>(
                "/operation_log/get_recent_operation_logs",
            );
        },
    };
}
