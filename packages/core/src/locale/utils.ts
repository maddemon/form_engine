export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target }
  for (const key of Object.keys(source) as (keyof T)[]) {
    const sourceVal = source[key]
    const targetVal = target[key]
    if (sourceVal && typeof sourceVal === 'object' && !Array.isArray(sourceVal) && targetVal && typeof targetVal === 'object' && !Array.isArray(targetVal)) {
      result[key] = deepMerge(targetVal as Record<string, unknown>, sourceVal as Record<string, unknown>) as T[keyof T]
    } else if (sourceVal !== undefined) {
      result[key] = sourceVal as T[keyof T]
    }
  }
  return result
}

export function flattenLocale(obj: object, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') result[path] = value
    else if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenLocale(value as Record<string, unknown>, path))
    }
  }
  return result
}

export function validateLocale(
  reference: Record<string, string>,
  target: Record<string, string>,
  label?: string,
): string[] {
  const missing: string[] = []
  for (const key of Object.keys(reference)) {
    if (!(key in target)) missing.push(key)
  }
  if (missing.length > 0) {
    const tag = label ? ` [${label}]` : ''
    console.warn(
      `[FormEngine] Missing locale keys${tag} (${missing.length}):\n  ${missing.join('\n  ')}`,
    )
  }
  return missing
}
