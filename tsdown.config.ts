import { defineConfig } from "tsdown"

export default defineConfig({
  entry: ["src/plugin.ts"],
  outDir: "dist",

  platform: "node",
  format: "esm",
  dts: true,
  fixedExtension: true,

  sourcemap: true,
})
