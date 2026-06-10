import React from 'react'
import { useLocale } from '../locale'
import { FieldItem } from '../propRenders/shared'
import type { DesignerWidgets } from '../types/adapter'
import type { DesignerAction } from '../types/designer'
import type { PropertySlots } from '../types/property-slot'
import type { FormFieldSchema, FormRule } from '../types/schema'
import { SectionTitle } from './UIPrimitives'
import { useDebouncedInput } from './useDebouncedInput'
import { useSlot } from './useSlot'

export function useCommonPatterns() {
  const { locale } = useLocale()
  const r = locale.designer.rules
  return [
    { label: r.custom, value: '' },
    { label: r.phone, value: '^1[3-9]\\d{9}$' },
    { label: r.idCard, value: '^[1-9]\\d{5}(19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]$' },
    { label: r.email, value: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
    { label: r.url, value: '^https?://[\\w.-]+(:\\d+)?(/[\\w./-]*)?$' },
  ]
}

export const COMMON_PATTERNS: { label: string; value: string }[] = [
  { label: '自定义', value: '' },
  { label: '手机号（中国）', value: '^1[3-9]\\d{9}$' },
  { label: '身份证号（18位）', value: '^[1-9]\\d{5}(19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]$' },
  { label: '邮箱', value: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
  { label: '网址', value: '^https?://[\\w.-]+(:\\d+)?(/[\\w./-]*)?$' },
]

interface RulesEditorProps {
  field: FormFieldSchema
  widgets: DesignerWidgets
  dispatch: React.Dispatch<DesignerAction>
  slots?: PropertySlots
}

export function RulesEditor({ field, widgets: w, dispatch, slots }: RulesEditorProps) {
  const { locale } = useLocale()
  const r = locale.designer.rules
  const commonPatterns = useCommonPatterns()
  const ExpressionEditorSlot = useSlot('expressionEditor', slots, w)
  const rule: FormRule = field.rules?.[0] ?? {}

  function updateRule(patch: Partial<FormRule>) {
    const nextRule = { ...rule, ...patch }
    const cleaned = Object.keys(nextRule).length > 0 ? nextRule : undefined
    dispatch({
      type: 'UPDATE_FIELD',
      fieldId: field.id,
      patch: { rules: cleaned ? [cleaned] : undefined },
    })
  }

  const [messageValue, handleMessageChange] = useDebouncedInput<string | number>(rule.message || '', (v) =>
    updateRule({ message: String(v) || undefined }),
  )

  const [patternValue, handlePatternChange, cancelPatternPending] = useDebouncedInput<string | number>(
    rule.pattern || '',
    (v) => updateRule({ pattern: String(v) || undefined }),
  )
  const handlePatternChangeTyped = handlePatternChange as (value: unknown) => void

  const handlePatternSelect = (v: string) => {
    cancelPatternPending()
    updateRule({ pattern: v || undefined })
  }

  return (
    <>
      <SectionTitle variant="primary">{r.title}</SectionTitle>
      <FieldItem label={r.required}>
        <w.Switch checked={!!rule.required} onChange={(v: boolean) => updateRule({ required: v || undefined })} />
      </FieldItem>
      <FieldItem label={r.errorMessage}>
        <w.Input value={messageValue} onChange={handleMessageChange} placeholder={r.errorMessagePlaceholder} />
      </FieldItem>
      <FieldItem label={r.regex}>
        {/* eslint-disable-next-line react-hooks/static-components */}
        <ExpressionEditorSlot
          value={patternValue}
          onChange={handlePatternChangeTyped}
          field={field}
          placeholder={r.regexPlaceholder}
        />
      </FieldItem>
      <FieldItem label={r.regexPresets}>
        <w.Select
          value={commonPatterns.some((p) => p.value === rule.pattern) ? rule.pattern || '' : ''}
          onChange={(v) => handlePatternSelect(v as string)}
          options={commonPatterns}
        />
      </FieldItem>
    </>
  )
}
