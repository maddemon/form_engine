import type { CheckboxProps } from '@form-engine/core'
import { Button, Checkbox as AntCheckbox, Flex, Space } from 'antd'
import React from 'react'

const { Group } = AntCheckbox

export const Checkbox: React.FC<CheckboxProps> = ({
  value,
  onChange,
  options = [],
  indeterminate,
  optionType = 'default',
  buttonStyle = 'outline',
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
    if (optionType === 'button') {
      const selected = (value || []) as (string | number)[]
      const handleToggle = (optValue: string | number) => {
        const next = selected.includes(optValue)
          ? selected.filter((v) => v !== optValue)
          : [...selected, optValue]
        onChange?.(next as string[])
      }
      const buttons = options.map((opt) => {
        const checked = selected.includes(opt.value)
        return (
          <Button
            key={String(opt.value)}
            type={checked ? 'primary' : 'default'}
            ghost={buttonStyle === 'outline' && checked}
            disabled={disabled || opt.disabled}
            onClick={() => handleToggle(opt.value)}
          >
            {opt.label}
          </Button>
        )
      })
      return (
        <div style={style} className={className} id={id}>
          {direction === 'vertical' ? (
            <Flex vertical gap={8}>{buttons}</Flex>
          ) : (
            <Space>{buttons}</Space>
          )}
        </div>
      )
    }

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
