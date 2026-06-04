import React from 'react'
import { Checkbox as AntCheckbox, Flex } from 'antd'
import type { CheckboxProps } from '@form-engine/core'

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
      <Group
        value={value || []}
        onChange={handleChange}
        disabled={disabled}
        style={style}
        className={className}
        id={id}
        {...rest}
      >
        {direction === 'vertical' ? (
          <Flex vertical gap={8}>
            {items}
          </Flex>
        ) : (
          items
        )}
      </Group>
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
    >
      {rest.children}
    </AntCheckbox>
  )
}

export const CheckboxGroup: React.FC<CheckboxProps> = (props) => {
  return <Checkbox {...props} />
}
