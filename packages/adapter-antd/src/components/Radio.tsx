/**
 * Antd Radio 组件
 * 适配 Form Engine 的 RadioProps
 */

import React from 'react'
import { Radio as AntRadio } from 'antd'
import type { RadioProps } from '@form-engine/core'

const { Group } = AntRadio

/**
 * Radio 组件
 */
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
  const handleChange = (e: any) => {
    onChange?.(e.target.value)
  }
  
  // 如果有 options，渲染 Radio.Group
  if (options && options.length > 0) {
    return (
      <Group
        value={value}
        onChange={handleChange}
        optionType={optionType === 'button' ? 'button' : undefined}
        buttonStyle={buttonStyle}
        disabled={disabled}
        style={{ ...style, flexDirection: direction === 'vertical' ? 'column' : undefined }}
        className={className}
        id={id}
        options={options}
        {...rest}
      />
    )
  }
  
  // 否则渲染单个 Radio
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

/**
 * RadioGroup 组件（Radio 的别名）
 */
export const RadioGroup: React.FC<RadioProps> = (props) => {
  return <Radio {...props} />
}
