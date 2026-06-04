import React from 'react'
import { Radio as AntRadio, Flex } from 'antd'
import type { RadioProps } from '@form-engine/core'

const { Group } = AntRadio

export const Radio: React.FC<RadioProps> = ({
  value,
  onChange,
  options = [],
  optionType = 'default',
  buttonStyle = 'outline',
  direction,
  disabled,
  style,
  className,
  id,
  ...rest
}) => {
  const handleChange = (e: { target: { value: string } }) => {
    onChange?.(e.target.value)
  }

  if (options && options.length > 0) {
    const items = options.map((opt) => {
      if (optionType === 'button') {
        return (
          <AntRadio.Button key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </AntRadio.Button>
        )
      }
      return (
        <AntRadio key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </AntRadio>
      )
    })

    return (
      <Group
        value={value}
        onChange={handleChange}
        buttonStyle={buttonStyle}
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
    <AntRadio
      checked={!!value}
      onChange={handleChange}
      disabled={disabled}
      style={style}
      className={className}
      id={id}
      {...rest}
    />
  )
}

export const RadioGroup: React.FC<RadioProps> = (props) => {
  return <Radio {...props} />
}
