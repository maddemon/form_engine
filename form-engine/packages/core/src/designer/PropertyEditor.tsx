/**
 * 属性编辑器组件
 * 根据 PropertyConfigItem 配置动态渲染属性编辑界面
 */

import React from 'react'
import type {
  PropertyConfigItem,
  PropertyWidgetComponentProps,
} from '../types/custom-component'
import { customPropertyWidgetRegistry } from '../registry/customComponentRegistry'
import type { DesignerWidgets } from '../types/adapter'
import { renderOptionsEditor } from './OptionsEditor'

/**
 * PropertyEditor 组件 Props
 */
interface PropertyEditorProps {
  /** 属性配置列表 */
  configs: PropertyConfigItem[]
  
  /** 当前字段的属性值 */
  fieldProps: Record<string, unknown>
  
  /** 字段 Schema（完整） */
  fieldSchema: Record<string, unknown>
  
  /** 值变化回调 */
  onChange: (key: string, value: unknown) => void
  
  /** 设计器小组件（用于渲染内置 widget） */
  widgets: DesignerWidgets
}

/**
 * 检查属性是否应该显示
 */
function shouldShowProperty(config: PropertyConfigItem, fieldProps: Record<string, unknown>): boolean {
  if (!config.visibleWhen) return true
  
  for (const [key, expectedValue] of Object.entries(config.visibleWhen)) {
    if (fieldProps[key] !== expectedValue) {
      return false
    }
  }
  
  return true
}

/**
 * 属性编辑器组件
 */
export const PropertyEditor: React.FC<PropertyEditorProps> = ({
  configs,
  fieldProps,
  fieldSchema,
  onChange,
  widgets,
}) => {
  // 按 group 分组
  const groupedConfigs: Record<string, PropertyConfigItem[]> = {}
  
  for (const config of configs) {
    // 检查是否应该显示
    if (!shouldShowProperty(config, fieldProps)) continue
    
    const group = config.group || '基础'
    if (!groupedConfigs[group]) {
      groupedConfigs[group] = []
    }
    groupedConfigs[group].push(config)
  }
  
  // 如果没有配置，显示提示
  if (Object.keys(groupedConfigs).length === 0) {
    return (
      <div style={{ padding: 12, color: '#999', fontSize: 12 }}>
        暂无自定义属性配置
      </div>
    )
  }
  
  /**
   * 根据 widget 类型渲染对应的编辑器
   * 这个函数现在在组件内部，可以访问 fieldProps 和 fieldSchema
   */
  const renderWidget = (
    config: PropertyConfigItem,
    value: unknown,
    onValueChange: (value: unknown) => void,
  ): React.ReactNode => {
    const { widget, widgetProps } = config
    
    switch (widget) {
      case 'input':
        return (
          <widgets.Input
            value={value as string ?? ''}
            onChange={(v: string | number) => onValueChange(v)}
            placeholder={widgetProps?.placeholder}
          />
        )
      
      case 'textarea':
        return widgets.TextArea ? (
          <widgets.TextArea
            value={value as string ?? ''}
            onChange={(v: string) => onValueChange(v)}
            placeholder={widgetProps?.placeholder}
            rows={4}
          />
        ) : (
          <textarea
            value={value as string ?? ''}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder={widgetProps?.placeholder}
            rows={4}
            style={{ width: '100%', padding: 4, border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 12 }}
          />
        )
      
      case 'number':
        return (
          <widgets.NumberInput
            value={value as number ?? 0}
            onChange={(v: number) => onValueChange(v)}
            min={widgetProps?.min}
            max={widgetProps?.max}
          />
        )
      
      case 'select':
        return (
          <widgets.Select
            value={value as string ?? ''}
            onChange={(v: string) => onValueChange(v)}
            options={(widgetProps?.options || []).map(opt => ({
              label: String(opt.label),
              value: String(opt.value),
            }))}
          />
        )
      
      case 'checkbox':
        return (
          <widgets.Checkbox
            checked={!!value}
            onChange={(v: boolean) => onValueChange(v)}
          />
        )
      
      case 'switch':
        if (widgets.Switch) {
          return (
            <widgets.Switch
              checked={!!value}
              onChange={(v: boolean) => onValueChange(v)}
            />
          )
        }
        // 降级到 Checkbox
        return (
          <widgets.Checkbox
            checked={!!value}
            onChange={(v: boolean) => onValueChange(v)}
          />
        )
      
      case 'json':
        // 简单 JSON 编辑器（后续可以替换为 Monaco Editor 等）
        return (
          <textarea
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value)
                onValueChange(parsed)
              } catch {
                onValueChange(e.target.value)
              }
            }}
            placeholder={widgetProps?.placeholder}
            rows={6}
            style={{
              width: '100%',
              padding: 4,
              border: '1px solid #d9d9d9',
              borderRadius: 4,
              fontFamily: 'monospace',
              fontSize: 12,
            }}
          />
        )
      
      case 'options':
        // 内置的 options 编辑器，用于编辑 OptionItem[]
        return renderOptionsEditor(value, onValueChange)
      
      case 'custom':
        // 渲染自定义 Widget
        const customWidgetName = widgetProps?.customWidget
        if (!customWidgetName) {
          console.warn(`[PropertyEditor] custom widget 未指定 customWidget 名称`)
          return <span style={{ color: '#999' }}>未配置自定义 Widget</span>
        }
        
        const CustomWidget = customPropertyWidgetRegistry.get(customWidgetName)
        if (!CustomWidget) {
          console.warn(`[PropertyEditor] 自定义 Widget "${customWidgetName}" 未注册`)
          return <span style={{ color: '#999' }}>Widget "{customWidgetName}" 未注册</span>
        }
        
        const customProps: PropertyWidgetComponentProps = {
          value,
          onChange: onValueChange,
          widgetProps,
          fieldProps,
          fieldSchema,
        }
        
        return <CustomWidget {...customProps} />
      
      default:
        return (
          <widgets.Input
            value={value as string ?? ''}
            onChange={(v: string | number) => onValueChange(v)}
          />
        )
    }
  }
  
  // 渲染分组
  return (
    <div>
      {Object.entries(groupedConfigs).map(([groupName, groupConfigs]) => (
        <div key={groupName} style={{ marginBottom: 12 }}>
          <div style={{
            fontSize: 12,
            fontWeight: 500,
            color: '#666',
            marginBottom: 8,
            paddingBottom: 4,
            borderBottom: '1px solid #eee',
          }}>
            {groupName}
          </div>
          
          {groupConfigs.map(config => {
            const value = fieldProps[config.key]
            const handleChange = (newValue: unknown) => {
              onChange(config.key, newValue)
            }
            
            // 如果是 checkbox/switch 类型，使用行内布局
            const isToggle = config.widget === 'checkbox' || config.widget === 'switch'
            
            return (
              <div key={config.key} style={{ marginBottom: 8 }}>
                {isToggle ? (
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}>
                    {renderWidget(config, value, handleChange)}
                    <span>{config.label}</span>
                    {config.required && <span style={{ color: '#ff4d4f' }}>*</span>}
                  </label>
                ) : (
                  <label style={{ display: 'block', fontSize: 12 }}>
                    <span style={{ display: 'block', marginBottom: 2 }}>
                      {config.label}
                      {config.required && <span style={{ color: '#ff4d4f' }}>*</span>}
                    </span>
                    <div style={{ marginTop: 2 }}>
                      {renderWidget(config, value, handleChange)}
                    </div>
                    {config.description && (
                      <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                        {config.description}
                      </div>
                    )}
                  </label>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default PropertyEditor
