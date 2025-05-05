import path from "node:path"

import { cache } from "empathic/package"

export const WORK_DIR: string = path.relative(
  process.cwd(),
  cache("unplugin-node-sea", { create: true })!,
)
export const SEA_CONFIG_PATH: string = path.join(WORK_DIR, "sea.json")
export const BLOB_PATH: string = path.join(WORK_DIR, "sea.blob")
