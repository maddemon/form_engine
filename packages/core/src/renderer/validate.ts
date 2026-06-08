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

import type { FormFieldSchema, FormRule, ValidateResult } from '../types/schema'
import type { LocalePack } from '../locale/types'

// 重新导出 ValidateResult 以保持向后兼容
export type { ValidateResult } from '../types/schema'

/**
 * 执行单条规则
 * 返回错误消息，null 表示通过
 */
function checkRule(value: unknown, rule: FormRule, validation?: LocalePack['validation']): string | null {
  if (rule.required) {
    if (value === undefined || value === null || value === '') {
      return rule.message || (validation?.required ?? 'Required')
    }
  }
  if (value === undefined || value === null || value === '') {
    return null
  }
  if (rule.type === 'string' && typeof value !== 'string') {
    return rule.message || (validation?.typeError?.string ?? 'Type error: expected string')
  }
  if (rule.type === 'number') {
    const n = Number(value)
    if (Number.isNaN(n)) return rule.message || (validation?.typeError?.number ?? 'Type error: expected number')
  }
  if (rule.type === 'email' && typeof value === 'string') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return rule.message || (validation?.email ?? 'Invalid email format')
    }
  }
  if (rule.type === 'url' && typeof value === 'string') {
    try {
      new URL(value)
    } catch {
      return rule.message || (validation?.url ?? 'Invalid URL format')
    }
  }
  if (rule.type === 'phone' && typeof value === 'string') {
    if (!/^1[3-9]\d{9}$/.test(value)) {
      return rule.message || (validation?.phone ?? 'Invalid phone number')
    }
  }
  if (rule.type === 'boolean' && typeof value !== 'boolean') {
    return rule.message || (validation?.typeError?.boolean ?? 'Type error: expected boolean')
  }
  if (typeof rule.min === 'number') {
    if (typeof value === 'number' && value < rule.min) {
      return rule.message || 'Invalid value'
    }
    if (typeof value === 'string' && value.length < rule.min) {
      return rule.message || 'Invalid value'
    }
    if (Array.isArray(value) && value.length < rule.min) {
      return rule.message || 'Invalid value'
    }
  }
  if (typeof rule.max === 'number') {
    if (typeof value === 'number' && value > rule.max) {
      return rule.message || 'Invalid value'
    }
    if (typeof value === 'string' && value.length > rule.max) {
      return rule.message || 'Invalid value'
    }
    if (Array.isArray(value) && value.length > rule.max) {
      return rule.message || 'Invalid value'
    }
  }
  if (typeof rule.len === 'number') {
    if (typeof value === 'string' && value.length !== rule.len) {
      return rule.message || 'Invalid value'
    }
    if (Array.isArray(value) && value.length !== rule.len) {
      return rule.message || 'Invalid value'
    }
  }
  if (rule.pattern && typeof value === 'string') {
    try {
      if (!new RegExp(rule.pattern).test(value)) {
        return rule.message || (validation?.pattern ?? 'Format mismatch')
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
function collectFields(nodes: FormFieldSchema[]): FormFieldSchema[] {
  const result: FormFieldSchema[] = []
  for (const node of nodes) {
    result.push(node)
    if (node.children.length) {
      result.push(...collectFields(node.children))
    }
  }
  return result
}

export function validateForm(
  fields: FormFieldSchema[],
  formValues: Record<string, unknown>,
  name?: string,
  validation?: LocalePack['validation'],
): ValidateResult {
  const errors: Record<string, string[]> = {}
  const allFields = collectFields(fields)
  const targets = name
    ? allFields.filter(f => f.name === name)
    : allFields

  for (const field of targets) {
    if (!field.rules || field.rules.length === 0) continue
    const value = formValues[field.name]
    const fieldErrors: string[] = []
    for (const rule of field.rules) {
      const msg = checkRule(value, rule, validation)
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
