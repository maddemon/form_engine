/**
 * Form Engine - Antd Adapter
 * 提供 antd 组件实现
 *
 * 使用方式：
 * ```typescript
 * // 方式1：使用 registerAdapter（推荐）
 * import { antdAdapter } from '@form-engine/adapter-antd'
 * import { registerAdapter } from '@form-engine/core'
 *
 * registerAdapter(antdAdapter)
 *
 * // 方式2：手动注册组件
 * import { antdComponents } from '@form-engine/adapter-antd'
 * import { registerComponents } from '@form-engine/core'
 *
 * registerComponents(antdComponents)
 * ```
 */

import React from 'react'
import { registerComponents, registerDesignerWidgets } from '@form-engine/core'
import { Input as AntdInput, Select as AntdSelect, Checkbox as AntdCheckbox, InputNumber as AntdInputNumber } from 'antd'

// ============================
// 导入所有 antd 组件实现
// ============================

export { Input, Password } from './components/Input'
export { TextArea } from './components/TextArea'
export { Select } from './components/Select'
export { Switch } from './components/Switch'
export { Radio, RadioGroup } from './components/Radio'
export { Checkbox, CheckboxGroup } from './components/Checkbox'
export { InputNumber } from './components/InputNumber'
export { Slider } from './components/Slider'
export { Rate } from './components/Rate'
export { DatePicker, DateRangePicker, TimePicker } from './components/DatePicker'
export { Upload } from './components/Upload'
export { Button } from './components/Button'

// 布局组件（使用 antd 的实现）
export { Grid } from './components/Grid'
export { Flex } from './components/Flex'
export { Container } from './components/Container'
export { Collapse, CollapsePanel } from './components/Collapse'
export { Tabs, TabPane } from './components/Tabs'

// 展示组件
export { Text } from './components/Text'
export { Image } from './components/Image'
export { Divider } from './components/Divider'
export { Title } from './components/Title'

// ============================
// 组件映射（用于注册）
// ============================

/**
 * Antd 组件映射
 * 支持 desktop 场景
 */
export const antdComponents = {
  // 表单组件
  'Input': React.lazy(() => import('./components/Input').then(m => ({ default: m.Input }))),
  'Password': React.lazy(() => import('./components/Input').then(m => ({ default: m.Password }))),
  'Textarea': React.lazy(() => import('./components/TextArea').then(m => ({ default: m.TextArea }))),
  'TextArea': React.lazy(() => import('./components/TextArea').then(m => ({ default: m.TextArea }))),
  'Select': React.lazy(() => import('./components/Select').then(m => ({ default: m.Select }))),
  'MultiSelect': React.lazy(() => import('./components/Select').then(m => ({ default: m.Select }))),
  'Switch': React.lazy(() => import('./components/Switch').then(m => ({ default: m.Switch }))),
  'Radio': React.lazy(() => import('./components/Radio').then(m => ({ default: m.Radio }))),
  'RadioGroup': React.lazy(() => import('./components/Radio').then(m => ({ default: m.RadioGroup }))),
  'Checkbox': React.lazy(() => import('./components/Checkbox').then(m => ({ default: m.Checkbox }))),
  'CheckboxGroup': React.lazy(() => import('./components/Checkbox').then(m => ({ default: m.CheckboxGroup }))),
  'InputNumber': React.lazy(() => import('./components/InputNumber').then(m => ({ default: m.InputNumber }))),
  'Slider': React.lazy(() => import('./components/Slider').then(m => ({ default: m.Slider }))),
  'Rate': React.lazy(() => import('./components/Rate').then(m => ({ default: m.Rate }))),
  'DatePicker': React.lazy(() => import('./components/DatePicker').then(m => ({ default: m.DatePicker }))),
  'DateRangePicker': React.lazy(() => import('./components/DatePicker').then(m => ({ default: m.DateRangePicker }))),
  'TimePicker': React.lazy(() => import('./components/DatePicker').then(m => ({ default: m.TimePicker }))),
  'Upload': React.lazy(() => import('./components/Upload').then(m => ({ default: m.Upload }))),
  'Button': React.lazy(() => import('./components/Button').then(m => ({ default: m.Button }))),
  
  // 布局组件
  'Grid': React.lazy(() => import('./components/Grid').then(m => ({ default: m.Grid }))),
  'Flex': React.lazy(() => import('./components/Flex').then(m => ({ default: m.Flex }))),
  'Container': React.lazy(() => import('./components/Container').then(m => ({ default: m.Container }))),
  'Collapse': React.lazy(() => import('./components/Collapse').then(m => ({ default: m.Collapse }))),
  'Tabs': React.lazy(() => import('./components/Tabs').then(m => ({ default: m.Tabs }))),
  
  // 展示组件
  'Text': React.lazy(() => import('./components/Text').then(m => ({ default: m.Text }))),
  'Image': React.lazy(() => import('./components/Image').then(m => ({ default: m.Image }))),
  'Divider': React.lazy(() => import('./components/Divider').then(m => ({ default: m.Divider }))),
  'Title': React.lazy(() => import('./components/Title').then(m => ({ default: m.Title }))),
}

