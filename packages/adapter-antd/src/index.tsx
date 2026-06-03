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

// 静态导入所有组件
import { Input, Password } from './components/Input'
import { TextArea } from './components/TextArea'
import { InputNumber } from './components/InputNumber'
import { Select } from './components/Select'
import { Switch as SwitchField } from './components/Switch'
import { Radio, RadioGroup } from './components/Radio'
import { Checkbox, CheckboxGroup } from './components/Checkbox'
import { Slider } from './components/Slider'
import { Rate } from './components/Rate'
import { DatePicker, DateRangePicker, TimePicker } from './components/DatePicker'
import { Upload } from './components/Upload'
import { Cascader } from './components/Cascader'
import { TreeSelect } from './components/TreeSelect'
import { Container } from './components/Container'
import { Grid } from './components/Grid'
import { Flex } from './components/Flex'
import { Collapse, CollapsePanel } from './components/Collapse'
import { Tabs, TabPane } from './components/Tabs'
import { Table } from './components/Table'
import { Text } from './components/Text'
import { Image } from './components/Image'
import { Divider } from './components/Divider'
import { Title } from './components/Title'
import { Button } from './components/Button'
import { Card } from './components/Card'
import { Alert } from './components/Alert'
import { Segment } from './components/Segment'

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
export { Card } from './components/Card'
export { Alert } from './components/Alert'
export { Segment } from './components/Segment'

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
  Switch: ({ checked, onChange, disabled, style }: any) => (
    <label
      style={{
        position: 'relative',
        display: 'inline-block',
        width: 36,
        height: 20,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      <input
        type="checkbox"
        checked={!!checked}
        disabled={disabled}
        onChange={e => onChange?.(e.target.checked)}
        style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
      />
      <span
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 10,
          background: checked ? 'var(--fe-primary, #1677ff)' : '#bfbfbf',
          transition: 'background 0.2s',
        }}
      />
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: checked ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transition: 'left 0.2s',
        }}
      />
    </label>
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
    <div style={{ display: 'inline-flex', borderRadius: 6, overflow: 'hidden', border: '1px solid var(--fe-border-primary, #d9d9d9)', ...style }}>
      {options?.map((opt: any) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onChange?.(opt.value)}
            style={{
              flex: 1,
              padding: '3px 10px',
              border: 'none',
              borderRight: '1px solid var(--fe-border-primary, #d9d9d9)',
              background: active ? 'var(--fe-primary, #1677ff)' : 'var(--fe-bg-primary, #fff)',
              color: active ? '#fff' : 'var(--fe-text-primary, #333)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: 12,
              fontWeight: active ? 500 : 400,
              outline: 'none',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {opt.label}
          </button>
        )
      })}
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
    // 表单组件
    'input': Input,
    'password': Password,
    'textarea': TextArea,
    'input-number': InputNumber,
    'select': Select,
    'multi-select': Select,
    'switch': SwitchField,
    'radio': Radio,
    'checkbox': Checkbox,
    'slider': Slider,
    'rate': Rate,
    'date': DatePicker,
    'datetime': DatePicker,
    'date-range': DateRangePicker,
    'time': TimePicker,
    'upload': Upload,
    'cascader': Cascader,
    'tree-select': TreeSelect,
    // 容器组件
    'container': Container,
    'grid': Grid,
    'flex': Flex,
    'collapse': Collapse,
    'tabs': Tabs,
    'table': Table,
    'card': Card,
    // 展示组件
    'text': Text,
    'image': Image,
    'divider': Divider,
    'title': Title,
    'alert': Alert,
    'segment': Segment,
  },

  default: DefaultField,
  designerWidgets,
}

export default antdAdapter
