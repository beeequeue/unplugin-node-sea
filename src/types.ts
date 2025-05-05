export type SeaConfig = {
  main: string
  output: string
  disableExperimentalSEAWarning?: boolean
  useSnapshot?: boolean
  useCodeCache: boolean
  assets?: Record<string, string>
}

export type NodeSeaPluginOptions = {
  name?: string
  codeCache?: boolean
  v8Snapshot?: boolean
}
