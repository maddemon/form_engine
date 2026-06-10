import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { EyeIcon, EyeOffIcon } from '../../components/icons'
import { useLocale } from '../../locale'
import { FieldItem } from '../../propRenders'
import CustomPropsRender from '../../propRenders/CustomPropsRender'
import type { PropsRenderProps } from '../../propRenders/types'
import { resolveSlot } from '../../registry/propertySlotRegistry'
import { useStyle } from '../../styles'
import type { DesignerWidgets } from '../../types/adapter'
import type { CustomComponentConfig } from '../../types/custom-component'
import type { DesignerAction } from '../../types/designer'
import type { PropertySlots } from '../../types/property-slot'
import type { FieldDataSource, FormFieldSchema } from '../../types/schema'
import { WidgetButton } from '../../widgets/Button'
import { Divider } from '../../widgets/Divider'
import { Space } from '../../widgets/Space'
import { CollapsibleSection } from '../CollapsibleSection'
import { RulesEditor } from '../RulesEditor'
import { useDebouncedInput } from '../useDebouncedInput'
import { useFieldNameValidation } from '../useFieldNameValidation'
import { ErrorMessage } from '../UIPrimitives'
import { EventEditor } from './EventEditor'
import { StaticExpressionToggle } from './StaticExpressionToggle'

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
  const { setNameDirty, nameError, existingNames } = useFieldNameValidation(allFields, field.id, field.name)

  // ===== Slot 解析 =====
  const ExpressionEditorSlot = useMemo(() => resolveSlot('expressionEditor', slots, w), [slots, w])

  // ===== 防抖输入 =====

  const [labelValue, handleLabelChange] = useDebouncedInput<string | number>(field.label || '', (v) =>
    dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { label: String(v) || undefined } }),
  )

  const [defaultValueValue, handleDefaultValueChange] = useDebouncedInput<string | number>(
    field.defaultValue != null ? String(field.defaultValue) : '',
    (v) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { defaultValue: v || undefined } }),
  )
  const handleDefaultValueChangeTyped = handleDefaultValueChange as (value: unknown) => void

  const [colSpanValue, handleColSpanChange] = useDebouncedInput<number>(field.colSpan || 24, (v) =>
    dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { colSpan: Number(v) } }),
  )

  // ===== disabled/readOnly 模式切换 =====
  // 已抽取为 StaticExpressionToggle 组件

  // 字段名防抖（含重复校验，setNameDirty 立即执行）
  const [nameValue, handleNameChangeRaw] = useDebouncedInput<string | number>(field.name, (v) => {
    const newName = String(v)
    if (newName && !existingNames.has(newName)) {
      dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { name: newName } })
    }
  })
  const handleNameChange = useCallback(
    (v: string | number) => {
      setNameDirty(true)
      handleNameChangeRaw(v)
    },
    [setNameDirty, handleNameChangeRaw],
  )

  // componentProps 防抖：维护本地状态实现即时视觉反馈
  const [localComponentProps, setLocalComponentProps] = useState<Record<string, unknown>>(field.componentProps || {})
  const componentPropsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isEditingComponentPropsRef = useRef(false)

  useEffect(() => {
    if (!isEditingComponentPropsRef.current) {
      setLocalComponentProps(field.componentProps || {})
    }
  }, [field.componentProps])

  const handleComponentPropsChange = useCallback(
    (key: string, value: unknown) => {
      isEditingComponentPropsRef.current = true
      setLocalComponentProps((prev) => {
        const next = { ...prev, [key]: value }
        if (componentPropsTimerRef.current) clearTimeout(componentPropsTimerRef.current)
        componentPropsTimerRef.current = setTimeout(() => {
          isEditingComponentPropsRef.current = false
          dispatch({
            type: 'UPDATE_FIELD',
            fieldId: field.id,
            patch: { componentProps: next },
          })
        }, 300)
        return next
      })
    },
    [dispatch, field.id],
  )

  useEffect(() => {
    return () => {
      if (componentPropsTimerRef.current) clearTimeout(componentPropsTimerRef.current)
    }
  }, [])

  return (
    <>
      <FieldItem label={lp.fieldName}>
        <Space direction="vertical" gap="xs" style={{ flex: 1 }}>
          <w.Input value={nameValue} onChange={handleNameChange} />
          {nameError && <ErrorMessage>{nameError}</ErrorMessage>}
        </Space>
      </FieldItem>
      <FieldItem label={lp.fieldLabel}>
        <Space gap="xs" style={{ flex: 1 }}>
          <w.Input value={labelValue} onChange={handleLabelChange} placeholder={lp.fieldLabelPlaceholder} style={{ flex: 1 }} />
          <WidgetButton
            type="text"
            size="sm"
            onClick={() =>
              dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { labelHidden: !field.labelHidden } })
            }
            label={field.labelHidden ? lp.showLabel : lp.hideLabel}
            style={{ color: field.labelHidden ? 'var(--fe-text-tertiary)' : 'var(--fe-primary)', flexShrink: 0, padding: '0 2px' }}
          >
            {field.labelHidden ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
          </WidgetButton>
        </Space>
      </FieldItem>
      {isForm && (
        <FieldItem label={lp.defaultValue}>
          {/* eslint-disable-next-line react-hooks/static-components */}
          <ExpressionEditorSlot
            value={defaultValueValue}
            onChange={handleDefaultValueChangeTyped}
            field={field}
            fieldNames={allFields.map((f) => f.name).filter(Boolean)}
            placeholder={lp.defaultValuePlaceholder}
          />
        </FieldItem>
      )}

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

      {(ComponentPropsRender || customConfig?.propertyConfig?.length) && (
        <>
          <Divider style={{ marginTop: token('spacingSm') }} />
          {ComponentPropsRender ? (
            <ComponentPropsRender
              widgets={w}
              values={localComponentProps}
              onChange={handleComponentPropsChange}
              dataSource={field.dataSource}
              onDataSourceChange={(ds: FieldDataSource) => {
                dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { dataSource: ds } })
              }}
              slots={slots}
            />
          ) : customConfig?.propertyConfig ? (
            <CustomPropsRender
              configs={customConfig.propertyConfig}
              widgets={w}
              values={localComponentProps}
              onChange={handleComponentPropsChange}
              slots={slots}
            />
          ) : null}
        </>
      )}

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
              fieldNames={allFields.map((f) => f.name).filter(Boolean)}
            />
            <StaticExpressionToggle
              field={field}
              propKey="readOnly"
              label={lp.readOnly}
              w={w}
              dispatch={dispatch}
              ExpressionEditorSlot={ExpressionEditorSlot}
              fieldNames={allFields.map((f) => f.name).filter(Boolean)}
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
          fieldNames={allFields.map((f) => f.name).filter(Boolean)}
          placeholder={lp.hiddenPlaceholder}
        />
      </CollapsibleSection>

      <EventEditor field={field} w={w} dispatch={dispatch} slots={slots} />
    </>
  )
}
