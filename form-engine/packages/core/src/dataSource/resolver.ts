import type {
  FieldDataSource,
  OptionItem,
  RemoteDataSource,
  StaticDataSource,
} from '../types/schema'
import type { DataSourceResolver, DataSourceContext } from '../types/render'
import { getNested, replaceTemplateVars } from '../utils'

// ============================
// 内置 Remote 请求缓存
// ============================

interface CacheEntry {
  data: OptionItem[]
  expireAt: number // Date.now() + ttl
}

const cache = new Map<string, CacheEntry>()

function getCacheKey(config: Record<string, unknown>, formValues: Record<string, unknown>): string {
  const url = String(config.url || '')
  const deps = (config.dependencies as string[] | undefined) || []
  const depValues = deps.map(dep => `${dep}=${(formValues as Record<string, unknown>)[dep]}`)
  return `${url}::${depValues.join('&')}`
}

function readCache(key: string): OptionItem[] | null {
  const entry = cache.get(key)
  if (entry && entry.expireAt > Date.now()) {
    return entry.data
  }
  cache.delete(key)
  return null
}

function writeCache(key: string, data: OptionItem[], ttlMs: number) {
  cache.set(key, { data, expireAt: Date.now() + ttlMs })
}

// ============================
// resultPath 提取
// ============================

function extractByPath(raw: unknown, path: string): unknown {
  if (!path) return raw
  return getNested({ _root: raw }, `_root.${path}`)
}

// ============================
// labelField / valueField 映射
// ============================

function mapRawItems(
  raw: unknown,
  labelField = 'label',
  valueField = 'value',
): OptionItem[] {
  if (!Array.isArray(raw)) {
    // 如果 raw 是对象，尝试包一层
    if (raw && typeof raw === 'object') return mapRawItems([raw], labelField, valueField)
    return []
  }

  return (raw as Record<string, unknown>[]).map(item => ({
    label: String(item[labelField] ?? ''),
    value: item[valueField] ?? item[labelField] ?? '',
    disabled: !!item.disabled,
    ...(item.children
      ? { children: mapRawItems(item.children, labelField, valueField) }
      : {}),
  }))
}

// ============================
// 内置 remote 请求执行器
// ============================

export interface RemoteFetchOptions {
  /** 请求 URL（支持模板变量如 /api/list?dept={deptId}） */
  url: string
  /** GET / POST */
  method?: string
  /** POST body（支持模板变量） */
  body?: Record<string, unknown>
  /** 从响应中提取数据的路径，如 'data.list' */
  resultPath?: string
  /** 响应中 label 对应的字段名 */
  labelField?: string
  /** 响应中 value 对应的字段名 */
  valueField?: string
  /** 缓存 TTL（毫秒），0 表示不缓存 */
  cacheTTL?: number
  /** 依赖字段，值变化时重新请求 */
  dependencies?: string[]
  /** 必需依赖，这些字段为空时不发请求 */
  requiredDeps?: string[]
  /** 当依赖为空时是否跳过请求 */
  skipEmpty?: boolean
}

/**
 * 执行内置 remote 数据源请求
 */
async function executeRemote(
  config: Record<string, unknown>,
  context: DataSourceContext,
): Promise<OptionItem[]> {
  const { formValues } = context

  // 1. 模板变量替换
  const url = replaceTemplateVars(String(config.url || ''), formValues)
  if (!url) throw new Error('[form-engine] remote dataSource 缺少 url')

  const method = (config.method as string || 'GET').toUpperCase()
  const resultPath = config.resultPath as string | undefined
  const labelField = config.labelField as string | undefined
  const valueField = config.valueField as string | undefined
  const cacheTTL = (config.cacheTTL as number | undefined) || 0
  const skipEmpty = !!config.skipEmpty

  // 2. 缓存读取
  if (cacheTTL > 0) {
    const key = getCacheKey(config, formValues)
    const cached = readCache(key)
    if (cached) return cached
  }

  // 3. 发请求
  const fetchOptions: RequestInit = { method }
  if (method === 'POST' && config.body) {
    fetchOptions.headers = { 'Content-Type': 'application/json' }
    const bodyStr = JSON.stringify(config.body)
    // 简单模板变量替换 body 中的 {fieldName}
    fetchOptions.body = replaceTemplateVars(bodyStr, formValues)
  }

  const resp = await fetch(url, fetchOptions)
  if (!resp.ok) throw new Error(`[form-engine] remote 请求失败: ${resp.status}`)

  const json = await resp.json()
  const extracted = extractByPath(json, resultPath || '')
  const options = mapRawItems(extracted, labelField, valueField)

  // 4. 写入缓存
  if (cacheTTL > 0) {
    const key = getCacheKey(config, formValues)
    writeCache(key, options, cacheTTL)
  }

  return options
}

// ============================
// 内置 dataSourceResolver（默认实现）
// ============================

/**
 * 内置解析器：处理 static / remote 两种类型
 * - static：直接返回 options
 * - remote：执行 HTTP 请求，支持模板变量、resultPath、label/value 映射、缓存
 *
 * 使用者可通过 FormRender 的 dataSourceResolver prop 完全覆盖此逻辑
 */
export const builtinDataSourceResolver: DataSourceResolver = async (
  config: Record<string, unknown>,
  context: DataSourceContext,
): Promise<OptionItem[]> => {
  // 通过 type 字段判断，但 config 是 remote.config，需要上层传入 type
  // 实际上上层会根据 dataSource.type 分别调用，这里 config 就是 remote.config
  // 所以 builtin resolver 专注处理 remote.config
  return executeRemote(config, context)
}

/**
 * 统一入口：根据 FieldDataSource 类型分发
 * 由 FormRender 内部调用
 */
export async function resolveDataSource(
  ds: FieldDataSource,
  context: DataSourceContext,
  customResolver?: DataSourceResolver,
): Promise<OptionItem[]> {
  if (ds.type === 'static') {
    const staticDs = ds as StaticDataSource
    return staticDs.static.options || []
  }

  // remote
  const remoteDs = ds as RemoteDataSource
  const config = remoteDs.remote.config

  // 优先使用外部自定义 resolver
  if (customResolver) {
    return customResolver(config, context)
  }

  // 内置 resolver
  return executeRemote(config, context)
}

/**
 * 检查 remote dataSource 的依赖是否已满足（requiredDeps）
 * 供 FormRender 决定是否发起请求
 */
export function checkRequiredDeps(
  ds: FieldDataSource,
  formValues: Record<string, unknown>,
): boolean {
  if (ds.type !== 'remote') return true
  const remoteDs = ds as RemoteDataSource
  const requiredDeps = (remoteDs.remote.config.requiredDeps as string[] | undefined) || []
  if (requiredDeps.length === 0) return true

  return requiredDeps.every(dep => {
    const val = (formValues as Record<string, unknown>)[dep]
    return val != null && val !== ''
  })
}

/**
 * 获取 dataSource 的依赖字段列表（用于监听变化）
 */
export function getDataSourceDeps(ds: FieldDataSource): string[] {
  if (ds.type !== 'remote') return []
  const remoteDs = ds as RemoteDataSource
  return (remoteDs.remote.config.dependencies as string[] | undefined) || []
}

export { readCache, writeCache, getCacheKey }
