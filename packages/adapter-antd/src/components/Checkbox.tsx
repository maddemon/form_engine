import type { CheckboxProps } from '@form-engine/core'
import { Checkbox as AntCheckbox, Flex } from 'antd'
import React from 'react'

const { Group } = AntCheckbox

export const Checkbox: React.FC<CheckboxProps> = ({
  value,
  onChange,
  options = [],
  indeterminate,
  direction,
  disabled,
  style,
  className,
  id,
  ...rest
}) => {
  const handleChange = (checkedValues: (string | number)[]) => {
    onChange?.(checkedValues as string[])
  }

  if (options && options.length > 0) {
    const items = options.map((opt) => (
      <AntCheckbox key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
        {opt.label}
      </AntCheckbox>
    ))

    return (
      <div style={style} className={className} id={id}>
        <Group value={value || []} onChange={handleChange} disabled={disabled} {...rest}>
          {direction === 'vertical' ? (
            <Flex vertical gap={8}>
              {items}
            </Flex>
          ) : (
            items
          )}
        </Group>
      </div>
    )
  }

  return (
    <AntCheckbox
      checked={!!value}
      onChange={(e) => onChange?.(e.target.checked)}
      indeterminate={indeterminate}
      disabled={disabled}
      style={style}
      className={className}
      id={id}
      {...rest}
    />
  )
}

export const CheckboxGroup: React.FC<CheckboxProps> = (props) => {
  return <Checkbox {...props} />
}
