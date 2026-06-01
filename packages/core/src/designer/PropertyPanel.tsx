import React from 'react'
import type { DeviceScene } from '../registry/componentRegistry'
import type { DesignerAction } from '../types/designer'
import type { FormFieldSchema } from '../types/schema'
import type { FormEngineAdapter, DesignerWidgets } from '../types/adapter'
import { defaultDesignerWidgets } from './widgets'
import { customComponentRegistry } from '../registry/customComponentRegistry'
import { PropertyEditor } from './PropertyEditor'
import { getComponentPropertyConfig } from './componentPropertyConfigs'
import { CollapsibleSection } from './CollapsibleSection'
import { FormConfigPanel } from './FormConfigPanel'

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

const FieldGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
    {label}
    <div style={{ marginTop: 2 }}>{children}</div>
  </label>
)

const InlineField: React.FC<{ label: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ label, children, style }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4, fontSize: 12, ...style }}>
    {children}
    {label}
  </label>
)

function hasAdvancedConfig(field: FormFieldSchema): boolean {
  return !!(
    (typeof field.hidden === 'boolean' && field.hidden) ||
    (typeof field.hidden === 'string' && field.hidden) ||
    field.disabled ||
    field.readOnly ||
    field.requiredIfExpr
  )
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  field,
  formConfig,
  submitConfig,
  dispatch,
  designerWidgets,
  scene = 'desktop',
  onSceneChange,
}) => {
  const w = useWidgets(designerWidgets)

  if (!field) {
    return (
      <FormConfigPanel
        formConfig={formConfig}
        submitConfig={submitConfig}
        dispatch={dispatch}
        scene={scene}
        onSceneChange={onSceneChange}
        widgets={w}
      />
    )
  }

  const hasAdvanced = hasAdvancedConfig(field)

  const builtInConfig = getComponentPropertyConfig(field.type)
  const customConfig = customComponentRegistry.get(field.type)
  const customPropertyConfig = customConfig?.propertyConfig || []

  const componentPropertyConfig = builtInConfig || (customPropertyConfig.length > 0 ? customPropertyConfig : null)

  return (
    <div style={{ width: 280, borderLeft: '1px solid #eee', padding: 12, overflow: 'auto', height: '100%' }}>
      <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>字段属性</h4>

      <CollapsibleSection title="基本属性" defaultCollapsed={false}>
        <FieldGroup label="字段类型">
          <div style={{ padding: '4px 8px', marginTop: 2, background: '#f5f5f5', borderRadius: 4, fontSize: 12, color: '#666', border: '1px solid #d9d9d9' }}>
            {field.type}
          </div>
        </FieldGroup>

        <FieldGroup label="字段名（name）">
          <w.Input
            value={field.name}
            onChange={(v: string | number) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { name: String(v) } })}
          />
        </FieldGroup>

        <FieldGroup label="标签（label）">
          <w.Input
            value={field.label || ''}
            onChange={(v: string | number) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { label: String(v) || undefined } })}
            placeholder="字段标签"
          />
        </FieldGroup>

        <FieldGroup label="placeholder">
          <w.Input
            value={field.placeholder || ''}
            onChange={(v: string | number) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { placeholder: String(v) || undefined } })}
          />
        </FieldGroup>

        <FieldGroup label="列宽（colSpan，24=满宽）">
          <w.NumberInput
            value={field.colSpan || 24}
            onChange={(v: number) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { colSpan: Number(v) } })}
            min={1}
            max={24}
          />
        </FieldGroup>
      </CollapsibleSection>

      {componentPropertyConfig && componentPropertyConfig.length > 0 && (
        <CollapsibleSection title="组件属性" defaultCollapsed={false}>
          <PropertyEditor
            configs={componentPropertyConfig}
            fieldProps={field as unknown as Record<string, unknown>}
            fieldSchema={field as unknown as Record<string, unknown>}
            onChange={(key, value) => {
              dispatch({
                type: 'UPDATE_FIELD',
                fieldId: field.id!,
                patch: { [key]: value }
              })
            }}
            widgets={w}
          />
        </CollapsibleSection>
      )}

      <CollapsibleSection
        title="高级属性"
        defaultCollapsed={true}
        forceExpand={hasAdvanced}
      >
        <InlineField label="隐藏">
          <w.Checkbox
            checked={!!field.hidden && typeof field.hidden === 'boolean'}
            onChange={(v: boolean) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { hidden: v } })}
          />
        </InlineField>
        <InlineField label="禁用">
          <w.Checkbox
            checked={!!field.disabled}
            onChange={(v: boolean) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { disabled: v } })}
          />
        </InlineField>
        <InlineField label="只读">
          <w.Checkbox
            checked={!!field.readOnly}
            onChange={(v: boolean) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { readOnly: v } })}
          />
        </InlineField>

        <FieldGroup label="隐藏表达式（hidden expr）">
          <w.Input
            value={typeof field.hidden === 'string' ? field.hidden : ''}
            onChange={(v: string | number) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { hidden: (v as string) || undefined } })}
            placeholder="如：form.type !== 'admin'"
            style={{ fontSize: 11 } as React.CSSProperties}
          />
        </FieldGroup>
        <FieldGroup label="必填表达式（requiredIfExpr）">
          <w.Input
            value={field.requiredIfExpr || ''}
            onChange={(v: string | number) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { requiredIfExpr: (v as string) || undefined } })}
            placeholder="如：form.type === 'admin'"
            style={{ fontSize: 11 } as React.CSSProperties}
          />
        </FieldGroup>
      </CollapsibleSection>
    </div>
  )
}
