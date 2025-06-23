import fs from "node:fs"
import path from "node:path"

import { inject } from "postject"
import { x } from "tinyexec"
import type { UnpluginOptions } from "unplugin"

import { BLOB_PATH, SEA_CONFIG_PATH, WORK_DIR } from "../constants.ts"
import type { NodeSeaPluginOptions, SeaConfig } from "../types.ts"
import { cleanCacheDir } from "../utils.ts"

type Options = NonNullable<UnpluginOptions["rolldown"]>

export const rolldownHandlers = (
  { name, codeCache, v8Snapshot }: Required<NodeSeaPluginOptions>,
  nodeExecPromise: Promise<unknown>,
) =>
  ({
    outputOptions(options) {
      if (options.format !== "commonjs" && options.format !== "cjs") {
        this.error("Node SEA only supports CommonJS. Set `output.format` to `cjs`.")
      }

      if (codeCache) {
        if (options.inlineDynamicImports === false) {
          this.warn(
            "Node SEA only supports compile cache without `import()` statements. If your code has any, either disable `codeCache` or enable `output.inlineDynamicImports`.",
          )
        }

        options.inlineDynamicImports = true
      }

      return options
    },

    async writeBundle(_, output) {
      const outDir = (this as never as { outputOptions: { dir: string } }).outputOptions
        .dir
      let entryPoint: string | null = null
      const assets = new Map<string, string>()

      for (const file of Object.values(output)) {
        // TODO: check that no file contains `import()`

        if (file.type === "chunk" && file.isEntry) {
          entryPoint = path.join(outDir, file.fileName)
        } else {
          if (codeCache && file.type === "chunk" && file.isDynamicEntry) {
            // TODO: error
            this.error(
              `Found a dynamic chunk with codeCache enabled. This is not supported by Node.`,
            )
          }
          assets.set(file.fileName, path.join(outDir, file.fileName))
        }
      }
      if (entryPoint == null) throw new Error("No entry point found")

      const distExecDir = path.join(path.dirname(outDir), "dist-exec")

      fs.cpSync(entryPoint, path.join(WORK_DIR, path.basename(entryPoint)))

      // Create SEA config
      const config = {
        main: entryPoint,
        output: BLOB_PATH,
        // Only works without import()
        // https://nodejs.org/api/single-executable-applications.html#v8-code-cache-support
        useCodeCache: codeCache,
        // https://nodejs.org/api/single-executable-applications.html#startup-snapshot-support
        useSnapshot: v8Snapshot,
      } satisfies SeaConfig as SeaConfig
      if (assets.size !== 0) {
        config.assets = Object.fromEntries(assets)
        // TODO: test assets
      }

      this.debug(JSON.stringify(config, null, 2))
      fs.writeFileSync(SEA_CONFIG_PATH, JSON.stringify(config))

      // Generate SEA blob from config
      await x(process.execPath, ["--experimental-sea-config", SEA_CONFIG_PATH])
      const blob = fs.readFileSync(BLOB_PATH)

      // Copy Node executable
      await nodeExecPromise

      // Inject SEA blob into node exec
      const execPath = path.join(WORK_DIR, name)
      await inject(execPath, "NODE_SEA_BLOB", blob, {
        sentinelFuse: "NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2",
      })

      fs.mkdirSync(distExecDir, { recursive: true })
      fs.renameSync(execPath, path.join(distExecDir, name))
      this.info(
        `Executable created at \`${path.relative(process.cwd(), path.join(distExecDir, name))}\``,
      )

      cleanCacheDir()
    },
  }) satisfies Options as Options
