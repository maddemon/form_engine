import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getEventDeclarations } from '../components'
import { FieldItem, PropsRenderMap } from '../propRenders'
import CustomPropsRender from '../propRenders/CustomPropsRender'
import { customComponentRegistry } from '../registry/customComponentRegistry'
import { useStyle } from '../styles'
import type { DesignerWidgets } from '../types/adapter'
import { getComponentCategory } from '../types/component-category'
import type { DesignerAction, PropertyPanelTab } from '../types/designer'
import type { EventDeclaration, FormFieldEvents } from '../types/events'
import type { FormFieldSchema } from '../types/schema'
import { resolvePanelWidth } from '../utils'
import { CollapsibleSection } from './CollapsibleSection'
import { EventHandlerEditor } from './EventHandlerEditor'
import { FormConfigPanel } from './FormConfigPanel'
import { RulesEditor } from './RulesEditor'
import { useDebouncedInput } from './useDebouncedInput'
import { defaultDesignerWidgets } from './widgets'

/**
 * 属性面板最小宽度（防呆）：再小 FieldItem / 控件就显示不全
 */
const MIN_PROPERTIES_WIDTH = 240
const PROPERTIES_DEFAULT_TAB_KEY = '__default-props__'

interface PropertyPanelProps {
  field: FormFieldSchema | null
  formConfig: any
  dispatch: React.Dispatch<DesignerAction>
  designerWidgets?: DesignerWidgets
  /**
   * 可选：面板宽度
   *  - `number`：px（小于 240 自动降级到 240）
   *  - `string`：透传 CSS 宽度（如 '24%'、'min(280px, 22vw)'）
   *  - 缺省：token 默认（`--fe-panel-config-width`）
   */
  width?: number | string
  /** 右侧属性面板扩展 Tab（有值时自动切换为 Segment Tab 布局） */
  propertyPanelTabs?: PropertyPanelTab[]
  /** 所有表单项（用于校验字段名唯一性） */
  allFields?: FormFieldSchema[]
}

function useWidgets(designerWidgets?: DesignerWidgets) {
  const merged = { ...defaultDesignerWidgets, ...designerWidgets }
  return merged as Required<Pick<DesignerWidgets, 'ButtonGroup' | 'TextArea'>> & Omit<DesignerWidgets, 'ButtonGroup' | 'TextArea'>
}

function hasAdvancedConfig(field: FormFieldSchema): boolean {
  return !!((typeof field.hidden === 'boolean' && field.hidden) || (typeof field.hidden === 'string' && field.hidden) || field.disabled || field.readOnly || field.requiredIfExpr || (field.rules && field.rules.length > 0))
}

/**
 * 获取字段的事件声明列表
 * 优先级：customComponentRegistry（自定义组件） > getEventDeclarations（内置组件）
 */
function getFieldEventDeclarations(field: FormFieldSchema): EventDeclaration[] {
  const customConfig = customComponentRegistry.get(field.type)
  if (customConfig?.events?.length) {
    return customConfig.events
  }
  return getEventDeclarations(field.type)
}

interface DefaultContentProps {
  field: FormFieldSchema
  w: any
  dispatch: React.Dispatch<DesignerAction>
  isForm: boolean
  isContainer: boolean
  isButton: boolean
  ComponentPropsRender: React.ComponentType<any> | undefined
  customConfig: any
  allFields: FormFieldSchema[]
}

function collectFieldNamesExcluding(fields: FormFieldSchema[], excludeId: string): Set<string> {
  const names = new Set<string>()
  const walk = (list: FormFieldSchema[]) => {
    for (const f of list) {
      if (f.id !== excludeId) names.add(f.name)
      if (f.children) walk(f.children)
    }
  }
  walk(fields)
  return names
}

