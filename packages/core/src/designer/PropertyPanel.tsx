import React, { useState, useCallback } from 'react'
import { getEventDeclarations } from '../components'
import { FieldGroup, InlineField, PropsRenderMap, RowField } from '../propRenders'
import CustomPropsRender from '../propRenders/CustomPropsRender'
import type { DeviceScene } from '../registry/componentRegistry'
import { customComponentRegistry } from '../registry/customComponentRegistry'
import { useStyle } from '../styles'
import type { DesignerWidgets, FormEngineAdapter } from '../types/adapter'
import { getComponentCategory } from '../types/component-category'
import type { DesignerAction, PropertyPanelTab } from '../types/designer'
import type { EventDeclaration, FormFieldEvents } from '../types/events'
import type { FormFieldSchema } from '../types/schema'
import { CollapsibleSection } from './CollapsibleSection'
import { EventHandlerEditor } from './EventHandlerEditor'
import { FormConfigPanel } from './FormConfigPanel'
import { defaultDesignerWidgets } from './widgets'
import { resolvePanelWidth } from '../utils'

/**
 * 属性面板最小宽度（防呆）：再小 RowField / 控件就显示不全
 */
const MIN_PROPERTIES_WIDTH = 240
const PROPERTIES_DEFAULT_TAB_KEY = '__default-props__'

interface PropertyPanelProps {
  field: FormFieldSchema | null
  formConfig: any
  submitConfig: any
  dispatch: React.Dispatch<DesignerAction>
  adapter?: FormEngineAdapter
  designerWidgets?: DesignerWidgets
  scene?: DeviceScene
  onSceneChange?: (scene: DeviceScene) => void
  /**
   * 可选：面板宽度
   *  - `number`：px（小于 240 自动降级到 240）
   *  - `string`：透传 CSS 宽度（如 '24%'、'min(280px, 22vw)'）
   *  - 缺省：token 默认（`--fe-panel-config-width`）
   */
  width?: number | string
  /** 右侧属性面板扩展 Tab（有值时自动切换为 Segment Tab 布局） */
  propertyPanelTabs?: PropertyPanelTab[]
}

function useWidgets(designerWidgets?: DesignerWidgets) {
  const merged = { ...defaultDesignerWidgets, ...designerWidgets }
  return merged as Required<Pick<DesignerWidgets, 'ButtonGroup' | 'TextArea'>> & Omit<DesignerWidgets, 'ButtonGroup' | 'TextArea'>
}

function hasAdvancedConfig(field: FormFieldSchema): boolean {
  return !!((typeof field.hidden === 'boolean' && field.hidden) || (typeof field.hidden === 'string' && field.hidden) || field.disabled || field.readOnly || field.requiredIfExpr)
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
}

