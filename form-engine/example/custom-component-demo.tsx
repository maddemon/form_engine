/**
 * 自定义组件注册示例
 * 演示如何使用新的自定义组件注册 API
 */

import React from 'react'
import { registerSimpleCustomComponent } from '@form-engine/core'

// 示例 1：简单自定义按钮组件
function MyButton(props: any) {
  return (
    <button
      style={{
        padding: '8px 16px',
        background: props.bgColor || '#1677ff',
        color: '#fff',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
      }}
      onClick={props.onClick}
    >
      {props.text || '按钮'}
    </button>
  )
}

// 注册自定义按钮组件（简化方式）
registerSimpleCustomComponent('my-button', MyButton, {
  label: '我的按钮',
  category: '自定义',
  defaultProps: {
    text: '点击我',
    bgColor: '#1677ff',
    disabled: false,
  },
  // propertyConfig 会自动根据 defaultProps 推断
})

// 示例 2：自定义颜色选择器组件（使用自定义 Widget）
function ColorPickerWidget(props: any) {
  return (
    <input
      type="color"
      value={props.value || '#000000'}
      onChange={(e) => props.onChange(e.target.value)}
      style={{ width: '100%', height: 32 }}
    />
  )
}

function ColorPicker(props: any) {
  return (
    <div>
      <label>{props.label || '选择颜色'}</label>
      <input
        type="color"
        value={props.value || '#000000'}
        onChange={(e) => props.onChange?.(e.target.value)}
      />
    </div>
  )
}

// 注册自定义颜色选择器（完整方式）
registerSimpleCustomComponent('color-picker', ColorPicker, {
  label: '颜色选择器',
  category: '高级',
  defaultProps: {
    label: '选择颜色',
    value: '#000000',
  },
  propertyConfig: [
    { key: 'label', label: '标签', widget: 'input' },
    { 
      key: 'value', 
      label: '颜色', 
      widget: 'custom',
      widgetProps: { customWidget: 'ColorPicker' }
    },
  ],
})

// 注意：需要先注册自定义 Widget
// registerCustomPropertyWidget('ColorPicker', ColorPickerWidget)

export { MyButton, ColorPicker }
