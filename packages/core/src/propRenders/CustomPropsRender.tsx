import React from 'react'
import { customPropertyWidgetRegistry } from '../registry/customComponentRegistry'
import { useSlot } from '../designer/hooks/useSlot'
import { useStyle } from '../styles'
import type { DesignerWidgets } from '../types/adapter-designer'
import type { PropertyConfigItem } from '../types/custom-component'
import type { PropertySlotProps, PropertySlots } from '../types/property-slot'
import { BASE_STYLE } from '../widgets/shared'
import { Space } from '../widgets/Space'
import { FieldItem } from './shared'

interface CustomPropsRenderProps {
  configs: PropertyConfigItem[]
  widgets: DesignerWidgets
  values: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
  slots?: PropertySlots
}

// ── Widget 渲染器注册表 ────────────────────────────────────────────

type WidgetRenderer = (
  config: PropertyConfigItem,
  value: unknown,
  onValueChange: (value: unknown) => void,
  w: DesignerWidgets,
  expressionEditorSlot: React.ComponentType<PropertySlotProps>,
  jsonEditorSlot: React.ComponentType<PropertySlotProps>,
) => React.ReactNode

const widgetRendererRegistry: Record<string, WidgetRenderer> = {
  input: (config, value, onValueChange, w) => (
    <w.Input value={(value as string) ?? ''} onChange={(v) => onValueChange(v)} placeholder={config.widgetProps?.placeholder} />
  ),

  textarea: (config, value, onValueChange, w) =>
    w.TextArea ? (
      <w.TextArea value={(value as string) ?? ''} onChange={(v) => onValueChange(v)} placeholder={config.widgetProps?.placeholder} rows={4} />
    ) : (
      <textarea
        value={(value as string) ?? ''}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={config.widgetProps?.placeholder}
        rows={4}
        style={{ ...BASE_STYLE, resize: 'vertical', minHeight: 36 }}
      />
    ),

  number: (config, value, onValueChange, w) => (
    <w.NumberInput value={(value as number) ?? 0} onChange={(v) => onValueChange(v)} min={config.widgetProps?.min} max={config.widgetProps?.max} />
  ),

  select: (config, value, onValueChange, w) => (
    <w.Select
      value={(value as string) ?? ''}
      onChange={(v) => onValueChange(v)}
      options={(config.widgetProps?.options || []).map((opt) => ({ label: String(opt.label), value: String(opt.value) }))}
    />
  ),

  checkbox: (_config, value, onValueChange, w) => <w.Checkbox checked={!!value} onChange={(v) => onValueChange(v)} />,

  switch: (_config, value, onValueChange, w) =>
    w.Switch ? <w.Switch checked={!!value} onChange={(v) => onValueChange(v)} /> : <w.Checkbox checked={!!value} onChange={(v) => onValueChange(v)} />,

  json: (config, value, onValueChange, _w, _expressionEditorSlot, jsonEditorSlot) => {
    const JsonEditorSlot = jsonEditorSlot
    return <JsonEditorSlot value={value} onChange={onValueChange} placeholder={config.widgetProps?.placeholder} />
  },

  expression: (config, value, onValueChange, _w, expressionEditorSlot) => {
    const ExpressionEditorSlot = expressionEditorSlot
    return <ExpressionEditorSlot
      value={(value as string) ?? ''}
      onChange={(v) => onValueChange(v)}
      fieldNames={config.widgetProps?.fieldNames}
      placeholder={config.widgetProps?.placeholder}
    />
  },

  custom: (config, value, onValueChange) => {
    const customWidgetName = config.widgetProps?.customWidget
    if (!customWidgetName) return <span style={{ color: 'var(--fe-text-muted)' }}>未配置自定义 Widget</span>

    const CustomWidget = customPropertyWidgetRegistry.get(customWidgetName)
    if (!CustomWidget) return <span style={{ color: 'var(--fe-text-muted)' }}>Widget &quot;{customWidgetName}&quot; 未注册</span>

    return <CustomWidget value={value} onChange={onValueChange} widgetProps={config.widgetProps} />
  },
}

function getDefaultRenderer(w: DesignerWidgets): WidgetRenderer {
  return (_config, value, onValueChange, w) => (
    <w.Input value={(value as string) ?? ''} onChange={(v) => onValueChange(v)} />
  )
}

// ── 组件 ────────────────────────────────────────────────────────────

export default function CustomPropsRender({ configs, widgets: w, values, onChange, slots }: CustomPropsRenderProps) {
  const { token } = useStyle()

  const ExpressionEditorSlot = useSlot('expressionEditor', slots, w)
  const JsonEditorSlot = useSlot('jsonEditor', slots)

  const renderWidget = (config: PropertyConfigItem, value: unknown, onValueChange: (value: unknown) => void): React.ReactNode => {
    const renderer = widgetRendererRegistry[config.widget] ?? getDefaultRenderer(w)
    return renderer(config, value, onValueChange, w, ExpressionEditorSlot, JsonEditorSlot)
  }

  return (
    <>
      {configs.map((config) => {
        const value = values[config.key]

        const handleChange = (newValue: unknown) => {
          onChange(config.key, newValue)
        }

        const isToggle = config.widget === 'checkbox' || config.widget === 'switch'

        if (isToggle) {
          return (
            <Space key={config.key} gap="xs" style={{ marginBottom: token('spacingXs'), fontSize: token('fontSizeXs'), cursor: 'pointer' }}>
              {renderWidget(config, value, handleChange)}
              <span>{config.label}</span>
            </Space>
          )
        }

        return (
          <FieldItem key={config.key} label={config.label}>
            {renderWidget(config, value, handleChange)}
          </FieldItem>
        )
      })}
    </>
  )
}