function DefaultPropertyContent({ field, w, dispatch, isForm, isContainer, isButton, ComponentPropsRender, customConfig }: DefaultContentProps) {
  const { token } = useStyle()
  const hasAdvanced = hasAdvancedConfig(field)

  return (
    <>
      {isForm ? (
        <>
          <RowField label="字段名">
            <w.Input value={field.name} onChange={(v: string | number) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { name: String(v) } })} />
          </RowField>
          <RowField label="标签">
            <w.Input value={field.label || ''} onChange={(v: string | number) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { label: String(v) || undefined } })} placeholder="字段标签" />
          </RowField>
          <RowField label="默认值">
            <w.Input value={field.defaultValue != null ? String(field.defaultValue) : ''} onChange={(v: string | number) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { defaultValue: v || undefined } })} />
          </RowField>
        </>
      ) : isButton ? null : (
        <RowField label="字段名">
          <w.Input value={field.name} onChange={(v: string | number) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { name: String(v) } })} />
        </RowField>
      )}

      {isContainer && <div style={{ fontSize: token('fontSizeSm'), color: 'var(--fe-text-muted)', padding: `${token('spacingXs')} 0`, marginBottom: token('spacingSm') }}>容器组件支持拖入子组件</div>}

      {(ComponentPropsRender || customConfig?.propertyConfig?.length) && (
        <div style={{ borderTop: '1px solid var(--fe-border-light)', paddingTop: token('spacingSm'), marginTop: token('spacingSm') }}>
          {ComponentPropsRender ? (
            <ComponentPropsRender
              widgets={w}
              values={field.componentProps || {}}
              onChange={(key: string, value: unknown) => {
                dispatch({
                  type: 'UPDATE_FIELD',
                  fieldId: field.id!,
                  patch: { componentProps: { ...field.componentProps, [key]: value } },
                })
              }}
            />
          ) : customConfig?.propertyConfig ? (
            <CustomPropsRender
              configs={customConfig.propertyConfig}
              widgets={w}
              values={field.componentProps || {}}
              onChange={(key, value) => {
                dispatch({
                  type: 'UPDATE_FIELD',
                  fieldId: field.id!,
                  patch: { componentProps: { ...field.componentProps, [key]: value } },
                })
              }}
            />
          ) : null}
        </div>
      )}

      <CollapsibleSection title="高级属性" defaultCollapsed={true} forceExpand={hasAdvanced}>
        {isForm && (
          <RowField label="列宽（colSpan，24=满宽）">
            <w.NumberInput value={field.colSpan || 24} onChange={(v: number) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { colSpan: Number(v) } })} min={1} max={24} />
          </RowField>
        )}
        <InlineField label="隐藏">
          <w.Checkbox checked={!!field.hidden && typeof field.hidden === 'boolean'} onChange={(v: boolean) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { hidden: v } })} />
        </InlineField>
        <InlineField label="禁用">
          <w.Checkbox checked={!!field.disabled} onChange={(v: boolean) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { disabled: v } })} />
        </InlineField>
        <InlineField label="只读">
          <w.Checkbox checked={!!field.readOnly} onChange={(v: boolean) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { readOnly: v } })} />
        </InlineField>

        <FieldGroup label="隐藏表达式（hidden expr）">
          <w.Input value={typeof field.hidden === 'string' ? field.hidden : ''} onChange={(v: string | number) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { hidden: (v as string) || undefined } })} placeholder="如：form.type !== 'admin'" style={{ fontSize: token('widgetInputFontSizeXs') } as React.CSSProperties} />
        </FieldGroup>
        <FieldGroup label="必填表达式（requiredIfExpr）">
          <w.Input value={field.requiredIfExpr || ''} onChange={(v: string | number) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { requiredIfExpr: (v as string) || undefined } })} placeholder="如：form.type === 'admin'" style={{ fontSize: token('widgetInputFontSizeXs') } as React.CSSProperties} />
        </FieldGroup>
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

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ field, formConfig, submitConfig, dispatch, designerWidgets, scene = 'desktop', onSceneChange, width, propertyPanelTabs }) => {
  const w = useWidgets(designerWidgets)
  const { token } = useStyle()
  const resolvedWidth = resolvePanelWidth(width, token('panelConfigWidth') as string, MIN_PROPERTIES_WIDTH)
  const hasTabs = propertyPanelTabs && propertyPanelTabs.length > 0
  const [activeTab, setActiveTab] = useState(PROPERTIES_DEFAULT_TAB_KEY)

  if (!field) {
    return <FormConfigPanel formConfig={formConfig} submitConfig={submitConfig} dispatch={dispatch} scene={scene} onSceneChange={onSceneChange} widgets={w} width={width} />
  }

  const ComponentPropsRender = PropsRenderMap[field.type]
  const customConfig = !ComponentPropsRender ? customComponentRegistry.get(field.type) : null
  const category = getComponentCategory(field.type)
  const isForm = category === 'form'
  const isContainer = category === 'container'
  const isButton = category === 'button'
  const isDisplay = category === 'display'

  const onUpdateProp = useCallback((key: string, value: unknown) => {
    dispatch({
      type: 'UPDATE_FIELD',
      fieldId: field.id!,
      patch: { componentProps: { ...field.componentProps, [key]: value } },
    })
  }, [dispatch, field.id, field.componentProps])

  const onUpdate = useCallback((patch: Partial<FormFieldSchema>) => {
    dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch })
  }, [dispatch, field.id])

  const allTabs = hasTabs
    ? [{ key: PROPERTIES_DEFAULT_TAB_KEY, title: '属性' }, ...propertyPanelTabs]
    : []

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
          <DefaultPropertyContent
            field={field}
            w={w}
            dispatch={dispatch}
            isForm={isForm}
            isContainer={isContainer}
            isButton={isButton}
            ComponentPropsRender={ComponentPropsRender}
            customConfig={customConfig}
          />
        ) : (
          (() => {
            const tab = propertyPanelTabs?.find(t => t.key === activeTab)
            if (!tab) return null
            const TabContent = tab.content
            return (
              <TabContent
                field={field}
                onUpdate={onUpdate}
                onUpdateProp={onUpdateProp}
                widgets={w}
                dispatch={dispatch}
              />
            )
          })()
        )}
      </div>
    </div>
  )
}
