import { registerComponents, registerDesignerWidgets } from '@form-engine/core'
import { DesignerWidgets, FieldRendererFn } from '@form-engine/core/types/adapter'


// 导入 antd-mobile 基础组件（用于 designerWidgets）
import { Button, Checkbox, Input, Picker, Stepper } from 'antd-mobile'

// 导入所有字段组件
import { CascaderField, DateField, DateRangeField, TimeField, TreeSelectField, UploadField } from './fields/DateField'
import { InputField, InputNumberField, PasswordField, SelectField, TextAreaField } from './fields/InputField'
import { CheckboxField, RadioField, RateField, SliderField, SwitchField } from './fields/SwitchField'

// ----- 兜底渲染（未知字段类型）-----
const DefaultField: FieldRendererFn = (props: any) => {
  const { fieldSchema } = props
  return (
    <div style={{ padding: '8px 0', color: '#999', fontSize: 12 }}>
      未支持的字段类型：{fieldSchema.type}
    </div>
  )
}

// ----- 设计器属性面板小组件（Ant Design Mobile 风格）-----
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
      disabled={disabled}
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

// ----- 组件映射（用于注册）-----
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
}

export const antdMobileAdapter = {
  name: 'antd-mobile',
  version: '5.0.0',

  // 字段渲染组件
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

  // 属性面板小组件
  _designerWidgets: designerWidgets,
}

// ----- 自动注册（副作用）-----
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
