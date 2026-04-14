const config = useRuntimeConfig();
const iconServerUrl = config.public.apiBase;


export function isApkFile(file: File) {
    return (
        file.name.toLowerCase().endsWith(".apk") ||
        file.type === "application/vnd.android.package-archive"
    );
}


export function formatDateTime(value: string): string {
    if (!value) return "-";
    return new Date(value).toLocaleString("zh-CN").replaceAll("/", "-");
}


export function formattedFileSize(file_size: number,): string {
    const bytes = file_size ?? 0;
    if (!bytes) return "0 B";

    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex += 1;
    }

    return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function formattedAppIconUrl(app_icon_path: string): string {
    const iconPath = app_icon_path?.trim();
    if (!iconPath) return "";
    if (/^https?:\/\//i.test(iconPath)) return iconPath;
    return `${iconServerUrl}${iconPath.startsWith("/") ? iconPath : `/${iconPath}`}`;
}
