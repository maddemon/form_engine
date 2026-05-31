import React from 'react'
import type { FieldRendererFn, DesignerWidgets } from '../../../types/adapter'
import type { OptionItem } from '../../../types/schema'

// 导入所有字段组件
import { InputField, TextAreaField, InputNumberField, PasswordField, SelectField } from './fields/InputField'
import { RadioField, CheckboxField, SwitchField, SliderField, RateField } from './fields/SwitchField'
import { DateField, DateRangeField, TimeField, UploadField, CascaderField, TreeSelectField } from './fields/DateField'

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

export const antdMobileAdapter = {
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

  '_designerWidgets': designerWidgets,
}
