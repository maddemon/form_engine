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
import { designerWidgets } from './widgets'

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

// Designer PropertyPanel Widgets
export { designerWidgets } from './widgets'

// ============================
// 兜底渲染
// ============================

const DefaultField: FieldRendererFn = (props: any) => {
  const { fieldSchema } = props
  return <div style={{ padding: '8px 0', color: '#999', fontSize: 12 }}>未支持的字段类型：{fieldSchema?.type}</div>
}

// ============================
// 设计器属性面板小组件 — 见 ./widgets
// ============================

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
    input: Input,
    password: Password,
    textarea: TextArea,
    'input-number': InputNumber,
    select: Select,
    'multi-select': Select,
    switch: SwitchField,
    radio: Radio,
    checkbox: Checkbox,
    slider: Slider,
    rate: Rate,
    date: DatePicker,
    datetime: DatePicker,
    'date-range': DateRangePicker,
    time: TimePicker,
    upload: Upload,
    cascader: Cascader,
    'tree-select': TreeSelect,
    // 容器组件
    container: Container,
    grid: Grid,
    flex: Flex,
    collapse: Collapse,
    tabs: Tabs,
    table: Table,
    card: Card,
    // 展示组件
    text: Text,
    image: Image,
    divider: Divider,
    title: Title,
    alert: Alert,
    segment: Segment,
  },

  default: DefaultField,
  designerWidgets,
}

export default antdAdapter
