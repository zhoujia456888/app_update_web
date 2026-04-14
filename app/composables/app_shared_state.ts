import { useState } from "#imports";
import type { UploadAppFileResp } from "~/types/app_manage";

export function useAppUploadState() {
  return useState<UploadAppFileResp | null>("appUploadState", () => null);
}
