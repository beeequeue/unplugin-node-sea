import fs from "node:fs"

import * as pkg from "empathic/package"

import { WORK_DIR } from "./constants.ts"

export const getArchOsExtensionSuffix = (): string => {
  let platform = "unknown"
  if (process.platform === "win32") platform = "win"
  if (process.platform === "darwin") platform = "mac"
  if (process.platform === "linux") platform = "linux"

  let suffix = `-${process.arch}-${platform}`

  if (process.platform === "win32") {
    suffix += ".exe"
  }

  return suffix
}

export const cleanCacheDir = (): void => {
  fs.rmSync(WORK_DIR, { recursive: true, force: true })
  fs.mkdirSync(WORK_DIR, { recursive: true })
}

export const loadPkgJson = (): { name: string } | null => {
  const pksJsonPath = pkg.up()
  if (pksJsonPath == null) return null

  const test = JSON.parse(fs.readFileSync(pksJsonPath, "utf8")) as { name?: string }
  if (!("name" in test) || test.name == null) return null

  return test as { name: string }
}
