/**
 * 基础校验
 *
 * 本期实现范围（与 docs/event-system-design.md 5.1 节一致）：
 * - 遍历目标 field 的 rules
 * - 支持 required / min / max / len / pattern / type
 * - 返回是否通过 + 错误消息列表
 *
 * 本期不实现：
 * - 自定义 validator 函数体（与 expression 体系重复，留待后续）
 * - 异步校验
 */

import type { FormFieldSchema, FormSchema, FormRule } from '../types/schema'

export interface ValidateResult {
  valid: boolean
  /** 错误信息列表，按 field.name 索引 */
  errors: Record<string, string[]>
}

/**
 * 执行单条规则
 * 返回错误消息，null 表示通过
 */
function checkRule(value: unknown, rule: FormRule): string | null {
  if (rule.required) {
    if (value === undefined || value === null || value === '') {
      return rule.message || '必填'
    }
  }
  if (value === undefined || value === null || value === '') {
    // 非 required 字段值为空时，跳过其他校验
    return null
  }
  if (rule.type === 'string' && typeof value !== 'string') {
    return rule.message || '类型错误：期望 string'
  }
  if (rule.type === 'number') {
    const n = Number(value)
    if (Number.isNaN(n)) return rule.message || '类型错误：期望 number'
  }
  if (rule.type === 'email' && typeof value === 'string') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return rule.message || '邮箱格式错误'
    }
  }
  if (rule.type === 'url' && typeof value === 'string') {
    try {
      new URL(value)
    } catch {
      return rule.message || 'URL 格式错误'
    }
  }
  if (rule.type === 'phone' && typeof value === 'string') {
    if (!/^1[3-9]\d{9}$/.test(value)) {
      return rule.message || '手机号格式错误'
    }
  }
  if (rule.type === 'boolean' && typeof value !== 'boolean') {
    return rule.message || '类型错误：期望 boolean'
  }
  if (typeof rule.min === 'number') {
    if (typeof value === 'number' && value < rule.min) {
      return rule.message || `不能小于 ${rule.min}`
    }
    if (typeof value === 'string' && value.length < rule.min) {
      return rule.message || `长度不能小于 ${rule.min}`
    }
    if (Array.isArray(value) && value.length < rule.min) {
      return rule.message || `数量不能小于 ${rule.min}`
    }
  }
  if (typeof rule.max === 'number') {
    if (typeof value === 'number' && value > rule.max) {
      return rule.message || `不能大于 ${rule.max}`
    }
    if (typeof value === 'string' && value.length > rule.max) {
      return rule.message || `长度不能大于 ${rule.max}`
    }
    if (Array.isArray(value) && value.length > rule.max) {
      return rule.message || `数量不能大于 ${rule.max}`
    }
  }
  if (typeof rule.len === 'number') {
    if (typeof value === 'string' && value.length !== rule.len) {
      return rule.message || `长度必须为 ${rule.len}`
    }
    if (Array.isArray(value) && value.length !== rule.len) {
      return rule.message || `数量必须为 ${rule.len}`
    }
  }
  if (rule.pattern && typeof value === 'string') {
    try {
      if (!new RegExp(rule.pattern).test(value)) {
        return rule.message || '格式不匹配'
      }
    } catch {
      // 非法正则：跳过
    }
  }
  return null
}

/**
 * 校验整个表单或单个字段
 * - name 不传：校验所有字段
 * - name 传入：只校验该字段
 *
 * 返回 { valid, errors }，valid=true 表示全部通过
 */
export function validateForm(
  fields: FormFieldSchema[],
  formValues: Record<string, unknown>,
  name?: string,
): ValidateResult {
  const errors: Record<string, string[]> = {}
  const targets = name
    ? fields.filter(f => f.name === name)
    : fields

  for (const field of targets) {
    if (!field.rules || field.rules.length === 0) continue
    const value = formValues[field.name]
    const fieldErrors: string[] = []
    for (const rule of field.rules) {
      const msg = checkRule(value, rule)
      if (msg) fieldErrors.push(msg)
    }
    if (fieldErrors.length > 0) {
      errors[field.name] = fieldErrors
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}
