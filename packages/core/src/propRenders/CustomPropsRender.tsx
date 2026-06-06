import React from 'react'
import { customPropertyWidgetRegistry } from '../registry/customComponentRegistry'
import { resolveSlot } from '../registry/propertySlotRegistry'
import { useStyle } from '../styles'
import type { DesignerWidgets } from '../types/adapter'
import type { PropertyConfigItem } from '../types/custom-component'
import type { PropertySlots } from '../types/property-slot'
import { BASE_STYLE } from '../widgets/shared'
import { FieldItem } from './shared'

interface CustomPropsRenderProps {
  configs: PropertyConfigItem[]
  widgets: DesignerWidgets
  values: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
  slots?: PropertySlots
}

export default function CustomPropsRender({ configs, widgets: w, values, onChange, slots }: CustomPropsRenderProps) {
  const { token } = useStyle()

  const ExpressionEditorSlot = resolveSlot('expressionEditor', slots, w)
  const JsonEditorSlot = resolveSlot('jsonEditor', slots)

  const renderWidget = (config: PropertyConfigItem, value: unknown, onValueChange: (value: unknown) => void): React.ReactNode => {
    const { widget, widgetProps } = config

    switch (widget) {
      case 'input':
        return <w.Input value={(value as string) ?? ''} onChange={(v) => onValueChange(v)} placeholder={widgetProps?.placeholder} />

      case 'textarea':
        return w.TextArea ? (
          <w.TextArea value={(value as string) ?? ''} onChange={(v) => onValueChange(v)} placeholder={widgetProps?.placeholder} rows={4} />
        ) : (
          <textarea
            value={(value as string) ?? ''}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder={widgetProps?.placeholder}
            rows={4}
            style={{ ...BASE_STYLE, resize: 'vertical', minHeight: 36 }}
          />
        )

      case 'number':
        return <w.NumberInput value={(value as number) ?? 0} onChange={(v) => onValueChange(v)} min={widgetProps?.min} max={widgetProps?.max} />

      case 'select':
        return <w.Select value={(value as string) ?? ''} onChange={(v) => onValueChange(v)} options={(widgetProps?.options || []).map((opt) => ({ label: String(opt.label), value: String(opt.value) }))} />

      case 'checkbox':
        return <w.Checkbox checked={!!value} onChange={(v) => onValueChange(v)} />

      case 'switch':
        return w.Switch ? <w.Switch checked={!!value} onChange={(v) => onValueChange(v)} /> : <w.Checkbox checked={!!value} onChange={(v) => onValueChange(v)} />

      case 'json':
        return (
          <JsonEditorSlot
            value={value}
            onChange={onValueChange}
            placeholder={widgetProps?.placeholder}
          />
        )

      case 'expression':
        return (
          <ExpressionEditorSlot
            value={(value as string) ?? ''}
            onChange={(v) => onValueChange(v)}
            fieldNames={widgetProps?.fieldNames}
            placeholder={widgetProps?.placeholder}
          />
        )

      case 'custom': {
        const customWidgetName = widgetProps?.customWidget
        if (!customWidgetName) return <span style={{ color: 'var(--fe-text-muted)' }}>未配置自定义 Widget</span>

        const CustomWidget = customPropertyWidgetRegistry.get(customWidgetName)
        if (!CustomWidget) return <span style={{ color: 'var(--fe-text-muted)' }}>Widget &quot;{customWidgetName}&quot; 未注册</span>

        return <CustomWidget value={value} onChange={onValueChange} widgetProps={widgetProps} />
      }

      default:
        return <w.Input value={(value as string) ?? ''} onChange={(v) => onValueChange(v)} />
    }
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
            <label key={config.key} style={{ display: 'flex', alignItems: 'center', gap: token('spacingXs'), marginBottom: token('spacingXs'), fontSize: token('fontSizeXs'), cursor: 'pointer' }}>
              {renderWidget(config, value, handleChange)}
              <span>{config.label}</span>
            </label>
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
