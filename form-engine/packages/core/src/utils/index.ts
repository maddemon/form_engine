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
