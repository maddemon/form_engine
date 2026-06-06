import { useCallback, useEffect, useRef, useState } from 'react'
import { EyeIcon, EyeOffIcon } from '../../components/icons'
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
import { CollapsibleSection } from '../CollapsibleSection'
import { RulesEditor } from '../RulesEditor'
import { useDebouncedInput } from '../useDebouncedInput'
import { useFieldNameValidation } from '../useFieldNameValidation'
import { EventEditor } from './EventEditor'

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
  const hasAdvanced = hasAdvancedConfig(field)
  const { nameDirty, setNameDirty, nameError, existingNames } = useFieldNameValidation(allFields, field.id, field.name)

  // ===== Slot 解析 =====
  const ExpressionEditorSlot = resolveSlot('expressionEditor', slots, w)

  // ===== 防抖输入 =====

  const [labelValue, handleLabelChange] = useDebouncedInput<string | number>(field.label || '', (v) =>
    dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { label: String(v) || undefined } }),
  )

  const [defaultValueValue, handleDefaultValueChange] = useDebouncedInput<string | number>(
    field.defaultValue != null ? String(field.defaultValue) : '',
    (v) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { defaultValue: v || undefined } }),
  )

  const [hiddenValue, handleHiddenChange] = useDebouncedInput<string | number>(
    typeof field.hidden === 'string' ? field.hidden : '',
    (v) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { hidden: (v as string) || undefined } }),
  )

  const [colSpanValue, handleColSpanChange] = useDebouncedInput<number>(field.colSpan || 24, (v) =>
    dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { colSpan: Number(v) } }),
  )

  // ===== disabled/readOnly 模式切换 =====
  // Schema 支持 boolean | string，boolean 时用 Switch，string（表达式）时用 expressionEditor slot
  const [disabledMode, setDisabledMode] = useState<'static' | 'expression'>(
    typeof field.disabled === 'string' ? 'expression' : 'static',
  )
  const [readOnlyMode, setReadOnlyMode] = useState<'static' | 'expression'>(
    typeof field.readOnly === 'string' ? 'expression' : 'static',
  )

  // 同步外部状态变更（如 undo/redo）
  useEffect(() => {
    setDisabledMode(typeof field.disabled === 'string' ? 'expression' : 'static')
  }, [field.disabled])
  useEffect(() => {
    setReadOnlyMode(typeof field.readOnly === 'string' ? 'expression' : 'static')
  }, [field.readOnly])

  const [disabledExprValue, handleDisabledExprChange] = useDebouncedInput<string | number>(
    typeof field.disabled === 'string' ? field.disabled : '',
    (v) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { disabled: (v as string) || false } }),
  )

  const [readOnlyExprValue, handleReadOnlyExprChange] = useDebouncedInput<string | number>(
    typeof field.readOnly === 'string' ? field.readOnly : '',
    (v) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { readOnly: (v as string) || false } }),
  )

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
        <div style={{ display: 'flex', gap: token('spacingXs'), alignItems: 'center', flex: 1 }}>
          <w.Input value={labelValue} onChange={handleLabelChange} placeholder="字段标签" style={{ flex: 1 }} />
          <span
            onClick={() =>
              dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { labelHidden: !field.labelHidden } })
            }
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: field.labelHidden ? 'var(--fe-text-tertiary)' : 'var(--fe-primary)',
              flexShrink: 0,
            }}
            title={field.labelHidden ? '显示标签' : '隐藏标签'}
          >
            {field.labelHidden ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
          </span>
        </div>
      </FieldItem>
      {isForm && (
        <FieldItem label="默认值">
          <ExpressionEditorSlot
            value={defaultValueValue}
            onChange={handleDefaultValueChange}
            field={field}
            fieldNames={allFields.map((f) => f.name).filter(Boolean)}
            placeholder="静态值或动态表达式"
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
          容器组件支持拖入子组件
        </div>
      )}

      {(ComponentPropsRender || customConfig?.propertyConfig?.length) && (
        <div
          style={{
            borderTop: '1px solid var(--fe-border-light)',
            paddingTop: token('spacingSm'),
            marginTop: token('spacingSm'),
          }}
        >
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
        </div>
      )}

      <CollapsibleSection title="高级属性" defaultCollapsed={true} forceExpand={hasAdvanced}>
        {isForm && (
          <>
            <FieldItem label="列宽">
              <w.NumberInput value={colSpanValue} onChange={handleColSpanChange} min={1} max={24} />
            </FieldItem>
            <RulesEditor field={field} widgets={w} dispatch={dispatch} slots={slots} />
            <FieldItem label="禁用">
              <div style={{ display: 'flex', alignItems: 'center', gap: token('spacingXs'), flex: 1 }}>
                {disabledMode === 'static' ? (
                  <w.Switch
                    checked={!!field.disabled}
                    onChange={(v: boolean) =>
                      dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { disabled: v } })
                    }
                  />
                ) : (
                  <ExpressionEditorSlot
                    value={disabledExprValue}
                    onChange={handleDisabledExprChange}
                    field={field}
                    fieldNames={allFields.map((f) => f.name).filter(Boolean)}
                    placeholder="如：form.status === 'locked'"
                  />
                )}
                <span
                  onClick={() => {
                    if (disabledMode === 'static') {
                      setDisabledMode('expression')
                      dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { disabled: '' } })
                    } else {
                      setDisabledMode('static')
                      dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { disabled: false } })
                    }
                  }}
                  style={{
                    cursor: 'pointer',
                    fontSize: token('fontSizeXs'),
                    color: 'var(--fe-primary)',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}
                  title={disabledMode === 'static' ? '切换为表达式' : '切换为静态'}
                >
                  {disabledMode === 'static' ? 'ƒ' : '≡'}
                </span>
              </div>
            </FieldItem>
            <FieldItem label="只读">
              <div style={{ display: 'flex', alignItems: 'center', gap: token('spacingXs'), flex: 1 }}>
                {readOnlyMode === 'static' ? (
                  <w.Switch
                    checked={!!field.readOnly}
                    onChange={(v: boolean) =>
                      dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { readOnly: v } })
                    }
                  />
                ) : (
                  <ExpressionEditorSlot
                    value={readOnlyExprValue}
                    onChange={handleReadOnlyExprChange}
                    field={field}
                    fieldNames={allFields.map((f) => f.name).filter(Boolean)}
                    placeholder="如：form.status === 'locked'"
                  />
                )}
                <span
                  onClick={() => {
                    if (readOnlyMode === 'static') {
                      setReadOnlyMode('expression')
                      dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { readOnly: '' } })
                    } else {
                      setReadOnlyMode('static')
                      dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { readOnly: false } })
                    }
                  }}
                  style={{
                    cursor: 'pointer',
                    fontSize: token('fontSizeXs'),
                    color: 'var(--fe-primary)',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}
                  title={readOnlyMode === 'static' ? '切换为表达式' : '切换为静态'}
                >
                  {readOnlyMode === 'static' ? 'ƒ' : '≡'}
                </span>
              </div>
            </FieldItem>
          </>
        )}

        <FieldItem label="是否隐藏">
          <ExpressionEditorSlot
            value={hiddenValue as string | undefined}
            onChange={handleHiddenChange}
            field={field}
            fieldNames={allFields.map((f) => f.name).filter(Boolean)}
            placeholder="如：form.type !== 'admin'"
          />
        </FieldItem>
      </CollapsibleSection>

      <EventEditor field={field} w={w} dispatch={dispatch} slots={slots} />
    </>
  )
}