function DefaultPropertyContent({ field, w, dispatch, isForm, isContainer, isButton, ComponentPropsRender, customConfig, allFields }: DefaultContentProps) {
  const { token } = useStyle()
  const hasAdvanced = hasAdvancedConfig(field)
  const [nameDirty, setNameDirty] = useState(false)
  const existingNames = useMemo(() => collectFieldNamesExcluding(allFields, field.id!), [allFields, field.id])
  const nameError = nameDirty && field.name && existingNames.has(field.name) ? '该字段名已存在' : null

  // ===== 防抖输入 =====

  const [labelValue, handleLabelChange] = useDebouncedInput<string | number>(
    field.label || '',
    (v) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { label: String(v) || undefined } }),
  )

  const [defaultValueValue, handleDefaultValueChange] = useDebouncedInput<string | number>(
    field.defaultValue != null ? String(field.defaultValue) : '',
    (v) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { defaultValue: v || undefined } }),
  )

  const [hiddenValue, handleHiddenChange] = useDebouncedInput<string | number>(
    typeof field.hidden === 'string' ? field.hidden : '',
    (v) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { hidden: (v as string) || undefined } }),
  )

  const [colSpanValue, handleColSpanChange] = useDebouncedInput<number>(
    field.colSpan || 24,
    (v) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { colSpan: Number(v) } }),
  )

  // 字段名防抖（含重复校验，setNameDirty 立即执行）
  const [nameValue, handleNameChangeRaw] = useDebouncedInput<string | number>(
    field.name,
    (v) => {
      const newName = String(v)
      if (newName && !existingNames.has(newName)) {
        dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { name: newName } })
      }
    },
  )
  const handleNameChange = useCallback((v: string | number) => {
    setNameDirty(true)
    handleNameChangeRaw(v)
  }, [setNameDirty, handleNameChangeRaw])

  // componentProps 防抖：维护本地状态实现即时视觉反馈
  const [localComponentProps, setLocalComponentProps] = useState<Record<string, unknown>>(field.componentProps || {})
  const componentPropsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isEditingComponentPropsRef = useRef(false)

  useEffect(() => {
    if (!isEditingComponentPropsRef.current) {
      setLocalComponentProps(field.componentProps || {})
    }
  }, [field.componentProps])

  const handleComponentPropsChange = useCallback((key: string, value: unknown) => {
    isEditingComponentPropsRef.current = true
    setLocalComponentProps(prev => {
      const next = { ...prev, [key]: value }
      if (componentPropsTimerRef.current) clearTimeout(componentPropsTimerRef.current)
      componentPropsTimerRef.current = setTimeout(() => {
        isEditingComponentPropsRef.current = false
        dispatch({
          type: 'UPDATE_FIELD',
          fieldId: field.id!,
          patch: { componentProps: next },
        })
      }, 300)
      return next
    })
  }, [dispatch, field.id])

  useEffect(() => {
    return () => {
      if (componentPropsTimerRef.current) clearTimeout(componentPropsTimerRef.current)
    }
  }, [])

  return (
    <>
      <FieldItem label="字段名">
        <div style={{ display: 'flex', flexDirection: 'column', gap: token('spacingXs'), flex: 1 }}>
          <w.Input
            value={nameValue}
            onChange={handleNameChange}
          />
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

      {(ComponentPropsRender || customConfig?.propertyConfig?.length) && (
        <div style={{ borderTop: '1px solid var(--fe-border-light)', paddingTop: token('spacingSm'), marginTop: token('spacingSm') }}>
          {ComponentPropsRender ? (
            <ComponentPropsRender
              widgets={w}
              values={localComponentProps}
              onChange={handleComponentPropsChange}
            />
          ) : customConfig?.propertyConfig ? (
            <CustomPropsRender
              configs={customConfig.propertyConfig}
              widgets={w}
              values={localComponentProps}
              onChange={handleComponentPropsChange}
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
            <RulesEditor field={field} widgets={w} dispatch={dispatch} />
            <FieldItem label="禁用">
              <w.Switch checked={!!field.disabled} onChange={(v: boolean) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { disabled: v } })} />
            </FieldItem>
            <FieldItem label="只读">
              <w.Switch checked={!!field.readOnly} onChange={(v: boolean) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { readOnly: v } })} />
            </FieldItem>
          </>
        )}

        <FieldItem label="是否隐藏">
          <w.Input value={hiddenValue} onChange={handleHiddenChange} placeholder="如：form.type !== 'admin'" style={{ fontSize: token('widgetInputFontSizeXs') } as React.CSSProperties} />
        </FieldItem>
      </CollapsibleSection>

      {(() => {
        const eventDeclarations = getFieldEventDeclarations(field)
        if (eventDeclarations.length === 0) return null
        return (
          <CollapsibleSection title={`事件（${eventDeclarations.length}）`} defaultCollapsed={!field.events || Object.keys(field.events).length === 0} forceExpand={!!field.events && Object.keys(field.events).length > 0}>
            {eventDeclarations.map((decl) => (
              <EventHandlerEditor
                key={decl.name}
                eventName={decl.name}
                value={field.events?.[decl.name]}
                widgets={w}
                onChange={(handler) => {
                  const next: FormFieldEvents = { ...(field.events || {}) }
                  if (handler) {
                    next[decl.name] = handler
                  } else {
                    delete next[decl.name]
                  }
                  const cleaned = Object.keys(next).length > 0 ? next : undefined
                  dispatch({
                    type: 'UPDATE_FIELD',
                    fieldId: field.id!,
                    patch: { events: cleaned },
                  })
                }}
              />
            ))}
          </CollapsibleSection>
        )
      })()}
    </>
  )
}

