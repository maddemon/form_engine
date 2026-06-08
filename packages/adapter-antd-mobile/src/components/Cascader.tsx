import { Cascader, Space } from 'antd-mobile'
import { DownOutline, CloseCircleFill } from 'antd-mobile-icons'
import type { OptionItem, FieldComponentProps, FieldRendererFn } from '@form-engine/core'
import { toCascaderOptions } from '../utils'

export const CascaderField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema, options } = props
  const cascaderOptions = toCascaderOptions((options || []) as OptionItem[])
  const placeholder = fieldSchema.placeholder || '请选择'
  const allowClear = fieldSchema.componentProps?.allowClear
  const valArr = value ? (Array.isArray(value) ? (value as string[]).map(String) : [String(value)]) : []
  const hasValue = valArr.length > 0

  return (
    <Cascader
      options={cascaderOptions}
      value={valArr}
      onConfirm={vals => onChange?.(vals)}
    >
      {(vals: any, actions: any) => (
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
            {hasValue ? vals.map((v: any) => v?.label ?? v ?? '').join(' / ') : placeholder}
          </span>
          {hasValue && allowClear ? (
            <CloseCircleFill
              style={{ fontSize: 16, flexShrink: 0 }}
              onClick={e => {
                e.stopPropagation()
                onChange?.([])
              }}
            />
          ) : (
            <DownOutline style={{ fontSize: 16, flexShrink: 0 }} />
          )}
        </Space>
      )}
    </Cascader>
  )
}