// ============================
// Antd Adapter 定义
// ============================

/**
 * Antd Adapter
 * 完整的 adapter 定义，包含组件映射和属性面板配置
 *
 * 注意：为了简化，这里不使用 FormEngineAdapter 类型
 * 用户可以直接使用 antdComponents 进行注册
 */
export const antdWidgets: import('@form-engine/core/types/adapter').DesignerWidgets = {
  Input: ({ value, onChange, placeholder, disabled, style }) => (
    <AntdInput
      value={value ?? ''}
      onChange={v => onChange?.(v.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      style={{ width: '100%', ...style }}
    />
  ),
  Select: ({ value, onChange, options, disabled, style }) => (
    <AntdSelect
      value={value}
      onChange={v => onChange?.(v)}
      options={options}
      disabled={disabled}
      style={{ width: '100%', ...style }}
    />
  ),
  Checkbox: ({ checked, onChange, disabled, style }) => (
    <AntdCheckbox
      checked={!!checked}
      onChange={v => onChange?.(v.target.checked)}
      disabled={disabled}
      style={style}
    />
  ),
  NumberInput: ({ value, onChange, min, max, disabled, style }) => (
    <AntdInputNumber
      value={value}
      onChange={v => onChange?.(v)}
      min={min}
      max={max}
      disabled={disabled}
      style={{ width: '100%', ...style }}
    />
  ),
}

export const antdAdapter = {
  name: 'antd',
  version: '5.0.0',

  // 组件映射
  components: antdComponents,

  // 主题配置（Ant Design 5 的 token）
  theme: {
    token: {
      // 默认 token，用户可以通过 StyleProvider 覆盖
    },
    components: {
      // 组件级 token
    }
  },

  // 布局组件覆写（使用 antd 的布局组件）
  layout: {
    Grid: undefined, // 将在运行时设置
    Container: undefined,
    Flex: undefined,
    Collapse: undefined,
    Tabs: undefined,
  },

  // 属性面板小组件（由 core 按场景获取）
  _designerWidgets: antdWidgets,
}

// 设置 layout 的引用（避免循环引用）
;(antdAdapter.layout as any).Grid = antdComponents['Grid']
;(antdAdapter.layout as any).Container = antdComponents['Container']
;(antdAdapter.layout as any).Flex = antdComponents['Flex']
;(antdAdapter.layout as any).Collapse = antdComponents['Collapse']
;(antdAdapter.layout as any).Tabs = antdComponents['Tabs']

/**
 * 自动注册 antd 组件和小组件（副作用）
 * 当导入此模块时自动执行
 *
 * 注意：推荐使用 registerAdapter 代替自动注册
 */
function autoRegister() {
  try {
    if (registerComponents) {
      registerComponents(antdComponents as any, 'desktop')
      console.log('[Form Engine] antd adapter 已自动注册 (desktop)')
    }
    if (registerDesignerWidgets) {
      registerDesignerWidgets(antdWidgets as any, 'desktop')
    }
  } catch (e) {
    console.warn('[Form Engine] 无法自动注册 antd adapter，请手动注册', e)
  }
}

// 如果在浏览器环境，自动注册
if (typeof window !== 'undefined') {
  autoRegister()
}

export default antdAdapter
