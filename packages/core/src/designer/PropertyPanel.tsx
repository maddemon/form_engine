import React from 'react'
import { FieldGroup, InlineField, PropsRenderMap } from '../propRenders'
import CustomPropsRender from '../propRenders/CustomPropsRender'
import type { DeviceScene } from '../registry/componentRegistry'
import { customComponentRegistry } from '../registry/customComponentRegistry'
import type { DesignerWidgets, FormEngineAdapter } from '../types/adapter'
import type { DesignerAction } from '../types/designer'
import type { FormFieldSchema } from '../types/schema'
import { getComponentCategory } from '../types/component-category'
import { CollapsibleSection } from './CollapsibleSection'
import { FormConfigPanel } from './FormConfigPanel'
import { defaultDesignerWidgets } from './widgets'

interface PropertyPanelProps {
  field: FormFieldSchema | null
  formConfig: any
  submitConfig: any
  dispatch: React.Dispatch<DesignerAction>
  adapter?: FormEngineAdapter
  designerWidgets?: DesignerWidgets
  scene?: DeviceScene
  onSceneChange?: (scene: DeviceScene) => void
}

function useWidgets(designerWidgets?: DesignerWidgets): DesignerWidgets {
  if (designerWidgets) return designerWidgets
  return defaultDesignerWidgets
}

function hasAdvancedConfig(field: FormFieldSchema): boolean {
  return !!((typeof field.hidden === 'boolean' && field.hidden) || (typeof field.hidden === 'string' && field.hidden) || field.disabled || field.readOnly || field.requiredIfExpr)
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ field, formConfig, submitConfig, dispatch, designerWidgets, scene = 'desktop', onSceneChange }) => {
  const w = useWidgets(designerWidgets)

  if (!field) {
    return <FormConfigPanel formConfig={formConfig} submitConfig={submitConfig} dispatch={dispatch} scene={scene} onSceneChange={onSceneChange} widgets={w} />
  }

  const hasAdvanced = hasAdvancedConfig(field)

  const ComponentPropsRender = PropsRenderMap[field.type]
  const customConfig = !ComponentPropsRender ? customComponentRegistry.get(field.type) : null
  const category = getComponentCategory(field.type)
  const isForm = category === 'form'
  const isContainer = category === 'container'

  return (
    <div style={{ width: 280, borderLeft: '1px solid #eee', padding: 12, overflow: 'auto', height: '100%' }}>
      <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>字段属性</h4>

      <CollapsibleSection title="基本属性" defaultCollapsed={false}>
        <FieldGroup label="字段类型">
          <div style={{ padding: '4px 8px', marginTop: 2, background: '#f5f5f5', borderRadius: 4, fontSize: 12, color: '#666', border: '1px solid #d9d9d9' }}>
            {field.type}
            <span style={{ marginLeft: 6, fontSize: 11, color: '#aaa' }}>
              ({category === 'form' ? '表单' : category === 'display' ? '展示' : category === 'container' ? '容器' : '按钮'})
            </span>
          </div>
        </FieldGroup>

        {isForm ? (
          <>
            <FieldGroup label="字段名（name）">
              <w.Input value={field.name} onChange={(v: string | number) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { name: String(v) } })} />
            </FieldGroup>
            <FieldGroup label="标签（label）">
              <w.Input value={field.label || ''} onChange={(v: string | number) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { label: String(v) || undefined } })} placeholder="字段标签" />
            </FieldGroup>
            <FieldGroup label="placeholder">
              <w.Input value={field.placeholder || ''} onChange={(v: string | number) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { placeholder: String(v) || undefined } })} />
            </FieldGroup>
          </>
        ) : (
          <FieldGroup label="字段名（name）">
            <w.Input value={field.name} onChange={(v: string | number) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { name: String(v) } })} />
          </FieldGroup>
        )}

        <FieldGroup label="列宽（colSpan，24=满宽）">
          <w.NumberInput value={field.colSpan || 24} onChange={(v: number) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { colSpan: Number(v) } })} min={1} max={24} />
        </FieldGroup>

        {isContainer && (
          <div style={{ fontSize: 12, color: '#999', padding: '4px 0' }}>
            容器组件支持拖入子组件
          </div>
        )}
      </CollapsibleSection>

      {(ComponentPropsRender || customConfig?.propertyConfig?.length) && (
        <CollapsibleSection title="组件属性" defaultCollapsed={false}>
          {ComponentPropsRender ? (
            <ComponentPropsRender
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
        </CollapsibleSection>
      )}

      <CollapsibleSection title="高级属性" defaultCollapsed={true} forceExpand={hasAdvanced}>
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
          <w.Input value={typeof field.hidden === 'string' ? field.hidden : ''} onChange={(v: string | number) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { hidden: (v as string) || undefined } })} placeholder="如：form.type !== 'admin'" style={{ fontSize: 11 } as React.CSSProperties} />
        </FieldGroup>
        <FieldGroup label="必填表达式（requiredIfExpr）">
          <w.Input value={field.requiredIfExpr || ''} onChange={(v: string | number) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { requiredIfExpr: (v as string) || undefined } })} placeholder="如：form.type === 'admin'" style={{ fontSize: 11 } as React.CSSProperties} />
        </FieldGroup>
      </CollapsibleSection>
    </div>
  )
}
