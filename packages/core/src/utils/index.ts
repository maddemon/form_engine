export { genId } from './id'
export { pickAdapter } from './adapterResolver'

/**
 * 工具函数：深层获取对象属性
 */
export function getNested(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>( (acc, key) => (acc as Record<string, unknown>)?.[key], obj )
}

/**
 * 工具函数：替换模板变量
 * "/api/users?dept={deptId}&name={form.name}"
 * → "/api/users?dept=2&name=test"
 */
export function replaceTemplateVars(
  template: string,
  context: Record<string, unknown>
): string {
  return template.replace(/\{([^}]+)\}/g, (_, path) => {
    const val = getNested(context as Record<string, unknown>, path)
    return val != null ? encodeURIComponent(String(val)) : ''
  })
}

// ── evalExpr 安全黑名单 ────────────────────────────────────────────

/** 危险标识符正则：匹配单词边界，避免误伤子字符串。
 * 使用 (?<!\$) 负向后顾排除 `$self` 等合法上下文变量 */
const DANGEROUS_REGEX = /\b(?<!\$)(fetch|document|window|globalThis|self|top|parent|XMLHttpRequest|WebSocket|EventSource|import|eval|Function|setTimeout|setInterval|localStorage|sessionStorage|indexedDB|location|history|alert|confirm|prompt|process|require)\b/g

/**
 * 检查表达式是否包含危险标识符
 */
function hasDangerousGlobals(expr: string): boolean {
  DANGEROUS_REGEX.lastIndex = 0
  return DANGEROUS_REGEX.test(expr)
}

// ── evalExpr LRU 缓存 ──────────────────────────────────────────────

const MAX_CACHE_SIZE = 200
const exprCache = new Map<string, (...args: unknown[]) => unknown>()

function getCacheKey(expr: string, keys: string[]): string {
  return `${keys.sort().join(',')}::${expr}`
}

/**
 * 工具函数：计算表达式
 * 安全执行字符串表达式，返回计算结果
 */
export function evalExpr(expr: string, context: Record<string, unknown>): unknown {
  // 安全校验：禁止危险 API
  if (hasDangerousGlobals(expr)) {
    console.warn(`[form-engine] 表达式包含危险标识符，已拦截: ${expr}`)
    return false
  }

  try {
    const keys = Object.keys(context)
    const values = Object.values(context)

    // LRU 缓存：按 (keys + expr) 缓存编译结果，避免同名表达式跨上下文复用
    const cacheKey = getCacheKey(expr, keys)
    let fn = exprCache.get(cacheKey)
    if (!fn) {
      fn = new Function(...keys, `return (${expr})`) as (...args: unknown[]) => unknown
      if (exprCache.size >= MAX_CACHE_SIZE) {
        const firstKey = exprCache.keys().next().value
        if (firstKey !== undefined) exprCache.delete(firstKey)
      }
      exprCache.set(cacheKey, fn)
    }

    return fn(...values)
  } catch {
    console.warn(`[form-engine] 表达式执行失败: ${expr}`)
    return false
  }
}

/**
 * 判断 visibleWhen 是否匹配
 */
export function matchVisibleWhen(
  visibleWhen: string | Record<string, unknown> | null,
  formValues: Record<string, unknown>
): boolean {
  if (visibleWhen === null || visibleWhen === undefined) return true
  if (typeof visibleWhen === 'string') {
    return !!getNested(formValues, visibleWhen)
  }
  // Record 声明式
  return Object.entries(visibleWhen).every(([key, expected]) => {
    const val = getNested(formValues, key)
    if (Array.isArray(expected)) return expected.includes(val)
    return val === expected
  })
}

/**
 * 解析用户传入的"面板宽度"为合法的 CSS 宽度值。
 *
 * 设计动机：用户可能传 px 数字、可能传 '20%' 字符串、可能啥都不传。
 * 我们要做的是：
 *  1. 给一个**最小值兜底**（避免字段被压到不可读）
 *  2. 给一个**默认值兜底**（用户不传时使用 token 推荐值）
 *  3. 字符串透传时不做单位假设，让用户自负责任
 *
 * @param value     用户传入值（number | string | undefined）
 * @param fallback  用户没传时使用的 token 推荐值
 * @param min       用户传 px 数字时允许的最小值（防呆）
 * @returns         可直接用于 React style.width 的字符串
 *
 * @example
 *   resolvePanelWidth(undefined, '220px', 160)          // '220px'
 *   resolvePanelWidth(280,       '220px', 160)          // '280px'
 *   resolvePanelWidth(100,       '220px', 160)          // '160px'  ← 自动兜底
 *   resolvePanelWidth('20%',     '220px', 160)          // '20%'    ← 字符串透传
 *   resolvePanelWidth('min(220px, 20vw)', '220px', 160) // 'min(220px, 20vw)'
 */
export function resolvePanelWidth(
  value: number | string | undefined,
  fallback: string,
  min: number,
): string {
  if (value === undefined || value === null || value === '') return fallback
  if (typeof value === 'string') return value
  // number 路径：把 NaN / 负数 / 0 都视为非法，回退到 min
  if (!Number.isFinite(value) || value <= 0) return `${min}px`
  return `${Math.max(value, min)}px`
}
