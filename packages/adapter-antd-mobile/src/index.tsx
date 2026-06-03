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
import { Button, Checkbox, Input, Picker, Stepper } from 'antd-mobile'

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

const designerWidgets: import('@form-engine/core/types/adapter').DesignerWidgets = {
  Input: ({ value, onChange, placeholder, disabled, style }: any) => (
    <Input
      value={value ?? ''}
      onChange={v => onChange?.(v)}
      placeholder={placeholder}
      disabled={disabled}
      style={{ width: '100%', ...style }}
    />
  ),
  Select: ({ value, onChange, options, disabled, style }: any) => (
    <Picker
      columns={[options || []]}
      value={value ? [String(value)] : []}
      onConfirm={vals => onChange?.(vals[0])}
    >
      {(vals, actions) => (
        <Button
          onClick={actions.open}
          disabled={disabled}
          style={{ width: '100%', textAlign: 'left', color: value ? undefined : '#999', ...style }}
        >
          {value ? options?.find((o: any) => o.value === value)?.label || value : '请选择'}
        </Button>
      )}
    </Picker>
  ),
  Checkbox: ({ checked, onChange, disabled, style }: any) => (
    <Checkbox
      checked={checked}
      onChange={v => onChange?.(v)}
      disabled={disabled}
      style={style}
    />
  ),
  NumberInput: ({ value, onChange, min, max, disabled, style }: any) => (
    <Stepper
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
        <Button
          key={opt.value}
          size="mini"
          color={value === opt.value ? 'primary' : 'default'}
          disabled={disabled}
          onClick={() => !disabled && onChange?.(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  ),
}

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
    // 展示组件
    'text': TextField,
    'image': ImageField,
    'divider': DividerField,
    'title': TitleField,
  },

  default: DefaultField,
  designerWidgets,
}

export default antdMobileAdapter
