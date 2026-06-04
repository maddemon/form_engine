import { useCallback, useEffect, useRef, useState } from 'react'
import { FieldItem, PropsRenderMap } from '../../propRenders'
import CustomPropsRender from '../../propRenders/CustomPropsRender'
import type { PropsRenderProps } from '../../propRenders/types'
import { customComponentRegistry } from '../../registry/customComponentRegistry'
import { useStyle } from '../../styles'
import type { DesignerWidgets } from '../../types/adapter'
import type { CustomComponentConfig } from '../../types/custom-component'
import type { DesignerAction } from '../../types/designer'
import type { FormFieldSchema } from '../../types/schema'
import { CollapsibleSection } from '../CollapsibleSection'
import { RulesEditor } from '../RulesEditor'
import { useDebouncedInput } from '../useDebouncedInput'
import { useFieldNameValidation } from '../useFieldNameValidation'
import { EventEditor } from './EventEditor'

// ── helpers ────────────────────────────────────────────────────────

export function hasAdvancedConfig(field: FormFieldSchema): boolean {
  return !!((typeof field.hidden === 'boolean' && field.hidden) || (typeof field.hidden === 'string' && field.hidden) || field.disabled || field.readOnly || field.requiredIfExpr || (field.rules && field.rules.length > 0))
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
  allFields: FormFieldSchema[]
}

export function DefaultPropertyContent({ field, w, dispatch, isForm, isContainer, ComponentPropsRender, customConfig, allFields }: DefaultContentProps) {
  const { token } = useStyle()
  const hasAdvanced = hasAdvancedConfig(field)
  const { nameDirty, setNameDirty, nameError, existingNames } = useFieldNameValidation(allFields, field.id, field.name)

  // ===== 防抖输入 =====

  const [labelValue, handleLabelChange] = useDebouncedInput<string | number>(field.label || '', (v) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { label: String(v) || undefined } }))

  const [defaultValueValue, handleDefaultValueChange] = useDebouncedInput<string | number>(field.defaultValue != null ? String(field.defaultValue) : '', (v) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { defaultValue: v || undefined } }))

  const [hiddenValue, handleHiddenChange] = useDebouncedInput<string | number>(typeof field.hidden === 'string' ? field.hidden : '', (v) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { hidden: (v as string) || undefined } }))

  const [colSpanValue, handleColSpanChange] = useDebouncedInput<number>(field.colSpan || 24, (v) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { colSpan: Number(v) } }))

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
      <FieldItem label="字段名">
        <div style={{ display: 'flex', flexDirection: 'column', gap: token('spacingXs'), flex: 1 }}>
          <w.Input value={nameValue} onChange={handleNameChange} />
          {nameError && <span style={{ fontSize: token('fontSizeXs'), color: 'var(--fe-error)' }}>{nameError}</span>}
        </div>
      </FieldItem>
      <FieldItem label="标签">
        <w.Input value={labelValue} onChange={handleLabelChange} placeholder="字段标签" />
      </FieldItem>
      {isForm && (
        <FieldItem label="默认值">
          <w.Input value={defaultValueValue} onChange={handleDefaultValueChange} />
        </FieldItem>
      )}

      {isContainer && <div style={{ fontSize: token('fontSizeSm'), color: 'var(--fe-text-muted)', padding: `${token('spacingXs')} 0`, marginBottom: token('spacingSm') }}>容器组件支持拖入子组件</div>}

      {(ComponentPropsRender || customConfig?.propertyConfig?.length) && <div style={{ borderTop: '1px solid var(--fe-border-light)', paddingTop: token('spacingSm'), marginTop: token('spacingSm') }}>{ComponentPropsRender ? <ComponentPropsRender widgets={w} values={localComponentProps} onChange={handleComponentPropsChange} /> : customConfig?.propertyConfig ? <CustomPropsRender configs={customConfig.propertyConfig} widgets={w} values={localComponentProps} onChange={handleComponentPropsChange} /> : null}</div>}

      <CollapsibleSection title="高级属性" defaultCollapsed={true} forceExpand={hasAdvanced}>
        {isForm && (
          <>
            <FieldItem label="列宽">
              <w.NumberInput value={colSpanValue} onChange={handleColSpanChange} min={1} max={24} />
            </FieldItem>
            <RulesEditor field={field} widgets={w} dispatch={dispatch} />
            <FieldItem label="禁用">
              <w.Switch checked={!!field.disabled} onChange={(v: boolean) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { disabled: v } })} />
            </FieldItem>
            <FieldItem label="只读">
              <w.Switch checked={!!field.readOnly} onChange={(v: boolean) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { readOnly: v } })} />
            </FieldItem>
          </>
        )}

        <FieldItem label="是否隐藏">
          <w.ExpressionInput value={hiddenValue as string | undefined} onChange={handleHiddenChange} placeholder="如：form.type !== 'admin'" style={{ fontSize: token('widgetInputFontSizeXs') } as React.CSSProperties} />
        </FieldItem>
      </CollapsibleSection>

      <EventEditor field={field} w={w} dispatch={dispatch} />
    </>
  )
}