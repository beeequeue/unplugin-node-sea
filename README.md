# unplugin-node-sea

[![npm](https://img.shields.io/npm/v/unplugin-node-sea)](https://www.npmjs.com/package/unplugin-node-sea)
![node-current](https://img.shields.io/node/v/unplugin-node-sea)

![rolldown ✅](https://img.shields.io/badge/rolldown-✅-darkgreen?logo=rollupdotjs)
![rollup ❌](https://img.shields.io/badge/rollup-❌-darkred?logo=rollupdotjs&logoColor=CE412B)
![vite ❌](https://img.shields.io/badge/vite-❌-darkred?logo=vite)
![esbuild ❌](https://img.shields.io/badge/esbuild-❌-darkred?logo=esbuild)
![webpack ❌](https://img.shields.io/badge/webpack-❌-darkred?logo=webpack)
![rspack ❌](https://img.shields.io/badge/rspack-❌-darkred?logo=rspack)
![farm ❌](https://img.shields.io/badge/farm-❌-darkred?logo=farmjs6)

_Currently only supports Rolldown since the information needed are only supplied by the framework-specific unplugin hooks._

---

A bundler plugin that automatically creates an executable file from a JS file using [Node Single Executable Applications (SEA)](https://nodejs.org/api/single-executable-applications.html).

It finds the entrypoint from the bundler output and embeds it into a Node executable for the building platform.

## Read before using

- Node SEA executables are as large as the Node executable (100MB~).
- Node SEA executables are not portable and only work on the same platform as the original Node exec.
  - You can download the correct Node exec for your target and use that, but you will have to disable the Node Compile Cache (`codeCache: false`), slowing down startups significantly.
  - Otherwise, you will need to run your builds on the target platform.
  - See [this example](https://github.com/beeequeue/sizer/blob/b741a4d7710b88ed40815240ed6c5b8c24cb8228/.github/workflows/ci.yml#L10-L47).
- Node SEA does not support ES modules.
  - If you use ESM, you will need to build a separate CJS bundle for your SEA.
- Node SEA does not support `import()`.
- V8 snapshots require extra work.
  - To enable V8 snapshots in Node SEA:s, the main entry script **must** invoke `v8.startupSnapshot.setDeserializeMainFunction()` [as described in the documentation](https://nodejs.org/api/single-executable-applications.html#startup-snapshot-support).

## Usage

<!--
<details>
<summary>Rolldown</summary>
-->

```ts
import { defineConfig } from "tsdown"
import { nodeSeaUnplugin } from "unplugin-node-sea"

export default defineConfig({
  entry: "src/cli.ts",
  outDir: "dist",

  platform: "node",
  target: "node20",
  format: "cjs",
  minify: false,
  fixedExtension: true,

  // All options are optional
  plugins: [
    nodeSeaUnplugin.rolldown({
      name: "foo", // name of executable (without .exe). Defaults to name in package.json
      codeCache: true, // Enable v8 compile cache. Default to `true`
      v8Snapshot: true, // Enable v8 snapshot (see section regarding it). Defaults to false.
    }),
  ],
}) as never
```

<!--</details>-->

## To-do (updated 2025-05-06)

- [ ] Add tests.
- [ ] Add support for more bundlers.
  - Split build logic from the bundler specific config and output handlers
- [ ] Add error for enabling `v8Snapshot` without `v8.startupSnapshot.setDeserializeMainFunction()` being found in the output file.
- [ ] Maybe automatically add `v8.startupSnapshot.setDeserializeMainFunction()` if `v8Snapshot` is enabled?
- [ ] Investigate if it's possible to implement `postject` in JS instead of using the 4MB C++ library it uses.
