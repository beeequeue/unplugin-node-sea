import { defineConfig } from "tsdown"

export default defineConfig({
  entry: ["src/plugin.ts"],
  outDir: "dist",

  platform: "node",
  format: "esm",
  hash: false,
  dts: true,
  fixedExtension: true,

  sourcemap: true,
})
