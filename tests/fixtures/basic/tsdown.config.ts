import { defineConfig } from "tsdown"
import { nodeSeaUnplugin } from "unplugin-node-sea"

export default defineConfig({
  name: "basic",
  entry: "index.ts",
  outDir: "dist",

  platform: "node",
  target: "node20",
  format: "cjs",
  minify: false,
  fixedExtension: true,

  plugins: [nodeSeaUnplugin.rolldown({ name: "basic" })],

  silent: true,
}) as Record<string, unknown>
