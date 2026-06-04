/**
 * Form Engine - Antd Mobile Adapter
 *
 * 纯对象适配器，无全局注册、无 Proxy、无副作用。
 *
 * 使用方式：
 * ```tsx
 * import { antdMobileAdapter } from '@form-engine/adapter-antd-mobile'
 * import { FormRender } from '@form-engine/core'
 *
 * <FormRender schema={schema} adapter={antdMobileAdapter} />
 * ```
 */

import type { FieldRendererFn, FormEngineAdapter } from '@form-engine/core'
import React from 'react'

import { InputField } from './components/Input'
import { TextAreaField } from './components/TextArea'
import { PasswordField } from './components/Password'
import { InputNumberField } from './components/InputNumber'
import { SelectField } from './components/Select'
import { RadioField } from './components/Radio'
import { CheckboxField } from './components/Checkbox'
import { SwitchField } from './components/Switch'
import { SliderField } from './components/Slider'
import { RateField } from './components/Rate'
import { DateField } from './components/DatePicker'
import { DateRangeField } from './components/DateRange'
import { TimeField } from './components/TimePicker'
import { UploadField } from './components/Upload'
import { CascaderField } from './components/Cascader'
import { TreeSelectField } from './components/TreeSelect'
import { GridField } from './components/Grid'
import { FlexField } from './components/Flex'
import { ContainerField } from './components/Container'
import { CollapseField } from './components/Collapse'
import { TabsField } from './components/Tabs'
import { TextField } from './components/Text'
import { ImageField } from './components/Image'
import { DividerField } from './components/Divider'
import { TitleField } from './components/Title'
import { TableField } from './components/Table'
import { CardField } from './components/Card'
import { AlertField } from './components/Alert'
import { SegmentField } from './components/Segment'

// Theme Bridge
export { AntdMobileBridgeProvider } from './themeBridge'

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
// 注意：adapter-antd-mobile 面向移动端场景。属性面板是 desktop 渲染器，
// 不应在此提供 widgets 覆盖，应回退到 core 的 defaultDesignerWidgets。
// 移动端适配器按场景只需提供 components（field.type 渲染器）。

// ============================
// Adapter 定义
// ============================

/**
 * Antd Mobile Adapter — 移动端
 *
 * 纯对象，field.type → FieldRendererFn 的映射。
 * 通过 adapter.components['input'] 查找组件。
 */
export const antdMobileAdapter: FormEngineAdapter = {
  name: 'antd-mobile',
  scene: 'mobile',

  components: {
    // 表单组件
    'input': InputField,
    'password': PasswordField,
    'textarea': TextAreaField,
    'input-number': InputNumberField,
    'select': SelectField,
    'multi-select': SelectField,
    'radio': RadioField,
    'checkbox': CheckboxField,
    'switch': SwitchField,
    'slider': SliderField,
    'rate': RateField,
    'date': DateField,
    'datetime': DateField,
    'date-range': DateRangeField,
    'time': TimeField,
    'upload': UploadField,
    'cascader': CascaderField,
    'tree-select': TreeSelectField,
    // 容器组件
    'container': ContainerField,
    'grid': GridField,
    'flex': FlexField,
    'collapse': CollapseField,
    'tabs': TabsField,
    'table': TableField,
    'card': CardField,
    // 展示组件
    'text': TextField,
    'image': ImageField,
    'divider': DividerField,
    'title': TitleField,
    'alert': AlertField,
    'segment': SegmentField,
  },

  default: DefaultField,
  // designerWidgets: 不提供 — PropertyPanel 是 desktop 渲染器，
  // 移动端适配器无 widgets 覆盖时自动回退到 core 的 defaultDesignerWidgets。
}

export default antdMobileAdapter
