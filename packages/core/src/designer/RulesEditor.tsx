import React, { useCallback } from 'react'
import { FieldItem } from '../propRenders/shared'
import { resolveSlot } from '../registry/propertySlotRegistry'
import { useStyle } from '../styles'
import type { DesignerWidgets } from '../types/adapter'
import type { DesignerAction } from '../types/designer'
import type { PropertySlots } from '../types/property-slot'
import type { FormFieldSchema, FormRule } from '../types/schema'
import { useDebouncedInput } from './useDebouncedInput'

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
  const { token } = useStyle()
  const CodeEditorSlot = resolveSlot('codeEditor', slots, w)
  const rule: FormRule = field.rules?.[0] ?? {}

  const updateRule = useCallback(
    (patch: Partial<FormRule>) => {
      const nextRule = { ...rule, ...patch }
      const cleaned = Object.keys(nextRule).length > 0 ? nextRule : undefined
      dispatch({
        type: 'UPDATE_FIELD',
        fieldId: field.id,
        patch: { rules: cleaned ? [cleaned] : undefined },
      })
    },
    [rule, dispatch, field.id],
  )

  const handlePatternSelect = useCallback(
    (v: string) => {
      updateRule({ pattern: v || undefined })
    },
    [updateRule],
  )

  // 防抖输入
  const [messageValue, handleMessageChange] = useDebouncedInput<string | number>(rule.message || '', (v) =>
    updateRule({ message: String(v) || undefined }),
  )

  const [patternValue, handlePatternChange] = useDebouncedInput<string | number>(rule.pattern || '', (v) =>
    updateRule({ pattern: String(v) || undefined }),
  )

  return (
    <>
      <div
        style={{
          fontSize: token('fontSizeSm'),
          fontWeight: 500,
          marginBottom: token('spacingSm'),
          color: token('textSecondary'),
        }}
      >
        校验规则
      </div>
      <FieldItem label="必填">
        <w.Switch checked={!!rule.required} onChange={(v: boolean) => updateRule({ required: v || undefined })} />
      </FieldItem>
      <FieldItem label="错误提示">
        <w.Input value={messageValue} onChange={handleMessageChange} placeholder="此字段为必填" />
      </FieldItem>
      <FieldItem label="正则验证">
        <CodeEditorSlot
          value={patternValue}
          onChange={handlePatternChange}
          field={field}
          placeholder="输入正则表达式"
        />
      </FieldItem>
      <FieldItem label="常用正则预设">
        <w.Select
          value={COMMON_PATTERNS.some((p) => p.value === rule.pattern) ? rule.pattern || '' : ''}
          onChange={(v) => handlePatternSelect(v as string)}
          options={COMMON_PATTERNS}
        />
      </FieldItem>
    </>
  )
}
