import fs from "node:fs"
import path from "node:path"

import * as pkg from "empathic/package"

import { WORK_DIR } from "./constants.js"

export const cleanCacheDir = (): void => {
  fs.rmSync(WORK_DIR, { recursive: true, force: true })
  fs.mkdirSync(WORK_DIR, { recursive: true })
}

const executableExists = (filePath: string) => {
  if (
    // If on windows
    process.platform === "win32" &&
    // and the file we're looking for isn't specifying .exe extension
    !path.basename(filePath).includes(".") &&
    // also check if the file exists with .exe
    fs.existsSync(`${filePath}.exe`)
  ) {
    return true
  }

  return fs.existsSync(filePath)
}

export const findInPath = (name: string): string | null => {
  const pathString =
    process.platform === "win32"
      ? (process.env.Path ?? process.env.PATH)
      : process.env.PATH
  const pathDirs = pathString?.split(path.delimiter) ?? []

  for (const dir of pathDirs) {
    const fullPath = path.join(dir, name)
    if (!executableExists(fullPath)) continue

    return fullPath
  }

  return null
}

export const loadPkgJson = (): { name: string } | null => {
  const pksJsonPath = pkg.up()
  if (pksJsonPath == null) return null

  const test = JSON.parse(fs.readFileSync(pksJsonPath, "utf8")) as { name?: string }
  if (!("name" in test) || test.name == null) return null

  return test as { name: string }
}
