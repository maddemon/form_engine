import { useMemo } from 'react'
import { useLocale } from '../../locale'
import { FieldItem } from '../../propRenders'
import type { DesignerWidgets } from '../../types/adapter'
import type { DesignerAction } from '../../types/designer'
import type { PropertySlots } from '../../types/property-slot'
import type { FormFieldSchema } from '../../types/schema'
import { CollapsibleSection } from '../CollapsibleSection'
import { RulesEditor } from '../RulesEditor'
import { useDebouncedFieldUpdate } from '../useDebouncedFieldUpdate'
import { useSlot } from '../useSlot'
import { StaticExpressionToggle } from './StaticExpressionToggle'

interface AdvancedSectionProps {
  field: FormFieldSchema
  w: DesignerWidgets
  dispatch: React.Dispatch<DesignerAction>
  isForm: boolean
  slots?: PropertySlots
  allFields: FormFieldSchema[]
  hasAdvanced: boolean
}

/** 高级属性区：colSpan、rules、disabled/readOnly/hidden */
export function AdvancedSection({
  field,
  w,
  dispatch,
  isForm,
  slots,
  allFields,
  hasAdvanced,
}: AdvancedSectionProps) {
  const { locale } = useLocale()
  const lp = locale.designer.propertyPanel
  const ExpressionEditorSlot = useSlot('expressionEditor', slots, w)
  const fieldNames = useMemo(() => allFields.map((f) => f.name).filter(Boolean), [allFields])

  const [colSpanValue, handleColSpanChange] = useDebouncedFieldUpdate<number>(
    dispatch,
    field.id,
    'colSpan',
    field.colSpan || 24,
    { transform: (v) => Number(v) },
  )

  return (
    <CollapsibleSection title={lp.advancedProps} defaultCollapsed={true} forceExpand={hasAdvanced}>
      {isForm && (
        <>
          <FieldItem label={lp.colSpan}>
            <w.NumberInput value={colSpanValue} onChange={handleColSpanChange} min={1} max={24} />
          </FieldItem>
          <RulesEditor field={field} widgets={w} dispatch={dispatch} slots={slots} />
          <StaticExpressionToggle
            field={field}
            propKey="disabled"
            label={lp.disabled}
            w={w}
            dispatch={dispatch}
            ExpressionEditorSlot={ExpressionEditorSlot}
            fieldNames={fieldNames}
          />
          <StaticExpressionToggle
            field={field}
            propKey="readOnly"
            label={lp.readOnly}
            w={w}
            dispatch={dispatch}
            ExpressionEditorSlot={ExpressionEditorSlot}
            fieldNames={fieldNames}
          />
        </>
      )}

      <StaticExpressionToggle
        field={field}
        propKey="hidden"
        label={lp.hidden}
        w={w}
        dispatch={dispatch}
        ExpressionEditorSlot={ExpressionEditorSlot}
        fieldNames={fieldNames}
        placeholder={lp.hiddenPlaceholder}
      />
    </CollapsibleSection>
  )
}
