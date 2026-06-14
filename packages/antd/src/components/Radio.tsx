import React from 'react'
import { Radio as AntRadio, Flex } from 'antd'
import type { RadioChangeEvent } from 'antd'
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
  const handleGroupChange = (e: RadioChangeEvent) => {
    onChange?.(e.target.value)
  }

  const handleChange = (e: RadioChangeEvent) => {
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

    // Button + 竖向：不用 Group（避免 ButtonGroup 边框问题），逐个渲染 Radio.Button
    if (optionType === 'button' && direction === 'vertical') {
      return (
        <Flex vertical gap={8} style={style} className={className} id={id}>
          {options.map((opt) => (
            <AntRadio.Button
              key={String(opt.value)}
              value={opt.value}
              checked={value === opt.value}
              disabled={disabled || opt.disabled}
              onChange={() => onChange?.(opt.value)}
            >
              {opt.label}
            </AntRadio.Button>
          ))}
        </Flex>
      )
    }

    return (
      <Group
        value={value}
        onChange={handleGroupChange}
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
