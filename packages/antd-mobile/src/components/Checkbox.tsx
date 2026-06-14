import type { OptionItem } from '@form-engine/core'
import { Checkbox as AntmCheckbox, Selector, Space } from 'antd-mobile'
import React from 'react'

interface CheckboxProps {
  value?: string[] | boolean
  onChange?: (value: string[] | boolean | undefined) => void
  disabled?: boolean
  options?: OptionItem[]
  optionType?: 'default' | 'button'
  direction?: 'horizontal' | 'vertical'
  style?: React.CSSProperties
  className?: string
  id?: string
}

export const Checkbox: React.FC<CheckboxProps> = ({
  value,
  onChange,
  disabled,
  options = [],
  optionType,
  style,
  className,
  id,
}) => {
  const checkboxOptions = (options || []) as OptionItem[]

  if (checkboxOptions.length > 0) {
    if (optionType === 'button') {
      return (
        <Selector
          options={checkboxOptions.map((opt) => ({
            label: opt.label,
            value: String(opt.value),
            disabled: opt.disabled,
          }))}
          value={(value as string[]) || []}
          onChange={(v) => onChange?.(v)}
          disabled={disabled}
          multiple={true}
          style={style}
        />
      )
    }

    const vals = (value as string[]) || []
    return (
      <AntmCheckbox.Group
        value={vals}
        onChange={(v) => onChange?.(v)}
        disabled={disabled}
        style={style}
        className={className}
        id={id}
      >
        <Space direction="horizontal" block wrap>
          {checkboxOptions.map((opt: any) => (
            <AntmCheckbox key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </AntmCheckbox>
          ))}
        </Space>
      </AntmCheckbox.Group>
    )
  }

  return (
    <AntmCheckbox
      checked={!!value}
      onChange={(v) => onChange?.(v)}
      disabled={disabled}
      style={style}
      className={className}
      id={id}
    >
      {''}
    </AntmCheckbox>
  )
}
