import { registerComponents, registerDesignerWidgets } from '@form-engine/core'
import type { DesignerWidgets, FieldRendererFn } from '@form-engine/core'

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

// Theme Bridge
export { AntdMobileBridgeProvider } from './themeBridge'

const DefaultField: FieldRendererFn = (props: any) => {
  const { fieldSchema } = props
  return (
    <div style={{ padding: '8px 0', color: '#999', fontSize: 12 }}>
      未支持的字段类型：{fieldSchema.type}
    </div>
  )
}

const designerWidgets: DesignerWidgets = {
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
}

export const antdMobileComponents = {
  'Input': InputField,
  'Password': PasswordField,
  'Textarea': TextAreaField,
  'TextArea': TextAreaField,
  'InputNumber': InputNumberField,
  'Select': SelectField,
  'MultiSelect': SelectField,
  'Radio': RadioField,
  'RadioGroup': RadioField,
  'Checkbox': CheckboxField,
  'CheckboxGroup': CheckboxField,
  'Switch': SwitchField,
  'Slider': SliderField,
  'Rate': RateField,
  'DatePicker': DateField,
  'DateRangePicker': DateRangeField,
  'TimePicker': TimeField,
  'Upload': UploadField,
  'Grid': GridField,
  'Flex': FlexField,
  'Container': ContainerField,
  'Collapse': CollapseField,
  'Tabs': TabsField,
  'Text': TextField,
  'Image': ImageField,
  'Divider': DividerField,
  'Title': TitleField,
}

export const antdMobileAdapter = {
  name: 'antd-mobile',
  version: '5.0.0',

  'default': DefaultField,
  'input': InputField,
  'input-number': InputNumberField,
  'textarea': TextAreaField,
  'password': PasswordField,
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
  'grid': GridField,
  'flex': FlexField,
  'container': ContainerField,
  'collapse': CollapseField,
  'tabs': TabsField,
  'text': TextField,
  'image': ImageField,
  'divider': DividerField,
  'title': TitleField,

  _designerWidgets: designerWidgets,
}

function autoRegister() {
  try {
    if (registerComponents) {
      registerComponents(antdMobileComponents as any, 'mobile')
      console.log('[Form Engine] antd-mobile adapter 已自动注册 (mobile)')
    }
    if (registerDesignerWidgets) {
      registerDesignerWidgets(designerWidgets as any, 'mobile')
    }
  } catch (e) {
    console.warn('[Form Engine] 无法自动注册 antd-mobile adapter，请手动注册', e)
  }
}

if (typeof window !== 'undefined') {
  autoRegister()
}
