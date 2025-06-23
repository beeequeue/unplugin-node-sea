import assert from "node:assert"
import fs from "node:fs"
import path from "node:path"
import { after, it } from "node:test"

import { x } from "tinyexec"
import { build } from "tsdown"

import { getArchOsExtensionSuffix } from "../../src/utils.ts"
import baseConfig from "../fixtures/basic/tsdown.config.ts"

const fixturesDir = path.resolve(import.meta.dirname, "../fixtures")
const basicFixture = path.join(fixturesDir, "basic")

const tempDirs: string[] = []
after(() => {
  for (const tempDir of tempDirs) {
    fs.rmSync(tempDir, { recursive: true })
  }
})

it("should build a functioning executable", async () => {
  const tempDir = fs.mkdtempSync(path.resolve("tmp", "test-"))
  tempDirs.push(tempDir)
  fs.cpSync(basicFixture, tempDir, { recursive: true })

  await assert.doesNotReject(
    build({
      ...baseConfig,
      cwd: tempDir,
    }),
  )

  const execPath = path.join(tempDir, "dist-exec", `basic${getArchOsExtensionSuffix()}`)
  assert.ok(fs.existsSync(execPath))

  const execResult = await x(execPath)
  assert.equal(execResult.stdout.trim(), "basic output")
})

it("should throw an error when not building CJS", async () => {
  const tempDir = fs.mkdtempSync(path.resolve("tmp", "test-"))
  tempDirs.push(tempDir)
  fs.cpSync(basicFixture, tempDir, { recursive: true })

  await assert.rejects(
    build({
      ...baseConfig,
      format: "esm",
      cwd: tempDir,
    }),
    "asdasd",
  )
})
