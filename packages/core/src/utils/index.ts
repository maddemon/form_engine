export { genId } from './id'

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
    return val != null ? String(val) : ''
  })
}

/**
 * 工具函数：计算表达式
 * 安全执行字符串表达式，返回计算结果
 */
export function evalExpr(expr: string, context: Record<string, unknown>): unknown {
  try {
    const keys = Object.keys(context)
    const values = Object.values(context)
    const fn = new Function(...keys, `return (${expr})`)
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
