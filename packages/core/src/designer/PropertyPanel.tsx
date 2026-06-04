import React, { useCallback, useState } from 'react'
import { PropsRenderMap } from '../propRenders'
import { customComponentRegistry } from '../registry/customComponentRegistry'
import { useStyle } from '../styles'
import type { DesignerWidgets } from '../types/adapter'
import { getComponentCategory } from '../types/component-category'
import type { DesignerAction, PropertyPanelTab } from '../types/designer'
import type { FormConfig, FormFieldSchema } from '../types/schema'
import { resolvePanelWidth } from '../utils'
import { defaultDesignerWidgets } from '../widgets'
import { FormConfigPanel } from './FormConfigPanel'
import { DefaultPropertyContent } from './PropertyPanel/DefaultPropertyContent'
import { PropertyPanelTabs } from './PropertyPanel/PropertyPanelTabs'

/**
 * 属性面板最小宽度（防呆）：再小 FieldItem / 控件就显示不全
 */
const MIN_PROPERTIES_WIDTH = 240
const PROPERTIES_DEFAULT_TAB_KEY = '__default-props__'

interface PropertyPanelProps {
  field: FormFieldSchema | null
  formConfig: FormConfig
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
  return { ...defaultDesignerWidgets, ...designerWidgets } as DesignerWidgets
}

function PropertyPanelInner({ field, w, token, activeTab, dispatch, propertyPanelTabs, allFields }: { field: FormFieldSchema; w: DesignerWidgets; token: ReturnType<typeof useStyle>['token']; activeTab: string; dispatch: React.Dispatch<DesignerAction>; propertyPanelTabs?: PropertyPanelTab[]; allFields: FormFieldSchema[] }) {
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
        fieldId: field.id,
        patch: { componentProps: { ...field.componentProps, [key]: value } },
      })
    },
    [dispatch, field.id, field.componentProps],
  )

  const onUpdate = useCallback(
    (patch: Partial<FormFieldSchema>) => {
      dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch })
    },
    [dispatch, field.id],
  )

  return (
    <>
      {activeTab === PROPERTIES_DEFAULT_TAB_KEY ? (
        <>
          <h4 style={{ margin: `0 0 ${token('spacingMd')} 0`, fontSize: token('fontSizeMd'), fontWeight: 500 }}>
            {category === 'form' ? '表单组件' : category === 'display' ? '展示组件' : category === 'container' ? '容器组件' : '按钮组件'}
            <span style={{ marginLeft: token('spacingXs'), color: 'var(--fe-text-muted)', fontWeight: 400 }}>({field.type})</span>
          </h4>
          <DefaultPropertyContent field={field} w={w} dispatch={dispatch} isForm={isForm} isContainer={isContainer} isButton={isButton} ComponentPropsRender={ComponentPropsRender} customConfig={customConfig ?? null} allFields={allFields} />
        </>
      ) : (
        (() => {
          const tab = propertyPanelTabs?.find((t) => t.key === activeTab)
          if (!tab) return null
          const TabContent = tab.content
          return <TabContent field={field} onUpdate={onUpdate} onUpdateProp={onUpdateProp} widgets={w} dispatch={dispatch} />
        })()
      )}
    </>
  )
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ field, formConfig, dispatch, designerWidgets, width, propertyPanelTabs, allFields }) => {
  const w = useWidgets(designerWidgets)
  const { token } = useStyle()
  const resolvedWidth = resolvePanelWidth(width, token('panelConfigWidth') as string, MIN_PROPERTIES_WIDTH)
  const hasTabs = propertyPanelTabs && propertyPanelTabs.length > 0
  const [activeTab, setActiveTab] = useState(PROPERTIES_DEFAULT_TAB_KEY)
  const allTabs = hasTabs ? [{ key: PROPERTIES_DEFAULT_TAB_KEY, title: '属性' }, ...(propertyPanelTabs || [])] : []

  /**
   * 无字段时扩展 Tab 的 onUpdate / onUpdateProp 退化为 no-op
   * （PropertyPanelTabContentProps.field 允许为 null，扩展 Tab 应自行处理"未选中"提示）
   */
  const noopUpdate = useCallback((_patch: Partial<FormFieldSchema>) => {}, [])
  const noopUpdateProp = useCallback((_key: string, _value: unknown) => {}, [])

  /**
   * 无字段时"属性" Tab 的内容
   */
  const renderNoFieldContent = () => {
    if (activeTab === PROPERTIES_DEFAULT_TAB_KEY) {
      return <FormConfigPanel formConfig={formConfig} dispatch={dispatch} widgets={w} />
    }
    const tab = propertyPanelTabs?.find((t) => t.key === activeTab)
    if (!tab) return null
    const TabContent = tab.content
    return <TabContent field={null} onUpdate={noopUpdate} onUpdateProp={noopUpdateProp} widgets={w} dispatch={dispatch} />
  }

  return (
    <div style={{ width: resolvedWidth, borderLeft: '1px solid var(--fe-border-light)', overflow: 'auto', height: '100%' }}>
      {hasTabs && <PropertyPanelTabs allTabs={allTabs} activeTab={activeTab} setActiveTab={setActiveTab} />}

      <div style={{ padding: token('spacingMd') }}>{field ? <PropertyPanelInner field={field} w={w} token={token} activeTab={activeTab} dispatch={dispatch} propertyPanelTabs={propertyPanelTabs} allFields={allFields || []} /> : renderNoFieldContent()}</div>
    </div>
  )
}