function PropertyPanelInner({ field, w, token, resolvedWidth, hasTabs, activeTab, setActiveTab, dispatch, propertyPanelTabs, allFields }: { field: FormFieldSchema; w: any; token: ReturnType<typeof useStyle>['token']; resolvedWidth: string | number; hasTabs: boolean; activeTab: string; setActiveTab: (v: string) => void; dispatch: React.Dispatch<DesignerAction>; propertyPanelTabs?: PropertyPanelTab[]; allFields: FormFieldSchema[] }) {
  const ComponentPropsRender = PropsRenderMap[field.type]
  const customConfig = !ComponentPropsRender ? customComponentRegistry.get(field.type) : null
  const category = getComponentCategory(field.type)
  const isForm = category === 'form'
  const isContainer = category === 'container'
  const isButton = category === 'button'

  const onUpdateProp = useCallback(
    (key: string, value: unknown) => {
      dispatch({
        type: 'UPDATE_FIELD',
        fieldId: field.id!,
        patch: { componentProps: { ...field.componentProps, [key]: value } },
      })
    },
    [dispatch, field.id, field.componentProps],
  )

  const onUpdate = useCallback(
    (patch: Partial<FormFieldSchema>) => {
      dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch })
    },
    [dispatch, field.id],
  )

  const allTabs = hasTabs ? [{ key: PROPERTIES_DEFAULT_TAB_KEY, title: '属性' }, ...(propertyPanelTabs || [])] : []

  return (
    <div style={{ width: resolvedWidth, borderLeft: '1px solid var(--fe-border-light)', overflow: 'auto', height: '100%' }}>
      {hasTabs && (
        <div style={{ display: 'flex', padding: token('spacingSm'), borderBottom: '1px solid var(--fe-border-light)', background: 'var(--fe-bg-tertiary)', position: 'sticky', top: 0, zIndex: 1 }}>
          {allTabs.map((tab, idx) => {
            const isFirst = idx === 0
            const isLast = idx === allTabs.length - 1
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flex: 1,
                  border: '1px solid var(--fe-border-primary)',
                  borderRight: isLast ? '1px solid var(--fe-border-primary)' : 'none',
                  background: activeTab === tab.key ? 'var(--fe-bg-primary)' : 'var(--fe-bg-tertiary)',
                  color: activeTab === tab.key ? 'var(--fe-primary)' : 'var(--fe-text-secondary)',
                  cursor: 'pointer',
                  padding: `${token('spacingXs')} ${token('spacingSm')}`,
                  fontSize: token('fontSizeXs'),
                  fontWeight: activeTab === tab.key ? 500 : 400,
                  transition: 'all 0.2s',
                  outline: 'none',
                  borderTopLeftRadius: isFirst ? token('borderRadiusSm') : 0,
                  borderBottomLeftRadius: isFirst ? token('borderRadiusSm') : 0,
                  borderTopRightRadius: isLast ? token('borderRadiusSm') : 0,
                  borderBottomRightRadius: isLast ? token('borderRadiusSm') : 0,
                }}
              >
                {tab.title}
              </button>
            )
          })}
        </div>
      )}

      <div style={{ padding: token('spacingMd') }}>
        <h4 style={{ margin: `0 0 ${token('spacingMd')} 0`, fontSize: token('fontSizeMd'), fontWeight: 500 }}>
          {category === 'form' ? '表单组件' : category === 'display' ? '展示组件' : category === 'container' ? '容器组件' : '按钮组件'}
          <span style={{ marginLeft: token('spacingXs'), color: 'var(--fe-text-muted)', fontWeight: 400 }}>({field.type})</span>
        </h4>

        {activeTab === PROPERTIES_DEFAULT_TAB_KEY ? (
          <DefaultPropertyContent field={field} w={w} dispatch={dispatch} isForm={isForm} isContainer={isContainer} isButton={isButton} ComponentPropsRender={ComponentPropsRender} customConfig={customConfig} allFields={allFields} />
        ) : (
          (() => {
            const tab = propertyPanelTabs?.find((t) => t.key === activeTab)
            if (!tab) return null
            const TabContent = tab.content
            return <TabContent field={field} onUpdate={onUpdate} onUpdateProp={onUpdateProp} widgets={w} dispatch={dispatch} />
          })()
        )}
      </div>
    </div>
  )
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ field, formConfig, dispatch, designerWidgets, width, propertyPanelTabs, allFields }) => {
  const w = useWidgets(designerWidgets)
  const { token } = useStyle()
  const resolvedWidth = resolvePanelWidth(width, token('panelConfigWidth') as string, MIN_PROPERTIES_WIDTH)
  const hasTabs = propertyPanelTabs && propertyPanelTabs.length > 0
  const [activeTab, setActiveTab] = useState(PROPERTIES_DEFAULT_TAB_KEY)

  if (!field) {
    return <FormConfigPanel formConfig={formConfig} dispatch={dispatch} widgets={w} width={width} />
  }

  return <PropertyPanelInner field={field} w={w} token={token} resolvedWidth={resolvedWidth} hasTabs={!!hasTabs} activeTab={activeTab} setActiveTab={setActiveTab} dispatch={dispatch} propertyPanelTabs={propertyPanelTabs} allFields={allFields || []} />
}
