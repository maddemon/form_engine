import { SelectProps } from '@form-engine/core'
import { Picker, Space } from 'antd-mobile'
import { DownOutline, CloseCircleFill } from 'antd-mobile-icons'
import { useLocale } from '@form-engine/core/locale'
import { toPickerColumns } from '../utils'
import React from 'react'

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  disabled,
  options = [],
  placeholder: placeholderProp,
  allowClear,
  mode,
  style,
  className,
  id,
}) => {
  const { locale } = useLocale()
  const opts = (options || []) as any[]
  const columns = toPickerColumns(opts)
  const placeholder = placeholderProp ?? locale.adapter.common.placeholder.select ?? 'Please select'
  const isMulti = mode === 'multiple'

  const valArr = isMulti
    ? ((value as string[]) || []).map(String)
    : (value ? [String(value)] : [])

  const hasValue = isMulti ? valArr.length > 0 : !!value

  return (
    <Picker
      columns={columns}
      value={valArr}
      onConfirm={(vals) => {
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
            ...style,
          }}
          className={className}
          id={id}
        >
          <span>
            {hasValue
              ? vals.map((v: any) => opts.find((o: any) => o.value === v?.value)?.label || v?.label || '').join('，')
              : placeholder}
          </span>
          {hasValue && allowClear ? (
            <CloseCircleFill
              style={{ fontSize: 16, flexShrink: 0 }}
              onClick={(e) => {
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
