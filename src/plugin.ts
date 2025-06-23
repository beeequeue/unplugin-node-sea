import fsp from "node:fs/promises"
import path from "node:path"

import { x } from "tinyexec"
import { which } from "tinywhich"
import { createUnplugin, type UnpluginInstance } from "unplugin"

import { WORK_DIR } from "./constants.ts"
import { rolldownHandlers } from "./handlers/rolldown.ts"
import type { NodeSeaPluginOptions } from "./types.ts"
import { cleanCacheDir, getArchOsExtensionSuffix, loadPkgJson } from "./utils.ts"

export const nodeSeaUnplugin: UnpluginInstance<NodeSeaPluginOptions | undefined, false> =
  createUnplugin((rawOptions = {}) => {
    rawOptions.codeCache ??= true
    rawOptions.v8Snapshot ??= false

    const pkgJson = loadPkgJson()
    rawOptions.name ??=
      pkgJson != null
        ? pkgJson.name.includes("/")
          ? pkgJson.name.split("/")[1]
          : pkgJson.name
        : "exec"

    rawOptions.name += getArchOsExtensionSuffix()

    const execPath = path.join(WORK_DIR, rawOptions.name)

    let nodeExecPromise: Promise<void> | null = null

    return {
      name: "unplugin-node-sea",
      enforce: "post",

      buildStart: async () => {
        cleanCacheDir()

        const { promise, resolve } = Promise.withResolvers<void>()
        nodeExecPromise = promise

        void fsp.copyFile(process.execPath, execPath).then(() => {
          // Remove exec signing
          if (process.platform === "win32" && which("signtool") != null) {
            // prettier-ignore
            void x(
              "signtool",
              ["remove", "/s", execPath],
            )
              .then(() => resolve())
          } else if (process.platform === "darwin" && which("codesign") != null) {
            // prettier-ignore
            void x("codesign", ["--sign", "-", execPath])
              .then(() => resolve())
          }
        })
      },

      // todo: more bundlers

      rolldown: rolldownHandlers(
        rawOptions as Required<NodeSeaPluginOptions>,
        nodeExecPromise!,
      ),
    }
  })
