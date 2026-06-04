import { useMemo } from 'react'
import type { FormFieldSchema } from '../../types/schema'
import { evalExpr, matchVisibleWhen } from '../../utils'

export interface UseFieldExpressionResult {
  /** 表达式计算后的禁用状态 */
  exprDisabled: boolean
  /** 表达式计算后的必填状态 */
  exprRequired: boolean
}

/**
 * 计算字段表达式（disabled / required）
 *
 * 将 evalExpr 调用集中在此 hook，通过 useMemo 缓存，
 * 仅当表达式字符串或依赖值变化时重算。
 */
export function useFieldExpression(
  field: FormFieldSchema,
  value: unknown,
): UseFieldExpressionResult {
  const context = useMemo(() => ({ [field.name]: value } as Record<string, unknown>), [field.name, value])

  const exprDisabled = useMemo(() => {
    if (typeof field.disabled === 'string') return !!evalExpr(field.disabled, context)
    if (field.disabledIfExpr) return !!evalExpr(field.disabledIfExpr, context)
    return false
  }, [field.disabled, field.disabledIfExpr, context])

  const exprRequired = useMemo(() => {
    if (field.requiredIfExpr) return !!evalExpr(field.requiredIfExpr, context)
    if (field.requiredWhen) return matchVisibleWhen(field.requiredWhen, context)
    return false
  }, [field.requiredIfExpr, field.requiredWhen, context])

  return { exprDisabled, exprRequired }
}
