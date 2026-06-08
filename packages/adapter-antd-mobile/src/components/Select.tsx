import { Picker, Space } from 'antd-mobile'
import { DownOutline, CloseCircleFill } from 'antd-mobile-icons'
import type { OptionItem, FieldComponentProps, FieldRendererFn } from '@form-engine/core'
import { toPickerColumns } from '../utils'

export const SelectField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema, options } = props
  const opts = (options || []) as OptionItem[]
  const columns = toPickerColumns(opts)
  const isMulti = fieldSchema.componentProps?.mode === 'multiple'
  const placeholder = fieldSchema.placeholder || '请选择'
  const allowClear = fieldSchema.componentProps?.allowClear

  const valArr = isMulti
    ? ((value as string[]) || []).map(String)
    : (value ? [String(value)] : [])

  const hasValue = isMulti ? valArr.length > 0 : !!value

  return (
    <Picker
      columns={columns}
      value={valArr}
      onConfirm={vals => {
        if (isMulti) {
          onChange?.(vals)
        } else {
          onChange?.(vals[0] || undefined)
        }
      }}
    >
      {(vals, actions) => (
        <Space
          block
          justify="between"
          align="center"
          onClick={disabled ? undefined : actions.open}
          style={{
            color: hasValue ? undefined : 'var(--adm-color-weak)',
            cursor: disabled ? 'default' : 'pointer',
          }}
        >
          <span>
            {hasValue
              ? vals.map(v => opts.find(o => o.value === v?.value)?.label || v?.label || '').join('，')
              : placeholder}
          </span>
          {hasValue && allowClear ? (
            <CloseCircleFill
              style={{ fontSize: 16, flexShrink: 0 }}
              onClick={e => {
                e.stopPropagation()
                onChange?.(isMulti ? [] : undefined)
              }}
            />
          ) : (
            <DownOutline style={{ fontSize: 16, flexShrink: 0 }} />
          )}
        </Space>
      )}
    </Picker>
  )
}
