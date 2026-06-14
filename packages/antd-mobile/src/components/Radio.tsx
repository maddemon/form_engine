import { RadioProps } from '@form-engine/core'
import { Radio as AntmRadio, Selector, Space } from 'antd-mobile'
import React from 'react'

export const Radio: React.FC<RadioProps> = ({
  value,
  onChange,
  disabled,
  options = [],
  direction,
  optionType,
  style,
  className,
  id,
}) => {
  const radioOptions = (options || []) as any[]

  if (optionType === 'button') {
    return (
      <Selector
        options={radioOptions.map((opt: any) => ({ label: opt.label, value: opt.value, disabled: opt.disabled }))}
        value={value != null ? [value] : []}
        onChange={(v) => onChange?.(v[0] ?? undefined)}
        disabled={disabled}
        multiple={false}
        style={style}
      />
    )
  }

  return (
    <AntmRadio.Group
      value={value as string}
      onChange={(v) => onChange?.(v)}
      disabled={disabled}
      style={style}
      className={className}
      id={id}
    >
      <Space direction={direction === 'vertical' ? 'vertical' : 'horizontal'} block>
        {radioOptions.map((opt: any) => (
          <AntmRadio key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </AntmRadio>
        ))}
      </Space>
    </AntmRadio.Group>
  )
}
