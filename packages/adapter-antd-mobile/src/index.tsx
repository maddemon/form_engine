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
  designerWidgets,
}

export default antdMobileAdapter
