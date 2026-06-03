/**
 * Form Engine - Antd Adapter
 *
 * 纯对象适配器，无全局注册、无 Proxy、无副作用。
 *
 * 使用方式：
 * ```tsx
 * import { antdAdapter } from '@form-engine/adapter-antd'
 * import { FormRender } from '@form-engine/core'
 *
 * <FormRender schema={schema} adapter={antdAdapter} />
 * ```
 */

import type { FieldRendererFn, FormEngineAdapter } from '@form-engine/core'
import { Checkbox as AntdCheckbox, Input as AntdInput, InputNumber as AntdInputNumber, Select as AntdSelect } from 'antd'
import React from 'react'

// 组件导出
export { Button } from './components/Button'
export { Checkbox, CheckboxGroup } from './components/Checkbox'
export { DatePicker, DateRangePicker, TimePicker } from './components/DatePicker'
export { Input, Password } from './components/Input'
export { InputNumber } from './components/InputNumber'
export { Radio, RadioGroup } from './components/Radio'
export { Rate } from './components/Rate'
export { Select } from './components/Select'
export { Slider } from './components/Slider'
export { Switch } from './components/Switch'
export { TextArea } from './components/TextArea'
export { Upload } from './components/Upload'
export { Cascader } from './components/Cascader'
export { TreeSelect } from './components/TreeSelect'
export { Collapse, CollapsePanel } from './components/Collapse'
export { Container } from './components/Container'
export { Flex } from './components/Flex'
export { Grid } from './components/Grid'
export { Table } from './components/Table'
export { TabPane, Tabs } from './components/Tabs'
export { Divider } from './components/Divider'
export { Image } from './components/Image'
export { Text } from './components/Text'
export { Title } from './components/Title'

// Theme Bridge
export { AntdBridgeProvider } from './themeBridge'

// ============================
// 兜底渲染
// ============================

const DefaultField: FieldRendererFn = (props: any) => {
  const { fieldSchema } = props
  return (
    <div style={{ padding: '8px 0', color: '#999', fontSize: 12 }}>
      未支持的字段类型：{fieldSchema?.type}
    </div>
  )
}

// ============================
// 设计器属性面板小组件
// ============================

const designerWidgets: import('@form-engine/core/types/adapter').DesignerWidgets = {
  Input: ({ value, onChange, placeholder, disabled, style }: any) => (
    <AntdInput
      value={value ?? ''}
      onChange={v => onChange?.(v.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      style={{ width: '100%', ...style }}
    />
  ),
  Select: ({ value, onChange, options, disabled, style }: any) => (
    <AntdSelect
      value={value}
      onChange={v => onChange?.(v)}
      options={options}
      disabled={disabled}
      style={{ width: '100%', ...style }}
    />
  ),
  Checkbox: ({ checked, onChange, disabled, style }: any) => (
    <AntdCheckbox
      checked={!!checked}
      onChange={v => onChange?.(v.target.checked)}
      disabled={disabled}
      style={style}
    />
  ),
  NumberInput: ({ value, onChange, min, max, disabled, style }: any) => (
    <AntdInputNumber
      value={value}
      onChange={v => onChange?.(v)}
      min={min}
      max={max}
      disabled={disabled}
      style={{ width: '100%', ...style }}
    />
  ),
  ButtonGroup: ({ value, onChange, options, disabled, style }: any) => (
    <div style={{ display: 'flex', gap: 4, ...style }}>
      {options?.map((opt: any) => (
        <AntdInput
          key={opt.value}
          style={{
            flex: 1,
            textAlign: 'center',
            background: value === opt.value ? '#1677ff' : 'transparent',
            color: value === opt.value ? '#fff' : undefined,
            borderColor: value === opt.value ? '#1677ff' : '#d9d9d9',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
          readOnly
          value={opt.label}
          onClick={() => !disabled && onChange?.(opt.value)}
        />
      ))}
    </div>
  ),
}

// ============================
// Adapter 定义
// ============================

/**
 * Antd Adapter — 桌面端
 *
 * 纯对象，field.type → FieldRendererFn 的映射。
 * 通过 adapter.components['input'] 查找组件。
 */
export const antdAdapter: FormEngineAdapter = {
  name: 'antd',
  scene: 'desktop',

  components: {
    // 表单组件（直接 import，不使用 React.lazy，避免 Suspense 依赖）
    'input': React.lazy(() => import('./components/Input').then(m => ({ default: m.Input as any }))),

    // 以下先直接 import，后续按需改为 lazy
    'password': React.lazy(() => import('./components/Input').then(m => ({ default: m.Password as any }))),
    'textarea': React.lazy(() => import('./components/TextArea').then(m => ({ default: m.TextArea as any }))),
    'input-number': React.lazy(() => import('./components/InputNumber').then(m => ({ default: m.InputNumber as any }))),
    'select': React.lazy(() => import('./components/Select').then(m => ({ default: m.Select as any }))),
    'multi-select': React.lazy(() => import('./components/Select').then(m => ({ default: m.Select as any }))),
    'switch': React.lazy(() => import('./components/Switch').then(m => ({ default: m.Switch as any }))),
    'radio': React.lazy(() => import('./components/Radio').then(m => ({ default: m.Radio as any }))),
    'checkbox': React.lazy(() => import('./components/Checkbox').then(m => ({ default: m.Checkbox as any }))),
    'slider': React.lazy(() => import('./components/Slider').then(m => ({ default: m.Slider as any }))),
    'rate': React.lazy(() => import('./components/Rate').then(m => ({ default: m.Rate as any }))),
    'date': React.lazy(() => import('./components/DatePicker').then(m => ({ default: m.DatePicker as any }))),
    'datetime': React.lazy(() => import('./components/DatePicker').then(m => ({ default: m.DatePicker as any }))),
    'date-range': React.lazy(() => import('./components/DatePicker').then(m => ({ default: m.DateRangePicker as any }))),
    'time': React.lazy(() => import('./components/DatePicker').then(m => ({ default: m.TimePicker as any }))),
    'upload': React.lazy(() => import('./components/Upload').then(m => ({ default: m.Upload as any }))),
    'cascader': React.lazy(() => import('./components/Cascader').then(m => ({ default: m.Cascader as any }))),
    'tree-select': React.lazy(() => import('./components/TreeSelect').then(m => ({ default: m.TreeSelect as any }))),
    // 容器组件
    'container': React.lazy(() => import('./components/Container').then(m => ({ default: m.Container as any }))),
    'grid': React.lazy(() => import('./components/Grid').then(m => ({ default: m.Grid as any }))),
    'flex': React.lazy(() => import('./components/Flex').then(m => ({ default: m.Flex as any }))),
    'collapse': React.lazy(() => import('./components/Collapse').then(m => ({ default: m.Collapse as any }))),
    'tabs': React.lazy(() => import('./components/Tabs').then(m => ({ default: m.Tabs as any }))),
    'table': React.lazy(() => import('./components/Table').then(m => ({ default: m.Table as any }))),
    // 展示组件
    'text': React.lazy(() => import('./components/Text').then(m => ({ default: m.Text as any }))),
    'image': React.lazy(() => import('./components/Image').then(m => ({ default: m.Image as any }))),
    'divider': React.lazy(() => import('./components/Divider').then(m => ({ default: m.Divider as any }))),
    'title': React.lazy(() => import('./components/Title').then(m => ({ default: m.Title as any }))),
  },

  default: DefaultField,
  designerWidgets,
}

export default antdAdapter
