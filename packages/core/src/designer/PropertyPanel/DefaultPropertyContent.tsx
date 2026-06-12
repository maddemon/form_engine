import { useMemo } from 'react'
import { useLocale } from '../../locale'
import { FieldItem } from '../../propRenders'
import type { PropsRenderProps } from '../../propRenders/types'
import { useStyle } from '../../styles'
import type { DesignerWidgets } from '../../types/adapter-designer'
import type { CustomComponentConfig } from '../../types/custom-component'
import type { DesignerAction } from '../../types/designer'
import type { PropertySlots } from '../../types/property-slot'
import type { FormFieldSchema } from '../../types/schema'
import { useDebouncedFieldUpdate } from '../hooks/useDebouncedFieldUpdate'
import { useSlot } from '../hooks/useSlot'
import { AdvancedSection } from './AdvancedSection'
import { ComponentPropsSection } from './ComponentPropsSection'
import { EventEditor } from './EventEditor'
import { FieldLabelEditor } from './FieldLabelEditor'
import { FieldNameEditor } from './FieldNameEditor'

// ── helpers ────────────────────────────────────────────────────────

export function hasAdvancedConfig(field: FormFieldSchema): boolean {
  return !!(
    (typeof field.hidden === 'boolean' && field.hidden) ||
    (typeof field.hidden === 'string' && field.hidden) ||
    field.disabled ||
    field.readOnly ||
    field.requiredIfExpr ||
    (field.rules && field.rules.length > 0)
  )
}

// ── DefaultPropertyContent ─────────────────────────────────────────

interface DefaultContentProps {
  field: FormFieldSchema
  w: DesignerWidgets
  dispatch: React.Dispatch<DesignerAction>
  isForm: boolean
  isContainer: boolean
  isButton: boolean
  ComponentPropsRender: React.ComponentType<PropsRenderProps> | undefined
  customConfig: CustomComponentConfig | null
  slots?: PropertySlots
  allFields: FormFieldSchema[]
}

export function DefaultPropertyContent({
  field,
  w,
  dispatch,
  isForm,
  isContainer,
  ComponentPropsRender,
  customConfig,
  slots,
  allFields,
}: DefaultContentProps) {
  const { token } = useStyle()
  const { locale } = useLocale()
  const lp = locale.designer.propertyPanel
  const hasAdvanced = hasAdvancedConfig(field)

  // ===== Slot 解析 =====
  const ExpressionEditorSlot = useSlot('expressionEditor', slots, w)
  const fieldNames = useMemo(() => allFields.map((f) => f.name).filter(Boolean), [allFields])

  // ===== 默认值防抖 =====
  const [defaultValueValue, handleDefaultValueChange] = useDebouncedFieldUpdate<string | number>(
    dispatch,
    field.id,
    'defaultValue',
    field.defaultValue != null ? String(field.defaultValue) : '',
    { transform: (v) => v || undefined },
  )
  const handleDefaultValueChangeTyped = handleDefaultValueChange as (value: unknown) => void

  return (
    <>
      {/* 字段名 */}
      <FieldNameEditor field={field} w={w} dispatch={dispatch} allFields={allFields} />

      {/* 字段标签 */}
      <FieldLabelEditor field={field} w={w} dispatch={dispatch} />

      {/* 默认值（仅表单组件） */}
      {isForm && (
        <FieldItem label={lp.defaultValue}>
          {/* eslint-disable-next-line react-hooks/static-components */}
          <ExpressionEditorSlot
            value={defaultValueValue}
            onChange={handleDefaultValueChangeTyped}
            field={field}
            fieldNames={fieldNames}
            placeholder={lp.defaultValuePlaceholder}
          />
        </FieldItem>
      )}

      {/* 容器提示 */}
      {isContainer && (
        <div
          style={{
            fontSize: token('fontSizeSm'),
            color: token('textTertiary') as string,
            padding: `${token('spacingXs')} 0`,
            marginBottom: token('spacingSm'),
          }}
        >
          {lp.containerHint}
        </div>
      )}

      {/* 组件属性 */}
      <ComponentPropsSection
        field={field}
        w={w}
        dispatch={dispatch}
        ComponentPropsRender={ComponentPropsRender}
        customConfig={customConfig}
        slots={slots}
      />

      {/* 高级属性 */}
      <AdvancedSection
        field={field}
        w={w}
        dispatch={dispatch}
        isForm={isForm}
        slots={slots}
        allFields={allFields}
        hasAdvanced={hasAdvanced}
      />

      {/* 事件编辑器 */}
      <EventEditor field={field} w={w} dispatch={dispatch} slots={slots} />
    </>
  )
}
